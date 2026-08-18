import { exerciseLibrary } from '../data/exerciseLibrary'
import type { WorkoutDay } from '../data/workoutPlan'
import { getWorkoutProgramByIdAndVersion } from '../data/workoutProgramRegistry'
import type {
  WorkoutProgram,
  WorkoutProgramValidationResult,
} from '../types/workoutProgram'
import {
  getCustomWorkoutPlan,
  normalizeCustomWorkoutPlan,
  saveCustomWorkoutPlanSafely,
} from './settingsUtils'
import {
  ACTIVE_WORKOUT_SESSION_KEY,
  CUSTOM_WORKOUT_PLAN_KEY,
  DISMISSED_WORKOUT_PROGRAMS_KEY,
  INSTALLED_WORKOUT_PROGRAM_KEY,
  WORKOUT_PLAN_BACKUPS_KEY,
  safeGetJSON,
  safeHasStorageKey,
  safeRemove,
  safeSetJSON,
} from './storageUtils'
import { validateWorkoutProgram } from './workoutProgramValidation'

const MAX_WORKOUT_PLAN_BACKUPS = 5

export interface InstalledWorkoutProgram {
  id: string
  version: string
  installedAt: string
}

export interface DismissedWorkoutProgram {
  id: string
  version: string
  dismissedAt: string
}

export interface WorkoutPlanBackup {
  id: string
  createdAt: string
  reason: string
  previousProgram: {
    id: string | null
    version: string | null
  }
  plan: WorkoutDay[]
}

export interface ProgramManagerResult<T> {
  success: boolean
  code?: string
  message: string
  data: T
  details: string[]
}

export interface StorageRollbackResult {
  attempted: boolean
  success: boolean
  details: string[]
}

export interface InstallWorkoutProgramData {
  backup: WorkoutPlanBackup | null
  installedProgram: InstalledWorkoutProgram | null
  plan: WorkoutDay[] | null
  program: WorkoutProgram | null
  rollback: StorageRollbackResult | null
  validation: WorkoutProgramValidationResult | null
}

export interface RestoreWorkoutPlanBackupData {
  backup: WorkoutPlanBackup | null
  installedProgram: InstalledWorkoutProgram | null
  plan: WorkoutDay[] | null
  rollback: StorageRollbackResult | null
  safetyBackup: WorkoutPlanBackup | null
}

export interface WorkoutPlanComparison {
  currentPlanName: string
  selectedProgramName: string
  currentExerciseOccurrences: number
  newExerciseOccurrences: number
  changedDayNames: Array<{
    day: number
    currentName: string
    newName: string
  }>
  addedExerciseIds: string[]
  removedExerciseIds: string[]
}

interface JsonStorageSnapshot {
  exists: boolean
  value: unknown
}

interface CreateBackupOptions {
  preserveBackupId?: string
}

export interface LocalProgramChangeOptions {
  cloudMode?: boolean
}

export function getInstalledWorkoutProgram(): ProgramManagerResult<
  InstalledWorkoutProgram | null
> {
  const snapshot = readJsonStorageSnapshot(INSTALLED_WORKOUT_PROGRAM_KEY)

  if (!snapshot.exists) {
    return succeed(null, 'No locally installed workout program metadata was found.')
  }
  if (!isInstalledWorkoutProgram(snapshot.value)) {
    return fail(
      null,
      'invalid-storage-data',
      'The installed workout program metadata is invalid.',
    )
  }

  return succeed(
    clone(snapshot.value),
    `Installed workout program: ${snapshot.value.id} ${snapshot.value.version}.`,
  )
}

export function setInstalledWorkoutProgram(
  program: Pick<WorkoutProgram, 'id' | 'version'> &
    Partial<Pick<InstalledWorkoutProgram, 'installedAt'>>,
): ProgramManagerResult<InstalledWorkoutProgram | null> {
  if (!isNonEmptyString(program?.id) || !isNonEmptyString(program?.version)) {
    return fail(
      null,
      'invalid-program-metadata',
      'Program ID and version are required.',
    )
  }

  const installedAt = program.installedAt ?? new Date().toISOString()
  if (!isIsoTimestamp(installedAt)) {
    return fail(
      null,
      'invalid-program-metadata',
      'The installed-program timestamp is invalid.',
    )
  }

  const metadata: InstalledWorkoutProgram = {
    id: program.id.trim(),
    version: program.version.trim(),
    installedAt,
  }

  if (!safeSetJSON(INSTALLED_WORKOUT_PROGRAM_KEY, metadata)) {
    return fail(
      null,
      'metadata-save-failed',
      'The installed workout program metadata could not be saved.',
    )
  }

  const verified = getInstalledWorkoutProgram()
  if (!verified.success || !deepEqual(verified.data, metadata)) {
    return fail(
      null,
      'metadata-verification-failed',
      'The installed workout program metadata could not be verified.',
      verified.details,
    )
  }

  return succeed(metadata, 'Installed workout program metadata saved.')
}

export function getDismissedWorkoutPrograms(): ProgramManagerResult<
  DismissedWorkoutProgram[]
> {
  const snapshot = readJsonStorageSnapshot(DISMISSED_WORKOUT_PROGRAMS_KEY)
  if (!snapshot.exists) {
    return succeed([], 'No workout programs are dismissed.')
  }
  if (
    !Array.isArray(snapshot.value) ||
    !snapshot.value.every(isDismissedWorkoutProgram)
  ) {
    return fail(
      [],
      'invalid-storage-data',
      'The dismissed workout program list is invalid.',
    )
  }

  const dismissed = [...snapshot.value]
    .sort((left, right) => right.dismissedAt.localeCompare(left.dismissedAt))
    .map((entry) => clone(entry))
  return succeed(dismissed, `${dismissed.length} dismissed workout program(s) loaded.`)
}

export function dismissWorkoutProgram(
  id: string,
  version: string,
): ProgramManagerResult<DismissedWorkoutProgram[]> {
  if (!isNonEmptyString(id) || !isNonEmptyString(version)) {
    return fail(
      [],
      'invalid-program-metadata',
      'Program ID and version are required.',
    )
  }

  const existing = getDismissedWorkoutPrograms()
  if (!existing.success) {
    return fail([], existing.code ?? 'dismissal-read-failed', existing.message)
  }

  const entry: DismissedWorkoutProgram = {
    id: id.trim(),
    version: version.trim(),
    dismissedAt: new Date().toISOString(),
  }
  const next = [
    entry,
    ...existing.data.filter(
      (candidate) =>
        candidate.id !== entry.id || candidate.version !== entry.version,
    ),
  ]

  if (!safeSetJSON(DISMISSED_WORKOUT_PROGRAMS_KEY, next)) {
    return fail(
      existing.data,
      'dismissal-save-failed',
      'The dismissed workout program could not be saved.',
    )
  }

  const verified = getDismissedWorkoutPrograms()
  if (!verified.success || !deepEqual(verified.data, next)) {
    return fail(
      existing.data,
      'dismissal-verification-failed',
      'The dismissed workout program could not be verified.',
      verified.details,
    )
  }

  return succeed(next, `Kept the current plan instead of ${entry.id} ${entry.version}.`)
}

export function clearDismissedWorkoutProgram(
  id: string,
  version: string,
): ProgramManagerResult<DismissedWorkoutProgram[]> {
  if (!isNonEmptyString(id) || !isNonEmptyString(version)) {
    return fail(
      [],
      'invalid-program-metadata',
      'Program ID and version are required.',
    )
  }

  const existing = getDismissedWorkoutPrograms()
  if (!existing.success) {
    return fail([], existing.code ?? 'dismissal-read-failed', existing.message)
  }

  const next = existing.data.filter(
    (entry) => entry.id !== id.trim() || entry.version !== version.trim(),
  )
  if (next.length === existing.data.length) {
    return succeed(next, 'The workout program was not dismissed.')
  }
  if (!safeSetJSON(DISMISSED_WORKOUT_PROGRAMS_KEY, next)) {
    return fail(
      existing.data,
      'dismissal-save-failed',
      'The dismissed workout program entry could not be cleared.',
    )
  }

  const verified = getDismissedWorkoutPrograms()
  if (!verified.success || !deepEqual(verified.data, next)) {
    return fail(
      existing.data,
      'dismissal-verification-failed',
      'The cleared dismissed workout program entry could not be verified.',
      verified.details,
    )
  }

  return succeed(next, 'Dismissed workout program entry cleared.')
}

export function getWorkoutPlanBackups(): ProgramManagerResult<
  WorkoutPlanBackup[]
> {
  const snapshot = readJsonStorageSnapshot(WORKOUT_PLAN_BACKUPS_KEY)
  if (!snapshot.exists) {
    return succeed([], 'No workout plan backups were found.')
  }
  if (!Array.isArray(snapshot.value) || !snapshot.value.every(isWorkoutPlanBackup)) {
    return fail(
      [],
      'invalid-storage-data',
      'The workout plan backup list is invalid.',
    )
  }

  const sorted = [...snapshot.value]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, MAX_WORKOUT_PLAN_BACKUPS)
    .map((backup) => clone(backup))
  return succeed(sorted, `${sorted.length} workout plan backup(s) loaded.`)
}

export function createWorkoutPlanBackup(
  plan: WorkoutDay[],
  reason: string,
): ProgramManagerResult<WorkoutPlanBackup | null> {
  return createWorkoutPlanBackupInternal(plan, reason)
}

export function restoreWorkoutPlanBackup(
  backupId: string,
  options: LocalProgramChangeOptions = {},
): ProgramManagerResult<RestoreWorkoutPlanBackupData> {
  const emptyData: RestoreWorkoutPlanBackupData = {
    backup: null,
    installedProgram: null,
    plan: null,
    rollback: null,
    safetyBackup: null,
  }

  if (options.cloudMode) {
    return fail(
      emptyData,
      'cloud-mode',
      'Cloud program installation will be added in Part 4B.',
    )
  }

  const protection = getWorkoutProgramChangeProtection()
  if (protection.data.blocked) {
    return fail(
      emptyData,
      'active-workout',
      'Finish or discard the active workout before changing programs.',
    )
  }

  const backupsResult = getWorkoutPlanBackups()
  if (!backupsResult.success) {
    return fail(emptyData, backupsResult.code ?? 'backup-read-failed', backupsResult.message)
  }

  const selected = backupsResult.data.find((backup) => backup.id === backupId)
  if (!selected) {
    return fail(emptyData, 'backup-not-found', 'The selected workout plan backup was not found.')
  }

  const planSnapshot = readJsonStorageSnapshot(CUSTOM_WORKOUT_PLAN_KEY)
  const installedSnapshot = readJsonStorageSnapshot(INSTALLED_WORKOUT_PROGRAM_KEY)
  const currentPlan = normalizePlan(getCustomWorkoutPlan())
  const safetyBackupResult = createWorkoutPlanBackupInternal(
    currentPlan,
    `Before restoring backup ${selected.id}`,
    { preserveBackupId: selected.id },
  )
  if (!safetyBackupResult.success || !safetyBackupResult.data) {
    return fail(
      emptyData,
      safetyBackupResult.code ?? 'backup-save-failed',
      `The current plan could not be backed up. ${safetyBackupResult.message}`,
      safetyBackupResult.details,
    )
  }

  const dataAfterBackup: RestoreWorkoutPlanBackupData = {
    ...emptyData,
    backup: clone(selected),
    safetyBackup: safetyBackupResult.data,
  }
  const savedPlan = saveCustomWorkoutPlanSafely(selected.plan)
  if (!savedPlan.success) {
    const rollback = rollbackStorageSnapshots([
      [CUSTOM_WORKOUT_PLAN_KEY, planSnapshot],
      [INSTALLED_WORKOUT_PROGRAM_KEY, installedSnapshot],
    ])
    return fail(
      { ...dataAfterBackup, rollback },
      rollback.success ? 'plan-save-failed' : 'rollback-failed',
      'The backup plan could not be saved; the previous plan was restored.',
      rollback.details,
    )
  }

  const normalizedPlan = normalizePlan(savedPlan.plan)
  if (!verifyStoredPlan(normalizedPlan)) {
    const rollback = rollbackStorageSnapshots([
      [CUSTOM_WORKOUT_PLAN_KEY, planSnapshot],
      [INSTALLED_WORKOUT_PROGRAM_KEY, installedSnapshot],
    ])
    return fail(
      { ...dataAfterBackup, rollback },
      rollback.success ? 'plan-verification-failed' : 'rollback-failed',
      'The restored plan could not be verified; the previous plan was restored.',
      rollback.details,
    )
  }

  let installedProgram: InstalledWorkoutProgram | null = null
  const previousProgram = selected.previousProgram
  const metadataResult =
    previousProgram.id && previousProgram.version
      ? setInstalledWorkoutProgram({
          id: previousProgram.id,
          version: previousProgram.version,
        })
      : clearInstalledWorkoutProgram()

  if (!metadataResult.success) {
    const rollback = rollbackStorageSnapshots([
      [CUSTOM_WORKOUT_PLAN_KEY, planSnapshot],
      [INSTALLED_WORKOUT_PROGRAM_KEY, installedSnapshot],
    ])
    return fail(
      { ...dataAfterBackup, rollback },
      rollback.success ? 'metadata-save-failed' : 'rollback-failed',
      'The prior installed-program metadata could not be restored; the previous plan was restored.',
      [metadataResult.message, ...rollback.details],
    )
  }
  installedProgram = metadataResult.data

  if (!verifyStoredPlan(normalizedPlan)) {
    const rollback = rollbackStorageSnapshots([
      [CUSTOM_WORKOUT_PLAN_KEY, planSnapshot],
      [INSTALLED_WORKOUT_PROGRAM_KEY, installedSnapshot],
    ])
    return fail(
      { ...dataAfterBackup, rollback },
      rollback.success ? 'restore-verification-failed' : 'rollback-failed',
      'The restored plan did not pass final verification; the previous plan was restored.',
      rollback.details,
    )
  }

  return succeed(
    {
      ...dataAfterBackup,
      installedProgram,
      plan: normalizedPlan,
    },
    'Workout plan backup restored. The selected backup was kept.',
    [
      'The current plan was backed up before restore.',
      'Workout history and active workout data were not changed.',
    ],
  )
}

export function installWorkoutProgramLocally(
  program: Pick<WorkoutProgram, 'id' | 'version'>,
  options: LocalProgramChangeOptions = {},
): ProgramManagerResult<InstallWorkoutProgramData> {
  const emptyData: InstallWorkoutProgramData = {
    backup: null,
    installedProgram: null,
    plan: null,
    program: null,
    rollback: null,
    validation: null,
  }

  if (options.cloudMode) {
    return fail(
      emptyData,
      'cloud-mode',
      'Cloud program installation will be added in Part 4B.',
    )
  }
  if (!isNonEmptyString(program?.id) || !isNonEmptyString(program?.version)) {
    return fail(emptyData, 'program-not-found', 'A valid program ID and version are required.')
  }

  const registeredProgram = getWorkoutProgramByIdAndVersion(
    program.id.trim(),
    program.version.trim(),
  )
  if (!registeredProgram) {
    return fail(emptyData, 'program-not-found', 'The selected program is not in the workout program registry.')
  }

  const validation = validateWorkoutProgram(registeredProgram, {
    knownExerciseIds: new Set(exerciseLibrary.map((exercise) => exercise.id)),
  })
  const dataWithProgram: InstallWorkoutProgramData = {
    ...emptyData,
    program: registeredProgram,
    validation,
  }
  if (!validation.valid || validation.errors.length > 0) {
    return fail(
      dataWithProgram,
      'program-invalid',
      'The selected workout program failed validation and was not installed.',
      validation.errors,
    )
  }

  const protection = getWorkoutProgramChangeProtection()
  if (protection.data.blocked) {
    return fail(
      dataWithProgram,
      'active-workout',
      'Finish or discard the active workout before changing programs.',
    )
  }

  const installedBefore = getInstalledWorkoutProgram()
  if (!installedBefore.success) {
    return fail(dataWithProgram, installedBefore.code ?? 'metadata-read-failed', installedBefore.message)
  }
  if (
    installedBefore.data?.id === registeredProgram.id &&
    installedBefore.data.version === registeredProgram.version
  ) {
    return fail(dataWithProgram, 'already-installed', 'This workout program is already installed.')
  }

  const planSnapshot = readJsonStorageSnapshot(CUSTOM_WORKOUT_PLAN_KEY)
  const installedSnapshot = readJsonStorageSnapshot(INSTALLED_WORKOUT_PROGRAM_KEY)
  const dismissedSnapshot = readJsonStorageSnapshot(DISMISSED_WORKOUT_PROGRAMS_KEY)
  const currentPlan = normalizePlan(getCustomWorkoutPlan())
  // A first install has no plan to protect: an empty plan is not a valid
  // backup, and failing the install over it would leave a new account unable
  // to set up the program it just uploaded.
  const backupResult =
    currentPlan.length > 0
      ? createWorkoutPlanBackupInternal(
          currentPlan,
          `Before installing ${registeredProgram.id} ${registeredProgram.version}`,
        )
      : null
  if (backupResult && (!backupResult.success || !backupResult.data)) {
    return fail(
      dataWithProgram,
      backupResult.code ?? 'backup-save-failed',
      `The current plan could not be backed up. ${backupResult.message}`,
      backupResult.details,
    )
  }

  const dataAfterBackup: InstallWorkoutProgramData = {
    ...dataWithProgram,
    backup: backupResult?.data ?? null,
  }
  const savedPlan = saveCustomWorkoutPlanSafely(registeredProgram.days)
  if (!savedPlan.success) {
    return failInstallWithRollback(
      dataAfterBackup,
      'plan-save-failed',
      'The workout program plan could not be saved.',
      planSnapshot,
      installedSnapshot,
      dismissedSnapshot,
    )
  }

  const normalizedPlan = normalizePlan(savedPlan.plan)
  if (!verifyStoredPlan(normalizedPlan)) {
    return failInstallWithRollback(
      dataAfterBackup,
      'plan-verification-failed',
      'The saved workout program plan could not be verified.',
      planSnapshot,
      installedSnapshot,
      dismissedSnapshot,
    )
  }

  const metadataResult = setInstalledWorkoutProgram(registeredProgram)
  if (!metadataResult.success || !metadataResult.data) {
    return failInstallWithRollback(
      dataAfterBackup,
      'metadata-save-failed',
      metadataResult.message,
      planSnapshot,
      installedSnapshot,
      dismissedSnapshot,
    )
  }

  const dismissalResult = clearDismissedWorkoutProgram(
    registeredProgram.id,
    registeredProgram.version,
  )
  if (!dismissalResult.success) {
    return failInstallWithRollback(
      dataAfterBackup,
      'dismissal-save-failed',
      dismissalResult.message,
      planSnapshot,
      installedSnapshot,
      dismissedSnapshot,
    )
  }

  return succeed(
    {
      ...dataAfterBackup,
      installedProgram: metadataResult.data,
      plan: normalizedPlan,
    },
    `${registeredProgram.name} ${registeredProgram.version} installed locally.`,
    [
      'The previous plan was backed up before installation.',
      'The saved plan and installed-program metadata were verified.',
      'Workout history and active workout data were not changed.',
      ...validation.warnings,
    ],
  )
}

export function getWorkoutProgramChangeProtection(): ProgramManagerResult<{
  blocked: boolean
}> {
  const blocked = safeHasStorageKey(ACTIVE_WORKOUT_SESSION_KEY)
  return succeed(
    { blocked },
    blocked
      ? 'Finish or discard the active workout before changing programs.'
      : 'No active workout blocks program changes.',
  )
}

export function areWorkoutPlansEquivalent(
  left: WorkoutDay[],
  right: WorkoutDay[],
): boolean {
  return deepEqual(normalizePlan(left), normalizePlan(right))
}

export function areLocalProgramChangesDisabled(
  cloudMode: boolean,
  activeWorkoutBlocked: boolean,
): boolean {
  return cloudMode || activeWorkoutBlocked
}

export function compareWorkoutPlans(
  currentPlan: WorkoutDay[],
  selectedProgram: WorkoutProgram,
  currentPlanName: string,
): WorkoutPlanComparison {
  const current = normalizePlan(currentPlan)
  const selected = normalizePlan(selectedProgram.days)
  const currentIds = new Set(
    current.flatMap((day) => day.exercises.map((exercise) => exercise.id)),
  )
  const selectedIds = new Set(
    selected.flatMap((day) => day.exercises.map((exercise) => exercise.id)),
  )

  return {
    currentPlanName,
    selectedProgramName: selectedProgram.name,
    currentExerciseOccurrences: countExerciseOccurrences(current),
    newExerciseOccurrences: countExerciseOccurrences(selected),
    changedDayNames: selected.flatMap((day) => {
      const currentDay = current.find((candidate) => candidate.day === day.day)
      if (!currentDay || currentDay.name === day.name) {
        return []
      }
      return [
        {
          day: day.day,
          currentName: currentDay.name,
          newName: day.name,
        },
      ]
    }),
    addedExerciseIds: [...selectedIds]
      .filter((id) => !currentIds.has(id))
      .sort((left, right) => left.localeCompare(right)),
    removedExerciseIds: [...currentIds]
      .filter((id) => !selectedIds.has(id))
      .sort((left, right) => left.localeCompare(right)),
  }
}

function createWorkoutPlanBackupInternal(
  plan: WorkoutDay[],
  reason: string,
  options: CreateBackupOptions = {},
): ProgramManagerResult<WorkoutPlanBackup | null> {
  if (!Array.isArray(plan) || !isNonEmptyString(reason)) {
    return fail(
      null,
      'invalid-backup',
      'A workout plan and backup reason are required.',
    )
  }

  const existingResult = getWorkoutPlanBackups()
  if (!existingResult.success) {
    return fail(null, existingResult.code ?? 'backup-read-failed', existingResult.message)
  }
  const installedResult = getInstalledWorkoutProgram()
  if (!installedResult.success) {
    return fail(null, installedResult.code ?? 'metadata-read-failed', installedResult.message)
  }

  const installed = installedResult.data
  const backup: WorkoutPlanBackup = {
    id: createBackupId(),
    createdAt: new Date().toISOString(),
    reason: reason.trim(),
    previousProgram: {
      id: installed?.id ?? null,
      version: installed?.version ?? null,
    },
    plan: normalizePlan(plan),
  }
  const candidates = [
    backup,
    ...existingResult.data.filter((candidate) => candidate.id !== backup.id),
  ]
  let next = candidates.slice(0, MAX_WORKOUT_PLAN_BACKUPS)
  const preserved = options.preserveBackupId
    ? candidates.find((candidate) => candidate.id === options.preserveBackupId)
    : undefined
  if (preserved && !next.some((candidate) => candidate.id === preserved.id)) {
    next = [...candidates.slice(0, MAX_WORKOUT_PLAN_BACKUPS - 1), preserved]
  }

  if (!safeSetJSON(WORKOUT_PLAN_BACKUPS_KEY, next)) {
    return fail(null, 'backup-save-failed', 'The workout plan backup could not be saved.')
  }

  const verified = getWorkoutPlanBackups()
  if (
    !verified.success ||
    !verified.data.some((candidate) => candidate.id === backup.id) ||
    (preserved && !verified.data.some((candidate) => candidate.id === preserved.id))
  ) {
    return fail(
      null,
      'backup-verification-failed',
      'The workout plan backup could not be verified.',
      verified.details,
    )
  }

  return succeed(backup, 'Workout plan backup created.')
}

function failInstallWithRollback(
  data: InstallWorkoutProgramData,
  code: string,
  message: string,
  planSnapshot: JsonStorageSnapshot,
  installedSnapshot: JsonStorageSnapshot,
  dismissedSnapshot: JsonStorageSnapshot,
): ProgramManagerResult<InstallWorkoutProgramData> {
  const rollback = rollbackStorageSnapshots([
    [CUSTOM_WORKOUT_PLAN_KEY, planSnapshot],
    [INSTALLED_WORKOUT_PROGRAM_KEY, installedSnapshot],
    [DISMISSED_WORKOUT_PROGRAMS_KEY, dismissedSnapshot],
  ])

  return fail(
    { ...data, rollback },
    rollback.success ? code : 'rollback-failed',
    rollback.success
      ? `${message} The previous custom plan and program metadata were restored.`
      : `${message} Rollback did not complete cleanly.`,
    rollback.details,
  )
}

function clearInstalledWorkoutProgram(): ProgramManagerResult<InstalledWorkoutProgram | null> {
  const snapshot = readJsonStorageSnapshot(INSTALLED_WORKOUT_PROGRAM_KEY)
  if (!snapshot.exists) {
    return succeed(null, 'No installed workout program metadata needed clearing.')
  }
  if (!safeRemove(INSTALLED_WORKOUT_PROGRAM_KEY)) {
    return fail(null, 'metadata-save-failed', 'Installed workout program metadata could not be cleared.')
  }
  const verified = readJsonStorageSnapshot(INSTALLED_WORKOUT_PROGRAM_KEY)
  if (verified.exists) {
    return fail(null, 'metadata-verification-failed', 'Cleared installed workout program metadata could not be verified.')
  }
  return succeed(null, 'Installed workout program metadata cleared.')
}

function rollbackStorageSnapshots(
  entries: Array<[string, JsonStorageSnapshot]>,
): StorageRollbackResult {
  const details: string[] = []
  let success = true

  entries.forEach(([key, snapshot]) => {
    const restored = snapshot.exists
      ? safeSetJSON(key, snapshot.value)
      : safeRemove(key)
    const verified = restored && storageSnapshotMatches(key, snapshot)
    if (verified) {
      details.push(`${key} restored.`)
    } else {
      success = false
      details.push(`${key} could not be restored and verified.`)
    }
  })

  return { attempted: true, success, details }
}

function verifyStoredPlan(expected: WorkoutDay[]): boolean {
  const snapshot = readJsonStorageSnapshot(CUSTOM_WORKOUT_PLAN_KEY)
  return snapshot.exists && Array.isArray(snapshot.value) && deepEqual(snapshot.value, expected)
}

function storageSnapshotMatches(key: string, expected: JsonStorageSnapshot): boolean {
  const actual = readJsonStorageSnapshot(key)
  return (
    actual.exists === expected.exists &&
    (!expected.exists || deepEqual(actual.value, expected.value))
  )
}

function readJsonStorageSnapshot(key: string): JsonStorageSnapshot {
  const missing = {}
  const value = safeGetJSON(key, missing)
  return value === missing
    ? { exists: false, value: null }
    : { exists: true, value: clone(value) }
}

function normalizePlan(plan: unknown): WorkoutDay[] {
  return clone(normalizeCustomWorkoutPlan(plan)) as WorkoutDay[]
}

function countExerciseOccurrences(plan: WorkoutDay[]): number {
  return plan.reduce((total, day) => total + day.exercises.length, 0)
}

function createBackupId(): string {
  const randomId = globalThis.crypto?.randomUUID?.()
  return randomId
    ? `workout-plan-${randomId}`
    : `workout-plan-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function isInstalledWorkoutProgram(value: unknown): value is InstalledWorkoutProgram {
  return (
    isPlainObject(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.version) &&
    isIsoTimestamp(value.installedAt)
  )
}

function isDismissedWorkoutProgram(value: unknown): value is DismissedWorkoutProgram {
  return (
    isPlainObject(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.version) &&
    isIsoTimestamp(value.dismissedAt)
  )
}

function isWorkoutPlanBackup(value: unknown): value is WorkoutPlanBackup {
  if (
    !isPlainObject(value) ||
    !isNonEmptyString(value.id) ||
    !isIsoTimestamp(value.createdAt) ||
    !isNonEmptyString(value.reason) ||
    !Array.isArray(value.plan) ||
    !isPlainObject(value.previousProgram)
  ) {
    return false
  }

  const { id, version } = value.previousProgram
  const previousProgramValid =
    (id === null || isNonEmptyString(id)) &&
    (version === null || isNonEmptyString(version)) &&
    ((id === null && version === null) ||
      (isNonEmptyString(id) && isNonEmptyString(version)))
  if (!previousProgramValid) {
    return false
  }

  return validateWorkoutProgram({
    id: 'local-backup-validation',
    name: 'Local backup validation',
    version: '1.0.0',
    updatedAt: '1970-01-01',
    description: 'Validation wrapper for a stored local workout plan backup.',
    days: value.plan,
  }).valid
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isIsoTimestamp(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString() === value
  )
}

function deepEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function succeed<T>(
  data: T,
  message: string,
  details: string[] = [],
): ProgramManagerResult<T> {
  return { success: true, message, data, details }
}

function fail<T>(
  data: T,
  code: string,
  message: string,
  details: string[] = [],
): ProgramManagerResult<T> {
  return { success: false, code, message, data, details }
}
