import { BODY_CHECK_INS_KEY } from '../data/bodyCheckIns'
import { NUTRITION_LOGS_KEY } from '../data/nutritionLogs'
import { WORKOUT_SESSIONS_KEY } from '../data/workoutSessions'
import {
  getCustomExerciseLibrary as localGetLibrary,
  getCustomWorkoutPlan as localGetPlan,
  getUserProfileSettings as localGetSettings,
  hasCustomExerciseLibrary,
  hasCustomWorkoutPlan,
} from '../utils/settingsUtils'
import { pushBodyCheckInToCloud } from './bodyCheckInService'
import { pushNutritionLogToCloud } from './nutritionService'
import {
  saveCustomExerciseLibrary,
  saveCustomWorkoutPlan,
  saveUserSettings,
} from './settingsService'
import { pushWorkoutSessionToCloud } from './workoutService'
import {
  backupLocalKey,
  describeError,
  isBrowserOnline,
  isCloudMode,
  readArrayKey,
  readJsonKey,
  supabase,
  withSyncMetadata,
  writeArrayKey,
  writeJsonKey,
} from './serviceUtils'
import {
  getSyncQueue,
  removeFromSyncQueue,
  setLastOfflineSyncAt,
  updateSyncQueueItem,
} from '../utils/offlineSyncQueue'
import {
  CLOUD_WORKOUT_PROGRAM_MANAGER_CACHE_KEY,
  DISMISSED_WORKOUT_PROGRAMS_KEY,
  INSTALLED_WORKOUT_PROGRAM_KEY,
} from '../utils/storageUtils'
import { hydrateWorkoutProgramManagerFromCloudSettings } from './workoutProgramService'

/**
 * Step 12 - sync service.
 *
 * Uploads/downloads localStorage <-> Supabase. Uploads use upsert on
 * (user_id, local_id) so running sync twice never duplicates. Downloads only
 * overwrite a local key when the cloud has rows, and always back up the
 * previous local value first.
 */

const USER_SETTINGS_KEY = 'userProfileSettings'
const MAX_QUEUE_ATTEMPTS = 5

export function getLocalDataSummary() {
  return {
    workoutSessions: readArrayKey(WORKOUT_SESSIONS_KEY).length,
    bodyCheckIns: readArrayKey(BODY_CHECK_INS_KEY).length,
    nutritionLogs: readArrayKey(NUTRITION_LOGS_KEY).length,
    settings: readJsonKey(USER_SETTINGS_KEY) ? 1 : 0,
    customPlan: hasCustomWorkoutPlan() ? 1 : 0,
    customLibrary: hasCustomExerciseLibrary() ? 1 : 0,
  }
}

export async function getCloudDataSummary(user) {
  if (!isCloudMode(user)) {
    return null
  }

  const [sessions, checkIns, nutrition, settings, plan, library] =
    await Promise.all([
      countRows('workout_sessions', user),
      countRows('body_check_ins', user),
      countRows('nutrition_logs', user),
      countRows('user_settings', user),
      countRows('custom_workout_plans', user),
      countRows('custom_exercise_libraries', user),
    ])

  return {
    workoutSessions: sessions,
    bodyCheckIns: checkIns,
    nutritionLogs: nutrition,
    settings,
    customPlan: plan,
    customLibrary: library,
  }
}

export async function syncLocalToCloud(user) {
  if (!isCloudMode(user)) {
    throw new Error('Sign in with a cloud account to upload your data.')
  }

  const summary = {
    workoutSessions: 0,
    bodyCheckIns: 0,
    nutritionLogs: 0,
    settings: 0,
    customPlan: 0,
    customLibrary: 0,
    errors: [],
  }

  for (const session of readArrayKey(WORKOUT_SESSIONS_KEY)) {
    try {
      await pushWorkoutSessionToCloud(user, session)
      summary.workoutSessions += 1
    } catch (error) {
      summary.errors.push(describe('workout session', error))
    }
  }

  for (const checkIn of readArrayKey(BODY_CHECK_INS_KEY)) {
    try {
      await pushBodyCheckInToCloud(user, checkIn)
      summary.bodyCheckIns += 1
    } catch (error) {
      summary.errors.push(describe('body check-in', error))
    }
  }

  for (const log of readArrayKey(NUTRITION_LOGS_KEY)) {
    try {
      await pushNutritionLogToCloud(user, log)
      summary.nutritionLogs += 1
    } catch (error) {
      summary.errors.push(describe('nutrition log', error))
    }
  }

  try {
    await saveUserSettings(user, localGetSettings())
    summary.settings = 1
  } catch (error) {
    summary.errors.push(describe('settings', error))
  }

  if (hasCustomWorkoutPlan()) {
    try {
      await saveCustomWorkoutPlan(user, localGetPlan())
      summary.customPlan = 1
    } catch (error) {
      summary.errors.push(describe('workout plan', error))
    }
  }

  if (hasCustomExerciseLibrary()) {
    try {
      await saveCustomExerciseLibrary(user, localGetLibrary())
      summary.customLibrary = 1
    } catch (error) {
      summary.errors.push(describe('exercise library', error))
    }
  }

  return summary
}

export async function syncCloudToLocal(user) {
  if (!isCloudMode(user)) {
    throw new Error('Sign in with a cloud account to download your data.')
  }

  const summary = {
    workoutSessions: 0,
    bodyCheckIns: 0,
    nutritionLogs: 0,
    settings: 0,
    customPlan: 0,
    customLibrary: 0,
    errors: [],
  }

  // Workout sessions (reconstruct from raw_data).
  try {
    const sessions = await fetchAll('workout_sessions', user, 'date')
    const list = sessions.map((row) => row.raw_data ?? { id: row.local_id ?? row.id })
    if (list.length > 0) {
      backupLocalKey(WORKOUT_SESSIONS_KEY)
      writeArrayKey(WORKOUT_SESSIONS_KEY, list)
      summary.workoutSessions = list.length
    }
  } catch (error) {
    summary.errors.push(describe('workout sessions', error))
  }

  // Body check-ins.
  try {
    const rows = await fetchAll('body_check_ins', user, 'date')
    const list = rows.map((row) => row.raw_data).filter(Boolean)
    if (list.length > 0) {
      backupLocalKey(BODY_CHECK_INS_KEY)
      writeArrayKey(BODY_CHECK_INS_KEY, list)
      summary.bodyCheckIns = list.length
    }
  } catch (error) {
    summary.errors.push(describe('body check-ins', error))
  }

  // Nutrition logs.
  try {
    const rows = await fetchAll('nutrition_logs', user, 'date')
    const list = rows.map((row) => row.raw_data).filter(Boolean)
    if (list.length > 0) {
      backupLocalKey(NUTRITION_LOGS_KEY)
      writeArrayKey(NUTRITION_LOGS_KEY, list)
      summary.nutritionLogs = list.length
    }
  } catch (error) {
    summary.errors.push(describe('nutrition logs', error))
  }

  // Single-row documents.
  try {
    const settings = await fetchSingleValue('user_settings', user, 'settings')
    if (settings) {
      backupLocalKey(USER_SETTINGS_KEY)
      backupLocalKey(INSTALLED_WORKOUT_PROGRAM_KEY)
      backupLocalKey(DISMISSED_WORKOUT_PROGRAMS_KEY)
      backupLocalKey(CLOUD_WORKOUT_PROGRAM_MANAGER_CACHE_KEY)
      writeJsonKey(USER_SETTINGS_KEY, settings)
      const hydration = hydrateWorkoutProgramManagerFromCloudSettings(
        settings,
        user.id,
      )
      if (!hydration.success) {
        summary.errors.push(
          describe(
            'workout program metadata',
            new Error([hydration.message, ...hydration.details].join(' ')),
          ),
        )
      }
      summary.settings = 1
    }
  } catch (error) {
    summary.errors.push(describe('settings', error))
  }

  try {
    const plan = await fetchSingleValue('custom_workout_plans', user, 'plan')
    if (plan) {
      backupLocalKey('customWorkoutPlan')
      writeJsonKey('customWorkoutPlan', plan)
      summary.customPlan = 1
    }
  } catch (error) {
    summary.errors.push(describe('workout plan', error))
  }

  try {
    const library = await fetchSingleValue(
      'custom_exercise_libraries',
      user,
      'library',
    )
    if (library) {
      backupLocalKey('customExerciseLibrary')
      writeJsonKey('customExerciseLibrary', library)
      summary.customLibrary = 1
    }
  } catch (error) {
    summary.errors.push(describe('exercise library', error))
  }

  return summary
}

export async function syncPendingQueue(user) {
  const summary = {
    synced: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    skippedReason: '',
  }

  if (!isBrowserOnline()) {
    summary.skippedReason = 'Offline. Pending changes will sync when online.'
    return summary
  }
  if (!isCloudMode(user)) {
    summary.skippedReason = 'Sign in with a cloud account to sync pending changes.'
    return summary
  }

  const queue = getSyncQueue()
  if (queue.length === 0) {
    return summary
  }

  for (const item of queue) {
    if (item.status === 'failed' || item.attempts >= MAX_QUEUE_ATTEMPTS) {
      summary.skipped += 1
      continue
    }

    try {
      await processQueueItem(user, item)
      removeFromSyncQueue(item.id)
      markLocalSynced(item)
      summary.synced += 1
    } catch (error) {
      const attempts = item.attempts + 1
      const failedPermanently = attempts >= MAX_QUEUE_ATTEMPTS
      updateSyncQueueItem(item.id, {
        attempts,
        lastError: describeError(error),
        status: failedPermanently ? 'failed' : 'pending',
      })
      summary.failed += 1
      summary.errors.push(describe(item.type, error))
    }
  }

  if (summary.synced > 0) {
    setLastOfflineSyncAt()
  }

  return summary
}

/** Optional. Never called automatically. Backs up, then clears bulk data keys. */
export function clearLocalAfterCloudSync() {
  const keys = [WORKOUT_SESSIONS_KEY, BODY_CHECK_INS_KEY, NUTRITION_LOGS_KEY]
  keys.forEach((key) => {
    backupLocalKey(key)
    writeArrayKey(key, [])
  })
  return { cleared: keys }
}

// --- internal --------------------------------------------------------------

async function countRows(table, user) {
  try {
    const { count, error } = await supabase
      .from(table)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    if (error) {
      return 0
    }
    return count ?? 0
  } catch {
    return 0
  }
}

async function fetchAll(table, user, orderColumn) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('user_id', user.id)
    .order(orderColumn, { ascending: false })
  if (error) {
    throw error
  }
  return data ?? []
}

async function fetchSingleValue(table, user, column) {
  const { data, error } = await supabase
    .from(table)
    .select(column)
    .eq('user_id', user.id)
    .maybeSingle()
  if (error) {
    throw error
  }
  return data ? data[column] : null
}

function describe(label, error) {
  const message =
    error && typeof error === 'object' && 'message' in error
      ? error.message
      : 'unknown error'
  return `${label}: ${message}`
}

async function processQueueItem(user, item) {
  const payload = unwrapPayload(item.payload)
  if (!payload && item.action !== 'delete') {
    throw new Error('Missing sync payload.')
  }

  switch (item.type) {
    case 'workoutSession':
      return processWorkoutQueueItem(user, item, payload)
    case 'bodyCheckIn':
      return processBodyCheckInQueueItem(user, item, payload)
    case 'nutritionLog':
      return processNutritionQueueItem(user, item, payload)
    case 'userSettings':
      return processSingleValueQueueItem('user_settings', 'settings', user, item, payload)
    case 'customWorkoutPlan':
      return processSingleValueQueueItem(
        'custom_workout_plans',
        'plan',
        user,
        item,
        payload,
      )
    case 'customExerciseLibrary':
      return processSingleValueQueueItem(
        'custom_exercise_libraries',
        'library',
        user,
        item,
        payload,
      )
    default:
      throw new Error(`Unsupported sync type: ${item.type}`)
  }
}

async function processWorkoutQueueItem(user, item, payload) {
  if (item.action === 'delete') {
    await deleteByLocalId('workout_sessions', user, payload?.id)
    return
  }
  await pushWorkoutSessionToCloud(user, withSyncMetadata(payload, 'synced'))
}

async function processBodyCheckInQueueItem(user, item, payload) {
  if (item.action === 'delete') {
    await deleteByLocalId('body_check_ins', user, payload?.id)
    return
  }
  await pushBodyCheckInToCloud(user, withSyncMetadata(payload, 'synced'))
}

async function processNutritionQueueItem(user, item, payload) {
  if (item.action === 'delete') {
    await deleteByLocalId('nutrition_logs', user, payload?.id)
    return
  }
  await pushNutritionLogToCloud(user, withSyncMetadata(payload, 'synced'))
}

async function processSingleValueQueueItem(table, column, user, item, payload) {
  if (item.action === 'delete') {
    const { error } = await supabase.from(table).delete().eq('user_id', user.id)
    if (error) {
      throw error
    }
    return
  }

  const value = payload?.value ?? payload
  const { error } = await supabase
    .from(table)
    .upsert({ user_id: user.id, [column]: value }, { onConflict: 'user_id' })
  if (error) {
    throw error
  }
}

async function deleteByLocalId(table, user, localId) {
  if (localId === undefined || localId === null || localId === '') {
    throw new Error('Missing local id for delete.')
  }
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('user_id', user.id)
    .eq('local_id', String(localId))
  if (error) {
    throw error
  }
}

function unwrapPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return payload ?? null
  }
  return payload.value && payload.id ? payload : payload
}

function markLocalSynced(item) {
  if (item.action === 'delete') {
    return
  }

  const payload = unwrapPayload(item.payload)
  const id = payload?.id
  if (!id) {
    return
  }

  if (item.type === 'workoutSession') {
    markArrayRecordSynced(WORKOUT_SESSIONS_KEY, id)
  } else if (item.type === 'bodyCheckIn') {
    markArrayRecordSynced(BODY_CHECK_INS_KEY, id)
  } else if (item.type === 'nutritionLog') {
    markArrayRecordSynced(NUTRITION_LOGS_KEY, id)
  }
}

function markArrayRecordSynced(key, id) {
  const list = readArrayKey(key)
  const next = list.map((item) =>
    item?.id === id ? withSyncMetadata(item, 'synced') : item,
  )
  writeArrayKey(key, next)
}
