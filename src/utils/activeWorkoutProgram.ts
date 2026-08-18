import type { LibraryExercise } from '../data/exerciseLibrary'
import { resolveExerciseLibraryEntry } from '../data/exerciseIdentity'
import type { Exercise, WorkoutDay } from '../data/workoutPlan'
import { getWorkoutProgramByIdAndVersion } from '../data/workoutProgramRegistry'
import type {
  StandaloneWorkout,
  WorkoutProgram,
  WorkoutProgramCoaching,
  WorkoutProgramPhase,
  WorkoutProgramRules,
} from '../types/workoutProgram'
import {
  getCustomWorkoutPlan,
  hasCustomWorkoutPlan,
} from './settingsUtils'
import {
  areWorkoutPlansEquivalent,
  getInstalledWorkoutProgram,
} from './workoutProgramManager'

/** `none` means this account has not uploaded and installed a program yet. */
export type ActiveWorkoutProgramSource = 'registry' | 'custom' | 'none'

/** Active-plan normalization always supplies the editable day notes field. */
export interface ActiveWorkoutDay extends WorkoutDay {
  notes: string
}

export interface ActiveWorkoutProgram {
  programId: string | null
  programVersion: string | null
  programName: string
  description: string
  durationWeeks: number | null
  normalWeeklyDays: number
  days: ActiveWorkoutDay[]
  standaloneWorkouts: StandaloneWorkout[]
  progressionPhases: WorkoutProgramPhase[]
  coaching: WorkoutProgramCoaching
  goals: string[]
  rules: WorkoutProgramRules
  benchmarkExerciseIds: string[]
  installed: boolean
  installedAt: string | null
  modifiedAfterInstallation: boolean
  source: ActiveWorkoutProgramSource
}

export interface ActiveWorkoutProgramBaselineResolution {
  activeProgram: ActiveWorkoutProgram
  managed: boolean
  program: WorkoutProgram | null
  error: string | null
}

export interface ResetWorkoutPlanDayResult {
  success: boolean
  code?:
    | 'baseline-unavailable'
    | 'invalid-day'
    | 'program-day-unavailable'
    | 'plan-day-unavailable'
  message: string
  plan: WorkoutDay[]
  baseline: ActiveWorkoutProgramBaselineResolution
}

type ProgramDaySource = Pick<ActiveWorkoutProgram, 'days'> | readonly WorkoutDay[]

const RECOVERY_ONLY_TERMS = [
  'aerobic',
  'breathing',
  'control',
  'foam roll',
  'mobility',
  'recovery',
  'rest',
  'stretch',
  'stretching',
  'walk',
  'walking',
]

/**
 * Resolve active plan days through the existing settings getter, then add
 * versioned registry metadata without changing the active-plan storage model.
 */
export function getActiveWorkoutProgram(): ActiveWorkoutProgram {
  const days = cloneDays(getCustomWorkoutPlan() as WorkoutDay[])
  const installedResult = getInstalledWorkoutProgram()
  const installedMetadata = installedResult.success
    ? installedResult.data
    : null
  const installedProgram = installedMetadata
    ? getWorkoutProgramByIdAndVersion(
        installedMetadata.id,
        installedMetadata.version,
      )
    : undefined

  if (installedProgram) {
    return fromRegistryProgram(installedProgram, days, {
      installed: true,
      modifiedAfterInstallation: !areWorkoutPlansEquivalent(
        days,
        installedProgram.days,
      ),
      source: 'registry',
    })
  }

  if (hasCustomWorkoutPlan()) {
    return {
      programId: null,
      programVersion: null,
      programName: 'Custom Workout Plan',
      description: 'A manually configured workout plan.',
      durationWeeks: null,
      normalWeeklyDays: days.length,
      days,
      standaloneWorkouts: [],
      progressionPhases: [],
      coaching: {},
      goals: [],
      rules: {},
      benchmarkExerciseIds: [],
      installed: false,
      installedAt: null,
      modifiedAfterInstallation: false,
      source: 'custom',
    }
  }

  return emptyActiveWorkoutProgram()
}

/**
 * The state a brand-new account is in: no program, no plan, nothing inherited
 * from anyone else. Callers must check `hasActiveWorkoutProgram()` and send
 * the user to the upload screen rather than rendering an empty workout.
 */
export function emptyActiveWorkoutProgram(): ActiveWorkoutProgram {
  return {
    programId: null,
    programVersion: null,
    programName: 'No program yet',
    description: 'Upload a program file to start training.',
    durationWeeks: null,
    normalWeeklyDays: 0,
    days: [],
    standaloneWorkouts: [],
    progressionPhases: [],
    coaching: {},
    goals: [],
    rules: {},
    benchmarkExerciseIds: [],
    installed: false,
    installedAt: null,
    modifiedAfterInstallation: false,
    source: 'none',
  }
}

/** True once this account has a program of its own to train against. */
export function hasActiveWorkoutProgram(): boolean {
  return getActiveWorkoutProgram().source !== 'none'
}

/**
 * Resolve the immutable program definition that owns Plan Editor defaults.
 * Installed metadata is authoritative and fails closed: with nothing installed
 * there is no baseline at all, because no program ships with the app.
 */
export function resolveActiveWorkoutProgramBaseline(): ActiveWorkoutProgramBaselineResolution {
  const activeProgram = getActiveWorkoutProgram()
  const installedResult = getInstalledWorkoutProgram()

  if (!installedResult.success) {
    return {
      activeProgram,
      managed: true,
      program: null,
      error: installedResult.message,
    }
  }

  if (installedResult.data) {
    const installedProgram = getWorkoutProgramByIdAndVersion(
      installedResult.data.id,
      installedResult.data.version,
    )

    return installedProgram
      ? {
          activeProgram,
          managed: true,
          program: installedProgram,
          error: null,
        }
      : {
          activeProgram,
          managed: true,
          program: null,
          error: `Installed workout program ${installedResult.data.id} ${installedResult.data.version} is unavailable in this build.`,
        }
  }

  return {
    activeProgram,
    managed: false,
    program: null,
    error: 'No workout program is installed. Upload one to edit your plan.',
  }
}

/**
 * Pure one-day replacement used by Plan Editor. The canonical day is cloned
 * again even though registry getters already return clones, so a saved draft
 * can never mutate the registered program definition.
 */
export function resetWorkoutPlanDayToActiveProgram(
  plan: WorkoutDay[],
  dayNumber: number,
): ResetWorkoutPlanDayResult {
  const baseline = resolveActiveWorkoutProgramBaseline()
  const targetDay = positiveDayNumber(dayNumber)

  if (targetDay === null) {
    return {
      success: false,
      code: 'invalid-day',
      message: 'Choose a valid workout day to reset.',
      plan,
      baseline,
    }
  }
  if (baseline.error || !baseline.program) {
    return {
      success: false,
      code: 'baseline-unavailable',
      message: `${baseline.error ?? 'The active program baseline is unavailable.'} No plan changes were saved.`,
      plan,
      baseline,
    }
  }

  const canonicalDay = findProgramDay(baseline.program.days, targetDay)
  if (!canonicalDay) {
    const identity = `${baseline.program.id} ${baseline.program.version}`
    return {
      success: false,
      code: 'program-day-unavailable',
      message: `Day ${targetDay} is unavailable in ${identity}. No legacy fallback was used and no plan changes were saved.`,
      plan,
      baseline,
    }
  }
  if (!plan.some((day) => day.day === targetDay)) {
    return {
      success: false,
      code: 'plan-day-unavailable',
      message: `Day ${targetDay} is unavailable in the saved plan. No plan changes were saved.`,
      plan,
      baseline,
    }
  }

  const replacement = cloneDays([canonicalDay])[0]
  return {
    success: true,
    message: `Day ${targetDay} restored from ${baseline.program.name} ${baseline.program.version}.`,
    plan: plan.map((day) => (day.day === targetDay ? replacement : day)),
    baseline,
  }
}

/**
 * Rest detection deliberately requires an exact Rest name or a clearly
 * recovery-only prescription. A training day is not rest merely because its
 * name or focus includes Recovery.
 */
export function isRestDay(day: WorkoutDay | null | undefined): boolean {
  if (!day) {
    return false
  }

  const dayName = normalizeText(day.name)
  if (dayName === 'rest') {
    return true
  }

  const focus = Array.isArray(day.focus)
    ? day.focus.map(normalizeText).filter(Boolean)
    : []
  const recoveryOnlyFocus =
    focus.length > 0 && focus.every(isRecoveryOnlyText)
  const explicitlyRecoveryNamed = isRecoveryOnlyText(dayName)
  if (focus.length > 0 && !recoveryOnlyFocus) {
    return false
  }
  if (!recoveryOnlyFocus && !explicitlyRecoveryNamed) {
    return false
  }

  const exercises = Array.isArray(day.exercises) ? day.exercises : []
  const hasNoRealPrescribedTraining =
    exercises.length === 0 || exercises.every(isRecoveryOnlyExercise)

  return hasNoRealPrescribedTraining
}

export function getTrainingDays(program: ProgramDaySource): WorkoutDay[] {
  return getDays(program).filter((day) => !isRestDay(day))
}

export function getRestDays(program: ProgramDaySource): WorkoutDay[] {
  return getDays(program).filter(isRestDay)
}

export function getWeeklyWorkoutTarget(program: ProgramDaySource): number {
  return getTrainingDays(program).length
}
/** Resolve explicit benchmark IDs only, preserving metadata order. */
export function getProgramBenchmarkExercises(
  program: Pick<ActiveWorkoutProgram, 'benchmarkExerciseIds'>,
  library: readonly LibraryExercise[],
): LibraryExercise[] {
  const seen = new Set<string>()

  return program.benchmarkExerciseIds.flatMap((exerciseId) => {
    const exercise = resolveExerciseLibraryEntry(
      { exerciseId },
      { library },
    )
    if (!exercise || seen.has(exercise.id)) {
      return []
    }

    seen.add(exercise.id)
    return [exercise]
  })
}

/**
 * Custom plans do not have registry benchmark metadata. Select up to three
 * distinct repetition-based exercises across different training days without
 * writing the derived choice to storage.
 */
export function getProgramBenchmarkExercisesWithFallback(
  program: ActiveWorkoutProgram,
  library: readonly LibraryExercise[],
  limit = 3,
): LibraryExercise[] {
  const explicit = getProgramBenchmarkExercises(program, library)
  const maximum = Math.max(0, Math.floor(Number(limit) || 0))
  if (
    maximum === 0 ||
    explicit.length > 0 ||
    program.benchmarkExerciseIds.length > 0 ||
    program.source !== 'custom'
  ) {
    return explicit.slice(0, maximum)
  }

  const selected: LibraryExercise[] = []
  const seen = new Set<string>()
  const trainingDays = getTrainingDays(program)

  // Favor one representative movement per day before filling remaining slots.
  trainingDays.forEach((day) => {
    const exercise = day.exercises.find(
      (candidate) =>
        isRepetitionBased(candidate) &&
        Boolean(resolvePlanExercise(candidate, library, seen)),
    )
    const resolved = exercise
      ? resolvePlanExercise(exercise, library, seen)
      : undefined
    if (resolved && selected.length < maximum) {
      selected.push(resolved)
      seen.add(resolved.id)
    }
  })

  if (selected.length < maximum) {
    trainingDays
      .flatMap((day) => day.exercises)
      .forEach((exercise) => {
        if (selected.length >= maximum || !isRepetitionBased(exercise)) {
          return
        }

        const resolved = resolvePlanExercise(exercise, library, seen)
        if (resolved) {
          selected.push(resolved)
          seen.add(resolved.id)
        }
      })
  }

  return selected
}

export function getDayLabel(day: WorkoutDay): string {
  const dayNumber = positiveDayNumber(day?.day)
  const prefix = dayNumber === null ? 'Day' : `Day ${dayNumber}`
  const name = cleanText(day?.name)

  if (!name || normalizeText(name) === normalizeText(prefix)) {
    return prefix
  }
  if (normalizeText(name).startsWith(`${normalizeText(prefix)} `)) {
    return name
  }

  return `${prefix} · ${name}`
}

export function getProgramNutritionTargets(
  program: Pick<ActiveWorkoutProgram, 'coaching'>,
): { proteinMin: number; proteinMax: number; proteinHigh: number } {
  const minimum = program.coaching.proteinMinGrams ?? 120
  const maximum = Math.max(
    minimum,
    program.coaching.proteinMaxGrams ?? 160,
  )
  return {
    proteinMin: minimum,
    proteinMax: maximum,
    proteinHigh: maximum + 20,
  }
}

export function findProgramDay(
  program: ProgramDaySource,
  dayNumber: number,
): WorkoutDay | undefined {
  const target = positiveDayNumber(dayNumber)
  return target === null
    ? undefined
    : getDays(program).find((day) => day.day === target)
}

function fromRegistryProgram(
  program: WorkoutProgram,
  days: ActiveWorkoutDay[],
  state: Pick<
    ActiveWorkoutProgram,
    'installed' | 'modifiedAfterInstallation' | 'source'
  >,
): ActiveWorkoutProgram {
  return {
    programId: program.id,
    programVersion: program.version,
    programName: program.name,
    description: program.description,
    durationWeeks: program.durationWeeks ?? null,
    normalWeeklyDays: program.normalWeeklyDays ?? program.days.length,
    days,
    standaloneWorkouts: state.installed
      ? cloneStandaloneWorkouts(program.standaloneWorkouts)
      : [],
    progressionPhases: cloneProgressionPhases(program.progressionPhases),
    coaching: cloneCoaching(program.coaching),
    goals: [...(program.goals ?? [])],
    rules: cloneRules(program.rules),
    benchmarkExerciseIds: [...(program.benchmarkExerciseIds ?? [])],
    installedAt: state.installed
      ? getInstalledWorkoutProgram().data?.installedAt ?? null
      : null,
    ...state,
  }
}

function getDays(program: ProgramDaySource): readonly WorkoutDay[] {
  return Array.isArray(program)
    ? program
    : (program as Pick<ActiveWorkoutProgram, 'days'>).days
}

function isRecoveryOnlyExercise(exercise: WorkoutDay['exercises'][number]): boolean {
  return isRecoveryOnlyText(
    [exercise?.id, exercise?.name, exercise?.muscleGroup]
      .map(cleanText)
      .filter(Boolean)
      .join(' '),
  )
}

function isRecoveryOnlyText(value: string): boolean {
  const normalized = normalizeText(value)
  return RECOVERY_ONLY_TERMS.some(
    (term) => normalized === term || normalized.includes(`${term} `) || normalized.includes(` ${term}`),
  )
}

function isRepetitionBased(
  exercise: WorkoutDay['exercises'][number],
): boolean {
  return Boolean(cleanText(exercise?.repRange)) || !cleanText(exercise?.duration)
}

function resolvePlanExercise(
  exercise: WorkoutDay['exercises'][number],
  library: readonly LibraryExercise[],
  excludedIds: ReadonlySet<string>,
): LibraryExercise | undefined {
  const resolved = resolveExerciseLibraryEntry(
    { exerciseId: exercise.id, exerciseName: exercise.name },
    { library },
  )
  return resolved && !excludedIds.has(resolved.id) ? resolved : undefined
}

function cloneDays(days: WorkoutDay[]): ActiveWorkoutDay[] {
  return days.map((day) => ({
    ...day,
    notes: cleanText((day as WorkoutDay & { notes?: unknown }).notes),
    focus: [...day.focus],
    exercises: day.exercises.map((exercise) => ({
      ...cloneExercise(exercise),
    })),
  }))
}

function cloneStandaloneWorkouts(
  workouts: StandaloneWorkout[] | undefined,
): StandaloneWorkout[] {
  return (workouts ?? []).map((workout) => ({
    ...workout,
    focus: [...workout.focus],
    rules: workout.rules ? [...workout.rules] : undefined,
    exercises: workout.exercises.map((exercise) => ({
      ...cloneExercise(exercise),
    })),
  }))
}

function cloneRules(
  rules: WorkoutProgramRules | undefined,
): WorkoutProgramRules {
  return rules
    ? {
        ...rules,
        effort: rules.effort ? [...rules.effort] : undefined,
        progression: rules.progression ? [...rules.progression] : undefined,
        returnAfterBreak: rules.returnAfterBreak
          ? [...rules.returnAfterBreak]
          : undefined,
        rest: rules.rest ? [...rules.rest] : undefined,
        substitutions: rules.substitutions
          ? [...rules.substitutions]
          : undefined,
        safety: rules.safety ? [...rules.safety] : undefined,
        optionalNeckWork: rules.optionalNeckWork
          ? [...rules.optionalNeckWork]
          : undefined,
      }
    : {}
}

function cloneExercise(exercise: Exercise): Exercise {
  return {
    ...exercise,
    formTips: [...exercise.formTips],
    guidance: exercise.guidance ? [...exercise.guidance] : undefined,
    defaultVariantIds: exercise.defaultVariantIds
      ? [...exercise.defaultVariantIds]
      : undefined,
    alternatives: exercise.alternatives
      ? Object.fromEntries(
          (['home', 'gym'] as const).flatMap((location) => {
            const variants = exercise.alternatives?.[location]
            return variants
              ? [[location, variants.map((variant) => ({
                  ...variant,
                  formTips: variant.formTips ? [...variant.formTips] : undefined,
                }))]]
              : []
          }),
        )
      : undefined,
    phaseTargets: exercise.phaseTargets?.map((target) => ({
      ...target,
      weeks: [...target.weeks],
      guidance: target.guidance ? [...target.guidance] : undefined,
    })),
  }
}

function cloneProgressionPhases(
  phases: WorkoutProgramPhase[] | undefined,
): WorkoutProgramPhase[] {
  return (phases ?? []).map((phase) => ({
    ...phase,
    weeks: [...phase.weeks],
    priorities: [...phase.priorities],
    restrictions: phase.restrictions ? [...phase.restrictions] : undefined,
    assessmentItems: phase.assessmentItems
      ? [...phase.assessmentItems]
      : undefined,
  }))
}

function cloneCoaching(
  coaching: WorkoutProgramCoaching | undefined,
): WorkoutProgramCoaching {
  return coaching
    ? {
        ...coaching,
        healthContext: coaching.healthContext
          ? [...coaching.healthContext]
          : undefined,
      }
    : {}
}

function positiveDayNumber(value: unknown): number | null {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeText(value: unknown): string {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}
