import { t } from '../i18n/t'
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
  fetchGuidedCatalogFromCloud,
  fetchUserWorkoutProgramsFromCloud,
  saveCustomExerciseLibrary,
  saveCustomWorkoutPlan,
  saveGuidedCatalogToCloud,
  saveUserSettings,
  saveUserWorkoutProgramsToCloud,
} from './settingsService'
import {
  getUserWorkoutPrograms,
  replaceUserWorkoutPrograms,
} from '../utils/userWorkoutPrograms'
import {
  isEmptyGuidedCatalog,
  mergeGuidedCatalogs,
  normalizeGuidedCatalog,
  readLocalGuidedCatalog,
  writeLocalGuidedCatalog,
} from '../utils/guidedCatalogSync'
import { pushWorkoutSessionToCloud } from './workoutService'
import {
  backupLocalKey,
  describeError,
  isBrowserOnline,
  isCloudMode,
  mergeCloudIntoLocal,
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
  resolveStorageKey,
  USER_WORKOUT_PROGRAMS_KEY,
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
const queueDrains = new Map()

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

/**
 * Reconciles this device's guided catalog with the cloud, both ways.
 *
 * Unlike the other documents here there is no upload direction and download
 * direction to pick between: sessions are added on whichever device is to
 * hand, so both copies hold something the other needs. One merge settles it,
 * and because the merge is symmetric the result is the same whichever device
 * runs it first. The merged catalog is written back to both sides, so the two
 * converge after a single sync rather than ping-ponging.
 *
 * Exported because the guided screen calls it directly: every import, edit and
 * delete reconciles rather than pushing the local list over the cloud one, so
 * a device that has been offline cannot drop what another device added while
 * it was away.
 *
 * Returns the number of sessions in the reconciled catalog.
 */
export async function reconcileGuidedCatalog(user) {
  if (!isUserStorageActive(user)) return 0
  const local = readLocalGuidedCatalog()
  const cloud = normalizeGuidedCatalog(await fetchGuidedCatalogFromCloud(user))
  if (!isUserStorageActive(user)) return 0
  const merged = mergeGuidedCatalogs(local, cloud)

  writeLocalGuidedCatalog(merged)

  // Nothing anywhere yet - skip the write rather than storing an empty row.
  if (!isEmptyGuidedCatalog(merged)) {
    await saveGuidedCatalogToCloud(user, merged)
  }

  return merged.workouts.length
}

export async function syncLocalToCloud(user) {
  if (!isCloudMode(user)) {
    throw new Error(t('sync.signInUpload'))
  }

  const summary = {
    workoutSessions: 0,
    bodyCheckIns: 0,
    nutritionLogs: 0,
    settings: 0,
    customPlan: 0,
    customLibrary: 0,
    userPrograms: 0,
    guidedWorkouts: 0,
    errors: [],
  }

  for (const session of readArrayKey(WORKOUT_SESSIONS_KEY)) {
    try {
      await pushWorkoutSessionToCloud(user, session)
      summary.workoutSessions += 1
    } catch (error) {
      summary.errors.push(describe(t('sync.entity.workoutSession'), error))
    }
  }

  for (const checkIn of readArrayKey(BODY_CHECK_INS_KEY)) {
    try {
      await pushBodyCheckInToCloud(user, checkIn)
      summary.bodyCheckIns += 1
    } catch (error) {
      summary.errors.push(describe(t('sync.entity.bodyCheckIn'), error))
    }
  }

  for (const log of readArrayKey(NUTRITION_LOGS_KEY)) {
    try {
      await pushNutritionLogToCloud(user, log)
      summary.nutritionLogs += 1
    } catch (error) {
      summary.errors.push(describe(t('sync.entity.nutritionLog'), error))
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
      summary.errors.push(describe(t('sync.entity.workoutPlan'), error))
    }
  }

  if (hasCustomExerciseLibrary()) {
    try {
      await saveCustomExerciseLibrary(user, localGetLibrary())
      summary.customLibrary = 1
    } catch (error) {
      summary.errors.push(describe(t('sync.entity.exerciseLibrary'), error))
    }
  }

  const pastedPrograms = getUserWorkoutPrograms()
  if (pastedPrograms.length > 0) {
    try {
      await saveUserWorkoutProgramsToCloud(user, pastedPrograms)
      summary.userPrograms = pastedPrograms.length
    } catch (error) {
      summary.errors.push(describe(t('sync.entity.pastedPrograms'), error))
    }
  }

  try {
    summary.guidedWorkouts = await reconcileGuidedCatalog(user)
  } catch (error) {
    summary.errors.push(describe(t('sync.entity.guidedWorkouts'), error))
  }

  return summary
}

export async function syncCloudToLocal(user) {
  if (!isCloudMode(user)) {
    throw new Error(t('sync.signInDownload'))
  }

  const summary = {
    workoutSessions: 0,
    bodyCheckIns: 0,
    nutritionLogs: 0,
    settings: 0,
    customPlan: 0,
    customLibrary: 0,
    userPrograms: 0,
    guidedWorkouts: 0,
    errors: [],
  }
  if (!isUserStorageActive(user)) return summary

  // A cloud read started before a selection must not undo it, even if the
  // selection finishes syncing while that read is still in flight.
  const programSnapshot = captureProgramMirror()
  const hadPendingProgramChanges = hasPendingProgramChanges()
  const mayHydratePrograms = () => isUserStorageActive(user) &&
    !hadPendingProgramChanges && !hasPendingProgramChanges() &&
    programSnapshot === captureProgramMirror()

  // Workout sessions (reconstruct from raw_data).
  try {
    const sessions = await fetchAll('workout_sessions', user, 'date')
    if (!isUserStorageActive(user)) return summary
    const list = sessions.map((row) => row.raw_data ?? { id: row.local_id ?? row.id })
    if (list.length > 0) {
      backupLocalKey(WORKOUT_SESSIONS_KEY)
      writeArrayKey(
        WORKOUT_SESSIONS_KEY,
        mergeCloudIntoLocal(list, readArrayKey(WORKOUT_SESSIONS_KEY)),
      )
      summary.workoutSessions = list.length
    }
  } catch (error) {
    summary.errors.push(describe(t('sync.entity.workoutSessions'), error))
  }

  // Body check-ins.
  try {
    const rows = await fetchAll('body_check_ins', user, 'date')
    if (!isUserStorageActive(user)) return summary
    const list = rows.map((row) => row.raw_data).filter(Boolean)
    if (list.length > 0) {
      backupLocalKey(BODY_CHECK_INS_KEY)
      writeArrayKey(
        BODY_CHECK_INS_KEY,
        mergeCloudIntoLocal(list, readArrayKey(BODY_CHECK_INS_KEY)),
      )
      summary.bodyCheckIns = list.length
    }
  } catch (error) {
    summary.errors.push(describe(t('sync.entity.bodyCheckIns'), error))
  }

  // Nutrition logs.
  try {
    const rows = await fetchAll('nutrition_logs', user, 'date')
    if (!isUserStorageActive(user)) return summary
    const list = rows.map((row) => row.raw_data).filter(Boolean)
    if (list.length > 0) {
      backupLocalKey(NUTRITION_LOGS_KEY)
      writeArrayKey(
        NUTRITION_LOGS_KEY,
        mergeCloudIntoLocal(list, readArrayKey(NUTRITION_LOGS_KEY)),
      )
      summary.nutritionLogs = list.length
    }
  } catch (error) {
    summary.errors.push(describe(t('sync.entity.nutritionLogs'), error))
  }

  // Read the related program documents together and commit without yielding,
  // so a local selection cannot leave metadata and editable days out of step.
  try {
    const [settings, plan, programs] = await Promise.all([
      fetchSingleValue('user_settings', user, 'settings'),
      fetchSingleValue('custom_workout_plans', user, 'plan'),
      fetchUserWorkoutProgramsFromCloud(user),
    ])
    if (!isUserStorageActive(user)) return summary
    if (mayHydratePrograms()) {
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
            t('sync.entity.programMetadata'),
            new Error([hydration.message, ...hydration.details].join(' ')),
          ),
        )
      }
      summary.settings = 1
      }
      if (plan) {
        backupLocalKey('customWorkoutPlan')
        writeJsonKey('customWorkoutPlan', plan)
        summary.customPlan = 1
      }
      if (Array.isArray(programs) && programs.length > 0) {
        backupLocalKey(USER_WORKOUT_PROGRAMS_KEY)
        summary.userPrograms = replaceUserWorkoutPrograms(programs).length
      }
    }
  } catch (error) {
    summary.errors.push(describe('settings', error))
  }

  try {
    const library = await fetchSingleValue(
      'custom_exercise_libraries',
      user,
      'library',
    )
    if (!isUserStorageActive(user)) return summary
    if (library) {
      backupLocalKey('customExerciseLibrary')
      writeJsonKey('customExerciseLibrary', library)
      summary.customLibrary = 1
    }
  } catch (error) {
    summary.errors.push(describe(t('sync.entity.exerciseLibrary'), error))
  }

  // Runs on every app load (see App.tsx), which is what makes a session
  // imported on one device show up on the other without anyone pressing sync.
  try {
    summary.guidedWorkouts = await reconcileGuidedCatalog(user)
  } catch (error) {
    summary.errors.push(describe(t('sync.entity.guidedWorkouts'), error))
  }

  return summary
}

export function syncPendingQueue(user) {
  const key = user?.id ?? ''
  if (queueDrains.has(key)) return queueDrains.get(key)
  const drain = drainPendingQueue(user).finally(() => {
    if (queueDrains.get(key) === drain) queueDrains.delete(key)
  })
  queueDrains.set(key, drain)
  return drain
}

async function drainPendingQueue(user) {
  const summary = {
    synced: 0,
    selectionSynced: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    skippedReason: '',
  }

  if (!isBrowserOnline()) {
    summary.skippedReason = t('sync.offlinePending')
    return summary
  }
  if (!isCloudMode(user) || !isUserStorageActive(user)) {
    summary.skippedReason = t('sync.signInPending')
    return summary
  }

  // Re-read between uploads so replacements and new changes are drained in
  // order. A failed revision is attempted only once per trigger.
  const attempted = new Set()
  summary.skipped = getSyncQueue().filter((item) =>
    item.status === 'failed' || item.attempts >= MAX_QUEUE_ATTEMPTS,
  ).length
  while (isUserStorageActive(user) && isBrowserOnline()) {
    const item = getSyncQueue().find((candidate) =>
      !attempted.has(candidate.id) && candidate.status !== 'failed' &&
      candidate.attempts < MAX_QUEUE_ATTEMPTS,
    )
    if (!item) break
    attempted.add(item.id)
    const isCurrent = () => isUserStorageActive(user) &&
      getSyncQueue().some((queued) => queued.id === item.id)

    try {
      await processQueueItem(user, item, isCurrent)
      if (!isCurrent()) continue
      removeFromSyncQueue(item.id)
      markLocalSynced(item)
      summary.synced += 1
      if (item.type === 'workoutProgramSelection') summary.selectionSynced += 1
    } catch (error) {
      if (!isCurrent()) continue
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

  if (summary.synced > 0 && isUserStorageActive(user)) {
    setLastOfflineSyncAt()
  }

  return summary
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
      : t('sync.unknownError')
  return `${label}: ${message}`
}

async function processQueueItem(user, item, isCurrent) {
  const payload = unwrapPayload(item.payload)
  if (!payload && item.action !== 'delete') {
    throw new Error(t('sync.missingPayload'))
  }

  switch (item.type) {
    case 'workoutProgramSelection':
      return processProgramSelection(user, payload?.value ?? payload, isCurrent)
    case 'workoutSession':
      return processWorkoutQueueItem(user, item, payload)
    case 'bodyCheckIn':
      return processBodyCheckInQueueItem(user, item, payload)
    case 'nutritionLog':
      return processNutritionQueueItem(user, item, payload)
    case 'userSettings':
      return processSingleValueQueueItem('user_settings', 'settings', user, item, {
        value: {
          ...(payload?.value ?? payload),
          workoutProgramManager: localGetSettings().workoutProgramManager,
          workoutProgramLibrary: localGetSettings().workoutProgramLibrary,
          workoutDisplay: {
            ...(payload?.value ?? payload)?.workoutDisplay,
            trainingLocation: localGetSettings().workoutDisplay.trainingLocation,
          },
        },
      })
    case 'customWorkoutPlan':
      return processSingleValueQueueItem(
        'custom_workout_plans',
        'plan',
        user,
        item,
        { value: localGetPlan() },
      )
    case 'customExerciseLibrary':
      return processSingleValueQueueItem(
        'custom_exercise_libraries',
        'library',
        user,
        item,
        payload,
      )
    case 'userWorkoutPrograms':
      return processSingleValueQueueItem(
        'user_workout_programs',
        'programs',
        user,
        item,
        { value: getUserWorkoutPrograms() },
      )
    case 'guidedCatalog':
      return processSingleValueQueueItem(
        'guided_workout_catalogs',
        'catalog',
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

async function processProgramSelection(user, selection, isCurrent) {
  if (!selection || !Array.isArray(selection.plan) ||
    !Array.isArray(selection.programs) || !selection.installedProgram ||
    !selection.library || !['home', 'gym'].includes(selection.trainingLocation)) {
    throw new Error(t('sync.missingPayload'))
  }
  // These helpers write cloud documents only. Completion must never hydrate
  // the local mirror: the user may already have selected a different plan.
  const write = (table, column, value) => processSingleValueQueueItem(
    table, column, user, { action: 'update' }, { value },
  )
  if (!isCurrent()) return
  await write('user_workout_programs', 'programs', selection.programs)
  if (!isCurrent()) return
  await write('custom_workout_plans', 'plan', selection.plan)
  if (!isCurrent()) return
  const cloudSettings = await fetchSingleValue('user_settings', user, 'settings')
  if (!isCurrent()) return
  const settings = isRecord(cloudSettings) ? cloudSettings : {}
  const manager = isRecord(settings.workoutProgramManager)
    ? settings.workoutProgramManager : {}
  const display = isRecord(settings.workoutDisplay) ? settings.workoutDisplay : {}
  await write('user_settings', 'settings', {
    ...settings,
    workoutDisplay: { ...display, trainingLocation: selection.trainingLocation },
    workoutProgramLibrary: selection.library,
    workoutProgramManager: {
      ...manager,
      installedProgram: selection.installedProgram,
      dismissedPrograms: (Array.isArray(manager.dismissedPrograms) ? manager.dismissedPrograms : [])
        .filter((item) => item.id !== selection.installedProgram.id ||
          item.version !== selection.installedProgram.version),
      backups: Array.isArray(manager.backups) ? manager.backups : [],
    },
  })
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
    throw new Error(t('sync.missingLocalId'))
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

function isUserStorageActive(user) {
  if (!user || typeof user.id !== 'string' || !user.id.trim()) return false
  const namespace = user.id.trim().replace(/:/g, '-')
  return resolveStorageKey(USER_SETTINGS_KEY) === `u:${namespace}:${USER_SETTINGS_KEY}`
}

function captureProgramMirror() {
  return JSON.stringify([
    readJsonKey(USER_SETTINGS_KEY),
    readJsonKey('customWorkoutPlan'),
    readJsonKey(INSTALLED_WORKOUT_PROGRAM_KEY),
    readJsonKey(USER_WORKOUT_PROGRAMS_KEY),
  ])
}

function hasPendingProgramChanges() {
  return getSyncQueue().some((item) => [
    'workoutProgramSelection', 'customWorkoutPlan', 'userSettings', 'userWorkoutPrograms',
  ].includes(item.type))
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
