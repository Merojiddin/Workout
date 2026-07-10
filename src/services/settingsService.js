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
