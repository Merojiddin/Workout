import { t } from '../i18n/t'
import { exerciseLibrary } from '../data/exerciseLibrary'
import type { WorkoutDay } from '../data/workoutPlan'
import { getWorkoutProgramByIdAndVersion } from '../data/workoutProgramRegistry'
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
  saving: t('cloud.status.saving'),
  verifying: t('cloud.status.verifying'),
  rollingBack: t('cloud.status.restoring'),
  installComplete: t('cloud.status.complete'),
  installFailedRestored:
    t('cloud.status.failed'),
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
  localBackup: WorkoutPlanBackup | null
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
    return fail(emptyData, 'program-not-found', t('svc.validIdVersionRequired'))
  }

  const registeredProgram = getWorkoutProgramByIdAndVersion(
    program.id.trim(),
    program.version.trim(),
  )
  if (!registeredProgram) {
    return fail(
      emptyData,
      'program-not-found',
      t('svc.notInRegistry'),
    )
  }

  const validation = validateWorkoutProgram(registeredProgram, {
    knownExerciseIds: new Set(exerciseLibrary.map((exercise) => exercise.id)),
  })
  if (!validation.valid || validation.errors.length > 0) {
    return fail(
      { ...emptyData, program: registeredProgram },
      'program-invalid',
      t('svc.failedValidation'),
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
    // Matching id and version is not enough to call a program installed.
    // An uploaded program is stored under its own id and version, so
    // uploading a revised plan keeps that identity while changing every day
    // inside it. The cloud plan is what settles it: only a plan that already
    // is this program has nothing left to install. Mirrors
    // installWorkoutProgramLocally.
    if (
      installed?.id === registeredProgram.id &&
      installed.version === registeredProgram.version
    ) {
      const cloudPlanSnapshot = await store.fetchPlan(authenticatedUser)
      const cloudPlan = cloudPlanSnapshot.exists
        ? normalizePlanSnapshot(cloudPlanSnapshot)
        : []
      if (areWorkoutPlansEquivalent(cloudPlan, registeredProgram.days)) {
        return fail(
          { ...emptyData, program: registeredProgram },
          'already-installed',
          t('svc.alreadyInstalled'),
        )
      }
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
      describeError(error, t('cloud.backupFailed')),
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
      describeError(error, t('cloud.planSaveFailed')),
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
      describeError(error, t('cloud.installedMetadataSaveFailed')),
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
      t('cloud.verifyFailedAfterInstall'),
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
      t('cloud.commitProgramFailed'),
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
      t('cloud.plansBackedUp'),
      t('cloud.planRefetchedVerified'),
      t('cloud.localUpdatedAfterVerify'),
      t('svc.historyUnchanged'),
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
    return fail(emptyData, 'backup-not-found', t('cloud.backupNotFound'))
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
      describeError(error, t('cloud.metadataLoadFailed')),
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
      describeError(error, t('cloud.metadataInvalid')),
    )
  }
  if (!selected) {
    return fail(emptyData, 'backup-not-found', t('cloud.backupNotFound'))
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
      describeError(error, t('cloud.backupFailed')),
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
      describeError(error, t('cloud.backupPlanRestoreFailed')),
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
      describeError(error, t('cloud.priorMetadataRestoreFailed')),
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
      t('cloud.verifyFailedDuringRestore'),
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
      t('cloud.commitBackupFailed'),
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
    t('cloud.backupRestored'),
    [
      t('cloud.plansBackedUpBeforeRestore'),
      t('cloud.restoredVerified'),
      t('cloud.backupKept'),
      t('svc.historyUnchanged'),
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
    return fail(null, 'program-not-found', t('svc.validIdVersionRequired'))
  }
  const registered = getWorkoutProgramByIdAndVersion(
    program.id.trim(),
    program.version.trim(),
  )
  if (!registered) {
    return fail(null, 'program-not-found', t('svc.notInRegistryShort'))
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
      throw new Error(t('cloud.dismissalVerifyFailed'))
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
      describeError(error, t('cloud.dismissFailed')),
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
      t('cloud.dismissalCacheFailed'),
      [...localCommit.details, ...rollbackDetails],
    )
  }

  return succeed(
    nextManager,
    `Kept the current plan instead of ${registered.id} ${registered.version}.`,
    [t('cloud.planHistoryUnchanged')],
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
    throw new Error(t('cloud.metadataMustBeObject'))
  }
  if (
    rawManager.installedProgram !== undefined &&
    rawManager.installedProgram !== null &&
    !isInstalledWorkoutProgram(rawManager.installedProgram)
  ) {
    throw new Error(t('cloud.installedMetadataInvalid'))
  }
  if (
    rawManager.dismissedPrograms !== undefined &&
    (!Array.isArray(rawManager.dismissedPrograms) ||
      !rawManager.dismissedPrograms.every(isDismissedWorkoutProgram))
  ) {
    throw new Error(t('cloud.dismissedMetadataInvalid'))
  }
  if (
    rawManager.backups !== undefined &&
    (!Array.isArray(rawManager.backups) ||
      !rawManager.backups.every(isCloudWorkoutPlanBackup))
  ) {
    throw new Error(t('cloud.backupMetadataInvalid'))
  }
  return getCloudWorkoutProgramManagerMetadata(settings)
}

export function hydrateWorkoutProgramManagerFromCloudSettings(
  settings: unknown,
  userId: string,
): ProgramManagerResult<CloudWorkoutProgramManagerMetadata | null> {
  if (!isNonEmptyString(userId)) {
    return fail(null, 'invalid-user', t('cloud.userIdRequired'))
  }
  let cloudSettings: Record<string, unknown>
  let manager: CloudWorkoutProgramManagerMetadata
  try {
    if (!isPlainObject(settings)) {
      throw new Error(t('cloud.settingsMustBeObject'))
    }
    cloudSettings = clone(settings)
    manager = getValidatedCloudWorkoutProgramManagerMetadata(cloudSettings)
  } catch (error) {
    return fail(
      null,
      'cloud-metadata-invalid',
      describeError(error, t('cloud.metadataInvalid')),
    )
  }
  const result = commitLocalMetadata(userId.trim(), cloudSettings, manager)
  return result.success
    ? succeed(
        manager,
        t('cloud.metadataHydrated'),
      )
    : fail(
        null,
        'cloud-metadata-hydration-failed',
        t('cloud.metadataHydrateFailed'),
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
    return succeed(null, t('cloud.noHydrated'))
  }
  return succeed(
    getCloudWorkoutProgramManagerMetadata({
      workoutProgramManager: value.metadata,
    }),
    t('cloud.hydratedLoaded'),
  )
}

async function prepareCloudChange(
  user: AuthUser,
  reason: string,
  selectedBackup: CloudWorkoutPlanBackup | null,
  options: CloudProgramOperationOptions,
): Promise<PreparedCloudChange> {
  const store = options.store ?? defaultStore
  const cloudPlanBefore = await store.fetchPlan(user)
  // No program ships with the app, so an account with no cloud plan row starts
  // from an empty plan rather than from somebody else's program.
  const cloudPlan = cloudPlanBefore.exists
    ? normalizePlanSnapshot(cloudPlanBefore)
    : []
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
        t('cloud.backupChanged'),
      )
    }
  }

  const cloudBackupId = (options.createId ?? createCloudBackupId)()
  if (
    !isNonEmptyString(cloudBackupId) ||
    managerBefore.backups.some((backup) => backup.id === cloudBackupId)
  ) {
    throw new Error(t('cloud.backupIdFailed'))
  }
  // A first install has no local plan to protect: an empty plan is not a valid
  // backup, and failing the install over it would leave a new account unable to
  // set up the program it just uploaded. Mirrors installWorkoutProgramLocally.
  const localPlanBefore = normalizePlan(getCustomWorkoutPlan())
  const localBackupResult =
    localPlanBefore.length > 0
      ? createWorkoutPlanBackup(localPlanBefore, reason)
      : null
  if (
    localBackupResult &&
    (!localBackupResult.success || !localBackupResult.data)
  ) {
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
    localBackup: localBackupResult?.data ?? null,
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
      throw new Error(t('cloud.backupVerifyFailed'))
    }
  } catch (error) {
    throw new PreparedCloudChangeError(
      describeError(error, t('cloud.backupVerifyFailed')),
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
      if (planSnapshot.exists) details.push(t('cloud.planRowExists'))
    } else if (
      !planSnapshot.exists ||
      !Array.isArray(planSnapshot.value) ||
      !areWorkoutPlansEquivalent(
        normalizePlan(planSnapshot.value),
        expectedPlan,
      )
    ) {
      details.push(t('cloud.planMismatch'))
    }
    if (!settingsSnapshot.exists || !isPlainObject(settingsSnapshot.value)) {
      details.push(t('cloud.settingsAbsent'))
      return { success: false, details, manager: null, settings: null }
    }
    const settings = settingsFromSnapshot(settingsSnapshot)
    if (!deepEqual(settings, expectedSettings)) {
      details.push(
        t('cloud.settingsMergeMismatch'),
      )
    }
    const manager = getValidatedCloudWorkoutProgramManagerMetadata(settings)
    if (!installedProgramsEqual(manager.installedProgram, expectedInstalled)) {
      details.push(t('cloud.installedMetadataMismatch'))
    }
    requiredBackupIds.forEach((requiredBackupId) => {
      if (!manager.backups.some((backup) => backup.id === requiredBackupId)) {
        details.push(`Required cloud backup ${requiredBackupId} is missing.`)
      }
    })
    // With no cloud plan row and no bundled program, the only correct local
    // state is an empty plan.
    if (expectPlanAbsent && expectedPlan.length > 0) {
      details.push(t('cloud.planExpectedLocally'))
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
      details: [describeError(error, t('cloud.refetchFailed'))],
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
        throw new Error(t('cloud.previousSnapshotInvalid'))
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
        ? t('cloud.rollbackPlanRestored')
        : t('cloud.rollbackPlanVerifyFailed'),
    )
  } catch (error) {
    details.push(describeError(error, t('cloud.rollbackPlanFailed')))
  }

  try {
    await store.writeSettings(user, prepared.cloudSettingsWithBackup)
    const settings = await store.fetchSettings(user)
    cloudSettingsRestored =
      settings.exists && deepEqual(settings.value, prepared.cloudSettingsWithBackup)
    details.push(
      cloudSettingsRestored
        ? t('cloud.rollbackMetadataRestored')
        : t('cloud.rollbackMetadataVerifyFailed'),
    )
  } catch (error) {
    details.push(describeError(error, t('cloud.rollbackMetadataFailed')))
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
        ? t('cloud.rollbackSettingsRestored')
        : t('cloud.rollbackSettingsVerifyFailed'),
    ]
  } catch (error) {
    return [describeError(error, t('cloud.rollbackSettingsFailed'))]
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
      details: [t('cloud.planLocalSaveFailed'), ...rollback.details],
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
    details: [t('cloud.localSaveVerifyFailed'), ...rollback.details],
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
      message: t('cloud.notConfigured'),
    }
  }
  if (!user || !isNonEmptyString(user.id)) {
    return {
      code: 'authentication-required',
      message: t('cloud.signInToChange'),
    }
  }
  if (!isBrowserOnline()) {
    return {
      code: 'offline',
      message: t('cloud.offline'),
    }
  }
  if (protectActiveWorkout && getWorkoutProgramChangeProtection().data.blocked) {
    return {
      code: 'active-workout',
      message: t('svc.activeWorkoutBlocks'),
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
    throw new Error(t('cloud.currentPlanInvalid'))
  }
  return normalizePlan(snapshot.value)
}

function normalizePlan(plan: unknown): WorkoutDay[] {
  return clone(normalizeCustomWorkoutPlan(plan)) as WorkoutDay[]
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
    throw new Error(t('cloud.settingsDocInvalid'))
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
  // An empty plan is a real state to return to - it is what an account has
  // before its first program is installed - so it is a valid *snapshot* even
  // though it would not be a valid *program*. Conflating the two is what made
  // a first-install backup unreadable the moment it was written, and then
  // blocked the very install that wrote it.
  if (value.plan.length === 0) {
    return true
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
