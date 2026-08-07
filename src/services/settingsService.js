import {
  getCustomExerciseLibrary as localGetLibrary,
  getCustomWorkoutPlan as localGetPlan,
  getUserProfileSettings as localGetSettings,
  saveCustomExerciseLibrary as localSaveLibrary,
  saveCustomWorkoutPlan as localSavePlan,
  saveUserProfileSettings as localSaveSettings,
} from '../utils/settingsUtils'
import { addToSyncQueue } from '../utils/offlineSyncQueue'
import {
  createCloudSyncError,
  describeError,
  isBrowserOnline,
  isCloudMode,
  supabase,
} from './serviceUtils'

/**
 * Step 12 - settings / plan / library service (cloud + local).
 *
 * These are single-row-per-user JSON documents. Local reads/writes reuse the
 * existing settingsUtils normalization; cloud writes upsert on user_id.
 */

async function upsertSingle(table, user, payloadKey, value) {
  const { error } = await supabase
    .from(table)
    .upsert(
      { user_id: user.id, [payloadKey]: value },
      { onConflict: 'user_id' },
    )
  if (error) {
    throw error
  }
}

async function fetchSingle(table, user, payloadKey) {
  const { data, error } = await supabase
    .from(table)
    .select(payloadKey)
    .eq('user_id', user.id)
    .maybeSingle()
  if (error) {
    throw error
  }
  return data ? data[payloadKey] : null
}

/**
 * Cloud-only single-document helpers used by transactional program changes.
 * Unlike the existing offline-first service methods below, these helpers do
 * not read or write the local mirror and never add work to the offline queue.
 */
async function fetchCloudSingleSnapshot(table, user, payloadKey, label) {
  requireOnlineCloudUser(user)

  try {
    const { data, error } = await supabase
      .from(table)
      .select(payloadKey)
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data
      ? { exists: true, value: cloneJsonValue(data[payloadKey]) }
      : { exists: false, value: null }
  } catch (error) {
    throw cloudPersistenceError(`fetch ${label}`, error)
  }
}

async function writeCloudSingle(table, user, payloadKey, value, label) {
  requireOnlineCloudUser(user)

  try {
    const { error } = await supabase
      .from(table)
      .upsert(
        { user_id: user.id, [payloadKey]: value },
        { onConflict: 'user_id' },
      )

    if (error) {
      throw error
    }

    return { exists: true, value: cloneJsonValue(value) }
  } catch (error) {
    throw cloudPersistenceError(`save ${label}`, error)
  }
}

async function deleteCloudSingle(table, user, label) {
  requireOnlineCloudUser(user)

  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    return { exists: false, value: null }
  } catch (error) {
    throw cloudPersistenceError(`delete ${label}`, error)
  }
}

function requireOnlineCloudUser(user) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Running in local mode.')
  }
  if (!user || typeof user.id !== 'string' || user.id.trim() === '') {
    throw new Error('Sign in with a cloud account to change workout programs.')
  }
  if (!isCloudMode(user)) {
    throw new Error('Cloud mode is unavailable for this account.')
  }
  if (!isBrowserOnline()) {
    throw new Error(
      'Connect to the internet before changing a cloud workout program.',
    )
  }
}

function cloudPersistenceError(action, error) {
  const wrapped = new Error(`Could not ${action}: ${describeError(error)}`)
  wrapped.cause = error
  return wrapped
}

function cloneJsonValue(value) {
  return JSON.parse(JSON.stringify(value))
}

// --- cloud-only Program Manager documents ---------------------------------

export async function fetchCloudUserSettingsSnapshot(user) {
  return fetchCloudSingleSnapshot(
    'user_settings',
    user,
    'settings',
    'cloud user settings',
  )
}

export async function writeCloudUserSettings(user, settings) {
  requireOnlineCloudUser(user)
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    throw new Error('Cloud user settings must be an object.')
  }
  return writeCloudSingle(
    'user_settings',
    user,
    'settings',
    settings,
    'cloud user settings',
  )
}

export async function deleteCloudUserSettings(user) {
  return deleteCloudSingle('user_settings', user, 'cloud user settings')
}

export async function fetchCloudWorkoutPlanSnapshot(user) {
  return fetchCloudSingleSnapshot(
    'custom_workout_plans',
    user,
    'plan',
    'cloud workout plan',
  )
}

export async function writeCloudWorkoutPlan(user, plan) {
  requireOnlineCloudUser(user)
  if (!Array.isArray(plan)) {
    throw new Error('Cloud workout plan must be an array.')
  }
  return writeCloudSingle(
    'custom_workout_plans',
    user,
    'plan',
    plan,
    'cloud workout plan',
  )
}

export async function deleteCloudWorkoutPlan(user) {
  return deleteCloudSingle(
    'custom_workout_plans',
    user,
    'cloud workout plan',
  )
}

// --- user settings ---------------------------------------------------------

export async function getUserSettings(user) {
  if (!isCloudMode(user)) {
    return localGetSettings()
  }
  if (!isBrowserOnline()) {
    return localGetSettings()
  }
  const cloud = await fetchSingle('user_settings', user, 'settings')
  if (cloud) {
    return localSaveSettings(cloud) // mirror + normalize
  }
  return localGetSettings()
}

export async function saveUserSettings(user, settings) {
  const saved = localSaveSettings(settings)
  if (isCloudMode(user)) {
    if (!isBrowserOnline()) {
      queueSettingsChange('userSettings', 'update', saved, 'offline')
      throw createCloudSyncError(new Error('offline'))
    }

    try {
      await upsertSingle('user_settings', user, 'settings', saved)
    } catch (error) {
      queueSettingsChange('userSettings', 'update', saved, describeError(error))
      throw createCloudSyncError(error)
    }
  }
  return saved
}

// --- custom workout plan ----------------------------------------------------

export async function getCustomWorkoutPlan(user) {
  if (!isCloudMode(user)) {
    return localGetPlan()
  }
  if (!isBrowserOnline()) {
    return localGetPlan()
  }
  const cloud = await fetchSingle('custom_workout_plans', user, 'plan')
  if (cloud) {
    return localSavePlan(cloud)
  }
  return localGetPlan()
}

export async function saveCustomWorkoutPlan(user, plan) {
  const saved = localSavePlan(plan)
  if (isCloudMode(user)) {
    if (!isBrowserOnline()) {
      queueSettingsChange('customWorkoutPlan', 'update', saved, 'offline')
      throw createCloudSyncError(new Error('offline'))
    }

    try {
      await upsertSingle('custom_workout_plans', user, 'plan', saved)
    } catch (error) {
      queueSettingsChange('customWorkoutPlan', 'update', saved, describeError(error))
      throw createCloudSyncError(error)
    }
  }
  return saved
}

// --- custom exercise library ------------------------------------------------

export async function getCustomExerciseLibrary(user) {
  if (!isCloudMode(user)) {
    return localGetLibrary()
  }
  if (!isBrowserOnline()) {
    return localGetLibrary()
  }
  const cloud = await fetchSingle('custom_exercise_libraries', user, 'library')
  if (cloud) {
    return localSaveLibrary(cloud)
  }
  return localGetLibrary()
}

export async function saveCustomExerciseLibrary(user, library) {
  const saved = localSaveLibrary(library)
  if (isCloudMode(user)) {
    if (!isBrowserOnline()) {
      queueSettingsChange('customExerciseLibrary', 'update', saved, 'offline')
      throw createCloudSyncError(new Error('offline'))
    }

    try {
      await upsertSingle('custom_exercise_libraries', user, 'library', saved)
    } catch (error) {
      queueSettingsChange(
        'customExerciseLibrary',
        'update',
        saved,
        describeError(error),
      )
      throw createCloudSyncError(error)
    }
  }
  return saved
}

function queueSettingsChange(type, action, payload, lastError) {
  addToSyncQueue({
    type,
    action,
    payload: { id: type, value: payload },
    lastError,
  })
}
