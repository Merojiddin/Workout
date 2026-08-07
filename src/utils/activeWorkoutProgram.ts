import type { LibraryExercise } from '../data/exerciseLibrary'
import { resolveExerciseLibraryEntry } from '../data/exerciseIdentity'
import type { WorkoutDay } from '../data/workoutPlan'
import {
  CURRENT_DEFAULT_PROGRAM_ID,
  getLatestWorkoutProgramById,
  getWorkoutProgramByIdAndVersion,
} from '../data/workoutProgramRegistry'
import type {
  StandaloneWorkout,
  WorkoutProgram,
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

export type ActiveWorkoutProgramSource =
  | 'registry'
  | 'custom'
  | 'legacy-default'

/** Active-plan normalization always supplies the editable day notes field. */
export interface ActiveWorkoutDay extends WorkoutDay {
  notes: string
}

export interface ActiveWorkoutProgram {
  programId: string | null
  programVersion: string | null
  programName: string
  description: string
  days: ActiveWorkoutDay[]
  standaloneWorkouts: StandaloneWorkout[]
  goals: string[]
  rules: WorkoutProgramRules
  benchmarkExerciseIds: string[]
  installed: boolean
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
  'breathing',
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
      days,
      standaloneWorkouts: [],
      goals: [],
      rules: {},
      benchmarkExerciseIds: [],
      installed: false,
      modifiedAfterInstallation: false,
      source: 'custom',
    }
  }

  const defaultProgram = getLatestWorkoutProgramById(
    CURRENT_DEFAULT_PROGRAM_ID,
  )
  if (defaultProgram) {
    return fromRegistryProgram(defaultProgram, days, {
      installed: false,
      modifiedAfterInstallation: false,
      source: 'legacy-default',
    })
  }

  return {
    programId: null,
    programVersion: null,
    programName: 'Workout Program',
    description: 'Your active weekly workout plan.',
    days,
    standaloneWorkouts: [],
    goals: [],
    rules: {},
    benchmarkExerciseIds: [],
    installed: false,
    modifiedAfterInstallation: false,
    source: 'legacy-default',
  }
}

/**
 * Resolve the immutable registry definition that owns Plan Editor defaults.
 * Installed metadata is authoritative and fails closed: a missing build-time
 * definition must never fall through to the legacy registry default.
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

  const defaultProgram = getLatestWorkoutProgramById(
    CURRENT_DEFAULT_PROGRAM_ID,
  )
  return defaultProgram
    ? {
        activeProgram,
        managed: false,
        program: defaultProgram,
        error: null,
      }
    : {
        activeProgram,
        managed: false,
        program: null,
        error: 'The current registry default program is unavailable.',
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

/** Unique exercise IDs in active-plan order, including recovery prescriptions. */
export function getProgramExerciseIds(program: ProgramDaySource): string[] {
  const seen = new Set<string>()

  return getDays(program).flatMap((day) =>
    day.exercises.flatMap((exercise) => {
      const id = cleanText(exercise.id)
      if (!id || seen.has(id)) {
        return []
      }

      seen.add(id)
      return [id]
    }),
  )
}

/** Count unique exercise identities rather than repeated weekly occurrences. */
export function getProgramExerciseCount(program: ProgramDaySource): number {
  return getProgramExerciseIds(program).length
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
    days,
    standaloneWorkouts: state.installed
      ? cloneStandaloneWorkouts(program.standaloneWorkouts)
      : [],
    goals: [...(program.goals ?? [])],
    rules: cloneRules(program.rules),
    benchmarkExerciseIds: [...(program.benchmarkExerciseIds ?? [])],
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
      ...exercise,
      formTips: [...exercise.formTips],
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
      ...exercise,
      formTips: [...exercise.formTips],
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
