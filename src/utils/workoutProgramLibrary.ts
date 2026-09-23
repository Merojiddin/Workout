import type { AuthUser } from '../context/AuthContext'
import type { TrainingLocation, WorkoutDay } from '../data/workoutPlan'
import { getWorkoutPrograms } from '../data/workoutProgramRegistry'
import type { WorkoutProgram } from '../types/workoutProgram'
import { t } from '../i18n/t'
import {
  getCustomWorkoutPlan,
  getUserProfileSettings,
  normalizeCustomWorkoutPlan,
  notifyUserProfileSettingsChanged,
  saveUserProfileSettingsSafely,
} from './settingsUtils'
import {
  CLOUD_WORKOUT_PROGRAM_MANAGER_CACHE_KEY,
  CUSTOM_WORKOUT_PLAN_KEY,
  DISMISSED_WORKOUT_PROGRAMS_KEY,
  INSTALLED_WORKOUT_PROGRAM_KEY,
  USER_PROFILE_SETTINGS_KEY,
  USER_WORKOUT_PROGRAMS_KEY,
  WORKOUT_PLAN_BACKUPS_KEY,
  resolveStorageKey,
  safeGetJSON,
  safeSetJSON,
} from './storageUtils'
import {
  getDismissedWorkoutPrograms,
  getInstalledWorkoutProgram,
  getWorkoutProgramChangeProtection,
  installWorkoutProgramLocally,
  type InstalledWorkoutProgram,
} from './workoutProgramManager'
import { getUserWorkoutPrograms, saveUserWorkoutProgram } from './userWorkoutPrograms'
import { addToSyncQueue } from './offlineSyncQueue'

type ProgramIdentity = Pick<WorkoutProgram, 'id' | 'version'>

export interface SavedWorkoutProgramPlan extends InstalledWorkoutProgram {
  days: WorkoutDay[]
}

export interface WorkoutProgramLibrary {
  version: 1
  selections: Partial<Record<TrainingLocation, ProgramIdentity>>
  plans: SavedWorkoutProgramPlan[]
}

export function getProgramTrainingLocations(
  program: Pick<WorkoutProgram, 'trainingLocations'>,
): TrainingLocation[] {
  return Array.isArray(program.trainingLocations)
    ? [...new Set(program.trainingLocations.filter((item) => item === 'home' || item === 'gym'))]
    : ['home', 'gym']
}

export function getProgramsForLocation(location: TrainingLocation): WorkoutProgram[] {
  return getWorkoutPrograms().filter((program) =>
    getProgramTrainingLocations(program).includes(location),
  )
}

/** Settings own only selections and edited snapshots; the registry owns definitions. */
export function getWorkoutProgramLibrary(
  settings: Record<string, unknown> = getUserProfileSettings(),
): WorkoutProgramLibrary {
  const raw = isObject(settings.workoutProgramLibrary) ? settings.workoutProgramLibrary : {}
  const rawSelections = isObject(raw.selections) ? raw.selections : {}
  const selections: WorkoutProgramLibrary['selections'] = {}
  for (const location of ['home', 'gym'] as const) {
    const selected = rawSelections[location]
    if (isIdentity(selected)) selections[location] = { id: selected.id, version: selected.version }
  }
  const plans = Array.isArray(raw.plans)
    ? raw.plans.flatMap((plan): SavedWorkoutProgramPlan[] => {
        if (!isObject(plan) || !isIdentity(plan) ||
          typeof plan.installedAt !== 'string' || Number.isNaN(Date.parse(plan.installedAt)) ||
          !Array.isArray(plan.days) || plan.days.length === 0) return []
        const days = normalizeCustomWorkoutPlan(plan.days) as WorkoutDay[]
        return days.length > 0
          ? [{ id: plan.id, version: plan.version, installedAt: plan.installedAt, days }]
          : []
      })
    : []
  return { version: 1, selections, plans }
}

export function getPreferredWorkoutProgram(location: TrainingLocation): WorkoutProgram | null {
  const programs = getProgramsForLocation(location)
  const preferred = getWorkoutProgramLibrary().selections[location]
  const installed = safeGetJSON(INSTALLED_WORKOUT_PROGRAM_KEY, null)
  return programs.find((program) => sameProgram(program, preferred)) ??
    programs.find((program) => sameProgram(program, installed)) ?? programs[0] ?? null
}

/** Pure transaction input: capture outgoing edits, restore incoming edits/date. */
export function prepareWorkoutProgramSelection(
  settings: Record<string, unknown>,
  currentPlan: WorkoutDay[],
  currentInstalled: InstalledWorkoutProgram | null,
  target: WorkoutProgram,
  location: TrainingLocation,
  now: string,
): { settings: Record<string, unknown>; plan: WorkoutDay[]; installedProgram: InstalledWorkoutProgram } {
  const library = getWorkoutProgramLibrary(settings)
  const display = isObject(settings.workoutDisplay) ? settings.workoutDisplay : {}
  const previousLocation: TrainingLocation = display.trainingLocation === 'gym' ? 'gym' : 'home'

  if (currentInstalled && currentPlan.length > 0) {
    library.plans = library.plans.filter((entry) => !sameProgram(entry, currentInstalled))
    library.plans.push({ ...currentInstalled, days: normalizeCustomWorkoutPlan(currentPlan) })
    library.selections[previousLocation] = {
      id: currentInstalled.id,
      version: currentInstalled.version,
    }
  }

  const saved = library.plans.find((entry) => sameProgram(entry, target))
  const plan = normalizeCustomWorkoutPlan(saved?.days ?? target.days) as WorkoutDay[]
  const installedProgram = {
    id: target.id,
    version: target.version,
    installedAt: saved?.installedAt ?? now,
  }
  library.plans = library.plans.filter((entry) => !sameProgram(entry, target))
  library.plans.push({ ...installedProgram, days: plan })
  library.selections[location] = { id: target.id, version: target.version }

  return {
    plan,
    installedProgram,
    settings: {
      ...settings,
      workoutDisplay: { ...display, trainingLocation: location },
      workoutProgramLibrary: library,
    },
  }
}

/** Commit cached plans locally; cloud latency never delays choosing a workout. */
export async function selectWorkoutProgram(
  identity: ProgramIdentity,
  location: TrainingLocation,
  user: AuthUser | null,
): Promise<{ success: boolean; message: string; plan?: WorkoutDay[] }> {
  const program = getProgramsForLocation(location).find((candidate) => sameProgram(candidate, identity))
  if (!program) return { success: false, message: t('library.wrongLocation') }
  if (getWorkoutProgramChangeProtection().data.blocked) {
    return { success: false, message: t('svc.activeWorkoutBlocks') }
  }
  const snapshots = user ? snapshotSelectionStorage() : null

  // Accounts that predate program imports can have edited days with no identity.
  // Give those days a recoverable catalog entry before the first switch.
  let preservedCustomProgram: InstalledWorkoutProgram | undefined
  const currentPlan = getCustomWorkoutPlan() as WorkoutDay[]
  if (!getInstalledWorkoutProgram().data && currentPlan.length > 0) {
    const savedAt = new Date().toISOString()
    const saved = saveUserWorkoutProgram({
      id: 'saved-custom-workout-plan',
      version: '1.0.0',
      name: t('pm.customPlan'),
      description: t('pm.customPlan'),
      updatedAt: savedAt.slice(0, 10),
      trainingLocations: ['home', 'gym'],
      days: currentPlan,
      source: 'pasted',
      savedAt,
    })
    if (!saved.success || !saved.program) return { success: false, message: saved.message }
    preservedCustomProgram = { id: saved.program.id, version: saved.program.version, installedAt: savedAt }
  }

  const options = { selectionLocation: location, preservedCustomProgram }
  const result = installWorkoutProgramLocally(identity, options)
  if (!result.success && snapshots) restoreSelectionStorage(snapshots)
  if (result.success && user && !queueSelectedProgram(user)) {
    restoreSelectionStorage(snapshots!)
    return { success: false, message: t('library.queueFailed') }
  }
  return {
    success: result.success,
    message: result.success ? t('library.selected') : [result.message, ...result.details].join(' '),
    ...(result.data.plan ? { plan: result.data.plan } : {}),
  }
}

/** Empty locations use the same ordered sync lane as program switches. */
export function selectWorkoutTrainingLocation(location: TrainingLocation, user: AuthUser | null) {
  if (getWorkoutProgramChangeProtection().data.blocked) {
    return { success: false, message: t('svc.activeWorkoutBlocks') }
  }
  const snapshots = snapshotSelectionStorage()
  const settings = getUserProfileSettings()
  const saved = saveUserProfileSettingsSafely({
    ...settings,
    workoutDisplay: { ...settings.workoutDisplay, trainingLocation: location },
  })
  if (!saved.success || (user && !queueSelectedProgram(user))) {
    restoreSelectionStorage(snapshots)
    return { success: false, message: t('library.queueFailed') }
  }
  return { success: true, message: t('library.selected') }
}

function queueSelectedProgram(user: AuthUser): boolean {
  const settings = getUserProfileSettings()
  const installedProgram = getInstalledWorkoutProgram().data
  const metadata = {
    ...(isObject(settings.workoutProgramManager) ? settings.workoutProgramManager : {}),
    installedProgram,
    dismissedPrograms: getDismissedWorkoutPrograms().data,
  }
  // Other pages must see the local choice even while its cloud write is pending.
  if (!saveUserProfileSettingsSafely({ ...settings, workoutProgramManager: metadata }).success ||
    !safeSetJSON(CLOUD_WORKOUT_PROGRAM_MANAGER_CACHE_KEY, { userId: user.id, metadata })) return false

  return Boolean(addToSyncQueue({
    type: 'workoutProgramSelection',
    action: 'update',
    payload: {
      id: 'workoutProgramSelection',
      value: {
        plan: getCustomWorkoutPlan(),
        programs: getUserWorkoutPrograms(),
        installedProgram,
        library: getWorkoutProgramLibrary(settings),
        trainingLocation: settings.workoutDisplay.trainingLocation,
      },
    },
  }))
}

const selectionStorageKeys = [
  CUSTOM_WORKOUT_PLAN_KEY, INSTALLED_WORKOUT_PROGRAM_KEY, DISMISSED_WORKOUT_PROGRAMS_KEY,
  USER_PROFILE_SETTINGS_KEY, WORKOUT_PLAN_BACKUPS_KEY, USER_WORKOUT_PROGRAMS_KEY,
  CLOUD_WORKOUT_PROGRAM_MANAGER_CACHE_KEY,
]

function snapshotSelectionStorage(): Array<[string, string | null]> {
  return selectionStorageKeys.map((key) => {
    const physicalKey = resolveStorageKey(key)
    return [physicalKey, window.localStorage.getItem(physicalKey)]
  })
}

function restoreSelectionStorage(snapshots: Array<[string, string | null]>) {
  for (const [key, value] of snapshots) {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  }
  notifyUserProfileSettingsChanged()
}

function sameProgram(left: ProgramIdentity, right: unknown): boolean {
  return isIdentity(right) && left.id === right.id && left.version === right.version
}

function isIdentity(value: unknown): value is ProgramIdentity & Record<string, unknown> {
  return isObject(value) && typeof value.id === 'string' && value.id.trim() !== '' &&
    typeof value.version === 'string' && value.version.trim() !== ''
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}
