import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import {
  resolveStorageKey,
  safeGetJSON,
  safeSetJSON,
} from '../utils/storageUtils'

/**
 * Step 12 - shared service helpers.
 *
 * Services follow an offline-first "mirror" pattern:
 *  - localStorage is always kept up to date (so existing pages keep working).
 *  - in cloud mode the same data is also pushed to / pulled from Supabase.
 */

/** True only when Supabase is configured AND a user is signed in. */
export function isCloudMode(user) {
  return isSupabaseConfigured && Boolean(supabase) && Boolean(user && user.id)
}

export { supabase, isSupabaseConfigured }

export function isBrowserOnline() {
  if (typeof window === 'undefined' || typeof window.navigator === 'undefined') {
    return true
  }
  return window.navigator.onLine
}

export function withSyncMetadata(record, syncStatus) {
  if (!record || typeof record !== 'object') {
    return record
  }
  return {
    ...record,
    syncStatus,
    updatedAt: new Date().toISOString(),
  }
}

export function createCloudSyncError(error) {
  const syncError = new Error('Saved locally. Cloud sync failed.')
  syncError.cause = error
  return syncError
}

export function describeError(error) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  return 'unknown error'
}

export function num(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function bool(value) {
  return typeof value === 'boolean' ? value : Boolean(value)
}

/** Whole minutes between two ISO timestamps (null when unknown). */
export function durationMinutes(start, end) {
  if (!start || !end) {
    return null
  }
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (!Number.isFinite(ms) || ms < 0) {
    return null
  }
  return Math.round(ms / 60000)
}

export function readArrayKey(key) {
  if (typeof window === 'undefined') {
    return []
  }
  const parsed = safeGetJSON(key, [])
  return Array.isArray(parsed) ? parsed : []
}

export function writeArrayKey(key, value) {
  if (typeof window === 'undefined') {
    return
  }
  safeSetJSON(key, Array.isArray(value) ? value : [])
}

export function readJsonKey(key) {
  if (typeof window === 'undefined') {
    return null
  }
  return safeGetJSON(key, null)
}

export function writeJsonKey(key, value) {
  if (typeof window === 'undefined') {
    return
  }
  safeSetJSON(key, value)
}

/** Copy the current value of a key to "<key>__cloudBackup" before overwriting. */
export function backupLocalKey(key) {
  if (typeof window === 'undefined') {
    return
  }
  try {
    // Must go through resolveStorageKey so the backup lands in the signed-in
    // user's namespace instead of a shared global key.
    const current = window.localStorage.getItem(resolveStorageKey(key))
    if (current !== null) {
      window.localStorage.setItem(
        resolveStorageKey(`${key}__cloudBackup`),
        current,
      )
    }
  } catch {
    // Best-effort.
  }
}
