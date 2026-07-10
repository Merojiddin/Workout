export const BODY_CHECK_INS_KEY = 'bodyCheckIns'
export const NUTRITION_LOGS_KEY = 'nutritionLogs'
export const WORKOUT_SESSIONS_KEY = 'workoutSessions'
export const ACTIVE_WORKOUT_SESSION_KEY = 'activeWorkoutSession'
export const PENDING_SYNC_QUEUE_KEY = 'pendingSyncQueue'
export const CUSTOM_EXERCISE_LIBRARY_KEY = 'customExerciseLibrary'
export const CUSTOM_WORKOUT_PLAN_KEY = 'customWorkoutPlan'
export const USER_PROFILE_SETTINGS_KEY = 'userProfileSettings'
export const REMINDER_SETTINGS_KEY = 'reminderSettings'
export const REMINDER_HISTORY_KEY = 'reminderHistory'
export const SENT_REMINDER_LOG_KEY = 'sentReminderLog'
export const LAST_OFFLINE_SYNC_AT_KEY = 'lastOfflineSyncAt'
export const PRE_DEPLOY_CHECKLIST_KEY = 'preDeployChecklist'
export const CLOUD_HEALTH_LAST_CHECK_KEY = 'cloudHealthLastCheck'

export const FITNESS_APP_STORAGE_KEYS = [
  WORKOUT_SESSIONS_KEY,
  ACTIVE_WORKOUT_SESSION_KEY,
  BODY_CHECK_INS_KEY,
  NUTRITION_LOGS_KEY,
  USER_PROFILE_SETTINGS_KEY,
  CUSTOM_WORKOUT_PLAN_KEY,
  CUSTOM_EXERCISE_LIBRARY_KEY,
  REMINDER_SETTINGS_KEY,
  REMINDER_HISTORY_KEY,
  SENT_REMINDER_LOG_KEY,
  PENDING_SYNC_QUEUE_KEY,
  LAST_OFFLINE_SYNC_AT_KEY,
  PRE_DEPLOY_CHECKLIST_KEY,
  CLOUD_HEALTH_LAST_CHECK_KEY,
]

const JSON_STORAGE_KEYS = new Set([
  WORKOUT_SESSIONS_KEY,
  ACTIVE_WORKOUT_SESSION_KEY,
  BODY_CHECK_INS_KEY,
  NUTRITION_LOGS_KEY,
  USER_PROFILE_SETTINGS_KEY,
  CUSTOM_WORKOUT_PLAN_KEY,
  CUSTOM_EXERCISE_LIBRARY_KEY,
  REMINDER_SETTINGS_KEY,
  REMINDER_HISTORY_KEY,
  SENT_REMINDER_LOG_KEY,
  PENDING_SYNC_QUEUE_KEY,
  PRE_DEPLOY_CHECKLIST_KEY,
  CLOUD_HEALTH_LAST_CHECK_KEY,
])

const APP_KEY_SUFFIXES = ['__cloudBackup']
const FIVE_MB = 5 * 1024 * 1024

/**
 * @param {string} key
 * @param {any} fallback
 * @returns {any}
 */
export function safeGetJSON(key, fallback = null) {
  if (!canUseLocalStorage()) {
    return fallback
  }

  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null || raw === '') {
      return fallback
    }
    return JSON.parse(raw)
  } catch {
    quarantineCorruptedValue(key)
    return fallback
  }
}

/**
 * @param {string} key
 * @param {any} value
 * @returns {boolean}
 */
export function safeSetJSON(key, value) {
  if (!canUseLocalStorage()) {
    return false
  }

  try {
    const serialized = JSON.stringify(value)
    if (typeof serialized !== 'string') {
      return false
    }
    window.localStorage.setItem(key, serialized)
    return true
  } catch {
    return false
  }
}

export function safeRemove(key) {
  if (!canUseLocalStorage()) {
    return false
  }

  try {
    window.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export function backupLocalStorageData() {
  const keys = getFitnessStorageKeys()
  const values = {}

  keys.forEach((key) => {
    const value = getRawStorageValue(key)
    if (value !== null) {
      values[key] = value
    }
  })

  return {
    app: 'Workout OS',
    exportedAt: new Date().toISOString(),
    version: 1,
    keys: values,
  }
}

export function downloadLocalStorageBackup() {
  const backup = backupLocalStorageData()

  if (typeof document === 'undefined' || typeof Blob === 'undefined') {
    return backup
  }

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `workout-os-local-backup-${new Date()
    .toISOString()
    .slice(0, 10)}.json`
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)

  return backup
}

export function restoreLocalStorageBackup(fileData) {
  if (!canUseLocalStorage()) {
    return { success: false, message: 'Local storage is unavailable.' }
  }

  try {
    const parsed =
      typeof fileData === 'string' ? JSON.parse(fileData) : fileData
    const values = getBackupValues(parsed)

    if (!values) {
      return { success: false, message: 'Invalid backup file.' }
    }

    const restored = []
    const skipped = []

    Object.entries(values).forEach(([key, value]) => {
      if (!isFitnessStorageKey(key) || typeof value !== 'string') {
        skipped.push(key)
        return
      }

      if (isJsonStorageKey(key) && !isJsonString(value)) {
        skipped.push(key)
        return
      }

      try {
        window.localStorage.setItem(key, value)
        restored.push(key)
      } catch {
        skipped.push(key)
      }
    })

    if (restored.length === 0) {
      return {
        success: false,
        message: 'No valid app data was found in that backup.',
        restored,
        skipped,
      }
    }

    return {
      success: true,
      message: `Restored ${restored.length} storage item${
        restored.length === 1 ? '' : 's'
      }.`,
      restored,
      skipped,
    }
  } catch {
    return { success: false, message: 'Invalid backup file.' }
  }
}

export function getStorageUsageEstimate() {
  const keys = getFitnessStorageKeys()
  const items = keys.map((key) => {
    const value = getRawStorageValue(key) ?? ''
    return {
      key,
      bytes: estimateBytes(key) + estimateBytes(value),
    }
  })
  const bytes = items.reduce((total, item) => total + item.bytes, 0)

  return {
    bytes,
    kilobytes: bytes / 1024,
    megabytes: bytes / (1024 * 1024),
    percentOfFiveMb: (bytes / FIVE_MB) * 100,
    itemCount: items.length,
    items: items.sort((a, b) => b.bytes - a.bytes),
  }
}

export function cleanupCorruptedStorage(keysToDelete = null) {
  const keys = getFitnessStorageKeys()
    .filter((key) => key.startsWith('corrupted_'))
    .map((key) => ({
      key,
      bytes: estimateBytes(getRawStorageValue(key) ?? ''),
      createdAt: parseCorruptedTimestamp(key),
    }))
    .sort((a, b) => a.key.localeCompare(b.key))

  if (!Array.isArray(keysToDelete)) {
    return {
      keys,
      removed: [],
      count: keys.length,
    }
  }

  const allowed = new Set(keys.map((item) => item.key))
  const removed = []

  keysToDelete.forEach((key) => {
    if (allowed.has(key) && safeRemove(key)) {
      removed.push(key)
    }
  })

  const remaining = keys.filter((item) => !removed.includes(item.key))
  return {
    keys: remaining,
    removed,
    count: remaining.length,
  }
}

export function getFitnessStorageKeys() {
  if (!canUseLocalStorage()) {
    return []
  }

  const keys = new Set()
  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index)
      if (key && isFitnessStorageKey(key)) {
        keys.add(key)
      }
    }
  } catch {
    return []
  }

  FITNESS_APP_STORAGE_KEYS.forEach((key) => {
    if (getRawStorageValue(key) !== null) {
      keys.add(key)
    }
  })

  return Array.from(keys).sort()
}

export function isFitnessStorageKey(key) {
  return (
    FITNESS_APP_STORAGE_KEYS.includes(key) ||
    key.startsWith('corrupted_') ||
    APP_KEY_SUFFIXES.some((suffix) =>
      FITNESS_APP_STORAGE_KEYS.some((appKey) => key === `${appKey}${suffix}`),
    )
  )
}

function quarantineCorruptedValue(key) {
  if (!canUseLocalStorage()) {
    return
  }

  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) {
      return
    }

    const prefix = `corrupted_${key}_`
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const existingKey = window.localStorage.key(index)
      if (
        existingKey?.startsWith(prefix) &&
        window.localStorage.getItem(existingKey) === raw
      ) {
        return
      }
    }

    const backupKey = `corrupted_${key}_${new Date()
      .toISOString()
      .replace(/[:.]/g, '-')}`

    window.localStorage.setItem(backupKey, raw)
  } catch {
    // Best effort only.
  }
}

function getBackupValues(parsed) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return null
  }

  if (parsed.keys && typeof parsed.keys === 'object' && !Array.isArray(parsed.keys)) {
    return parsed.keys
  }

  return parsed
}

function getRawStorageValue(key) {
  if (!canUseLocalStorage()) {
    return null
  }

  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function isJsonStorageKey(key) {
  if (JSON_STORAGE_KEYS.has(key)) {
    return true
  }

  return APP_KEY_SUFFIXES.some((suffix) => {
    if (!key.endsWith(suffix)) {
      return false
    }
    const sourceKey = key.slice(0, -suffix.length)
    return JSON_STORAGE_KEYS.has(sourceKey)
  })
}

function isJsonString(value) {
  try {
    JSON.parse(value)
    return true
  } catch {
    return false
  }
}

function estimateBytes(value) {
  if (typeof Blob !== 'undefined') {
    return new Blob([String(value)]).size
  }
  return String(value).length * 2
}

function parseCorruptedTimestamp(key) {
  const parts = key.split('_')
  const timestamp = parts
    .slice(2)
    .join('_')
    .replace(
      /^(\d{4}-\d{2}-\d{2}T\d{2})-(\d{2})-(\d{2})-(\d{3}Z)$/,
      '$1:$2:$3.$4',
    )
  const parsed = new Date(timestamp)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

function canUseLocalStorage() {
  try {
    return typeof window !== 'undefined' && Boolean(window.localStorage)
  } catch {
    return false
  }
}
