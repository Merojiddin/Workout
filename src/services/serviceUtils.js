import { t } from '../i18n/t'
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
  const syncError = new Error(t('sync.savedLocally'))
  syncError.cause = error
  return syncError
}

export function describeError(error) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  return t('sync.unknownError')
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

/**
 * Cloud rows folded into the local mirror, newest first.
 *
 * A pull must never be a plain replace. A record logged on this device that
 * has not reached the cloud yet - queued offline, or a push that failed - only
 * exists locally, and overwriting the array with the cloud list would take a
 * finished workout off the screen even though it is still waiting to upload.
 *
 * Records are matched on `id`, which is the same value the cloud stores as
 * `local_id`. The newer `updatedAt` wins so an edit made on another device is
 * not undone by a stale local copy, and an edit made here that has not synced
 * yet survives the pull. Records with no id cannot be matched at all, so they
 * are kept as-is rather than dropped.
 */
export function mergeCloudIntoLocal(cloudList, localList) {
  const byId = new Map()
  const unmatchable = []

  const add = (record) => {
    const id = record?.id
    if (id === undefined || id === null || id === '') {
      unmatchable.push(record)
      return
    }

    const key = String(id)
    const existing = byId.get(key)
    if (!existing || sortableTime(record) >= sortableTime(existing)) {
      byId.set(key, record)
    }
  }

  // Local first, so a cloud row of the same age wins the >= comparison: it is
  // the copy that round-tripped through the server.
  safeList(localList).forEach(add)
  safeList(cloudList).forEach(add)

  return [...byId.values(), ...unmatchable].sort(
    (a, b) => recordDate(b).localeCompare(recordDate(a)),
  )
}

function safeList(value) {
  return Array.isArray(value) ? value : []
}

/** `updatedAt` as a number; 0 when absent, so any timestamped copy beats it. */
function sortableTime(record) {
  const parsed = new Date(record?.updatedAt ?? 0).getTime()
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * What the list is ordered by on screen. ISO strings sort correctly as text,
 * and a full timestamp compares correctly against a bare `YYYY-MM-DD` from a
 * different day, which is the only ordering that matters here.
 */
function recordDate(record) {
  const value = record?.finishedAt ?? record?.date ?? ''
  return typeof value === 'string' ? value : ''
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
