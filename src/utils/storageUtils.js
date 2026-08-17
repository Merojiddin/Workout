export const BODY_CHECK_INS_KEY = 'bodyCheckIns'
export const NUTRITION_LOGS_KEY = 'nutritionLogs'
export const WORKOUT_SESSIONS_KEY = 'workoutSessions'
export const ACTIVE_WORKOUT_SESSION_KEY = 'activeWorkoutSession'
export const PENDING_SYNC_QUEUE_KEY = 'pendingSyncQueue'
export const CUSTOM_EXERCISE_LIBRARY_KEY = 'customExerciseLibrary'
export const CUSTOM_WORKOUT_PLAN_KEY = 'customWorkoutPlan'
export const INSTALLED_WORKOUT_PROGRAM_KEY = 'installedWorkoutProgram'
export const DISMISSED_WORKOUT_PROGRAMS_KEY = 'dismissedWorkoutPrograms'
export const WORKOUT_PLAN_BACKUPS_KEY = 'workoutPlanBackups'
export const USER_WORKOUT_PROGRAMS_KEY = 'userWorkoutPrograms'
export const CLOUD_WORKOUT_PROGRAM_MANAGER_CACHE_KEY =
  'cloudWorkoutProgramManagerCache'
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
  INSTALLED_WORKOUT_PROGRAM_KEY,
  DISMISSED_WORKOUT_PROGRAMS_KEY,
  WORKOUT_PLAN_BACKUPS_KEY,
  USER_WORKOUT_PROGRAMS_KEY,
  CLOUD_WORKOUT_PROGRAM_MANAGER_CACHE_KEY,
  CUSTOM_EXERCISE_LIBRARY_KEY,
  REMINDER_SETTINGS_KEY,
  REMINDER_HISTORY_KEY,
  SENT_REMINDER_LOG_KEY,
  PENDING_SYNC_QUEUE_KEY,
  LAST_OFFLINE_SYNC_AT_KEY,
  PRE_DEPLOY_CHECKLIST_KEY,
  CLOUD_HEALTH_LAST_CHECK_KEY,
]

const APP_KEY_SUFFIXES = ['__cloudBackup']
const FIVE_MB = 5 * 1024 * 1024

/**
 * Per-user storage namespacing.
 *
 * Every app key is stored under `u:<userId>:<key>` while a user is signed in,
 * and under its bare name in local (signed-out) mode. Callers always pass the
 * bare "logical" key - resolution happens here - so no page or util needed to
 * change.
 *
 * This is what keeps two people sharing one browser from reading, overwriting,
 * or uploading each other's history: signing in switches the namespace, so the
 * previous user's data is not merely hidden but unreachable through the normal
 * read path.
 */
const NAMESPACE_PREFIX = 'u:'
const LEGACY_CLAIM_KEY = 'legacyLocalDataClaim'

let activeStorageNamespace = null

/** @param {string | null | undefined} userId */
export function setStorageNamespace(userId) {
  const next = normalizeNamespace(userId)
  const changed = next !== activeStorageNamespace
  activeStorageNamespace = next
  return changed
}

function normalizeNamespace(userId) {
  if (typeof userId !== 'string') {
    return null
  }
  const trimmed = userId.trim()
  if (trimmed === '') {
    return null
  }
  // Keep the prefix delimiter unambiguous.
  return trimmed.replace(/:/g, '-')
}

/** Bare key -> the key actually written to localStorage. */
export function resolveStorageKey(key) {
  if (activeStorageNamespace === null) {
    return key
  }
  return `${NAMESPACE_PREFIX}${activeStorageNamespace}:${key}`
}

/**
 * Physical key -> bare key, or null when it belongs to a different namespace.
 */
function toLogicalKey(physicalKey) {
  if (activeStorageNamespace === null) {
    return physicalKey.startsWith(NAMESPACE_PREFIX) ? null : physicalKey
  }

  const prefix = `${NAMESPACE_PREFIX}${activeStorageNamespace}:`
  return physicalKey.startsWith(prefix) ? physicalKey.slice(prefix.length) : null
}

/**
 * One-time migration for data written before namespacing existed.
 *
 * The un-namespaced data belongs to whoever was using the app locally, so the
 * FIRST account to sign in on this device adopts it. Later accounts get a clean
 * slate instead of inheriting someone else's history.
 */
export function claimLegacyLocalDataForUser(userId) {
  const namespace = normalizeNamespace(userId)
  if (!namespace || !canUseLocalStorage()) {
    return { claimed: false, keys: [] }
  }

  try {
    const existingClaim = window.localStorage.getItem(LEGACY_CLAIM_KEY)
    if (existingClaim !== null) {
      return { claimed: false, keys: [], claimedBy: existingClaim }
    }

    const legacyKeys = []
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index)
      if (
        key &&
        !key.startsWith(NAMESPACE_PREFIX) &&
        key !== LEGACY_CLAIM_KEY &&
        isFitnessStorageKey(key)
      ) {
        legacyKeys.push(key)
      }
    }

    // Always record the claim, even with nothing to move, so a second account
    // signing in later can never adopt data the first account creates.
    window.localStorage.setItem(LEGACY_CLAIM_KEY, namespace)

    const moved = []
    legacyKeys.forEach((key) => {
      try {
        const value = window.localStorage.getItem(key)
        if (value === null) {
          return
        }
        window.localStorage.setItem(
          `${NAMESPACE_PREFIX}${namespace}:${key}`,
          value,
        )
        window.localStorage.removeItem(key)
        moved.push(key)
      } catch {
        // Best effort: a quota failure leaves the original key in place.
      }
    })

    return { claimed: true, keys: moved, claimedBy: namespace }
  } catch {
    return { claimed: false, keys: [] }
  }
}
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
    const raw = window.localStorage.getItem(resolveStorageKey(key))
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
    window.localStorage.setItem(resolveStorageKey(key), serialized)
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
    window.localStorage.removeItem(resolveStorageKey(key))
    return true
  } catch {
    return false
  }
}

export function safeHasStorageKey(key) {
  if (!canUseLocalStorage()) {
    return false
  }

  try {
    return window.localStorage.getItem(resolveStorageKey(key)) !== null
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
      const physicalKey = window.localStorage.key(index)
      if (!physicalKey) {
        continue
      }
      // Only surface keys inside the active namespace, so Data Health and
      // backups never expose another account's data.
      const key = toLogicalKey(physicalKey)
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
    const raw = window.localStorage.getItem(resolveStorageKey(key))
    if (raw === null) {
      return
    }

    const prefix = resolveStorageKey(`corrupted_${key}_`)
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

    window.localStorage.setItem(resolveStorageKey(backupKey), raw)
  } catch {
    // Best effort only.
  }
}

function getRawStorageValue(key) {
  if (!canUseLocalStorage()) {
    return null
  }

  try {
    return window.localStorage.getItem(resolveStorageKey(key))
  } catch {
    return null
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
