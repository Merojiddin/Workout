import { resolveStorageKey, safeGetJSON, safeSetJSON } from './storageUtils'

export const PENDING_SYNC_QUEUE_KEY = 'pendingSyncQueue'
export const LAST_OFFLINE_SYNC_AT_KEY = 'lastOfflineSyncAt'

const MAX_ATTEMPTS = 5
const VALID_TYPES = new Set([
  'workoutSession',
  'bodyCheckIn',
  'nutritionLog',
  'userSettings',
  'customWorkoutPlan',
  'customExerciseLibrary',
])

const VALID_ACTIONS = new Set(['create', 'update', 'delete'])

export function addToSyncQueue(item) {
  const normalized = normalizeNewQueueItem(item)
  if (!normalized) {
    return null
  }

  const queue = getSyncQueue()
  const payloadId = getPayloadId(normalized.payload)
  const existingIndex = queue.findIndex(
    (queued) =>
      queued.type === normalized.type &&
      getPayloadId(queued.payload) === payloadId &&
      queued.status !== 'failed',
  )

  if (existingIndex >= 0) {
    const existing = queue[existingIndex]
    queue[existingIndex] = {
      ...existing,
      ...normalized,
      id: existing.id,
      action:
        normalized.action === 'delete'
          ? 'delete'
          : existing.action === 'create'
            ? 'create'
            : normalized.action,
      attempts: 0,
      createdAt: existing.createdAt,
      lastError: null,
      status: 'pending',
    }
  } else {
    queue.push(normalized)
  }

  writeQueue(queue)
  return normalized
}

export function getSyncQueue() {
  if (typeof window === 'undefined') {
    return []
  }

  const parsed = safeGetJSON(PENDING_SYNC_QUEUE_KEY, [])
  if (!Array.isArray(parsed)) {
    return []
  }
  return parsed.map(normalizeStoredQueueItem).filter(Boolean)
}

export function removeFromSyncQueue(id) {
  const queue = getSyncQueue().filter((item) => item.id !== id)
  writeQueue(queue)
  return queue
}

export function updateSyncQueueItem(id, updates) {
  const queue = getSyncQueue().map((item) =>
    item.id === id ? normalizeStoredQueueItem({ ...item, ...updates }) : item,
  ).filter(Boolean)
  writeQueue(queue)
  return queue.find((item) => item.id === id) ?? null
}

export function getPendingSyncCount() {
  return getSyncQueue().filter(
    (item) => item.status !== 'failed' && item.attempts < MAX_ATTEMPTS,
  ).length
}

export function getFailedSyncCount() {
  return getSyncQueue().filter(
    (item) => item.status === 'failed' || item.attempts >= MAX_ATTEMPTS,
  ).length
}

export function clearFailedSyncItems() {
  const next = getSyncQueue().filter(
    (item) => item.status !== 'failed' && item.attempts < MAX_ATTEMPTS,
  )
  writeQueue(next)
  return next
}

export function getLastOfflineSyncAt() {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    return window.localStorage.getItem(
      resolveStorageKey(LAST_OFFLINE_SYNC_AT_KEY),
    )
  } catch {
    return null
  }
}

export function setLastOfflineSyncAt(value = new Date().toISOString()) {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    window.localStorage.setItem(
      resolveStorageKey(LAST_OFFLINE_SYNC_AT_KEY),
      value,
    )
    return value
  } catch {
    return null
  }
}

function normalizeNewQueueItem(item) {
  const normalized = normalizeStoredQueueItem({
    id: item?.id ?? createQueueId(),
    type: item?.type,
    action: item?.action,
    payload: item?.payload,
    createdAt: item?.createdAt ?? new Date().toISOString(),
    attempts: item?.attempts ?? 0,
    lastError: item?.lastError ?? null,
    status: item?.status ?? 'pending',
  })

  return normalized
}

function normalizeStoredQueueItem(item) {
  if (!item || typeof item !== 'object') {
    return null
  }
  if (!VALID_TYPES.has(item.type) || !VALID_ACTIONS.has(item.action)) {
    return null
  }

  return {
    id: typeof item.id === 'string' && item.id ? item.id : createQueueId(),
    type: item.type,
    action: item.action,
    payload: item.payload ?? null,
    createdAt:
      typeof item.createdAt === 'string' && item.createdAt
        ? item.createdAt
        : new Date().toISOString(),
    attempts: normalizeAttempts(item.attempts),
    lastError:
      typeof item.lastError === 'string' && item.lastError
        ? item.lastError
        : null,
    status:
      item.status === 'failed' || normalizeAttempts(item.attempts) >= MAX_ATTEMPTS
        ? 'failed'
        : 'pending',
  }
}

function normalizeAttempts(value) {
  const attempts = Number(value)
  return Number.isFinite(attempts) && attempts > 0 ? Math.floor(attempts) : 0
}

function getPayloadId(payload) {
  if (!payload || typeof payload !== 'object') {
    return ''
  }
  return String(payload.id ?? payload.localId ?? payload.local_id ?? '')
}

function writeQueue(queue) {
  if (typeof window === 'undefined') {
    return
  }
  if (safeSetJSON(PENDING_SYNC_QUEUE_KEY, queue)) {
    window.dispatchEvent(new CustomEvent('offline-sync-queue-changed'))
  }
}

function createQueueId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `sync-${Date.now()}-${Math.random().toString(16).slice(2)}`
}
