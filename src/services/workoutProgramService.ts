import { exerciseLibrary } from '../data/exerciseLibrary'
import type { WorkoutDay } from '../data/workoutPlan'
import {
  CURRENT_DEFAULT_PROGRAM_ID,
  getLatestWorkoutProgramById,
  getWorkoutProgramByIdAndVersion,
} from '../data/workoutProgramRegistry'
import type { AuthUser } from '../context/AuthContext'
import type { WorkoutProgram } from '../types/workoutProgram'
import {
  getCustomWorkoutPlan,
  getUserProfileSettings,
  normalizeCustomWorkoutPlan,
  saveCustomWorkoutPlanSafely,
  saveUserProfileSettingsSafely,
} from '../utils/settingsUtils'
import {
  CLOUD_WORKOUT_PROGRAM_MANAGER_CACHE_KEY,
  CUSTOM_WORKOUT_PLAN_KEY,
  DISMISSED_WORKOUT_PROGRAMS_KEY,
  INSTALLED_WORKOUT_PROGRAM_KEY,
  USER_PROFILE_SETTINGS_KEY,
  safeGetJSON,
  safeRemove,
  safeSetJSON,
} from '../utils/storageUtils'
import {
  areWorkoutPlansEquivalent,
  createWorkoutPlanBackup,
  getWorkoutProgramChangeProtection,
  type DismissedWorkoutProgram,
  type InstalledWorkoutProgram,
  type ProgramManagerResult,
  type StorageRollbackResult,
  type WorkoutPlanBackup,
} from '../utils/workoutProgramManager'
import { validateWorkoutProgram } from '../utils/workoutProgramValidation'
import { isSupabaseConfigured } from '../lib/supabaseClient'
import { isBrowserOnline } from './serviceUtils'
import {
  deleteCloudUserSettings,
  deleteCloudWorkoutPlan,
  fetchCloudUserSettingsSnapshot,
  fetchCloudWorkoutPlanSnapshot,
  writeCloudUserSettings,
  writeCloudWorkoutPlan,
} from './settingsService'

const MAX_CLOUD_BACKUPS = 3

export const CLOUD_PROGRAM_OPERATION_STATUS = {
  saving: 'Saving cloud plan…',
  verifying: 'Verifying cloud plan…',
  rollingBack: 'Restoring previous plan…',
  installComplete: 'Installation complete',
  installFailedRestored:
    'Installation failed and previous plan restored',
} as const

export type CloudProgramOperationStatus =
  (typeof CLOUD_PROGRAM_OPERATION_STATUS)[keyof typeof CLOUD_PROGRAM_OPERATION_STATUS]

export interface CloudWorkoutPlanBackup {
  id: string
  createdAt: string
  reason: string
  previousProgram: InstalledWorkoutProgram | null
  plan: WorkoutDay[]
}

export interface CloudWorkoutProgramManagerMetadata {
  installedProgram: InstalledWorkoutProgram | null
  dismissedPrograms: DismissedWorkoutProgram[]
  backups: CloudWorkoutPlanBackup[]
  [key: string]: unknown
}

export interface CloudDocumentSnapshot<T> {
  exists: boolean
  value: T | null
}

export interface CloudProgramStore {
  fetchSettings(user: AuthUser): Promise<CloudDocumentSnapshot<Record<string, unknown>>>
  writeSettings(
    user: AuthUser,
    settings: Record<string, unknown>,
  ): Promise<CloudDocumentSnapshot<Record<string, unknown>>>
  deleteSettings(user: AuthUser): Promise<CloudDocumentSnapshot<Record<string, unknown>>>
  fetchPlan(user: AuthUser): Promise<CloudDocumentSnapshot<unknown>>
  writePlan(
    user: AuthUser,
    plan: WorkoutDay[],
  ): Promise<CloudDocumentSnapshot<unknown>>
  deletePlan(user: AuthUser): Promise<CloudDocumentSnapshot<unknown>>
}

export interface CloudProgramOperationOptions {
  onStatus?: (status: CloudProgramOperationStatus) => void
  store?: CloudProgramStore
  now?: () => string
  createId?: () => string
}

export interface CloudProgramRollbackResult extends StorageRollbackResult {
  cloudPlanRestored: boolean
  cloudSettingsRestored: boolean
  localRestored: boolean
}

export interface CloudProgramOperationData {
  cloudBackup: CloudWorkoutPlanBackup | null
  cloudSettings: Record<string, unknown> | null
  installedProgram: InstalledWorkoutProgram | null
  localBackup: WorkoutPlanBackup | null
  plan: WorkoutDay[] | null
  program: WorkoutProgram | null
  rollback: CloudProgramRollbackResult | null
}

interface PreparedCloudChange {
  cloudBackup: CloudWorkoutPlanBackup
  cloudPlanBefore: CloudDocumentSnapshot<unknown>
  cloudSettingsBefore: CloudDocumentSnapshot<Record<string, unknown>>
  cloudSettingsWithBackup: Record<string, unknown>
  managerBefore: CloudWorkoutProgramManagerMetadata
  localBackup: WorkoutPlanBackup
}

interface JsonStorageSnapshot {
  exists: boolean
  value: unknown
}

class PreparedCloudChangeError extends Error {
  prepared: PreparedCloudChange

  constructor(message: string, prepared: PreparedCloudChange) {
    super(message)
    this.name = 'PreparedCloudChangeError'
    this.prepared = prepared
  }
}

interface LocalCommitOptions {
  expectedPlan: WorkoutDay[]
  manager: CloudWorkoutProgramManagerMetadata
  removeCustomPlan?: boolean
  userId: string
}

interface LocalCommitResult {
  success: boolean
  details: string[]
  rollback: StorageRollbackResult
}

const defaultStore: CloudProgramStore = {
  fetchSettings: fetchCloudUserSettingsSnapshot,
  writeSettings: writeCloudUserSettings,
  deleteSettings: deleteCloudUserSettings,
  fetchPlan: fetchCloudWorkoutPlanSnapshot,
  writePlan: writeCloudWorkoutPlan,
  deletePlan: deleteCloudWorkoutPlan,
}

export async function installWorkoutProgramInCloud(
  program: Pick<WorkoutProgram, 'id' | 'version'>,
  user: AuthUser | null,
  options: CloudProgramOperationOptions = {},
): Promise<ProgramManagerResult<CloudProgramOperationData>> {
  const emptyData = createEmptyOperationData()
  const guard = guardCloudProgramChange(user, true)
  if (guard) return fail(emptyData, guard.code, guard.message)

  if (!isNonEmptyString(program?.id) || !isNonEmptyString(program?.version)) {
    return fail(emptyData, 'program-not-found', 'A valid program ID and version are required.')
  }

  const registeredProgram = getWorkoutProgramByIdAndVersion(
    program.id.trim(),
    program.version.trim(),
  )
  if (!registeredProgram) {
    return fail(
      emptyData,
      'program-not-found',
      'The selected program is not in the workout program registry.',
    )
  }

  const validation = validateWorkoutProgram(registeredProgram, {
    knownExerciseIds: new Set(exerciseLibrary.map((exercise) => exercise.id)),
  })
  if (!validation.valid || validation.errors.length > 0) {
    return fail(
      { ...emptyData, program: registeredProgram },
      'program-invalid',
      'The selected workout program failed validation and was not installed.',
      validation.errors,
    )
  }

  const authenticatedUser = user as AuthUser
  const store = options.store ?? defaultStore
  let prepared: PreparedCloudChange

  try {
    const settingsSnapshot = await store.fetchSettings(authenticatedUser)
    const initialSettings = settingsFromSnapshot(settingsSnapshot)
    const installed = getValidatedCloudWorkoutProgramManagerMetadata(
      initialSettings,
    ).installedProgram
    if (
      installed?.id === registeredProgram.id &&
      installed.version === registeredProgram.version
    ) {
      return fail(
        { ...emptyData, program: registeredProgram },
        'already-installed',
        'This workout program is already installed.',
      )
    }

    prepared = await prepareCloudChange(
      authenticatedUser,
      `Before installing ${registeredProgram.id} ${registeredProgram.version}`,
      null,
      options,
    )
  } catch (error) {
    if (error instanceof PreparedCloudChangeError) {
      return failWithCloudRollback(
        authenticatedUser,
        {
          ...emptyData,
          cloudBackup: error.prepared.cloudBackup,
          localBackup: error.prepared.localBackup,
          program: registeredProgram,
        },
        error.prepared,
        store,
        options,
        'cloud-backup-verification-failed',
        error.message,
        true,
      )
    }
    return fail(
      { ...emptyData, program: registeredProgram },
      'cloud-backup-failed',
      describeError(error, 'The current plans could not be backed up.'),
    )
  }

  const dataAfterBackup: CloudProgramOperationData = {
    ...emptyData,
    cloudBackup: prepared.cloudBackup,
    localBackup: prepared.localBackup,
    program: registeredProgram,
  }
  const expectedPlan = normalizePlan(registeredProgram.days)
  const installedProgram: InstalledWorkoutProgram = {
    id: registeredProgram.id,
    version: registeredProgram.version,
    installedAt: prepared.cloudBackup.createdAt,
  }

  emitStatus(options, CLOUD_PROGRAM_OPERATION_STATUS.saving)
  try {
    await store.writePlan(authenticatedUser, expectedPlan)
  } catch (error) {
    return failWithCloudRollback(
      authenticatedUser,
      dataAfterBackup,
      prepared,
      store,
      options,
      'cloud-plan-save-failed',
      describeError(error, 'The cloud workout plan could not be saved.'),
      true,
    )
  }

  let finalSettings: Record<string, unknown>
  let finalManager: CloudWorkoutProgramManagerMetadata
  let rollbackSettings = prepared.cloudSettingsWithBackup
  try {
    const latestSettingsSnapshot = await store.fetchSettings(authenticatedUser)
    const latestSettings = settingsFromSnapshot(latestSettingsSnapshot)
    const latestManager = getValidatedCloudWorkoutProgramManagerMetadata(
      latestSettings,
    )
    const backups = addCloudBackup(
      latestManager.backups,
      prepared.cloudBackup,
    )
    finalManager = {
      ...latestManager,
      installedProgram,
      dismissedPrograms: latestManager.dismissedPrograms.filter(
        (entry) =>
          entry.id !== installedProgram.id ||
          entry.version !== installedProgram.version,
      ),
      backups,
    }
    rollbackSettings = mergeWorkoutProgramManager(latestSettings, {
      ...latestManager,
      installedProgram: prepared.managerBefore.installedProgram,
      dismissedPrograms: prepared.managerBefore.dismissedPrograms,
      backups,
    })
    finalSettings = mergeWorkoutProgramManager(latestSettings, finalManager)
    await store.writeSettings(authenticatedUser, finalSettings)
  } catch (error) {
    return failWithCloudRollback(
      authenticatedUser,
      dataAfterBackup,
      { ...prepared, cloudSettingsWithBackup: rollbackSettings },
      store,
      options,
      'cloud-metadata-save-failed',
      describeError(error, 'The installed-program metadata could not be saved.'),
      true,
    )
  }

  emitStatus(options, CLOUD_PROGRAM_OPERATION_STATUS.verifying)
  const verified = await verifyCloudState(
    authenticatedUser,
    store,
    finalSettings,
    expectedPlan,
    installedProgram,
    [prepared.cloudBackup.id],
    false,
  )
  if (!verified.success || !verified.settings || !verified.manager) {
    return failWithCloudRollback(
      authenticatedUser,
      dataAfterBackup,
      { ...prepared, cloudSettingsWithBackup: rollbackSettings },
      store,
      options,
      'cloud-verification-failed',
      'Cloud verification failed after installation.',
      true,
      verified.details,
    )
  }

  const localCommit = commitLocalState({
    expectedPlan,
    manager: verified.manager,
    userId: authenticatedUser.id,
  })
  if (!localCommit.success) {
    return failWithCloudRollback(
      authenticatedUser,
      { ...dataAfterBackup, cloudSettings: verified.settings },
      { ...prepared, cloudSettingsWithBackup: rollbackSettings },
      store,
      options,
      'local-commit-failed',
      'The verified cloud program could not be committed locally.',
      true,
      localCommit.details,
      localCommit.rollback,
    )
  }

  emitStatus(options, CLOUD_PROGRAM_OPERATION_STATUS.installComplete)
  return succeed(
    {
      ...dataAfterBackup,
      cloudSettings: verified.settings,
      installedProgram,
      plan: expectedPlan,
    },
    CLOUD_PROGRAM_OPERATION_STATUS.installComplete,
    [
      'The previous local and cloud plans were backed up.',
      'The cloud plan and installed-program metadata were refetched and verified.',
      'The local plan was updated only after cloud verification.',
      'Workout history and active workout data were not changed.',
      ...validation.warnings,
    ],
  )
}

export async function restoreWorkoutProgramBackupInCloud(
  backupId: string,
  user: AuthUser | null,
  options: CloudProgramOperationOptions = {},
): Promise<ProgramManagerResult<CloudProgramOperationData>> {
  const emptyData = createEmptyOperationData()
  const guard = guardCloudProgramChange(user, true)
  if (guard) return fail(emptyData, guard.code, guard.message)
  if (!isNonEmptyString(backupId)) {
    return fail(emptyData, 'backup-not-found', 'The selected cloud backup was not found.')
  }

  const authenticatedUser = user as AuthUser
  const store = options.store ?? defaultStore
  let settingsSnapshot: CloudDocumentSnapshot<Record<string, unknown>>
  try {
    settingsSnapshot = await store.fetchSettings(authenticatedUser)
  } catch (error) {
    return fail(
      emptyData,
      'cloud-settings-read-failed',
      describeError(error, 'Cloud Program Manager metadata could not be loaded.'),
    )
  }
  let selected: CloudWorkoutPlanBackup | undefined
  try {
    selected = getValidatedCloudWorkoutProgramManagerMetadata(
      settingsFromSnapshot(settingsSnapshot),
    ).backups.find((backup) => backup.id === backupId.trim())
  } catch (error) {
    return fail(
      emptyData,
      'cloud-settings-invalid',
      describeError(error, 'Cloud Program Manager metadata is invalid.'),
    )
  }
  if (!selected) {
    return fail(emptyData, 'backup-not-found', 'The selected cloud backup was not found.')
  }

  let prepared: PreparedCloudChange
  try {
    prepared = await prepareCloudChange(
      authenticatedUser,
      `Before restoring cloud backup ${selected.id}`,
      selected,
      options,
    )
  } catch (error) {
    if (error instanceof PreparedCloudChangeError) {
      return failWithCloudRollback(
        authenticatedUser,
        {
          ...emptyData,
          cloudBackup: error.prepared.cloudBackup,
          localBackup: error.prepared.localBackup,
        },
        error.prepared,
        store,
        options,
        'cloud-backup-verification-failed',
        error.message,
        false,
      )
    }
    return fail(
      { ...emptyData, cloudBackup: selected },
      'cloud-backup-failed',
      describeError(error, 'The current plans could not be backed up.'),
    )
  }

  const dataAfterBackup: CloudProgramOperationData = {
    ...emptyData,
    cloudBackup: prepared.cloudBackup,
    localBackup: prepared.localBackup,
  }
  const expectedPlan = normalizePlan(selected.plan)
  emitStatus(options, CLOUD_PROGRAM_OPERATION_STATUS.saving)
  try {
    await store.writePlan(authenticatedUser, expectedPlan)
  } catch (error) {
    return failWithCloudRollback(
      authenticatedUser,
      dataAfterBackup,
      prepared,
      store,
      options,
      'cloud-plan-save-failed',
      describeError(error, 'The cloud backup plan could not be restored.'),
      false,
    )
  }

  let finalSettings: Record<string, unknown>
  let finalManager: CloudWorkoutProgramManagerMetadata
  let rollbackSettings = prepared.cloudSettingsWithBackup
  try {
    const latestSettingsSnapshot = await store.fetchSettings(authenticatedUser)
    const latestSettings = settingsFromSnapshot(latestSettingsSnapshot)
    const latestManager = getValidatedCloudWorkoutProgramManagerMetadata(
      latestSettings,
    )
    const backups = addCloudBackup(
      latestManager.backups,
      prepared.cloudBackup,
      selected.id,
    )
    finalManager = {
      ...latestManager,
      installedProgram: clone(selected.previousProgram),
      backups,
    }
    rollbackSettings = mergeWorkoutProgramManager(latestSettings, {
      ...latestManager,
      installedProgram: prepared.managerBefore.installedProgram,
      dismissedPrograms: prepared.managerBefore.dismissedPrograms,
      backups,
    })
    finalSettings = mergeWorkoutProgramManager(latestSettings, finalManager)
    await store.writeSettings(authenticatedUser, finalSettings)
  } catch (error) {
    return failWithCloudRollback(
      authenticatedUser,
      dataAfterBackup,
      { ...prepared, cloudSettingsWithBackup: rollbackSettings },
      store,
      options,
      'cloud-metadata-save-failed',
      describeError(error, 'The prior installed-program metadata could not be restored.'),
      false,
    )
  }

  emitStatus(options, CLOUD_PROGRAM_OPERATION_STATUS.verifying)
  const verified = await verifyCloudState(
    authenticatedUser,
    store,
    finalSettings,
    expectedPlan,
    selected.previousProgram,
    [selected.id, prepared.cloudBackup.id],
    false,
  )
  if (!verified.success || !verified.settings || !verified.manager) {
    return failWithCloudRollback(
      authenticatedUser,
      dataAfterBackup,
      { ...prepared, cloudSettingsWithBackup: rollbackSettings },
      store,
      options,
      'cloud-verification-failed',
      'Cloud verification failed while restoring the backup.',
      false,
      verified.details,
    )
  }

  const localCommit = commitLocalState({
    expectedPlan,
    manager: verified.manager,
    userId: authenticatedUser.id,
  })
  if (!localCommit.success) {
    return failWithCloudRollback(
      authenticatedUser,
      { ...dataAfterBackup, cloudSettings: verified.settings },
      { ...prepared, cloudSettingsWithBackup: rollbackSettings },
      store,
      options,
      'local-commit-failed',
      'The verified cloud backup could not be committed locally.',
      false,
      localCommit.details,
      localCommit.rollback,
    )
  }

  return succeed(
    {
      ...dataAfterBackup,
      cloudSettings: verified.settings,
      installedProgram: selected.previousProgram,
      plan: expectedPlan,
    },
    'Cloud workout plan backup restored.',
    [
      'The current local and cloud plans were backed up before restore.',
      'The restored cloud plan and installed metadata were verified before local changes.',
      'The selected cloud backup was kept.',
      'Workout history and active workout data were not changed.',
    ],
  )
}

export async function resetCloudPlanToCurrentDefault(
  user: AuthUser | null,
  options: CloudProgramOperationOptions = {},
): Promise<ProgramManagerResult<CloudProgramOperationData>> {
  const emptyData = createEmptyOperationData()
  const guard = guardCloudProgramChange(user, true)
  if (guard) return fail(emptyData, guard.code, guard.message)

  const defaultProgram = getLatestWorkoutProgramById(CURRENT_DEFAULT_PROGRAM_ID)
  if (!defaultProgram) {
    return fail(
      emptyData,
      'default-program-unavailable',
      'The current registry default program is unavailable.',
    )
  }
  const validation = validateWorkoutProgram(defaultProgram, {
    knownExerciseIds: new Set(exerciseLibrary.map((exercise) => exercise.id)),
  })
  if (!validation.valid || validation.errors.length > 0) {
    return fail(
      { ...emptyData, program: defaultProgram },
      'default-program-invalid',
      'The current registry default program is invalid.',
      validation.errors,
    )
  }

  const authenticatedUser = user as AuthUser
  const store = options.store ?? defaultStore
  let prepared: PreparedCloudChange
  try {
    prepared = await prepareCloudChange(
      authenticatedUser,
      `Before resetting to ${defaultProgram.id} ${defaultProgram.version}`,
      null,
      options,
    )
  } catch (error) {
    if (error instanceof PreparedCloudChangeError) {
      return failWithCloudRollback(
        authenticatedUser,
        {
          ...emptyData,
          cloudBackup: error.prepared.cloudBackup,
          localBackup: error.prepared.localBackup,
          program: defaultProgram,
        },
        error.prepared,
        store,
        options,
        'cloud-backup-verification-failed',
        error.message,
        false,
      )
    }
    return fail(
      { ...emptyData, program: defaultProgram },
      'cloud-backup-failed',
      describeError(error, 'The current plans could not be backed up.'),
    )
  }

  const dataAfterBackup: CloudProgramOperationData = {
    ...emptyData,
    cloudBackup: prepared.cloudBackup,
    localBackup: prepared.localBackup,
    program: defaultProgram,
  }
  const expectedPlan = normalizePlan(defaultProgram.days)
  const installedProgram: InstalledWorkoutProgram = {
    id: defaultProgram.id,
    version: defaultProgram.version,
    installedAt: prepared.cloudBackup.createdAt,
  }

  emitStatus(options, CLOUD_PROGRAM_OPERATION_STATUS.saving)
  try {
    await store.deletePlan(authenticatedUser)
    emitStatus(options, CLOUD_PROGRAM_OPERATION_STATUS.verifying)
    const absentPlan = await store.fetchPlan(authenticatedUser)
    if (absentPlan.exists) {
      throw new Error('The cloud custom workout plan still exists after reset.')
    }
  } catch (error) {
    return failWithCloudRollback(
      authenticatedUser,
      dataAfterBackup,
      prepared,
      store,
      options,
      'cloud-plan-reset-failed',
      describeError(error, 'The cloud custom workout plan could not be cleared.'),
      false,
    )
  }

  let finalSettings: Record<string, unknown>
  let finalManager: CloudWorkoutProgramManagerMetadata
  let rollbackSettings = prepared.cloudSettingsWithBackup
  try {
    const latestSettingsSnapshot = await store.fetchSettings(authenticatedUser)
    const latestSettings = settingsFromSnapshot(latestSettingsSnapshot)
    const latestManager = getValidatedCloudWorkoutProgramManagerMetadata(
      latestSettings,
    )
    const backups = addCloudBackup(latestManager.backups, prepared.cloudBackup)
    finalManager = {
      ...latestManager,
      installedProgram,
      dismissedPrograms: latestManager.dismissedPrograms.filter(
        (entry) =>
          entry.id !== installedProgram.id ||
          entry.version !== installedProgram.version,
      ),
      backups,
    }
    rollbackSettings = mergeWorkoutProgramManager(latestSettings, {
      ...latestManager,
      installedProgram: prepared.managerBefore.installedProgram,
      dismissedPrograms: prepared.managerBefore.dismissedPrograms,
      backups,
    })
    finalSettings = mergeWorkoutProgramManager(latestSettings, finalManager)
    await store.writeSettings(authenticatedUser, finalSettings)
  } catch (error) {
    return failWithCloudRollback(
      authenticatedUser,
      dataAfterBackup,
      { ...prepared, cloudSettingsWithBackup: rollbackSettings },
      store,
      options,
      'cloud-metadata-save-failed',
      describeError(error, 'The default installed-program metadata could not be saved.'),
      false,
    )
  }

  emitStatus(options, CLOUD_PROGRAM_OPERATION_STATUS.verifying)
  const verified = await verifyCloudState(
    authenticatedUser,
    store,
    finalSettings,
    expectedPlan,
    installedProgram,
    [prepared.cloudBackup.id],
    true,
  )
  if (!verified.success || !verified.settings || !verified.manager) {
    return failWithCloudRollback(
      authenticatedUser,
      dataAfterBackup,
      { ...prepared, cloudSettingsWithBackup: rollbackSettings },
      store,
      options,
      'cloud-verification-failed',
      'Cloud verification failed while resetting to the default program.',
      false,
      verified.details,
    )
  }

  const localCommit = commitLocalState({
    expectedPlan,
    manager: verified.manager,
    removeCustomPlan: true,
    userId: authenticatedUser.id,
  })
  if (!localCommit.success) {
    return failWithCloudRollback(
      authenticatedUser,
      { ...dataAfterBackup, cloudSettings: verified.settings },
      { ...prepared, cloudSettingsWithBackup: rollbackSettings },
      store,
      options,
      'local-commit-failed',
      'The verified default program could not be activated locally.',
      false,
      localCommit.details,
      localCommit.rollback,
    )
  }

  return succeed(
    {
      ...dataAfterBackup,
      cloudSettings: verified.settings,
      installedProgram,
      plan: expectedPlan,
    },
    'Cloud plan reset to the current registry default.',
    [
      'The cloud custom plan row was absent before local custom data was cleared.',
      'The active local fallback matches the current registry default.',
      'Workout history and active workout data were not changed.',
    ],
  )
}

export async function dismissWorkoutProgramInCloud(
  program: Pick<WorkoutProgram, 'id' | 'version'>,
  user: AuthUser | null,
  options: CloudProgramOperationOptions = {},
): Promise<ProgramManagerResult<CloudWorkoutProgramManagerMetadata | null>> {
  const guard = guardCloudProgramChange(user, false)
  if (guard) return fail(null, guard.code, guard.message)
  if (!isNonEmptyString(program?.id) || !isNonEmptyString(program?.version)) {
    return fail(null, 'program-not-found', 'A valid program ID and version are required.')
  }
  const registered = getWorkoutProgramByIdAndVersion(
    program.id.trim(),
    program.version.trim(),
  )
  if (!registered) {
    return fail(null, 'program-not-found', 'The selected program is not in the registry.')
  }

  const authenticatedUser = user as AuthUser
  const store = options.store ?? defaultStore
  let before: CloudDocumentSnapshot<Record<string, unknown>> | null = null
  let settingsWriteAttempted = false
  let nextSettings: Record<string, unknown>
  let nextManager: CloudWorkoutProgramManagerMetadata
  try {
    before = await store.fetchSettings(authenticatedUser)
    const settings = settingsFromSnapshot(before)
    const manager = getValidatedCloudWorkoutProgramManagerMetadata(settings)
    const dismissedAt = (options.now ?? (() => new Date().toISOString()))()
    nextManager = {
      ...manager,
      dismissedPrograms: [
        { id: registered.id, version: registered.version, dismissedAt },
        ...manager.dismissedPrograms.filter(
          (entry) => entry.id !== registered.id || entry.version !== registered.version,
        ),
      ],
    }
    nextSettings = mergeWorkoutProgramManager(settings, nextManager)
    settingsWriteAttempted = true
    await store.writeSettings(authenticatedUser, nextSettings)
    const verified = await store.fetchSettings(authenticatedUser)
    const verifiedSettings = settingsFromSnapshot(verified)
    const verifiedManager = getValidatedCloudWorkoutProgramManagerMetadata(
      verifiedSettings,
    )
    if (
      !verified.exists ||
      !deepEqual(verifiedSettings, nextSettings) ||
      !verifiedManager.dismissedPrograms.some(
        (entry) =>
          entry.id === registered.id && entry.version === registered.version,
      )
    ) {
      throw new Error('The cloud dismissal metadata could not be verified.')
    }
    nextManager = verifiedManager
    nextSettings = verifiedSettings
  } catch (error) {
    const rollbackDetails = before && settingsWriteAttempted
      ? await rollbackSettingsSnapshot(authenticatedUser, before, store)
      : []
    return fail(
      null,
      'cloud-dismissal-failed',
      describeError(error, 'The program could not be dismissed in the cloud.'),
      rollbackDetails,
    )
  }

  const localCommit = commitLocalMetadata(
    authenticatedUser.id,
    nextSettings,
    nextManager,
  )
  if (!localCommit.success) {
    const rollbackDetails = await rollbackSettingsSnapshot(
      authenticatedUser,
      before,
      store,
    )
    return fail(
      null,
      'local-dismissal-failed',
      'The cloud dismissal was verified, but the local dismissed cache could not be updated.',
      [...localCommit.details, ...rollbackDetails],
    )
  }

  return succeed(
    nextManager,
    `Kept the current plan instead of ${registered.id} ${registered.version}.`,
    ['The cloud custom plan and workout history were not changed.'],
  )
}

export function getCloudWorkoutProgramManagerMetadata(
  settings: unknown,
): CloudWorkoutProgramManagerMetadata {
  const settingsRecord = settingsObject(settings)
  const rawManager = isPlainObject(settingsRecord.workoutProgramManager)
    ? settingsRecord.workoutProgramManager
    : {}
  const installedProgram = isInstalledWorkoutProgram(rawManager.installedProgram)
    ? clone(rawManager.installedProgram)
    : null
  const dismissedPrograms = Array.isArray(rawManager.dismissedPrograms)
    ? rawManager.dismissedPrograms
        .filter(isDismissedWorkoutProgram)
        .sort((left, right) => right.dismissedAt.localeCompare(left.dismissedAt))
        .map(clone)
    : []
  const backups = Array.isArray(rawManager.backups)
    ? rawManager.backups
        .filter(isCloudWorkoutPlanBackup)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .slice(0, MAX_CLOUD_BACKUPS)
        .map(clone)
    : []

  return {
    ...clone(rawManager),
    installedProgram,
    dismissedPrograms,
    backups,
  }
}

function getValidatedCloudWorkoutProgramManagerMetadata(
  settings: Record<string, unknown>,
): CloudWorkoutProgramManagerMetadata {
  const rawManager = settings.workoutProgramManager
  if (rawManager === undefined) {
    return getCloudWorkoutProgramManagerMetadata(settings)
  }
  if (!isPlainObject(rawManager)) {
    throw new Error('Cloud Program Manager metadata must be an object.')
  }
  if (
    rawManager.installedProgram !== undefined &&
    rawManager.installedProgram !== null &&
    !isInstalledWorkoutProgram(rawManager.installedProgram)
  ) {
    throw new Error('Cloud installed-program metadata is invalid.')
  }
  if (
    rawManager.dismissedPrograms !== undefined &&
    (!Array.isArray(rawManager.dismissedPrograms) ||
      !rawManager.dismissedPrograms.every(isDismissedWorkoutProgram))
  ) {
    throw new Error('Cloud dismissed-program metadata is invalid.')
  }
  if (
    rawManager.backups !== undefined &&
    (!Array.isArray(rawManager.backups) ||
      !rawManager.backups.every(isCloudWorkoutPlanBackup))
  ) {
    throw new Error('Cloud workout plan backup metadata is invalid.')
  }
  return getCloudWorkoutProgramManagerMetadata(settings)
}

export function hydrateWorkoutProgramManagerFromCloudSettings(
  settings: unknown,
  userId: string,
): ProgramManagerResult<CloudWorkoutProgramManagerMetadata | null> {
  if (!isNonEmptyString(userId)) {
    return fail(null, 'invalid-user', 'A user ID is required for cloud Program Manager hydration.')
  }
  let cloudSettings: Record<string, unknown>
  let manager: CloudWorkoutProgramManagerMetadata
  try {
    if (!isPlainObject(settings)) {
      throw new Error('Cloud user settings must be an object.')
    }
    cloudSettings = clone(settings)
    manager = getValidatedCloudWorkoutProgramManagerMetadata(cloudSettings)
  } catch (error) {
    return fail(
      null,
      'cloud-metadata-invalid',
      describeError(error, 'Cloud Program Manager metadata is invalid.'),
    )
  }
  const result = commitLocalMetadata(userId.trim(), cloudSettings, manager)
  return result.success
    ? succeed(
        manager,
        'Cloud Program Manager metadata hydrated. Local-only backups were preserved.',
      )
    : fail(
        null,
        'cloud-metadata-hydration-failed',
        'Cloud Program Manager metadata could not be hydrated.',
        result.details,
      )
}

export function getHydratedCloudWorkoutProgramManager(
  userId: string,
): ProgramManagerResult<CloudWorkoutProgramManagerMetadata | null> {
  const value = safeGetJSON(CLOUD_WORKOUT_PROGRAM_MANAGER_CACHE_KEY, null)
  if (
    !isPlainObject(value) ||
    value.userId !== userId ||
    !isPlainObject(value.metadata)
  ) {
    return succeed(null, 'No hydrated cloud Program Manager metadata was found for this account.')
  }
  return succeed(
    getCloudWorkoutProgramManagerMetadata({
      workoutProgramManager: value.metadata,
    }),
    'Hydrated cloud Program Manager metadata loaded.',
  )
}

async function prepareCloudChange(
  user: AuthUser,
  reason: string,
  selectedBackup: CloudWorkoutPlanBackup | null,
  options: CloudProgramOperationOptions,
): Promise<PreparedCloudChange> {
  const store = options.store ?? defaultStore
  const defaultProgram = getLatestWorkoutProgramById(CURRENT_DEFAULT_PROGRAM_ID)
  if (!defaultProgram) {
    throw new Error('The current registry default program is unavailable.')
  }
  const cloudPlanBefore = await store.fetchPlan(user)
  const cloudPlan = cloudPlanBefore.exists
    ? normalizePlanSnapshot(cloudPlanBefore)
    : normalizePlan(defaultProgram.days)
  const settingsSnapshot = await store.fetchSettings(user)
  const settingsBefore = settingsFromSnapshot(settingsSnapshot)
  const managerBefore = getValidatedCloudWorkoutProgramManagerMetadata(
    settingsBefore,
  )
  if (selectedBackup) {
    const latestSelected = managerBefore.backups.find(
      (backup) => backup.id === selectedBackup.id,
    )
    if (!latestSelected || !deepEqual(latestSelected, selectedBackup)) {
      throw new Error(
        'The selected cloud backup changed before restoration began.',
      )
    }
  }

  const cloudBackupId = (options.createId ?? createCloudBackupId)()
  if (
    !isNonEmptyString(cloudBackupId) ||
    managerBefore.backups.some((backup) => backup.id === cloudBackupId)
  ) {
    throw new Error('A unique cloud backup ID could not be created.')
  }
  const localBackupResult = createWorkoutPlanBackup(
    normalizePlan(getCustomWorkoutPlan()),
    reason,
  )
  if (!localBackupResult.success || !localBackupResult.data) {
    throw new Error(localBackupResult.message)
  }

  const createdAt = (options.now ?? (() => new Date().toISOString()))()
  const cloudBackup: CloudWorkoutPlanBackup = {
    id: cloudBackupId,
    createdAt,
    reason,
    previousProgram: clone(managerBefore.installedProgram),
    plan: cloudPlan,
  }
  const managerWithBackup: CloudWorkoutProgramManagerMetadata = {
    ...managerBefore,
    backups: addCloudBackup(
      managerBefore.backups,
      cloudBackup,
      selectedBackup?.id ?? null,
    ),
  }
  const cloudSettingsWithBackup = mergeWorkoutProgramManager(
    settingsBefore,
    managerWithBackup,
  )

  const prepared: PreparedCloudChange = {
    cloudBackup,
    cloudPlanBefore,
    cloudSettingsBefore: settingsSnapshot,
    cloudSettingsWithBackup,
    managerBefore,
    localBackup: localBackupResult.data,
  }

  try {
    emitStatus(options, CLOUD_PROGRAM_OPERATION_STATUS.saving)
    await store.writeSettings(user, cloudSettingsWithBackup)
    const backupVerification = await store.fetchSettings(user)
    const verifiedSettings = settingsFromSnapshot(backupVerification)
    const verifiedManager = getValidatedCloudWorkoutProgramManagerMetadata(
      verifiedSettings,
    )
    if (
      !deepEqual(verifiedSettings, cloudSettingsWithBackup) ||
      !verifiedManager.backups.some((backup) => backup.id === cloudBackup.id) ||
      (selectedBackup &&
        !verifiedManager.backups.some(
          (backup) => backup.id === selectedBackup.id,
        ))
    ) {
      throw new Error('The cloud workout plan backup could not be verified.')
    }
  } catch (error) {
    throw new PreparedCloudChangeError(
      describeError(error, 'The cloud workout plan backup could not be verified.'),
      prepared,
    )
  }

  return prepared
}

async function verifyCloudState(
  user: AuthUser,
  store: CloudProgramStore,
  expectedSettings: Record<string, unknown>,
  expectedPlan: WorkoutDay[],
  expectedInstalled: InstalledWorkoutProgram | null,
  requiredBackupIds: string[],
  expectPlanAbsent: boolean,
): Promise<{
  success: boolean
  details: string[]
  manager: CloudWorkoutProgramManagerMetadata | null
  settings: Record<string, unknown> | null
}> {
  const details: string[] = []
  try {
    const [planSnapshot, settingsSnapshot] = await Promise.all([
      store.fetchPlan(user),
      store.fetchSettings(user),
    ])
    if (expectPlanAbsent) {
      if (planSnapshot.exists) details.push('The cloud custom plan row still exists.')
    } else if (
      !planSnapshot.exists ||
      !Array.isArray(planSnapshot.value) ||
      !areWorkoutPlansEquivalent(
        normalizePlan(planSnapshot.value),
        expectedPlan,
      )
    ) {
      details.push('The cloud plan does not match the expected program.')
    }
    if (!settingsSnapshot.exists || !isPlainObject(settingsSnapshot.value)) {
      details.push('The cloud settings document is absent or invalid.')
      return { success: false, details, manager: null, settings: null }
    }
    const settings = settingsFromSnapshot(settingsSnapshot)
    if (!deepEqual(settings, expectedSettings)) {
      details.push(
        'The verified cloud settings document does not match the complete expected settings merge.',
      )
    }
    const manager = getValidatedCloudWorkoutProgramManagerMetadata(settings)
    if (!installedProgramsEqual(manager.installedProgram, expectedInstalled)) {
      details.push('The cloud installed-program metadata does not match.')
    }
    requiredBackupIds.forEach((requiredBackupId) => {
      if (!manager.backups.some((backup) => backup.id === requiredBackupId)) {
        details.push(`Required cloud backup ${requiredBackupId} is missing.`)
      }
    })
    if (expectPlanAbsent && !areWorkoutPlansEquivalent(getDefaultPlan(), expectedPlan)) {
      details.push('The registry fallback does not match the expected default program.')
    }
    return {
      success: details.length === 0,
      details,
      manager,
      settings,
    }
  } catch (error) {
    return {
      success: false,
      details: [describeError(error, 'Cloud values could not be refetched.')],
      manager: null,
      settings: null,
    }
  }
}

async function failWithCloudRollback(
  user: AuthUser,
  data: CloudProgramOperationData,
  prepared: PreparedCloudChange,
  store: CloudProgramStore,
  options: CloudProgramOperationOptions,
  code: string,
  message: string,
  installation: boolean,
  details: string[] = [],
  localRollback: StorageRollbackResult | null = null,
): Promise<ProgramManagerResult<CloudProgramOperationData>> {
  const rollback = await rollbackCloudState(
    user,
    prepared,
    store,
    options,
    localRollback,
  )
  if (installation && rollback.success) {
    emitStatus(options, CLOUD_PROGRAM_OPERATION_STATUS.installFailedRestored)
  }
  return fail(
    { ...data, rollback },
    rollback.success ? code : 'rollback-failed',
    installation && rollback.success
      ? CLOUD_PROGRAM_OPERATION_STATUS.installFailedRestored
      : rollback.success
        ? `${message} The previous cloud plan and metadata were restored.`
        : `${message} Rollback did not complete cleanly.`,
    [
      ...(installation && rollback.success ? [message] : []),
      ...details,
      ...rollback.details,
    ],
  )
}

async function rollbackCloudState(
  user: AuthUser,
  prepared: PreparedCloudChange,
  store: CloudProgramStore,
  options: CloudProgramOperationOptions,
  localRollback: StorageRollbackResult | null,
): Promise<CloudProgramRollbackResult> {
  emitStatus(options, CLOUD_PROGRAM_OPERATION_STATUS.rollingBack)
  const details: string[] = []
  let cloudPlanRestored = false
  let cloudSettingsRestored = false

  try {
    if (prepared.cloudPlanBefore.exists) {
      if (!Array.isArray(prepared.cloudPlanBefore.value)) {
        throw new Error('The previous cloud plan snapshot is invalid.')
      }
      await store.writePlan(
        user,
        clone(prepared.cloudPlanBefore.value) as WorkoutDay[],
      )
    } else {
      await store.deletePlan(user)
    }
    const plan = await store.fetchPlan(user)
    cloudPlanRestored = snapshotsEqual(plan, prepared.cloudPlanBefore)
    details.push(
      cloudPlanRestored
        ? 'Previous cloud plan restored and verified.'
        : 'Previous cloud plan could not be verified after rollback.',
    )
  } catch (error) {
    details.push(describeError(error, 'Previous cloud plan rollback failed.'))
  }

  try {
    await store.writeSettings(user, prepared.cloudSettingsWithBackup)
    const settings = await store.fetchSettings(user)
    cloudSettingsRestored =
      settings.exists && deepEqual(settings.value, prepared.cloudSettingsWithBackup)
    details.push(
      cloudSettingsRestored
        ? 'Previous cloud metadata restored; the created backup was preserved.'
        : 'Previous cloud metadata could not be verified after rollback.',
    )
  } catch (error) {
    details.push(describeError(error, 'Previous cloud metadata rollback failed.'))
  }

  const localRestored = localRollback?.success ?? true
  return {
    attempted: true,
    success: cloudPlanRestored && cloudSettingsRestored && localRestored,
    details,
    cloudPlanRestored,
    cloudSettingsRestored,
    localRestored,
  }
}

async function rollbackSettingsSnapshot(
  user: AuthUser,
  snapshot: CloudDocumentSnapshot<Record<string, unknown>>,
  store: CloudProgramStore,
): Promise<string[]> {
  try {
    if (snapshot.exists) {
      await store.writeSettings(user, settingsObject(snapshot.value))
    } else {
      await store.deleteSettings(user)
    }
    const verified = await store.fetchSettings(user)
    return [
      snapshotsEqual(verified, snapshot)
        ? 'Previous cloud settings restored and verified.'
        : 'Previous cloud settings could not be verified after rollback.',
    ]
  } catch (error) {
    return [describeError(error, 'Previous cloud settings rollback failed.')]
  }
}

function commitLocalState(options: LocalCommitOptions): LocalCommitResult {
  const snapshots = localProgramSnapshots()
  const details: string[] = []
  const planSaved = options.removeCustomPlan
    ? safeRemove(CUSTOM_WORKOUT_PLAN_KEY)
    : saveCustomWorkoutPlanSafely(options.expectedPlan).success
  const planVerified = options.removeCustomPlan
    ? !readJsonStorageSnapshot(CUSTOM_WORKOUT_PLAN_KEY).exists &&
      areWorkoutPlansEquivalent(getCustomWorkoutPlan(), options.expectedPlan)
    : verifyLocalPlan(options.expectedPlan)

  if (!planSaved || !planVerified) {
    const rollback = rollbackLocalSnapshots(snapshots)
    return {
      success: false,
      details: ['The verified plan could not be saved and verified locally.', ...rollback.details],
      rollback,
    }
  }

  const metadata = commitLocalMetadata(
    options.userId,
    mergeWorkoutProgramManager(getUserProfileSettings(), options.manager),
    options.manager,
  )
  if (!metadata.success) {
    const rollback = rollbackLocalSnapshots(snapshots)
    return {
      success: false,
      details: [...metadata.details, ...rollback.details],
      rollback,
    }
  }

  return {
    success: true,
    details,
    rollback: { attempted: false, success: true, details: [] },
  }
}

function commitLocalMetadata(
  userId: string,
  settings: Record<string, unknown>,
  manager: CloudWorkoutProgramManagerMetadata,
): LocalCommitResult {
  const snapshots = localMetadataSnapshots()
  const details: string[] = []
  const installedSaved = manager.installedProgram
    ? safeSetJSON(INSTALLED_WORKOUT_PROGRAM_KEY, manager.installedProgram)
    : safeRemove(INSTALLED_WORKOUT_PROGRAM_KEY)
  const dismissedSaved = safeSetJSON(
    DISMISSED_WORKOUT_PROGRAMS_KEY,
    manager.dismissedPrograms,
  )
  const localSettings = getUserProfileSettings()
  const settingsSaved = saveUserProfileSettingsSafely({
    ...settings,
    ...localSettings,
    workoutProgramManager: clone(manager),
  }).success
  const cacheSaved = safeSetJSON(CLOUD_WORKOUT_PROGRAM_MANAGER_CACHE_KEY, {
    userId,
    hydratedAt: new Date().toISOString(),
    metadata: manager,
  })
  const verified =
    installedSaved &&
    dismissedSaved &&
    settingsSaved &&
    cacheSaved &&
    installedSnapshotMatches(manager.installedProgram) &&
    deepEqual(
      safeGetJSON(DISMISSED_WORKOUT_PROGRAMS_KEY, null),
      manager.dismissedPrograms,
    ) &&
    getHydratedCloudWorkoutProgramManager(userId).data !== null

  if (verified) {
    return {
      success: true,
      details,
      rollback: { attempted: false, success: true, details: [] },
    }
  }

  const rollback = rollbackLocalSnapshots(snapshots)
  return {
    success: false,
    details: ['Local Program Manager metadata could not be saved and verified.', ...rollback.details],
    rollback,
  }
}

function guardCloudProgramChange(
  user: AuthUser | null,
  protectActiveWorkout: boolean,
): { code: string; message: string } | null {
  if (!isSupabaseConfigured) {
    return {
      code: 'supabase-not-configured',
      message: 'Supabase is not configured. Running in local mode.',
    }
  }
  if (!user || !isNonEmptyString(user.id)) {
    return {
      code: 'authentication-required',
      message: 'Sign in with a cloud account to change workout programs.',
    }
  }
  if (!isBrowserOnline()) {
    return {
      code: 'offline',
      message: 'Connect to the internet before changing a cloud workout program.',
    }
  }
  if (protectActiveWorkout && getWorkoutProgramChangeProtection().data.blocked) {
    return {
      code: 'active-workout',
      message: 'Finish or discard the active workout before changing programs.',
    }
  }
  return null
}

function mergeWorkoutProgramManager(
  settings: Record<string, unknown>,
  manager: CloudWorkoutProgramManagerMetadata,
): Record<string, unknown> {
  return {
    ...clone(settings),
    workoutProgramManager: clone(manager),
  }
}

function addCloudBackup(
  existing: CloudWorkoutPlanBackup[],
  backup: CloudWorkoutPlanBackup,
  preserveBackupId: string | null = null,
): CloudWorkoutPlanBackup[] {
  const candidates = [
    clone(backup),
    ...existing
      .filter((candidate) => candidate.id !== backup.id)
      .map(clone),
  ].sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  const preserved = preserveBackupId
    ? candidates.find((candidate) => candidate.id === preserveBackupId)
    : undefined
  const required = [backup, preserved]
    .filter((candidate): candidate is CloudWorkoutPlanBackup => Boolean(candidate))
    .filter(
      (candidate, index, list) =>
        list.findIndex((entry) => entry.id === candidate.id) === index,
    )
  return [
    ...required,
    ...candidates.filter(
      (candidate) => !required.some((entry) => entry.id === candidate.id),
    ),
  ]
    .slice(0, MAX_CLOUD_BACKUPS)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
}

function normalizePlanSnapshot(snapshot: CloudDocumentSnapshot<unknown>): WorkoutDay[] {
  if (!snapshot.exists || !Array.isArray(snapshot.value)) {
    throw new Error('The current cloud custom plan is invalid.')
  }
  return normalizePlan(snapshot.value)
}

function normalizePlan(plan: unknown): WorkoutDay[] {
  return clone(normalizeCustomWorkoutPlan(plan)) as WorkoutDay[]
}

function getDefaultPlan(): WorkoutDay[] {
  const defaultProgram = getLatestWorkoutProgramById(CURRENT_DEFAULT_PROGRAM_ID)
  return defaultProgram ? normalizePlan(defaultProgram.days) : []
}

function localProgramSnapshots(): Array<[string, JsonStorageSnapshot]> {
  return [
    [CUSTOM_WORKOUT_PLAN_KEY, readJsonStorageSnapshot(CUSTOM_WORKOUT_PLAN_KEY)],
    ...localMetadataSnapshots(),
  ]
}

function localMetadataSnapshots(): Array<[string, JsonStorageSnapshot]> {
  return [
    [INSTALLED_WORKOUT_PROGRAM_KEY, readJsonStorageSnapshot(INSTALLED_WORKOUT_PROGRAM_KEY)],
    [DISMISSED_WORKOUT_PROGRAMS_KEY, readJsonStorageSnapshot(DISMISSED_WORKOUT_PROGRAMS_KEY)],
    [USER_PROFILE_SETTINGS_KEY, readJsonStorageSnapshot(USER_PROFILE_SETTINGS_KEY)],
    [
      CLOUD_WORKOUT_PROGRAM_MANAGER_CACHE_KEY,
      readJsonStorageSnapshot(CLOUD_WORKOUT_PROGRAM_MANAGER_CACHE_KEY),
    ],
  ]
}

function rollbackLocalSnapshots(
  snapshots: Array<[string, JsonStorageSnapshot]>,
): StorageRollbackResult {
  const details: string[] = []
  let success = true
  snapshots.forEach(([key, snapshot]) => {
    const restored = snapshot.exists
      ? safeSetJSON(key, snapshot.value)
      : safeRemove(key)
    const verified = restored && snapshotsEqual(readJsonStorageSnapshot(key), snapshot)
    if (!verified) success = false
    details.push(
      verified ? `${key} restored.` : `${key} could not be restored and verified.`,
    )
  })
  return { attempted: true, success, details }
}

function readJsonStorageSnapshot(key: string): JsonStorageSnapshot {
  const missing = {}
  const value = safeGetJSON(key, missing)
  return value === missing
    ? { exists: false, value: null }
    : { exists: true, value: clone(value) }
}

function verifyLocalPlan(expected: WorkoutDay[]): boolean {
  const snapshot = readJsonStorageSnapshot(CUSTOM_WORKOUT_PLAN_KEY)
  return (
    snapshot.exists &&
    Array.isArray(snapshot.value) &&
    areWorkoutPlansEquivalent(normalizePlan(snapshot.value), expected)
  )
}

function installedSnapshotMatches(expected: InstalledWorkoutProgram | null): boolean {
  const snapshot = readJsonStorageSnapshot(INSTALLED_WORKOUT_PROGRAM_KEY)
  return expected === null
    ? !snapshot.exists
    : snapshot.exists && deepEqual(snapshot.value, expected)
}

function snapshotsEqual(
  left: CloudDocumentSnapshot<unknown> | JsonStorageSnapshot,
  right: CloudDocumentSnapshot<unknown> | JsonStorageSnapshot,
): boolean {
  return (
    left.exists === right.exists &&
    (!left.exists || deepEqual(left.value, right.value))
  )
}

function settingsObject(value: unknown): Record<string, unknown> {
  return isPlainObject(value) ? clone(value) : {}
}

function settingsFromSnapshot(
  snapshot: CloudDocumentSnapshot<unknown>,
): Record<string, unknown> {
  if (!snapshot.exists) return {}
  if (!isPlainObject(snapshot.value)) {
    throw new Error('The existing cloud user settings document is invalid.')
  }
  return clone(snapshot.value)
}

function installedProgramsEqual(
  left: InstalledWorkoutProgram | null,
  right: InstalledWorkoutProgram | null,
): boolean {
  return left === null || right === null
    ? left === right
    : left.id === right.id &&
        left.version === right.version &&
        left.installedAt === right.installedAt
}

function isCloudWorkoutPlanBackup(value: unknown): value is CloudWorkoutPlanBackup {
  if (
    !isPlainObject(value) ||
    !isNonEmptyString(value.id) ||
    !isIsoTimestamp(value.createdAt) ||
    !isNonEmptyString(value.reason) ||
    !Array.isArray(value.plan) ||
    !(value.previousProgram === null || isInstalledWorkoutProgram(value.previousProgram))
  ) {
    return false
  }
  return validateWorkoutProgram({
    id: 'cloud-backup-validation',
    name: 'Cloud backup validation',
    version: '1.0.0',
    updatedAt: '1970-01-01',
    description: 'Validation wrapper for a cloud workout plan backup.',
    days: value.plan,
  }).valid
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

function createCloudBackupId(): string {
  const randomId = globalThis.crypto?.randomUUID?.()
  return randomId
    ? `cloud-workout-plan-${randomId}`
    : `cloud-workout-plan-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function createEmptyOperationData(): CloudProgramOperationData {
  return {
    cloudBackup: null,
    cloudSettings: null,
    installedProgram: null,
    localBackup: null,
    plan: null,
    program: null,
    rollback: null,
  }
}

function describeError(error: unknown, fallback: string): string {
  return error && typeof error === 'object' && 'message' in error
    ? String(error.message)
    : fallback
}

function emitStatus(
  options: CloudProgramOperationOptions,
  status: CloudProgramOperationStatus,
) {
  try {
    options.onStatus?.(status)
  } catch {
    // Rendering an operation status must never affect persistence or rollback.
  }
}

function deepEqual(left: unknown, right: unknown): boolean {
  return stableSerialize(left) === stableSerialize(right)
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(',')}]`
  }
  if (isPlainObject(value)) {
    return `{${Object.keys(value)
      .sort((left, right) => left.localeCompare(right))
      .map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`)
      .join(',')}}`
  }
  return JSON.stringify(value) ?? 'undefined'
}

function clone<T>(value: T): T {
  return value === null || value === undefined
    ? value
    : (JSON.parse(JSON.stringify(value)) as T)
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
