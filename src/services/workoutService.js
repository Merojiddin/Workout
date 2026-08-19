import { WORKOUT_SESSIONS_KEY } from '../data/workoutSessions'
import {
  createCloudSyncError,
  describeError,
  durationMinutes,
  isBrowserOnline,
  isCloudMode,
  mergeCloudIntoLocal,
  num,
  readArrayKey,
  supabase,
  withSyncMetadata,
  writeArrayKey,
} from './serviceUtils'
import { addToSyncQueue } from '../utils/offlineSyncQueue'

/**
 * Step 12 - workout data service (cloud + local).
 *
 * Sessions are stored losslessly in `workout_sessions.raw_data` so the exact
 * local shape survives a round-trip (Progress / Weekly Review keep working).
 * Individual sets are also fanned out into `workout_sets` for future querying.
 */

function readLocal() {
  return readArrayKey(WORKOUT_SESSIONS_KEY)
}

function writeLocal(list) {
  writeArrayKey(WORKOUT_SESSIONS_KEY, list)
}

function writeLocalSession(session) {
  const next = [session, ...readLocal().filter((item) => item.id !== session.id)]
  writeLocal(next)
  return next
}

function flattenSets(session) {
  const exercises = Array.isArray(session?.exercises) ? session.exercises : []
  const rows = []
  exercises.forEach((exercise) => {
    const sets = Array.isArray(exercise?.sets) ? exercise.sets : []
    sets.forEach((set) => {
      rows.push({
        exerciseId: exercise?.exerciseId ?? exercise?.id ?? null,
        exerciseName: exercise?.exerciseName ?? '',
        setNumber: num(set?.setNumber),
        reps: num(set?.reps),
        weightKg: num(set?.weightKg),
        timeSeconds: num(set?.timeSeconds),
        rpe: num(set?.rpe),
        painLevel: num(set?.painLevel),
        notes: typeof set?.notes === 'string' ? set.notes : '',
        completedAt: set?.completedAt ?? null,
        raw: set,
      })
    })
  })
  return rows
}

function sessionToRow(user, session) {
  return {
    user_id: user.id,
    local_id: String(session.id),
    date: session.date ?? null,
    workout_day_id:
      session.workoutDayId !== undefined && session.workoutDayId !== null
        ? String(session.workoutDayId)
        : null,
    workout_name: session.workoutName ?? null,
    started_at: session.startedAt ?? null,
    finished_at: session.finishedAt ?? null,
    duration_minutes: durationMinutes(session.startedAt, session.finishedAt),
    completed: session.completed ?? false,
    raw_data: session,
  }
}

function setToRow(user, cloudSessionId, set) {
  return {
    user_id: user.id,
    session_id: cloudSessionId,
    exercise_id: set.exerciseId,
    exercise_name: set.exerciseName,
    set_number: set.setNumber,
    reps: set.reps,
    weight_kg: set.weightKg,
    time_seconds: set.timeSeconds,
    completed_at: set.completedAt,
    raw_data: set.raw,
  }
}

/** Cloud-only: upsert one session and replace its sets. Returns cloud id. */
export async function pushWorkoutSessionToCloud(user, session) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .upsert(sessionToRow(user, session), { onConflict: 'user_id,local_id' })
    .select('id')
    .single()
  if (error) {
    throw error
  }

  const cloudId = data.id
  await supabase.from('workout_sets').delete().eq('session_id', cloudId)

  const rows = flattenSets(session).map((set) => setToRow(user, cloudId, set))
  if (rows.length > 0) {
    const { error: setError } = await supabase.from('workout_sets').insert(rows)
    if (setError) {
      throw setError
    }
  }
  return cloudId
}

export async function getWorkoutSessions(user) {
  if (!isCloudMode(user)) {
    return readLocal()
  }
  if (!isBrowserOnline()) {
    return readLocal()
  }

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
  if (error) {
    throw error
  }

  const sessions = (data ?? []).map((row) => row.raw_data ?? reconstructSession(row))
  if (sessions.length > 0) {
    // Mirror the cloud over the local copy without wiping it: an empty cloud
    // is skipped entirely, and a non-empty one is merged so sessions still
    // waiting to upload stay in the list.
    writeLocal(
      mergeCloudIntoLocal(
        sessions.map((session) => withSyncMetadata(session, 'synced')),
        readLocal(),
      ),
    )
  }
  return sessions
}

export async function saveWorkoutSession(user, session) {
  if (!isCloudMode(user)) {
    const local = withSyncMetadata(session, 'local-only')
    writeLocalSession(local)
    return local
  }

  const pending = withSyncMetadata(session, 'pending-sync')
  writeLocalSession(pending)

  if (!isBrowserOnline()) {
    queueWorkoutChange('create', pending, 'offline')
    throw createCloudSyncError(new Error('offline'))
  }

  try {
    const synced = withSyncMetadata(session, 'synced')
    await pushWorkoutSessionToCloud(user, synced)
    writeLocalSession(synced)
    return synced
  } catch (error) {
    queueWorkoutChange('create', pending, describeError(error))
    throw createCloudSyncError(error)
  }
}
/** Fallback reconstruction if a cloud row somehow has no raw_data. */
function reconstructSession(row) {
  return {
    id: row.local_id ?? row.id,
    date: row.date,
    workoutDayId: row.workout_day_id,
    workoutName: row.workout_name,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    completed: row.completed ?? false,
    exercises: [],
    syncStatus: 'synced',
    updatedAt: row.updated_at ?? new Date().toISOString(),
  }
}

function queueWorkoutChange(action, payload, lastError) {
  addToSyncQueue({
    type: 'workoutSession',
    action,
    payload,
    lastError,
  })
}
