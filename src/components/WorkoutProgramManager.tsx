import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  ClipboardPaste,
  Copy,
  Download,
  Eye,
  Package,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { formatDate, t as translateText, useT, type MessageKey } from '../i18n'
import { exerciseLibrary } from '../data/exerciseLibrary'
import type {
  Exercise,
  ExercisePhaseTarget,
  WorkoutDay,
} from '../data/workoutPlan'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import {
  dismissWorkoutProgramInCloud,
  getHydratedCloudWorkoutProgramManager,
  installWorkoutProgramInCloud,
  restoreWorkoutProgramBackupInCloud,
  type CloudProgramOperationStatus,
  type CloudWorkoutPlanBackup,
} from '../services/workoutProgramService'
import { saveUserWorkoutProgramsToCloud } from '../services/settingsService'
import {
  getWorkoutProgramByIdAndVersion,
  getWorkoutPrograms,
  getWorkoutProgramValidationResults,
} from '../data/workoutProgramRegistry'
import type { WorkoutProgram } from '../types/workoutProgram'
import { exportWorkoutPlanJSON } from '../utils/exportUtils'
import {
  buildProgramAuthoringPrompt,
  deleteUserWorkoutProgram,
  getUserWorkoutPrograms,
  parseWorkoutProgramInput,
  saveUserWorkoutProgram,
  type ParsedWorkoutProgramResult,
  type UserWorkoutProgram,
} from '../utils/userWorkoutPrograms'
import {
  getCustomWorkoutPlan,
  getExerciseTargetLabel,
  getUserProfileSettings,
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
  /** Bundled programs plus this user's pasted ones; re-read on every refresh. */
  programs: WorkoutProgram[]
  savedPlan: WorkoutDay[]
  userPrograms: UserWorkoutProgram[]
}

/** Stored status value; `pm.status.*` carries the wording. */
type ProgramStatus = 'current' | 'available' | 'dismissed'
type ManagerNotice = {
  message: string
  tone: 'success' | 'error'
}

const validationResults = getWorkoutProgramValidationResults()

export function WorkoutProgramManager({
  hasUnsavedPlanChanges,
  plan,
  onDataChanged,
  onPlanChanged,
}: WorkoutProgramManagerProps) {
  const { isSupabaseConfigured, user } = useAuth()
  const t = useT()
  const cloudOfflineMessage = t('pm.cloudOffline')
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
    ? modifiedAfterInstallation
      ? t('pm.planNameModified', { name: installedRegistryProgram.name })
      : installedRegistryProgram.name
    : managerState.hasStoredCustomPlan
      ? t('pm.customPlan')
      : t('pm.noProgram')
  const programs = managerState.programs
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

  /**
   * Mirrors pasted programs to the cloud. The local save already succeeded, so
   * a failure here is queued for replay rather than surfaced as a hard error.
   */
  function persistProgramsToCloud(programs: UserWorkoutProgram[]) {
    if (!cloudActive) {
      return
    }
    saveUserWorkoutProgramsToCloud(user, programs).catch(() => undefined)
  }

  async function keepCurrentPlan(program: WorkoutProgram) {
    if (cloudActive) {
      if (!isOnline) {
        setNotice({ message: cloudOfflineMessage, tone: 'error' })
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

  /**
   * Uploading is only half the job: the plan a person trains from does not
   * change until the program is installed. Opening the confirmation straight
   * away makes "upload this week's plan" one flow ending in one confirm -
   * which still shows what the switch changes - rather than an upload that
   * quietly leaves last week's plan in place.
   */
  function startInstallAfterUpload(
    program: WorkoutProgram,
    state: ManagerState,
  ) {
    // Re-uploading the plan already being trained changes nothing; asking to
    // install it would only offer a confirm that cannot succeed.
    if (areWorkoutPlansEquivalent(state.savedPlan, program.days)) {
      return
    }
    if (hasUnsavedPlanChanges) {
      setNotice({ message: t('pm.unsavedInstall'), tone: 'error' })
      return
    }

    setInstallProgram(program)
  }

  async function confirmInstallation(program: WorkoutProgram) {
    if (hasUnsavedPlanChanges) {
      setNotice({
        message: t('pm.unsavedInstall'),
        tone: 'error',
      })
      return
    }
    if (cloudActive) {
      if (!isOnline) {
        setNotice({ message: cloudOfflineMessage, tone: 'error' })
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
        message: t('pm.unsavedRestore'),
        tone: 'error',
      })
      return
    }
    if (cloudActive) {
      setNotice({
        message: t('pm.useCloudBackup'),
        tone: 'error',
      })
      return
    }
    if (
      !window.confirm(
        t('pm.restoreLocalConfirm'),
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
        message: t('pm.unsavedRestore'),
        tone: 'error',
      })
      return
    }
    if (!isOnline) {
      setNotice({ message: cloudOfflineMessage, tone: 'error' })
      return
    }
    if (managerState.activeWorkoutBlocked) {
      setNotice({
        message: t('pm.activeWorkoutBlocked'),
        tone: 'error',
      })
      return
    }
    if (
      !window.confirm(
        t('pm.restoreCloudConfirm'),
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
            {cloudActive ? t('pm.cloudTitle') : t('pm.localTitle')}
          </p>
          <h2 id="workout-programs-title">{t('pm.heading')}</h2>
          <p>{cloudActive ? t('pm.cloudIntro') : t('pm.localIntro')}</p>
        </div>
        <Package size={26} strokeWidth={2.3} aria-hidden="true" />
      </div>

      {cloudActive && !isOnline ? (
        <div className="program-manager__restriction" role="alert">
          <AlertTriangle size={18} strokeWidth={2.4} aria-hidden="true" />
          {cloudOfflineMessage}
        </div>
      ) : null}

      {managerState.activeWorkoutBlocked ? (
        <div className="program-manager__restriction" role="alert">
          <AlertTriangle size={18} strokeWidth={2.4} aria-hidden="true" />
          {t('pm.activeWorkoutBlocked')}
        </div>
      ) : null}

      {hasUnsavedPlanChanges ? (
        <div className="program-manager__restriction" role="alert">
          <AlertTriangle size={18} strokeWidth={2.4} aria-hidden="true" />
          {t('pm.unsavedEdits')}
        </div>
      ) : null}

      {managerState.installed && !installedRegistryProgram ? (
        <div className="program-manager__restriction" role="status">
          <AlertTriangle size={18} strokeWidth={2.4} aria-hidden="true" />
          {t('pm.installedUnavailable')}
        </div>
      ) : null}

      {modifiedAfterInstallation ? (
        <div className="program-manager__modified-badge">
          {t('pm.modifiedAfterInstall')}
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
            ? t('pm.hideDismissed')
            : t('pm.showDismissed', { count: dismissedCount })}
        </button>
      ) : null}

      <button
        className="workout-secondary-button program-manager__export-current"
        onClick={exportCurrentPlan}
        type="button"
      >
        <Download size={17} strokeWidth={2.4} aria-hidden="true" />
        {t('pm.exportCurrent')}
      </button>
      {hasUnsavedPlanChanges ? (
        <small className="program-manager__export-note">
          {t('pm.exportNote')}
        </small>
      ) : null}

      <PasteProgramPanel
        onSaved={(message, programs, program) => {
          setNotice({ message, tone: 'success' })
          const next = refreshState()
          persistProgramsToCloud(programs)
          startInstallAfterUpload(program, next)
        }}
        savedPrograms={managerState.userPrograms}
        onDeleted={(message, programs) => {
          setNotice({ message, tone: 'success' })
          refreshState()
          persistProgramsToCloud(programs)
        }}
      />

      <div className="program-manager__grid">
        {visiblePrograms.map((program) => {
          const current = isCurrentProgram(program, managerState)
          // Installed, but the saved plan is no longer what this program says:
          // either the program was re-uploaded under the same version with new
          // content, or the plan was edited by hand. Both are re-appliable, so
          // the button stays live rather than reading "Current Program" while
          // the plan on screen is something else.
          const outdated = current && modifiedAfterInstallation
          const dismissed = dismissedIdentities.has(
            programIdentity(program.id, program.version),
          )
          const status = getProgramStatus(current, dismissed)
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
                  <p className="eyebrow">
                    {t('pm.version', { version: program.version })}
                  </p>
                  <h3>{program.name}</h3>
                </div>
                <span
                  className={`program-manager-status program-manager-status--${status}`}
                >
                  {t(`pm.status.${status}` as MessageKey)}
                </span>
              </div>

              <p className="program-manager-card__description">
                {program.description}
              </p>
              <dl className="program-manager-card__stats">
                <div>
                  <dt>{t('pm.updated')}</dt>
                  <dd>{formatDateOnly(program.updatedAt)}</dd>
                </div>
                <div>
                  <dt>{t('pm.days')}</dt>
                  <dd>{program.days.length}</dd>
                </div>
                <div>
                  <dt>{t('pm.exercises')}</dt>
                  <dd>{exerciseCount}</dd>
                </div>
              </dl>

              {current && modifiedAfterInstallation ? (
                <span className="program-manager-card__modified">
                  {t('pm.modifiedAfterInstall')}
                </span>
              ) : null}

              {warnings.length > 0 ? (
                <details className="program-manager-warnings">
                  <summary>
                    {t('pm.validationWarningCount', { count: warnings.length })}
                  </summary>
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
                  {t('pm.preview')}
                </button>
                <button
                  className="workout-primary-button"
                  disabled={
                    (current && !outdated) ||
                    hasUnsavedPlanChanges ||
                    operationBusy ||
                    managerState.activeWorkoutBlocked ||
                    (cloudActive && !isOnline)
                  }
                  onClick={() => openInstallConfirmation(program)}
                  type="button"
                >
                  <Package size={18} strokeWidth={2.4} aria-hidden="true" />
                  {current
                    ? outdated
                      ? t('pm.reapply')
                      : t('pm.currentProgram')
                    : t('pm.install')}
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
                  {dismissed ? t('pm.currentKept') : t('pm.keepCurrent')}
                </button>
              </div>
            </article>
          )
        })}
      </div>

      <section className="program-manager-backups" aria-labelledby="program-backups-title">
        <div className="program-manager-backups__heading">
          <div>
            <p className="eyebrow">{t('pm.backupsEyebrow')}</p>
            <h3 id="program-backups-title">{t('pm.backupsHeading')}</h3>
          </div>
          <Archive size={22} strokeWidth={2.4} aria-hidden="true" />
        </div>

        <h4>{t('pm.localBackups')}</h4>
        {managerState.localBackups.length === 0 ? (
          <p className="program-manager-empty">{t('pm.noLocalBackups')}</p>
        ) : (
          <div className="program-manager-backups__list">
            {managerState.localBackups.slice(0, 5).map((backup) => (
              <article className="program-manager-backup" key={backup.id}>
                <div>
                  <p className="eyebrow">{t('pm.localBackup')}</p>
                  <strong>{formatTimestamp(backup.createdAt)}</strong>
                  <p>{backup.reason}</p>
                  <small>
                    {t('pm.previousProgram')}
                    {backup.previousProgram.id && backup.previousProgram.version
                      ? `${backup.previousProgram.id} ${backup.previousProgram.version}`
                      : t('pm.noneRecorded')}
                    {' · '}
                    {t('pm.backupDays', { count: backup.plan.length })}
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
                    {t('pm.restore')}
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
                    {t('pm.exportBackup')}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {cloudActive ? (
          <>
            <h4>{t('pm.cloudBackups')}</h4>
            {managerState.cloudBackups.length === 0 ? (
              <p className="program-manager-empty">{t('pm.noCloudBackups')}</p>
            ) : (
              <div className="program-manager-backups__list">
                {managerState.cloudBackups.map((backup) => (
                  <article
                    className="program-manager-backup"
                    key={`cloud-${backup.id}`}
                  >
                    <div>
                      <p className="eyebrow">{t('pm.cloudBackup')}</p>
                      <strong>{formatTimestamp(backup.createdAt)}</strong>
                      <p>{backup.reason}</p>
                      <small>
                        {t('pm.previousProgram')}
                        {backup.previousProgram
                          ? `${backup.previousProgram.id} ${backup.previousProgram.version}`
                          : t('pm.noneRecorded')}
                        {' · '}
                        {t('pm.backupDays', { count: backup.plan.length })}
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
                        {t('pm.restore')}
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
                        {t('pm.exportBackup')}
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
  const t = useT()
  const comparison = compareWorkoutPlans(currentPlan, program, currentPlanName)
  const rules = [
    [t('pm.rules.effort'), program.rules?.effort],
    [t('pm.rules.progression'), program.rules?.progression],
    [t('pm.rules.rest'), program.rules?.rest],
    [t('pm.rules.substitutions'), program.rules?.substitutions],
    [
      t('pm.rules.posture'),
      program.rules?.postureCue ? [program.rules.postureCue] : undefined,
    ],
    [t('pm.rules.returnAfterBreak'), program.rules?.returnAfterBreak],
    [t('pm.rules.safety'), program.rules?.safety],
    [t('pm.rules.neckWork'), program.rules?.optionalNeckWork],
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
            <p className="eyebrow">{t('pm.previewEyebrow')}</p>
            <h2 id="program-preview-title">{program.name}</h2>
            <p>
              {t('pm.version', { version: program.version })} ·{' '}
              {t('pm.updated')} {formatDateOnly(program.updatedAt)}
            </p>
          </div>
          <button
            aria-label={t('pm.closePreview')}
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
            <dt>{t('pm.programId')}</dt>
            <dd>{program.id}</dd>
          </div>
          <div>
            <dt>{t('settings.tab.program')}</dt>
            <dd>{program.version}</dd>
          </div>
          <div>
            <dt>{t('pm.updated')}</dt>
            <dd>{formatDateOnly(program.updatedAt)}</dd>
          </div>
          <div>
            <dt>{t('pm.days')}</dt>
            <dd>{program.normalWeeklyDays ?? program.days.length}</dd>
          </div>
          <div>
            <dt>{t('pm.duration')}</dt>
            <dd>{program.durationWeeks ? `${program.durationWeeks} weeks` : '-'}</dd>
          </div>
          <div>
            <dt>{t('pm.exerciseOccurrences')}</dt>
            <dd>{countExercises(program.days)}</dd>
          </div>
        </dl>

        <div className="program-preview-meta-grid">
          <PreviewList title="Goals" values={program.goals ?? []} />
          <PreviewList
            title={t('pm.benchmarks')}
            values={(program.benchmarkExerciseIds ?? []).map(getExerciseName)}
          />
          {rules.map(([title, values]) => (
            <PreviewList key={title} title={title} values={values ?? []} />
          ))}
        </div>

        {warnings.length > 0 ? (
          <section className="program-preview-warnings">
            <h3>{t('pm.validationWarnings')}</h3>
            <ul>
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {safeArray(program.progressionPhases).length > 0 ? (
          <section
            className="program-preview-days"
            aria-labelledby="program-phases-title"
          >
            <h3 id="program-phases-title">{t('pm.phasesHeading')}</h3>
            {safeArray(program.progressionPhases).map((phase) => (
              <article
                className="program-preview-day"
                key={`${phase.name}-${phase.weeks.join('-')}`}
              >
                <div className="program-preview-day__heading">
                  <div>
                    <p className="eyebrow">{formatWeeks(phase.weeks)}</p>
                    <h4>{phase.name}</h4>
                  </div>
                </div>
                <p>
                  <strong>{t('pm.volume')}</strong> {phase.volumeGuidance}
                </p>
                <p>
                  <strong>{t('pm.effort')}</strong> {phase.rirGuidance}
                </p>
                <PreviewList title="Priorities" values={phase.priorities} />
                <PreviewList
                  title="Restrictions"
                  values={phase.restrictions ?? []}
                />
                <PreviewList
                  title="Assessment"
                  values={phase.assessmentItems ?? []}
                />
              </article>
            ))}
          </section>
        ) : null}

        <section className="program-comparison" aria-labelledby="program-comparison-title">
          <h3 id="program-comparison-title">{t('pm.comparisonHeading')}</h3>
          <dl className="program-comparison__stats">
            <div>
              <dt>{t('pm.currentPlan')}</dt>
              <dd>{comparison.currentPlanName}</dd>
            </div>
            <div>
              <dt>{t('pm.selectedProgram')}</dt>
              <dd>{comparison.selectedProgramName}</dd>
            </div>
            <div>
              <dt>{t('pm.currentOccurrences')}</dt>
              <dd>{comparison.currentExerciseOccurrences}</dd>
            </div>
            <div>
              <dt>{t('pm.newOccurrences')}</dt>
              <dd>{comparison.newExerciseOccurrences}</dd>
            </div>
          </dl>
          <ComparisonList
            title={t('pm.changedDays')}
            values={comparison.changedDayNames.map(
              (day) => `Day ${day.day}: ${day.currentName} → ${day.newName}`,
            )}
          />
          <ComparisonList
            title={t('pm.exercisesAdded')}
            values={comparison.addedExerciseIds}
          />
          <ComparisonList
            title={t('pm.exercisesRemoved')}
            values={comparison.removedExerciseIds}
          />
        </section>

        <section className="program-preview-days" aria-labelledby="program-days-title">
          <h3 id="program-days-title">
            Weekly days ({program.normalWeeklyDays ?? program.days.length})
          </h3>
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
                  <ProgramExercisePreview
                    exercise={exercise}
                    key={`${exercise.id}-${index}`}
                  />
                ))}
              </div>
            </article>
          ))}
        </section>

        {safeArray(program.standaloneWorkouts).length > 0 ? (
          <section
            className="program-preview-days"
            aria-labelledby="program-standalone-title"
          >
            <h3 id="program-standalone-title">
              {t('pm.optionalStandalone')}
            </h3>
            <p>
              These workouts remain outside the weekly rotation and never
              advance a scheduled day.
            </p>
            {safeArray(program.standaloneWorkouts).map((workout) => (
              <article className="program-preview-day" key={workout.id}>
                <div className="program-preview-day__heading">
                  <div>
                    <p className="eyebrow">{t('pm.standaloneWorkout')}</p>
                    <h4>{workout.name}</h4>
                  </div>
                  <span>{workout.estimatedTime}</span>
                </div>
                <p>{workout.description}</p>
                <p>
                  <strong>{t('pm.recommendedUse')}</strong> {workout.recommendedUse}
                </p>
                <p className="program-preview-day__focus">
                  Focus: {workout.focus.join(', ')}
                </p>
                <PreviewList
                  title={t('pm.workoutRules')}
                  values={workout.rules ?? []}
                />
                <div className="program-preview-exercises">
                  {workout.exercises.map((exercise, index) => (
                    <ProgramExercisePreview
                      exercise={exercise}
                      key={`${workout.id}-${exercise.id}-${index}`}
                    />
                  ))}
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </section>
    </div>
  )
}

function ProgramExercisePreview({ exercise }: { exercise: Exercise }) {
  const homeAlternatives = exercise.alternatives?.home ?? []
  const gymAlternatives = exercise.alternatives?.gym ?? []
  const hasAlternatives =
    homeAlternatives.length > 0 || gymAlternatives.length > 0

  return (
    <div className="program-preview-exercise">
      <strong>{exercise.name}</strong>
      <span>
        {exercise.optional ? translateText('plan.optionalPrefix') : ''}
        {getExerciseTargetLabel(exercise)}
        {exercise.targetRir
          ? ` · ${translateText('plan.rirSuffix', { value: exercise.targetRir })}`
          : ''}
      </span>
      <span>
        {translateText('pm.restSeconds', { seconds: exercise.restSeconds })}
      </span>
      {hasAlternatives ? (
        <>
          <span>
            <strong>{getSelectionInstruction(exercise)}</strong>
          </span>
          <VariantPreviewLine
            label={translateText('plan.home')}
            variants={homeAlternatives}
          />
          <VariantPreviewLine
            label={translateText('plan.gym')}
            variants={gymAlternatives}
          />
        </>
      ) : null}
      {safeArray(exercise.guidance).map((guidance, index) => (
        <span key={`${guidance}-${index}`}>
          {translateText('pm.guidancePrefix')} {guidance}
        </span>
      ))}
      {safeArray(exercise.phaseTargets).map((target, index) => (
        <span key={`${target.weeks.join('-')}-${index}`}>
          {formatPhaseTarget(target)}
        </span>
      ))}
    </div>
  )
}

function VariantPreviewLine({
  label,
  variants,
}: {
  label: string
  variants: NonNullable<Exercise['alternatives']>['home']
}) {
  if (!variants || variants.length === 0) return null

  return (
    <span>
      <strong>{label}:</strong>{' '}
      {variants
        .map((variant) =>
          `${variant.name} (${variant.equipment})${
            variant.repRange
              ? ` — ${variant.repRange}`
              : variant.duration
                ? ` — ${variant.duration}`
                : ''
          }`,
        )
        .join(' · ')}
    </span>
  )
}

function getSelectionInstruction(exercise: Exercise): string {
  const optionalPrefix = exercise.optional
    ? translateText('plan.optionalSlotPrefix')
    : ''
  if (exercise.selectionMode !== 'multiple') {
    return `${optionalPrefix}${translateText('plan.selectOne')}`
  }

  const minimum = Math.max(1, exercise.minSelections ?? 1)
  const maximum = Math.max(minimum, exercise.maxSelections ?? minimum)
  const count = minimum === maximum ? String(minimum) : `${minimum}-${maximum}`
  return `${optionalPrefix}${translateText('plan.selectCount', { count })}`
}

function formatPhaseTarget(target: ExercisePhaseTarget): string {
  const prescription = [
    target.sets ? translateText('plan.setsTimes', { count: target.sets }) : '',
    target.repRange ?? target.duration ?? '',
  ]
    .filter(Boolean)
    .join(' × ')
  const guidance = safeArray(target.guidance).join(' ')
  return `${formatWeeks(target.weeks)}: ${[prescription, guidance]
    .filter(Boolean)
    .join(' · ')}`
}

function formatWeeks(weeks: readonly number[]): string {
  const sorted = [...new Set(weeks)].sort((left, right) => left - right)
  if (sorted.length === 0) return translateText('plan.weeksNotSpecified')
  if (sorted.length === 1)
    return translateText('plan.weekSingle', { week: sorted[0] })
  const sequential = sorted.every(
    (week, index) => index === 0 || week === sorted[index - 1] + 1,
  )
  return sequential
    ? translateText('plan.weekRange', { from: sorted[0], to: sorted.at(-1) ?? '' })
    : translateText('plan.weekList', { weeks: sorted.join(', ') })
}

function safeArray<T>(value: T[] | undefined): T[] {
  return Array.isArray(value) ? value : []
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
  const t = useT()

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
          {cloudActive ? t('pm.confirmCloudTitle') : t('pm.confirmLocalTitle')}
        </p>
        <h2 id="install-program-title">Install {program.name}?</h2>
        <p>
          {cloudActive
            ? t('pm.confirmCloudCopy')
            : t('pm.confirmLocalCopy')}
        </p>
        <dl className="program-install-confirmation__stats">
          <div>
            <dt>{t('pm.selectedProgram')}</dt>
            <dd>
              {program.name} · {program.version}
            </dd>
          </div>
          <div>
            <dt>{t('pm.days')}</dt>
            <dd>{program.days.length}</dd>
          </div>
          <div>
            <dt>{t('pm.exercises')}</dt>
            <dd>{countExercises(program.days)}</dd>
          </div>
          <div>
            <dt>{t('pm.activeWorkoutBlock')}</dt>
            <dd>
              {activeWorkoutBlocked ? t('pm.blocked') : t('pm.noActiveWorkout')}
            </dd>
          </div>
        </dl>
        {activeWorkoutBlocked ? (
          <p className="program-install-confirmation__warning">
            {t('pm.activeWorkoutBlocked')}
          </p>
        ) : null}
        {cloudActive && !isOnline ? (
          <p className="program-install-confirmation__warning">
            {t('pm.cloudOffline')}
          </p>
        ) : null}
        <div className="program-install-confirmation__actions">
          <button
            className="workout-secondary-button"
            disabled={operationBusy}
            onClick={onCancel}
            type="button"
          >
            {t('action.cancel')}
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
            {t('pm.installProgram')}
          </button>
        </div>
      </section>
    </div>
  )
}

function PreviewList({ title, values }: { title: string; values: readonly string[] }) {
  const t = useT()

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
        <p>{t('pm.noneListed')}</p>
      )}
    </section>
  )
}

function ComparisonList({ title, values }: { title: string; values: string[] }) {
  const t = useT()

  return (
    <div className="program-comparison__list">
      <strong>{title}</strong>
      <p>{values.length > 0 ? values.join(', ') : t('pm.none')}</p>
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
    programs: getWorkoutPrograms(),
    savedPlan: getCustomWorkoutPlan(),
    userPrograms: getUserWorkoutPrograms(),
  }
}

function isCurrentProgram(program: WorkoutProgram, state: ManagerState): boolean {
  // Nothing installed means nothing is current: no program ships with the app,
  // so there is no implicit fallback to mark.
  if (!state.installed) {
    return false
  }
  return (
    state.installed.id === program.id &&
    state.installed.version === program.version
  )
}

function getProgramStatus(current: boolean, dismissed: boolean): ProgramStatus {
  if (current) return 'current'
  if (dismissed) return 'dismissed'
  return 'available'
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
    : formatDate(date, { dateStyle: 'medium' })
}

function formatTimestamp(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : formatDate(date, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
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

interface PasteProgramPanelProps {
  onDeleted: (message: string, programs: UserWorkoutProgram[]) => void
  onSaved: (
    message: string,
    programs: UserWorkoutProgram[],
    program: UserWorkoutProgram,
  ) => void
  savedPrograms: UserWorkoutProgram[]
}

/**
 * Upload-a-program panel.
 *
 * No program ships with the app, so this is how every account gets one.
 * Uploading a .json file and pasting JSON text feed the exact same parser and
 * the same per-user program list; the file picker is just the path that works
 * when the program arrived as a file rather than on the clipboard.
 */
function PasteProgramPanel({
  onDeleted,
  onSaved,
  savedPrograms,
}: PasteProgramPanelProps) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [result, setResult] = useState<ParsedWorkoutProgramResult | null>(null)
  const [copyLabel, setCopyLabel] = useState<'idle' | 'copied' | 'manual'>('idle')
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Clear immediately so re-picking the same file after a fix still fires.
    event.target.value = ''
    if (!file) {
      return
    }

    setFileName(file.name)
    let contents: string
    try {
      contents = await file.text()
    } catch {
      setText('')
      setResult({
        success: false,
        program: null,
        errors: [t('paste.readFailed', { name: file.name })],
        warnings: [],
        repairs: [],
      })
      return
    }

    setText(contents)
    setResult(parseWorkoutProgramInput(contents))
  }

  function handleCheck() {
    setResult(parseWorkoutProgramInput(text))
  }

  function handleSave() {
    const parsed = result?.success ? result : parseWorkoutProgramInput(text)
    setResult(parsed)
    if (!parsed.success || !parsed.program) {
      return
    }

    const saved = saveUserWorkoutProgram(parsed.program)
    if (!saved.success) {
      setResult({ ...parsed, success: false, errors: [saved.message] })
      return
    }

    setText('')
    setResult(null)
    setFileName(null)
    setOpen(false)
    onSaved(
      t('paste.savedThenInstall', { message: saved.message }),
      saved.programs,
      parsed.program,
    )
  }

  async function handleCopyPrompt() {
    const prompt = buildProgramAuthoringPrompt(getUserProfileSettings())
    try {
      await navigator.clipboard.writeText(prompt)
      setCopyLabel('copied')
    } catch {
      // Clipboard access can be blocked; fall back to a manual selection.
      setCopyLabel('manual')
      setText(prompt)
    }
    window.setTimeout(() => setCopyLabel('idle'), 2500)
  }

  function handleDelete(program: UserWorkoutProgram) {
    const confirmed = window.confirm(
      t('paste.removeConfirm', {
        name: program.name,
        version: program.version,
      }),
    )
    if (!confirmed) {
      return
    }

    const removed = deleteUserWorkoutProgram(program.id, program.version)
    if (removed.success) {
      onDeleted(
        t('paste.removed', { name: program.name, version: program.version }),
        removed.programs,
      )
    }
  }

  return (
    <div className="paste-program">
      <button
        aria-expanded={open}
        className="paste-program__toggle"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <ClipboardPaste size={18} strokeWidth={2.4} aria-hidden="true" />
        {open ? t('paste.close') : t('paste.open')}
      </button>

      {open ? (
        <div className="paste-program__body">
          <p className="paste-program__hint">
            {t('paste.hint')}
          </p>

          <input
            accept="application/json,.json"
            className="paste-program__file-input"
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />
          <button
            className="workout-primary-button paste-program__upload-button"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <Upload size={17} strokeWidth={2.4} aria-hidden="true" />
            {t('paste.chooseFile')}
          </button>
          {fileName ? (
            <p className="paste-program__file-name">
              {t('paste.loaded', { name: fileName })}
            </p>
          ) : null}

          <button
            className="workout-secondary-button paste-program__prompt-button"
            onClick={handleCopyPrompt}
            type="button"
          >
            <Copy size={17} strokeWidth={2.4} aria-hidden="true" />
            {copyLabel === 'copied'
              ? t('action.copied')
              : copyLabel === 'manual'
                ? t('setup.program.copyManual')
                : t('setup.program.copyPrompt')}
          </button>

          <label className="paste-program__label" htmlFor="paste-program-input">
            {t('paste.jsonLabel')}{' '}
            <span className="paste-program__label-note">
              {t('paste.jsonLabelNote')}
            </span>
          </label>
          <textarea
            className="paste-program__textarea"
            id="paste-program-input"
            onChange={(event) => {
              setText(event.target.value)
              setResult(null)
              setFileName(null)
            }}
            placeholder={'{\n  "name": "My Program",\n  "days": [ ... ]\n}'}
            rows={10}
            spellCheck={false}
            value={text}
          />

          <div className="paste-program__actions">
            <button
              className="workout-secondary-button"
              disabled={text.trim() === ''}
              onClick={handleCheck}
              type="button"
            >
              {t('paste.check')}
            </button>
            <button
              className="workout-primary-button"
              disabled={text.trim() === ''}
              onClick={handleSave}
              type="button"
            >
              {t('paste.save')}
            </button>
          </div>

          {result ? (
            <div
              className={`paste-program__result paste-program__result--${
                result.success ? 'ok' : 'error'
              }`}
              role={result.success ? 'status' : 'alert'}
            >
              {result.success && result.program ? (
                <>
                  <p className="paste-program__result-title">
                    <CheckCircle2 size={17} strokeWidth={2.4} aria-hidden="true" />
                    {t('paste.looksGood', {
                      name: result.program.name,
                      days: result.program.days.length,
                      exercises: countExercises(result.program.days),
                    })}
                  </p>
                  <p className="paste-program__result-note">
                    {t('paste.saveHint')}
                  </p>
                </>
              ) : (
                <>
                  <p className="paste-program__result-title">
                    <AlertTriangle size={17} strokeWidth={2.4} aria-hidden="true" />
                    {t('paste.cannotSave')}
                  </p>
                  <ul className="paste-program__issues">
                    {result.errors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </>
              )}

              {result.repairs.length > 0 ? (
                <ul className="paste-program__issues paste-program__issues--muted">
                  {result.repairs.map((repair) => (
                    <li key={repair}>{repair}</li>
                  ))}
                </ul>
              ) : null}

              {result.warnings.length > 0 ? (
                <details className="paste-program__warnings">
                  <summary>
                    {t('paste.warningSummary', { count: result.warnings.length })}
                  </summary>
                  <ul className="paste-program__issues paste-program__issues--muted">
                    {result.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {savedPrograms.length > 0 ? (
        <div className="paste-program__saved">
          <p className="paste-program__saved-title">
            {t('paste.savedTitle', { count: savedPrograms.length })}
          </p>
          <ul className="paste-program__saved-list">
            {savedPrograms.map((program) => (
              <li key={programIdentity(program.id, program.version)}>
                <span>
                  {program.name}{' '}
                  <span className="paste-program__saved-version">
                    {program.version}
                  </span>
                </span>
                <button
                  aria-label={t('paste.removeAria', {
                    name: program.name,
                    version: program.version,
                  })}
                  className="paste-program__delete"
                  onClick={() => handleDelete(program)}
                  type="button"
                >
                  <Trash2 size={16} strokeWidth={2.4} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
