import type { AuthUser } from '../context/AuthContext'
import type { TrainingLocation, WorkoutDay } from '../data/workoutPlan'
import { getWorkoutPrograms } from '../data/workoutProgramRegistry'
import type { WorkoutProgram } from '../types/workoutProgram'
import { t } from '../i18n/t'
import {
  getCustomWorkoutPlan,
  getUserProfileSettings,
  normalizeCustomWorkoutPlan,
} from './settingsUtils'
import { INSTALLED_WORKOUT_PROGRAM_KEY, safeGetJSON } from './storageUtils'
import type { InstalledWorkoutProgram } from './workoutProgramManager'

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

/** Select through the existing verified install transaction, without reinstalling defaults. */
export async function selectWorkoutProgram(
  identity: ProgramIdentity,
  location: TrainingLocation,
  user: AuthUser | null,
): Promise<{ success: boolean; message: string; plan?: WorkoutDay[] }> {
  const program = getProgramsForLocation(location).find((candidate) => sameProgram(candidate, identity))
  if (!program) return { success: false, message: t('library.wrongLocation') }
  const manager = await import('./workoutProgramManager')
  if (manager.getWorkoutProgramChangeProtection().data.blocked) {
    return { success: false, message: t('svc.activeWorkoutBlocks') }
  }

  // Accounts that predate program imports can have edited days with no identity.
  // Give those days a recoverable catalog entry before the first switch.
  let preservedCustomProgram: InstalledWorkoutProgram | undefined
  const currentPlan = getCustomWorkoutPlan() as WorkoutDay[]
  if (!manager.getInstalledWorkoutProgram().data && currentPlan.length > 0) {
    const { saveUserWorkoutProgram } = await import('./userWorkoutPrograms')
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
    if (user) {
      const { saveUserWorkoutProgramsToCloud } = await import('../services/settingsService')
      try {
        await saveUserWorkoutProgramsToCloud(user, saved.programs)
      } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : t('paste.storageFull') }
      }
    }
  }

  const options = { selectionLocation: location, preservedCustomProgram }
  const result = user
    ? await (await import('../services/workoutProgramService')).installWorkoutProgramInCloud(identity, user, options)
    : manager.installWorkoutProgramLocally(identity, options)
  return {
    success: result.success,
    message: result.success ? t('library.selected') : [result.message, ...result.details].join(' '),
    ...(result.data.plan ? { plan: result.data.plan } : {}),
  }
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
