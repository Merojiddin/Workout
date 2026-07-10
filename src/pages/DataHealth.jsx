import {
  Activity,
  BellOff,
  ClipboardCheck,
  Database,
  Download,
  FlaskConical,
  HardDrive,
  RotateCcw,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  Wrench,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { getEnvironmentLabel } from '../utils/envUtils'
import {
  createProductionTestData,
  hasProductionTestData,
  removeProductionTestData,
} from '../utils/testDataUtils'
import {
  findDuplicateWorkoutSessions,
  findEmptyWorkoutSessions,
  repairBodyCheckIns,
  repairNutritionLogs,
  repairWorkoutSessions,
  validateBodyCheckIns,
  validateNutritionLogs,
  validatePendingSyncQueue,
  validateWorkoutSessions,
} from '../utils/dataValidationUtils'
import {
  ACTIVE_WORKOUT_SESSION_KEY,
  BODY_CHECK_INS_KEY,
  CUSTOM_EXERCISE_LIBRARY_KEY,
  CUSTOM_WORKOUT_PLAN_KEY,
  FITNESS_APP_STORAGE_KEYS,
  NUTRITION_LOGS_KEY,
  PENDING_SYNC_QUEUE_KEY,
  REMINDER_HISTORY_KEY,
  USER_PROFILE_SETTINGS_KEY,
  WORKOUT_SESSIONS_KEY,
  backupLocalStorageData,
  cleanupCorruptedStorage,
  downloadLocalStorageBackup,
  getFitnessStorageKeys,
  getStorageUsageEstimate,
  safeGetJSON,
  safeRemove,
  safeSetJSON,
} from '../utils/storageUtils'

const STORAGE_HIGH_BYTES = 2.5 * 1024 * 1024

export function DataHealth({ onNavigate }) {
  const [notice, setNotice] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const { runtime, mode } = getEnvironmentLabel()

  const snapshot = buildSnapshot(refreshKey)
  const allIssues = [
    ...snapshot.validation.workouts,
    ...snapshot.validation.checkIns,
    ...snapshot.validation.nutrition,
    ...snapshot.validation.pendingSync,
  ]
  const hasHighUsage = snapshot.storage.bytes >= STORAGE_HIGH_BYTES

  function refresh(message) {
    setNotice(message)
    setRefreshKey((key) => key + 1)
  }

  function createBackup() {
    downloadLocalStorageBackup()
    refresh('Backup downloaded.')
  }

  function repairMinorIssues() {
    if (
      !confirmAction(
        'Repair minor issues by normalizing workout, body, and nutrition data?',
      )
    ) {
      return
    }

    const sessions = readArray(WORKOUT_SESSIONS_KEY)
    const checkIns = readArray(BODY_CHECK_INS_KEY)
    const logs = readArray(NUTRITION_LOGS_KEY)

    safeSetJSON(WORKOUT_SESSIONS_KEY, repairWorkoutSessions(sessions))
    safeSetJSON(BODY_CHECK_INS_KEY, repairBodyCheckIns(checkIns))
    safeSetJSON(NUTRITION_LOGS_KEY, repairNutritionLogs(logs))
    refresh('Minor repair completed.')
  }

  function removeDuplicateWorkoutSessions() {
    const duplicates = findDuplicateWorkoutSessions(snapshot.workoutSessions)
    if (duplicates.length === 0) {
      refresh('No duplicate workout sessions found.')
      return
    }
    if (
      !confirmAction(
        `Remove ${duplicates.length} duplicate workout session${
          duplicates.length === 1 ? '' : 's'
        }?`,
      )
    ) {
      return
    }

    safeSetJSON(
      WORKOUT_SESSIONS_KEY,
      dedupeWorkoutSessions(snapshot.workoutSessions),
    )
    refresh('Duplicate workout sessions removed.')
  }

  function removeEmptyWorkoutSessions() {
    const emptySessions = findEmptyWorkoutSessions(snapshot.workoutSessions)
    if (emptySessions.length === 0) {
      refresh('No empty workout sessions found.')
      return
    }
    if (
      !confirmAction(
        `Remove ${emptySessions.length} empty workout session${
          emptySessions.length === 1 ? '' : 's'
        }?`,
      )
    ) {
      return
    }

    const emptySet = new Set(emptySessions)
    safeSetJSON(
      WORKOUT_SESSIONS_KEY,
      snapshot.workoutSessions.filter((session) => !emptySet.has(session)),
    )
    refresh('Empty workout sessions removed.')
  }

  function removeCorruptedKeys() {
    const keys = snapshot.corruptedKeys.map((item) => item.key)
    if (keys.length === 0) {
      refresh('No corrupted storage keys found.')
      return
    }
    if (
      !confirmAction(
        `Remove ${keys.length} corrupted storage backup${
          keys.length === 1 ? '' : 's'
        }?`,
      )
    ) {
      return
    }

    cleanupCorruptedStorage(keys)
    refresh('Corrupted storage keys removed.')
  }

  function clearFailedSyncQueue() {
    const queue = readArray(PENDING_SYNC_QUEUE_KEY)
    const next = queue.filter(
      (item) => item?.status !== 'failed' && Number(item?.attempts ?? 0) < 5,
    )
    const removed = queue.length - next.length

    if (removed === 0) {
      refresh('No failed sync items found.')
      return
    }
    if (
      !confirmAction(
        `Clear ${removed} failed sync item${removed === 1 ? '' : 's'}?`,
      )
    ) {
      return
    }

    safeSetJSON(PENDING_SYNC_QUEUE_KEY, next)
    refresh('Failed sync queue cleared.')
  }

  function clearReminderHistory() {
    if (!confirmAction('Clear reminder history from this browser?')) {
      return
    }

    safeSetJSON(REMINDER_HISTORY_KEY, [])
    refresh('Reminder history cleared.')
  }

  function clearActiveWorkout() {
    if (!confirmAction('Clear the active workout saved on this browser?')) {
      return
    }

    safeRemove(ACTIVE_WORKOUT_SESSION_KEY)
    refresh('Active workout cleared.')
  }

  function handleCreateTestData() {
    if (
      !confirmAction(
        'Create small demo data (1 workout, 1 body check-in, 1 nutrition log) for production testing?',
      )
    ) {
      return
    }

    const result = createProductionTestData()
    refresh(result.message)
  }

  function handleRemoveTestData() {
    if (!hasProductionTestData()) {
      refresh('No production test data found.')
      return
    }
    if (!confirmAction('Remove all production test data records?')) {
      return
    }

    const result = removeProductionTestData()
    refresh(result.message)
  }

  function resetAllLocalData() {
    const backup = backupLocalStorageData()
    const keyCount = Object.keys(backup.keys).length
    if (
      !confirmAction(
        `Reset all local app data on this browser? A backup snapshot for ${keyCount} item${
          keyCount === 1 ? '' : 's'
        } will be downloaded first.`,
      )
    ) {
      return
    }

    downloadLocalStorageBackup()
    getFitnessStorageKeys().forEach((key) => safeRemove(key))
    refresh('All local app data reset.')
  }

  return (
    <section className="data-health-page">
      <header className="progress-hero data-health-hero">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Data Health</h1>
          <p>Stability checks, local backup tools, and guarded cleanup actions.</p>
          <div className="env-badge-row">
            <span
              className={`env-badge ${
                runtime === 'Production'
                  ? 'env-badge--production'
                  : 'env-badge--development'
              }`}
            >
              {runtime}
            </span>
            <span
              className={`env-badge ${
                mode === 'Cloud Mode' ? 'env-badge--cloud' : 'env-badge--local'
              }`}
            >
              {mode}
            </span>
          </div>
        </div>
        <div className="settings-hero-actions">
          <button
            className="workout-primary-button"
            onClick={createBackup}
            type="button"
          >
            <Download size={19} strokeWidth={2.4} aria-hidden="true" />
            Create Full Backup
          </button>
          {onNavigate ? (
            <button
              className="workout-secondary-button"
              onClick={() => onNavigate('pre-deploy-checklist')}
              type="button"
            >
              <ClipboardCheck size={19} strokeWidth={2.4} aria-hidden="true" />
              Pre-Deploy Checklist
            </button>
          ) : null}
        </div>
      </header>

      {notice ? (
        <div className="settings-notice" role="status">
          <ShieldCheck size={18} strokeWidth={2.4} aria-hidden="true" />
          {notice}
        </div>
      ) : null}

      <section className="data-health-grid">
        <article className="dashboard-card data-health-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Data Summary</p>
              <h2>Local mirror status</h2>
            </div>
            <Database size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>

          <div className="data-health-summary-grid">
            {snapshot.summary.map((item) => (
              <div className="data-health-metric" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card data-health-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Storage Usage</p>
              <h2>{formatBytes(snapshot.storage.bytes)}</h2>
            </div>
            <HardDrive size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>

          <div className="data-health-storage-meter" aria-hidden="true">
            <span
              style={{
                width: `${Math.min(snapshot.storage.percentOfFiveMb, 100)}%`,
              }}
            />
          </div>
          <p
            className={
              hasHighUsage
                ? 'data-health-message data-health-message--warn'
                : 'data-health-message data-health-message--good'
            }
          >
            {hasHighUsage
              ? 'Storage usage high. Consider migrating photos to cloud or exporting backup.'
              : 'Storage usage normal.'}
          </p>

          {snapshot.storage.items.length > 0 ? (
            <div className="data-health-storage-list">
              {snapshot.storage.items.slice(0, 5).map((item) => (
                <div key={item.key}>
                  <span>{formatStorageKey(item.key)}</span>
                  <strong>{formatBytes(item.bytes)}</strong>
                </div>
              ))}
            </div>
          ) : null}
        </article>
      </section>

      <article className="dashboard-card data-health-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Data Validation</p>
            <h2>{allIssues.length} warning{allIssues.length === 1 ? '' : 's'}</h2>
          </div>
          <TriangleAlert size={22} strokeWidth={2.4} aria-hidden="true" />
        </div>

        {allIssues.length === 0 ? (
          <div className="data-health-empty">
            <ShieldCheck size={24} strokeWidth={2.4} aria-hidden="true" />
            <strong>No validation warnings found.</strong>
          </div>
        ) : (
          <div className="data-health-issue-grid">
            <IssueGroup title="Workout sessions" issues={snapshot.validation.workouts} />
            <IssueGroup title="Body check-ins" issues={snapshot.validation.checkIns} />
            <IssueGroup title="Nutrition logs" issues={snapshot.validation.nutrition} />
            <IssueGroup title="Pending sync" issues={snapshot.validation.pendingSync} />
          </div>
        )}
      </article>

      <article className="dashboard-card data-health-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Repair Tools</p>
            <h2>Guarded cleanup actions</h2>
          </div>
          <Wrench size={22} strokeWidth={2.4} aria-hidden="true" />
        </div>

        <div className="data-health-action-grid">
          <button
            className="workout-primary-button"
            onClick={createBackup}
            type="button"
          >
            <Download size={19} strokeWidth={2.4} aria-hidden="true" />
            Create Full Backup
          </button>
          <button
            className="workout-secondary-button"
            onClick={repairMinorIssues}
            type="button"
          >
            <Wrench size={19} strokeWidth={2.4} aria-hidden="true" />
            Repair Minor Issues
          </button>
          <button
            className="workout-secondary-button"
            onClick={removeDuplicateWorkoutSessions}
            type="button"
          >
            <Activity size={19} strokeWidth={2.4} aria-hidden="true" />
            Remove Duplicate Workout Sessions
          </button>
          <button
            className="workout-secondary-button"
            onClick={removeEmptyWorkoutSessions}
            type="button"
          >
            <XCircle size={19} strokeWidth={2.4} aria-hidden="true" />
            Remove Empty Workout Sessions
          </button>
          <button
            className="workout-secondary-button"
            onClick={removeCorruptedKeys}
            type="button"
          >
            <Trash2 size={19} strokeWidth={2.4} aria-hidden="true" />
            Remove Corrupted Keys
          </button>
          <button
            className="workout-secondary-button"
            onClick={clearFailedSyncQueue}
            type="button"
          >
            <RotateCcw size={19} strokeWidth={2.4} aria-hidden="true" />
            Clear Failed Sync Queue
          </button>
          <button
            className="workout-secondary-button"
            onClick={clearReminderHistory}
            type="button"
          >
            <BellOff size={19} strokeWidth={2.4} aria-hidden="true" />
            Clear Reminder History
          </button>
          <button
            className="workout-secondary-button"
            onClick={clearActiveWorkout}
            type="button"
          >
            <XCircle size={19} strokeWidth={2.4} aria-hidden="true" />
            Clear Active Workout
          </button>
          <button
            className="workout-secondary-button workout-secondary-button--danger"
            onClick={resetAllLocalData}
            type="button"
          >
            <Trash2 size={19} strokeWidth={2.4} aria-hidden="true" />
            Reset All Local Data
          </button>
        </div>
      </article>

      <article className="dashboard-card data-health-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Production Test Data</p>
            <h2>Deployment smoke test</h2>
          </div>
          <FlaskConical size={22} strokeWidth={2.4} aria-hidden="true" />
        </div>

        <p className="data-health-message data-health-message--good">
          Small demo records (marked isTestData) for verifying a fresh
          deployment: lists, charts, sync, and export. Remove them when the
          test is done.
        </p>

        <div className="data-health-action-grid">
          <button
            className="workout-primary-button"
            onClick={handleCreateTestData}
            type="button"
          >
            <FlaskConical size={19} strokeWidth={2.4} aria-hidden="true" />
            Create Production Test Data
          </button>
          <button
            className="workout-secondary-button"
            onClick={handleRemoveTestData}
            type="button"
          >
            <Trash2 size={19} strokeWidth={2.4} aria-hidden="true" />
            Remove Production Test Data
          </button>
        </div>
      </article>
    </section>
  )
}

function IssueGroup({ title, issues }) {
  return (
    <section className="data-health-issue-group">
      <h3>{title}</h3>
      {issues.length === 0 ? (
        <p>No warnings.</p>
      ) : (
        <ul>
          {issues.slice(0, 30).map((issue, index) => (
            <li key={`${issue.id}-${index}`}>
              <strong>{issue.message}</strong>
              <span>{issue.scope}</span>
            </li>
          ))}
        </ul>
      )}
      {issues.length > 30 ? (
        <p>{issues.length - 30} more warnings hidden.</p>
      ) : null}
    </section>
  )
}

function buildSnapshot(refreshKey) {
  void refreshKey
  const workoutSessions = readArray(WORKOUT_SESSIONS_KEY)
  const bodyCheckIns = readArray(BODY_CHECK_INS_KEY)
  const nutritionLogs = readArray(NUTRITION_LOGS_KEY)
  const reminderHistory = readArray(REMINDER_HISTORY_KEY)
  const pendingSyncQueue = readArray(PENDING_SYNC_QUEUE_KEY)
  const customWorkoutPlan = safeGetJSON(CUSTOM_WORKOUT_PLAN_KEY, null)
  const customExerciseLibrary = safeGetJSON(CUSTOM_EXERCISE_LIBRARY_KEY, null)
  const userSettings = safeGetJSON(USER_PROFILE_SETTINGS_KEY, null)
  const activeWorkout = safeGetJSON(ACTIVE_WORKOUT_SESSION_KEY, null)
  const corruptedKeys = cleanupCorruptedStorage().keys
  const storage = getStorageUsageEstimate()

  return {
    activeWorkout,
    bodyCheckIns,
    corruptedKeys,
    nutritionLogs,
    pendingSyncQueue,
    storage,
    summary: [
      { label: 'Workout sessions', value: workoutSessions.length },
      { label: 'Body check-ins', value: bodyCheckIns.length },
      { label: 'Nutrition logs', value: nutritionLogs.length },
      { label: 'Reminder history', value: reminderHistory.length },
      { label: 'Pending sync items', value: pendingSyncQueue.length },
      { label: 'Custom workout plan', value: yesNo(Boolean(customWorkoutPlan)) },
      {
        label: 'Custom exercise library',
        value: yesNo(Boolean(customExerciseLibrary)),
      },
      { label: 'User settings', value: yesNo(Boolean(userSettings)) },
      { label: 'Active workout', value: yesNo(Boolean(activeWorkout)) },
      { label: 'Corrupted storage keys', value: corruptedKeys.length },
    ],
    validation: {
      checkIns: validateBodyCheckIns(bodyCheckIns),
      nutrition: validateNutritionLogs(nutritionLogs),
      pendingSync: validatePendingSyncQueue(pendingSyncQueue),
      workouts: validateWorkoutSessions(workoutSessions),
    },
    workoutSessions,
  }
}

function readArray(key) {
  const value = safeGetJSON(key, [])
  return Array.isArray(value) ? value : []
}

function dedupeWorkoutSessions(sessions) {
  const seen = new Set()
  return sessions.filter((session, index) => {
    const signature = getSessionSignature(session, index)
    if (seen.has(signature)) {
      return false
    }
    seen.add(signature)
    return true
  })
}

function getSessionSignature(session, index) {
  if (!session || typeof session !== 'object') {
    return `malformed-${index}`
  }
  if (typeof session.id === 'string' && session.id.trim()) {
    return `id:${session.id}`
  }
  return [
    'session',
    session.date ?? '',
    session.workoutName ?? '',
    session.startedAt ?? '',
    session.finishedAt ?? '',
  ].join('|')
}

function confirmAction(message) {
  if (typeof window === 'undefined') {
    return false
  }
  return window.confirm(message)
}

function yesNo(value) {
  return value ? 'Yes' : 'No'
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 KB'
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }
  return `${Math.max(bytes / 1024, 0.1).toFixed(1)} KB`
}

function formatStorageKey(key) {
  const known = FITNESS_APP_STORAGE_KEYS.includes(key)
  return known ? key : key.replace(/^corrupted_/, 'corrupted ')
}
