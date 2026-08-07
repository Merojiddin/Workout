import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Download,
  Eye,
  Package,
  RotateCcw,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { exerciseLibrary } from '../data/exerciseLibrary'
import type { WorkoutDay } from '../data/workoutPlan'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import {
  dismissWorkoutProgramInCloud,
  getHydratedCloudWorkoutProgramManager,
  installWorkoutProgramInCloud,
  restoreWorkoutProgramBackupInCloud,
  type CloudProgramOperationStatus,
  type CloudWorkoutPlanBackup,
} from '../services/workoutProgramService'
import {
  CURRENT_DEFAULT_PROGRAM_ID,
  getLatestWorkoutProgramById,
  getWorkoutProgramByIdAndVersion,
  getWorkoutPrograms,
  getWorkoutProgramValidationResults,
} from '../data/workoutProgramRegistry'
import type { WorkoutProgram } from '../types/workoutProgram'
import { exportWorkoutPlanJSON } from '../utils/exportUtils'
import {
  getCustomWorkoutPlan,
  getExerciseTargetLabel,
  hasCustomWorkoutPlan,
} from '../utils/settingsUtils'
import {
  areLocalProgramChangesDisabled,
  areWorkoutPlansEquivalent,
  compareWorkoutPlans,
  dismissWorkoutProgram,
  getDismissedWorkoutPrograms,
  getInstalledWorkoutProgram,
  getWorkoutPlanBackups,
  getWorkoutProgramChangeProtection,
  installWorkoutProgramLocally,
  restoreWorkoutPlanBackup,
  type DismissedWorkoutProgram,
  type InstalledWorkoutProgram,
  type WorkoutPlanBackup,
} from '../utils/workoutProgramManager'

interface WorkoutProgramManagerProps {
  hasUnsavedPlanChanges: boolean
  plan: WorkoutDay[]
  onPlanChanged: (plan: WorkoutDay[]) => void
  onDataChanged?: () => void
}

interface ManagerState {
  activeWorkoutBlocked: boolean
  cloudBackups: CloudWorkoutPlanBackup[]
  dismissed: DismissedWorkoutProgram[]
  errors: string[]
  hasStoredCustomPlan: boolean
  installed: InstalledWorkoutProgram | null
  localBackups: WorkoutPlanBackup[]
  savedPlan: WorkoutDay[]
}

type ProgramStatus = 'Current' | 'Available' | 'Dismissed' | 'Legacy'
type ManagerNotice = {
  message: string
  tone: 'success' | 'error'
}

const programs = getWorkoutPrograms()
const validationResults = getWorkoutProgramValidationResults()
const CLOUD_OFFLINE_MESSAGE =
  'Connect to the internet before changing a cloud workout program.'

export function WorkoutProgramManager({
  hasUnsavedPlanChanges,
  plan,
  onDataChanged,
  onPlanChanged,
}: WorkoutProgramManagerProps) {
  const { isSupabaseConfigured, user } = useAuth()
  const { isOnline } = useOnlineStatus()
  const cloudActive = isSupabaseConfigured && Boolean(user)
  const [managerState, setManagerState] = useState<ManagerState>(() =>
    readManagerState(user?.id ?? null),
  )
  const [previewProgram, setPreviewProgram] = useState<WorkoutProgram | null>(null)
  const [installProgram, setInstallProgram] = useState<WorkoutProgram | null>(null)
  const [showDismissed, setShowDismissed] = useState(false)
  const [notice, setNotice] = useState<ManagerNotice | null>(null)
  const [operationBusy, setOperationBusy] = useState(false)
  const [operationStatus, setOperationStatus] =
    useState<CloudProgramOperationStatus | null>(null)

  const dismissedIdentities = useMemo(
    () =>
      new Set(
        managerState.dismissed.map((entry) =>
          programIdentity(entry.id, entry.version),
        ),
      ),
    [managerState.dismissed],
  )
  const installedRegistryProgram = managerState.installed
    ? getWorkoutProgramByIdAndVersion(
        managerState.installed.id,
        managerState.installed.version,
      )
    : undefined
  const modifiedAfterInstallation = Boolean(
    installedRegistryProgram &&
      !areWorkoutPlansEquivalent(
        managerState.savedPlan,
        installedRegistryProgram.days,
      ),
  )
  const currentPlanName = installedRegistryProgram
    ? `${installedRegistryProgram.name}${modifiedAfterInstallation ? ' (modified)' : ''}`
    : managerState.hasStoredCustomPlan
      ? 'Custom workout plan'
      : getLatestWorkoutProgramById(CURRENT_DEFAULT_PROGRAM_ID)?.name ??
        'Original weekly workout plan'
  const dismissedCount = programs.filter((program) =>
    dismissedIdentities.has(programIdentity(program.id, program.version)),
  ).length
  const visiblePrograms = programs.filter(
    (program) =>
      showDismissed ||
      !dismissedIdentities.has(programIdentity(program.id, program.version)),
  )

  useEffect(() => {
    if (!previewProgram && !installProgram) {
      return undefined
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && !operationBusy) {
        setPreviewProgram(null)
        setInstallProgram(null)
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [installProgram, operationBusy, previewProgram])

  useEffect(() => {
    setManagerState(readManagerState(user?.id ?? null))
  }, [plan, user?.id])

  useEffect(() => {
    function refreshFromStorage() {
      setManagerState(readManagerState(user?.id ?? null))
    }

    function refreshWhenVisible() {
      if (document.visibilityState === 'visible') {
        refreshFromStorage()
      }
    }

    window.addEventListener('focus', refreshFromStorage)
    window.addEventListener('storage', refreshFromStorage)
    document.addEventListener('visibilitychange', refreshWhenVisible)
    return () => {
      window.removeEventListener('focus', refreshFromStorage)
      window.removeEventListener('storage', refreshFromStorage)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [user?.id])

  function refreshState() {
    const next = readManagerState(user?.id ?? null)
    setManagerState(next)
    return next
  }

  async function keepCurrentPlan(program: WorkoutProgram) {
    if (cloudActive) {
      if (!isOnline) {
        setNotice({ message: CLOUD_OFFLINE_MESSAGE, tone: 'error' })
        return
      }

      setNotice(null)
      setOperationStatus(null)
      setOperationBusy(true)
      try {
        const result = await dismissWorkoutProgramInCloud(program, user)
        setNotice({
          message: result.message,
          tone: result.success ? 'success' : 'error',
        })
        if (result.success) {
          refreshState()
        }
      } finally {
        setOperationStatus(null)
        setOperationBusy(false)
      }
      return
    }

    const result = dismissWorkoutProgram(program.id, program.version)
    setNotice({
      message: result.message,
      tone: result.success ? 'success' : 'error',
    })
    if (result.success) {
      refreshState()
    }
  }

  function openInstallConfirmation(program: WorkoutProgram) {
    refreshState()
    setInstallProgram(program)
  }

  async function confirmInstallation(program: WorkoutProgram) {
    if (hasUnsavedPlanChanges) {
      setNotice({
        message: 'Save your manual plan edits before installing a workout program.',
        tone: 'error',
      })
      return
    }
    if (cloudActive) {
      if (!isOnline) {
        setNotice({ message: CLOUD_OFFLINE_MESSAGE, tone: 'error' })
        return
      }

      setNotice(null)
      setOperationStatus(null)
      setOperationBusy(true)
      let cloudPlanChanged = false
      try {
        const result = await installWorkoutProgramInCloud(program, user, {
          onStatus: setOperationStatus,
        })
        setNotice({
          message: result.message,
          tone: result.success ? 'success' : 'error',
        })
        if (result.success && result.data.plan) {
          onPlanChanged(result.data.plan)
          setInstallProgram(null)
          cloudPlanChanged = true
        }
        refreshState()
      } finally {
        setOperationStatus(null)
        setOperationBusy(false)
      }
      if (cloudPlanChanged) {
        onDataChanged?.()
      }
      return
    }

    const result = installWorkoutProgramLocally(program, {
      cloudMode: cloudActive,
    })
    setNotice({
      message: result.success
        ? result.message
        : [result.message, ...result.details].join(' '),
      tone: result.success ? 'success' : 'error',
    })
    if (result.success && result.data.plan) {
      onPlanChanged(result.data.plan)
      setInstallProgram(null)
    }
    refreshState()
  }

  function restoreLocalBackup(backup: WorkoutPlanBackup) {
    if (hasUnsavedPlanChanges) {
      setNotice({
        message: 'Save your manual plan edits before restoring a workout plan backup.',
        tone: 'error',
      })
      return
    }
    if (cloudActive) {
      setNotice({
        message: 'Use a Cloud backup when cloud sync is active.',
        tone: 'error',
      })
      return
    }
    if (
      !window.confirm(
        'Restore this workout plan backup? Your current plan will be backed up first.',
      )
    ) {
      return
    }

    const result = restoreWorkoutPlanBackup(backup.id, {
      cloudMode: cloudActive,
    })
    setNotice({
      message: result.success
        ? result.message
        : [result.message, ...result.details].join(' '),
      tone: result.success ? 'success' : 'error',
    })
    if (result.success && result.data.plan) {
      onPlanChanged(result.data.plan)
    }
    refreshState()
  }

  async function restoreCloudBackup(backup: CloudWorkoutPlanBackup) {
    if (hasUnsavedPlanChanges) {
      setNotice({
        message: 'Save your manual plan edits before restoring a workout plan backup.',
        tone: 'error',
      })
      return
    }
    if (!isOnline) {
      setNotice({ message: CLOUD_OFFLINE_MESSAGE, tone: 'error' })
      return
    }
    if (managerState.activeWorkoutBlocked) {
      setNotice({
        message: 'Finish or discard the active workout before changing programs.',
        tone: 'error',
      })
      return
    }
    if (
      !window.confirm(
        'Restore this cloud workout plan backup? Your current local and cloud plans will be backed up first.',
      )
    ) {
      return
    }

    setNotice(null)
    setOperationStatus(null)
    setOperationBusy(true)
    let cloudPlanChanged = false
    try {
      const result = await restoreWorkoutProgramBackupInCloud(backup.id, user, {
        onStatus: setOperationStatus,
      })
      setNotice({
        message: result.message,
        tone: result.success ? 'success' : 'error',
      })
      if (result.success && result.data.plan) {
        onPlanChanged(result.data.plan)
        cloudPlanChanged = true
      }
      refreshState()
    } finally {
      setOperationStatus(null)
      setOperationBusy(false)
    }
    if (cloudPlanChanged) {
      onDataChanged?.()
    }
  }

  return (
    <section className="program-manager" aria-labelledby="workout-programs-title">
      <div className="program-manager__heading">
        <div>
          <p className="eyebrow">
            {cloudActive ? 'Cloud Program Manager' : 'Local Program Manager'}
          </p>
          <h2 id="workout-programs-title">Workout Programs</h2>
          <p>
            {cloudActive
              ? 'Preview discovered programs, install with verified local and cloud backups, or keep your current plan.'
              : 'Preview discovered programs, install one with a local backup, or keep your current custom plan.'}
          </p>
        </div>
        <Package size={26} strokeWidth={2.3} aria-hidden="true" />
      </div>

      {cloudActive && !isOnline ? (
        <div className="program-manager__restriction" role="alert">
          <AlertTriangle size={18} strokeWidth={2.4} aria-hidden="true" />
          {CLOUD_OFFLINE_MESSAGE}
        </div>
      ) : null}

      {managerState.activeWorkoutBlocked ? (
        <div className="program-manager__restriction" role="alert">
          <AlertTriangle size={18} strokeWidth={2.4} aria-hidden="true" />
          Finish or discard the active workout before changing programs.
        </div>
      ) : null}

      {hasUnsavedPlanChanges ? (
        <div className="program-manager__restriction" role="alert">
          <AlertTriangle size={18} strokeWidth={2.4} aria-hidden="true" />
          Save your manual plan edits before installing or restoring a workout
          program.
        </div>
      ) : null}

      {managerState.installed && !installedRegistryProgram ? (
        <div className="program-manager__restriction" role="status">
          <AlertTriangle size={18} strokeWidth={2.4} aria-hidden="true" />
          Installed program unavailable in this build.
        </div>
      ) : null}

      {modifiedAfterInstallation ? (
        <div className="program-manager__modified-badge">
          Modified after installation
        </div>
      ) : null}

      {managerState.errors.map((error) => (
        <div className="program-manager__restriction" key={error} role="alert">
          <AlertTriangle size={18} strokeWidth={2.4} aria-hidden="true" />
          {error}
        </div>
      ))}

      {operationStatus ? (
        <div className="program-manager__notice" role="status">
          <Package size={18} strokeWidth={2.4} aria-hidden="true" />
          {operationStatus}
        </div>
      ) : null}

      {notice ? (
        <div
          className={
            notice.tone === 'error'
              ? 'program-manager__restriction'
              : 'program-manager__notice'
          }
          role={notice.tone === 'error' ? 'alert' : 'status'}
        >
          {notice.tone === 'error' ? (
            <AlertTriangle size={18} strokeWidth={2.4} aria-hidden="true" />
          ) : (
            <CheckCircle2 size={18} strokeWidth={2.4} aria-hidden="true" />
          )}
          {notice.message}
        </div>
      ) : null}

      {dismissedCount > 0 ? (
        <button
          className="program-manager__dismissed-toggle"
          onClick={() => setShowDismissed((current) => !current)}
          type="button"
        >
          {showDismissed
            ? 'Hide dismissed programs'
            : `Show dismissed programs again (${dismissedCount})`}
        </button>
      ) : null}

      <button
        className="workout-secondary-button program-manager__export-current"
        onClick={exportCurrentPlan}
        type="button"
      >
        <Download size={17} strokeWidth={2.4} aria-hidden="true" />
        Export Current Plan
      </button>
      {hasUnsavedPlanChanges ? (
        <small className="program-manager__export-note">
          Current-plan exports contain the last saved plan; unsaved editor
          changes are not included.
        </small>
      ) : null}

      <div className="program-manager__grid">
        {visiblePrograms.map((program) => {
          const current = isCurrentProgram(program, managerState)
          const dismissed = dismissedIdentities.has(
            programIdentity(program.id, program.version),
          )
          const status = getProgramStatus(program, current, dismissed)
          const warnings = getValidationWarnings(program)
          const exerciseCount = countExercises(program.days)

          return (
            <article
              className={`program-manager-card${
                current ? ' program-manager-card--current' : ''
              }`}
              key={programIdentity(program.id, program.version)}
            >
              <div className="program-manager-card__header">
                <div>
                  <p className="eyebrow">Version {program.version}</p>
                  <h3>{program.name}</h3>
                </div>
                <span
                  className={`program-manager-status program-manager-status--${status.toLowerCase()}`}
                >
                  {status}
                </span>
              </div>

              <p className="program-manager-card__description">
                {program.description}
              </p>
              <dl className="program-manager-card__stats">
                <div>
                  <dt>Updated</dt>
                  <dd>{formatDateOnly(program.updatedAt)}</dd>
                </div>
                <div>
                  <dt>Days</dt>
                  <dd>{program.days.length}</dd>
                </div>
                <div>
                  <dt>Exercises</dt>
                  <dd>{exerciseCount}</dd>
                </div>
              </dl>

              {current && modifiedAfterInstallation ? (
                <span className="program-manager-card__modified">
                  Modified after installation
                </span>
              ) : null}

              {warnings.length > 0 ? (
                <details className="program-manager-warnings">
                  <summary>{warnings.length} validation warning(s)</summary>
                  <ul>
                    {warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </details>
              ) : null}

              <div className="program-manager-card__actions">
                <button
                  className="workout-secondary-button"
                  onClick={() => setPreviewProgram(program)}
                  type="button"
                >
                  <Eye size={18} strokeWidth={2.4} aria-hidden="true" />
                  Preview
                </button>
                <button
                  className="workout-primary-button"
                  disabled={
                    current ||
                    hasUnsavedPlanChanges ||
                    operationBusy ||
                    managerState.activeWorkoutBlocked ||
                    (cloudActive && !isOnline)
                  }
                  onClick={() => openInstallConfirmation(program)}
                  type="button"
                >
                  <Package size={18} strokeWidth={2.4} aria-hidden="true" />
                  {current ? 'Current Program' : 'Install'}
                </button>
                <button
                  className="workout-secondary-button"
                  disabled={
                    current ||
                    dismissed ||
                    operationBusy ||
                    (cloudActive && !isOnline)
                  }
                  onClick={() => keepCurrentPlan(program)}
                  type="button"
                >
                  <CheckCircle2 size={18} strokeWidth={2.4} aria-hidden="true" />
                  {dismissed ? 'Current Plan Kept' : 'Keep Current Plan'}
                </button>
              </div>
            </article>
          )
        })}
      </div>

      <section className="program-manager-backups" aria-labelledby="program-backups-title">
        <div className="program-manager-backups__heading">
          <div>
            <p className="eyebrow">Local and cloud safety copies</p>
            <h3 id="program-backups-title">Workout Plan Backups</h3>
          </div>
          <Archive size={22} strokeWidth={2.4} aria-hidden="true" />
        </div>

        <h4>Local backups</h4>
        {managerState.localBackups.length === 0 ? (
          <p className="program-manager-empty">
            No local backups have been created yet.
          </p>
        ) : (
          <div className="program-manager-backups__list">
            {managerState.localBackups.slice(0, 5).map((backup) => (
              <article className="program-manager-backup" key={backup.id}>
                <div>
                  <p className="eyebrow">Local backup</p>
                  <strong>{formatTimestamp(backup.createdAt)}</strong>
                  <p>{backup.reason}</p>
                  <small>
                    Previous program:{' '}
                    {backup.previousProgram.id && backup.previousProgram.version
                      ? `${backup.previousProgram.id} ${backup.previousProgram.version}`
                      : 'None recorded'}
                    {' · '}
                    {backup.plan.length} days
                  </small>
                </div>
                <div className="program-manager-backup__actions">
                  <button
                    className="workout-secondary-button"
                    disabled={
                      hasUnsavedPlanChanges ||
                      operationBusy ||
                      areLocalProgramChangesDisabled(
                        cloudActive,
                        managerState.activeWorkoutBlocked,
                      )
                    }
                    onClick={() => restoreLocalBackup(backup)}
                    type="button"
                  >
                    <RotateCcw size={17} strokeWidth={2.4} aria-hidden="true" />
                    Restore
                  </button>
                  <button
                    className="workout-secondary-button"
                    onClick={() =>
                      downloadJSON(
                        backup,
                        `workout-plan-backup-${backup.createdAt.slice(0, 10)}.json`,
                      )
                    }
                    type="button"
                  >
                    <Download size={17} strokeWidth={2.4} aria-hidden="true" />
                    Export Backup
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {cloudActive ? (
          <>
            <h4>Cloud backups</h4>
            {managerState.cloudBackups.length === 0 ? (
              <p className="program-manager-empty">
                No cloud backups have been created for this account yet.
              </p>
            ) : (
              <div className="program-manager-backups__list">
                {managerState.cloudBackups.map((backup) => (
                  <article
                    className="program-manager-backup"
                    key={`cloud-${backup.id}`}
                  >
                    <div>
                      <p className="eyebrow">Cloud backup</p>
                      <strong>{formatTimestamp(backup.createdAt)}</strong>
                      <p>{backup.reason}</p>
                      <small>
                        Previous program:{' '}
                        {backup.previousProgram
                          ? `${backup.previousProgram.id} ${backup.previousProgram.version}`
                          : 'None recorded'}
                        {' · '}
                        {backup.plan.length} days
                      </small>
                    </div>
                    <div className="program-manager-backup__actions">
                      <button
                        className="workout-secondary-button"
                        disabled={
                          hasUnsavedPlanChanges ||
                          operationBusy ||
                          !isOnline ||
                          managerState.activeWorkoutBlocked
                        }
                        onClick={() => restoreCloudBackup(backup)}
                        type="button"
                      >
                        <RotateCcw size={17} strokeWidth={2.4} aria-hidden="true" />
                        Restore
                      </button>
                      <button
                        className="workout-secondary-button"
                        onClick={() =>
                          downloadJSON(
                            backup,
                            `cloud-workout-plan-backup-${backup.createdAt.slice(0, 10)}.json`,
                          )
                        }
                        type="button"
                      >
                        <Download size={17} strokeWidth={2.4} aria-hidden="true" />
                        Export Backup
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        ) : null}
      </section>

      {previewProgram ? (
        <ProgramPreviewDialog
          currentPlan={managerState.savedPlan}
          currentPlanName={currentPlanName}
          onClose={() => setPreviewProgram(null)}
          program={previewProgram}
          warnings={getValidationWarnings(previewProgram)}
        />
      ) : null}

      {installProgram ? (
        <InstallConfirmationDialog
          activeWorkoutBlocked={managerState.activeWorkoutBlocked}
          cloudActive={cloudActive}
          isOnline={isOnline}
          operationBusy={operationBusy}
          onCancel={() => {
            if (!operationBusy) setInstallProgram(null)
          }}
          onConfirm={() => confirmInstallation(installProgram)}
          program={installProgram}
        />
      ) : null}
    </section>
  )
}

function ProgramPreviewDialog({
  currentPlan,
  currentPlanName,
  onClose,
  program,
  warnings,
}: {
  currentPlan: WorkoutDay[]
  currentPlanName: string
  onClose: () => void
  program: WorkoutProgram
  warnings: string[]
}) {
  const comparison = compareWorkoutPlans(currentPlan, program, currentPlanName)
  const rules = [
    ['Rules — Effort', program.rules?.effort],
    ['Rules — Progression', program.rules?.progression],
    [
      'Rules — Posture cue',
      program.rules?.postureCue ? [program.rules.postureCue] : undefined,
    ],
    ['Rules — Return after a break', program.rules?.returnAfterBreak],
  ] as const

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="presentation"
    >
      <section
        aria-labelledby="program-preview-title"
        aria-modal="true"
        className="workout-detail-modal program-preview-modal dashboard-card"
        role="dialog"
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">Read-only Program Preview</p>
            <h2 id="program-preview-title">{program.name}</h2>
            <p>
              Version {program.version} · Updated {formatDateOnly(program.updatedAt)}
            </p>
          </div>
          <button
            aria-label="Close program preview"
            className="modal-close-button"
            onClick={onClose}
            type="button"
          >
            <X size={20} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </header>

        <p className="program-preview-modal__description">{program.description}</p>

        <dl className="program-comparison__stats program-preview-metadata">
          <div>
            <dt>Program ID</dt>
            <dd>{program.id}</dd>
          </div>
          <div>
            <dt>Version</dt>
            <dd>{program.version}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>{formatDateOnly(program.updatedAt)}</dd>
          </div>
          <div>
            <dt>Days</dt>
            <dd>{program.days.length}</dd>
          </div>
          <div>
            <dt>Exercise occurrences</dt>
            <dd>{countExercises(program.days)}</dd>
          </div>
        </dl>

        <div className="program-preview-meta-grid">
          <PreviewList title="Goals" values={program.goals ?? []} />
          <PreviewList
            title="Benchmark exercises"
            values={(program.benchmarkExerciseIds ?? []).map(getExerciseName)}
          />
          {rules.map(([title, values]) => (
            <PreviewList key={title} title={title} values={values ?? []} />
          ))}
        </div>

        {warnings.length > 0 ? (
          <section className="program-preview-warnings">
            <h3>Validation warnings</h3>
            <ul>
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="program-comparison" aria-labelledby="program-comparison-title">
          <h3 id="program-comparison-title">Simple plan comparison</h3>
          <dl className="program-comparison__stats">
            <div>
              <dt>Current plan</dt>
              <dd>{comparison.currentPlanName}</dd>
            </div>
            <div>
              <dt>Selected program</dt>
              <dd>{comparison.selectedProgramName}</dd>
            </div>
            <div>
              <dt>Current exercise occurrences</dt>
              <dd>{comparison.currentExerciseOccurrences}</dd>
            </div>
            <div>
              <dt>New exercise occurrences</dt>
              <dd>{comparison.newExerciseOccurrences}</dd>
            </div>
          </dl>
          <ComparisonList
            title="Days with changed names"
            values={comparison.changedDayNames.map(
              (day) => `Day ${day.day}: ${day.currentName} → ${day.newName}`,
            )}
          />
          <ComparisonList
            title="Exercises added"
            values={comparison.addedExerciseIds}
          />
          <ComparisonList
            title="Exercises removed"
            values={comparison.removedExerciseIds}
          />
        </section>

        <section className="program-preview-days" aria-labelledby="program-days-title">
          <h3 id="program-days-title">All seven days</h3>
          {program.days.map((day) => (
            <article className="program-preview-day" key={day.day}>
              <div className="program-preview-day__heading">
                <div>
                  <p className="eyebrow">Day {day.day}</p>
                  <h4>{day.name}</h4>
                </div>
                <span>{day.estimatedTime}</span>
              </div>
              <p className="program-preview-day__focus">
                Focus: {day.focus.join(', ')}
              </p>
              <div className="program-preview-exercises">
                {day.exercises.map((exercise, index) => (
                  <div
                    className="program-preview-exercise"
                    key={`${exercise.id}-${index}`}
                  >
                    <strong>{exercise.name}</strong>
                    <span>{getExerciseTargetLabel(exercise)}</span>
                    <span>Rest: {exercise.restSeconds} sec</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </section>
    </div>
  )
}

function InstallConfirmationDialog({
  activeWorkoutBlocked,
  cloudActive,
  isOnline,
  operationBusy,
  onCancel,
  onConfirm,
  program,
}: {
  activeWorkoutBlocked: boolean
  cloudActive: boolean
  isOnline: boolean
  operationBusy: boolean
  onCancel: () => void
  onConfirm: () => void
  program: WorkoutProgram
}) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !operationBusy) onCancel()
      }}
      role="presentation"
    >
      <section
        aria-labelledby="install-program-title"
        aria-modal="true"
        className="confirm-modal program-install-confirmation"
        role="dialog"
      >
        <p className="eyebrow">
          {cloudActive ? 'Confirm cloud installation' : 'Confirm local installation'}
        </p>
        <h2 id="install-program-title">Install {program.name}?</h2>
        <p>
          {cloudActive
            ? 'This will replace your cloud custom workout plan only after local and cloud backups are created. The verified plan will then update this device. Your workout history will not be changed.'
            : 'This will replace your active custom workout plan with the selected program. Your workout history will not be changed. A local backup of your current plan will be created first.'}
        </p>
        <dl className="program-install-confirmation__stats">
          <div>
            <dt>Selected program</dt>
            <dd>
              {program.name} · {program.version}
            </dd>
          </div>
          <div>
            <dt>Days</dt>
            <dd>{program.days.length}</dd>
          </div>
          <div>
            <dt>Exercises</dt>
            <dd>{countExercises(program.days)}</dd>
          </div>
          <div>
            <dt>Active workout block</dt>
            <dd>{activeWorkoutBlocked ? 'Blocked' : 'No active workout'}</dd>
          </div>
        </dl>
        {activeWorkoutBlocked ? (
          <p className="program-install-confirmation__warning">
            Finish or discard the active workout before changing programs.
          </p>
        ) : null}
        {cloudActive && !isOnline ? (
          <p className="program-install-confirmation__warning">
            {CLOUD_OFFLINE_MESSAGE}
          </p>
        ) : null}
        <div className="program-install-confirmation__actions">
          <button
            className="workout-secondary-button"
            disabled={operationBusy}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="workout-secondary-button"
            onClick={exportCurrentPlan}
            type="button"
          >
            <Download size={17} strokeWidth={2.4} aria-hidden="true" />
            Export Current Plan
          </button>
          <button
            className="workout-primary-button"
            disabled={
              activeWorkoutBlocked ||
              operationBusy ||
              (cloudActive && !isOnline)
            }
            onClick={onConfirm}
            type="button"
          >
            <Package size={17} strokeWidth={2.4} aria-hidden="true" />
            Install Program
          </button>
        </div>
      </section>
    </div>
  )
}

function PreviewList({ title, values }: { title: string; values: readonly string[] }) {
  return (
    <section className="program-preview-list">
      <h3>{title}</h3>
      {values.length > 0 ? (
        <ul>
          {values.map((value) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
      ) : (
        <p>None listed.</p>
      )}
    </section>
  )
}

function ComparisonList({ title, values }: { title: string; values: string[] }) {
  return (
    <div className="program-comparison__list">
      <strong>{title}</strong>
      <p>{values.length > 0 ? values.join(', ') : 'None'}</p>
    </div>
  )
}

function readManagerState(userId: string | null): ManagerState {
  const installed = getInstalledWorkoutProgram()
  const dismissed = getDismissedWorkoutPrograms()
  const localBackups = getWorkoutPlanBackups()
  const protection = getWorkoutProgramChangeProtection()
  const hydrated = userId
    ? getHydratedCloudWorkoutProgramManager(userId)
    : null
  const cloudMetadata = hydrated?.data ?? null
  const errors = [installed, dismissed, localBackups, protection]
    .filter((result) => !result.success)
    .map((result) => result.message)
  if (hydrated && !hydrated.success) {
    errors.push(hydrated.message)
  }

  return {
    activeWorkoutBlocked: protection.data.blocked,
    cloudBackups: cloudMetadata?.backups ?? [],
    dismissed: userId
      ? cloudMetadata?.dismissedPrograms ?? []
      : dismissed.data,
    errors,
    hasStoredCustomPlan: hasCustomWorkoutPlan(),
    installed: userId
      ? cloudMetadata?.installedProgram ?? null
      : installed.data,
    localBackups: localBackups.data,
    savedPlan: getCustomWorkoutPlan(),
  }
}

function isCurrentProgram(program: WorkoutProgram, state: ManagerState): boolean {
  if (state.installed) {
    return state.installed.id === program.id && state.installed.version === program.version
  }

  const defaultProgram = getLatestWorkoutProgramById(CURRENT_DEFAULT_PROGRAM_ID)
  return (
    !state.hasStoredCustomPlan &&
    defaultProgram?.id === program.id &&
    defaultProgram.version === program.version
  )
}

function getProgramStatus(
  program: WorkoutProgram,
  current: boolean,
  dismissed: boolean,
): ProgramStatus {
  if (current) return 'Current'
  if (dismissed) return 'Dismissed'
  if (program.id === CURRENT_DEFAULT_PROGRAM_ID) return 'Legacy'
  return 'Available'
}

function getValidationWarnings(program: WorkoutProgram): string[] {
  return (
    validationResults.find(
      (result) =>
        result.programId === program.id && result.version === program.version,
    )?.warnings ?? []
  )
}

function getExerciseName(id: string): string {
  const exercise = exerciseLibrary.find((candidate) => candidate.id === id)
  return exercise ? `${exercise.name} (${id})` : id
}

function countExercises(days: WorkoutDay[]): number {
  return days.reduce((total, day) => total + day.exercises.length, 0)
}

function formatDateOnly(value: string): string {
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
}

function formatTimestamp(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date)
}

function programIdentity(id: string, version: string): string {
  return `${id}\u0000${version}`
}

function downloadJSON(value: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function exportCurrentPlan() {
  exportWorkoutPlanJSON()
}
