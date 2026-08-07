import type { Exercise, WorkoutDay } from '../data/workoutPlan'
import {
  exerciseIdentitiesMatch,
  type ExerciseIdentityOptions,
  type ExerciseIdentityInput,
} from '../data/exerciseIdentity'
import {
  getWorkoutSessions,
  saveWorkoutSession,
  type LoggedExercise,
  type LoggedSet,
  type WorkoutSession,
  type WorkoutSessionType,
} from '../data/workoutSessions'
import {
  classifyExercise,
  parseRepRange,
  type ProgressionSuggestion,
} from './progressionUtils'
import {
  formatDuration,
  getExerciseLoggingMode,
  isTimedExercise,
  type ExerciseLoggingMode,
} from './exerciseLoggingUtils'
import { safeGetJSON, safeRemove, safeSetJSON } from './storageUtils'

/**
 * Step 11 - Live Workout Assistant.
 *
 * Manages an in-progress ("active") workout session in localStorage so a set can
 * be logged one at a time and nothing is lost on refresh. When the workout is
 * finished the active session is converted to the regular `workoutSessions`
 * shape (so Progress / Dashboard / Weekly Review keep working) and cleared.
 *
 * Everything here is defensive: malformed storage, missing exercises, empty
 * history and partial fields must never crash the live workout screen.
 */

export const ACTIVE_WORKOUT_SESSION_KEY = 'activeWorkoutSession'

export interface ActiveSet {
  setNumber: number
  reps: number | null
  timeSeconds: number | null
  weightKg: number | null
  rpe: number | null
  painLevel: number | null
  notes: string
  completedAt: string | null
}

export interface ActiveExercise {
  exerciseId: string
  exerciseName: string
  targetSets: number
  targetReps: string
  targetDuration: string
  loggingMode: ExerciseLoggingMode
  restSeconds: number
  muscleGroup: string
  equipment: string
  formTips: string[]
  sets: ActiveSet[]
}

export interface ActiveWorkoutSession {
  id: string
  date: string
  workoutDayId: number | null
  workoutName: string
  sessionType?: WorkoutSessionType
  standaloneWorkoutId?: string | null
  startedAt: string
  finishedAt: string | null
  currentExerciseIndex: number
  currentSetIndex: number
  completed: boolean
  exercises: ActiveExercise[]
}

type LiveWorkoutDefinition = Pick<WorkoutDay, 'exercises' | 'name'> &
  Partial<Pick<WorkoutDay, 'day'>>

export type CreateActiveWorkoutSessionOptions =
  | {
      sessionType?: 'scheduled'
      standaloneWorkoutId?: null
    }
  | {
      sessionType: 'standalone'
      standaloneWorkoutId: string
    }

export interface SuggestedSetTarget {
  repsTarget: string
  weightTarget: string
  message: string
}

export interface PainWarning {
  exerciseName: string
  setNumber: number
  painLevel: number
}

// ---------------------------------------------------------------------------
// Create / read / write / clear
// ---------------------------------------------------------------------------

export function createActiveWorkoutSession(
  workoutDay: LiveWorkoutDefinition,
  options: CreateActiveWorkoutSessionOptions = {},
): ActiveWorkoutSession {
  const now = new Date()
  const exercises = safeArray<Exercise>(workoutDay?.exercises).map((exercise) =>
    createActiveExercise(exercise),
  )
  const sessionType: WorkoutSessionType =
    options.sessionType === 'standalone' ? 'standalone' : 'scheduled'
  const standaloneWorkoutId =
    sessionType === 'standalone'
      ? nullableNonEmptyText(options.standaloneWorkoutId)
      : null
  if (sessionType === 'standalone' && !standaloneWorkoutId) {
    throw new Error('A standalone workout ID is required to start this workout.')
  }
  const workoutDayId =
    sessionType === 'standalone'
      ? null
      : nullablePositiveInteger(workoutDay?.day)
  const sessionId =
    sessionType === 'standalone'
      ? `${now.getTime()}-standalone-${standaloneWorkoutId}`
      : workoutDayId === null
        ? `${now.getTime()}-scheduled`
        : `${now.getTime()}-${workoutDayId}`

  return {
    id: sessionId,
    date: now.toISOString().slice(0, 10),
    workoutDayId,
    workoutName: toText(workoutDay?.name, 'Workout'),
    sessionType,
    standaloneWorkoutId,
    startedAt: now.toISOString(),
    finishedAt: null,
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    completed: false,
    exercises,
  }
}

function createActiveExercise(exercise: Exercise): ActiveExercise {
  const targetSets = Math.max(1, Math.round(toNumber(exercise?.sets, 1)))

  return {
    exerciseId: toText(exercise?.id, toText(exercise?.name, 'exercise')),
    exerciseName: toText(exercise?.name, 'Exercise'),
    targetSets,
    targetReps: toText(exercise?.repRange, ''),
    targetDuration: toText(exercise?.duration, ''),
    loggingMode: getExerciseLoggingMode(exercise),
    restSeconds: Math.max(0, Math.round(toNumber(exercise?.restSeconds, 90))),
    muscleGroup: toText(exercise?.muscleGroup, ''),
    equipment: toText(exercise?.equipment, ''),
    formTips: safeArray<string>(exercise?.formTips).filter(
      (tip) => typeof tip === 'string',
    ),
    sets: Array.from({ length: targetSets }, (_, index) =>
      createEmptySet(index + 1),
    ),
  }
}

export function createEmptySet(setNumber: number): ActiveSet {
  return {
    setNumber,
    reps: null,
    timeSeconds: null,
    weightKg: null,
    rpe: null,
    painLevel: null,
    notes: '',
    completedAt: null,
  }
}

export function getActiveWorkoutSession(): ActiveWorkoutSession | null {
  if (typeof window === 'undefined') {
    return null
  }

  const session = safeGetJSON(ACTIVE_WORKOUT_SESSION_KEY, null)
  return session ? normalizeActiveSession(session) : null
}

export function saveActiveWorkoutSession(session: ActiveWorkoutSession): void {
  if (typeof window === 'undefined' || !session) {
    return
  }

  safeSetJSON(ACTIVE_WORKOUT_SESSION_KEY, session)
}

export function clearActiveWorkoutSession(): void {
  if (typeof window === 'undefined') {
    return
  }

  safeRemove(ACTIVE_WORKOUT_SESSION_KEY)
}

/** Move a finished active session into workoutSessions, then clear it. */
export function completeActiveWorkoutSession(
  session: ActiveWorkoutSession,
): WorkoutSession {
  const finishedAt = new Date().toISOString()
  const sessionType: WorkoutSessionType =
    session?.sessionType === 'standalone' ? 'standalone' : 'scheduled'
  const standaloneWorkoutId =
    sessionType === 'standalone'
      ? nullableNonEmptyText(session?.standaloneWorkoutId)
      : null
  const finished: WorkoutSession = {
    completed: true,
    date: toText(session?.date, finishedAt.slice(0, 10)),
    exercises: safeArray<ActiveExercise>(session?.exercises).map(
      toLoggedExercise,
    ),
    finishedAt,
    id: toText(session?.id, `${Date.now()}`),
    sessionType,
    standaloneWorkoutId,
    startedAt: toText(session?.startedAt, finishedAt),
    workoutDayId:
      sessionType === 'standalone'
        ? null
        : nullablePositiveInteger(session?.workoutDayId),
    workoutName: toText(session?.workoutName, 'Workout'),
  }

  saveWorkoutSession(finished)
  clearActiveWorkoutSession()
  return finished
}

function toLoggedExercise(exercise: ActiveExercise): LoggedExercise {
  return {
    exerciseId: toText(exercise?.exerciseId, ''),
    exerciseName: toText(exercise?.exerciseName, 'Exercise'),
    muscleGroup: toText(exercise?.muscleGroup, ''),
    targetReps: toText(exercise?.targetReps, ''),
    targetDuration: toText(exercise?.targetDuration, '') || undefined,
    targetSets: Math.max(1, toNumber(exercise?.targetSets, 1)),
    sets: safeArray<ActiveSet>(exercise?.sets).map(
      (set, index): LoggedSet => ({
        setNumber: toNumber(set?.setNumber, index + 1),
        reps: nullableNumber(set?.reps),
        timeSeconds: nullableNonNegativeNumber(set?.timeSeconds),
        weightKg: nullableNumber(set?.weightKg),
        rpe: nullableNumber(set?.rpe),
        painLevel: nullableNumber(set?.painLevel),
        notes: toText(set?.notes, ''),
        completedAt: set?.completedAt ?? null,
      }),
    ),
  }
}

// ---------------------------------------------------------------------------
// Mutations (return a new session; callers persist it)
// ---------------------------------------------------------------------------

export function updateActiveSet(
  session: ActiveWorkoutSession,
  exerciseIndex: number,
  setIndex: number,
  setData: Partial<ActiveSet>,
): ActiveWorkoutSession {
  const safeSetData = {
    ...setData,
    ...(Object.hasOwn(setData, 'timeSeconds')
      ? { timeSeconds: nullableNonNegativeNumber(setData.timeSeconds) }
      : {}),
  }

  return {
    ...session,
    exercises: session.exercises.map((exercise, index) => {
      if (index !== exerciseIndex) {
        return exercise
      }

      return {
        ...exercise,
        sets: exercise.sets.map((set, innerIndex) =>
          innerIndex === setIndex ? { ...set, ...safeSetData } : set,
        ),
      }
    }),
  }
}

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export function getCurrentExercise(
  session: ActiveWorkoutSession | null,
): ActiveExercise | null {
  if (!session) {
    return null
  }

  return session.exercises[session.currentExerciseIndex] ?? null
}

export function getCurrentSet(
  session: ActiveWorkoutSession | null,
): ActiveSet | null {
  const exercise = getCurrentExercise(session)
  if (!exercise || !session) {
    return null
  }

  return exercise.sets[session.currentSetIndex] ?? null
}

export function getTotalPlannedSets(
  session: ActiveWorkoutSession | null,
): number {
  return safeArray<ActiveExercise>(session?.exercises).reduce(
    (total, exercise) => total + safeArray<ActiveSet>(exercise?.sets).length,
    0,
  )
}

export function getCompletedSetsCount(
  session: ActiveWorkoutSession | null,
): number {
  return safeArray<ActiveExercise>(session?.exercises).reduce(
    (total, exercise) =>
      total + safeArray<ActiveSet>(exercise?.sets).filter(isLoggedSet).length,
    0,
  )
}

export function getCompletedExerciseCount(
  session: ActiveWorkoutSession | null,
): number {
  return safeArray<ActiveExercise>(session?.exercises).filter((exercise) =>
    safeArray<ActiveSet>(exercise?.sets).some(isLoggedSet),
  ).length
}

/** Duration in whole minutes (at least 0). */
export function getWorkoutDuration(
  session: ActiveWorkoutSession | null,
  endTime: Date = new Date(),
): number {
  if (!session?.startedAt) {
    return 0
  }

  const started = new Date(session.startedAt).getTime()
  if (!Number.isFinite(started)) {
    return 0
  }

  const end = session.finishedAt
    ? new Date(session.finishedAt).getTime()
    : endTime.getTime()

  return Math.max(0, Math.round((end - started) / 60000))
}

export function getTotalVolume(session: ActiveWorkoutSession | null): number {
  return safeArray<ActiveExercise>(session?.exercises).reduce(
    (total, exercise) =>
      total +
      safeArray<ActiveSet>(exercise?.sets).reduce((sum, set) => {
        const reps = toNumber(set?.reps, 0)
        const weight = toNumber(set?.weightKg, 0)
        return weight > 0 && reps > 0 ? sum + weight * reps : sum
      }, 0),
    0,
  )
}

export function calculateAverageRPE(
  session: ActiveWorkoutSession | null,
): number | null {
  const rpes: number[] = []

  for (const exercise of safeArray<ActiveExercise>(session?.exercises)) {
    for (const set of safeArray<ActiveSet>(exercise?.sets)) {
      const rpe = toNumber(set?.rpe, 0)
      if (rpe > 0) {
        rpes.push(rpe)
      }
    }
  }

  if (rpes.length === 0) {
    return null
  }

  const average = rpes.reduce((sum, value) => sum + value, 0) / rpes.length
  return Math.round(average * 10) / 10
}

/** Warnings for every set that logged pain >= 4. */
export function getPainWarnings(
  session: ActiveWorkoutSession | null,
): PainWarning[] {
  const warnings: PainWarning[] = []

  for (const exercise of safeArray<ActiveExercise>(session?.exercises)) {
    for (const set of safeArray<ActiveSet>(exercise?.sets)) {
      const painLevel = toNumber(set?.painLevel, 0)
      if (painLevel >= 4) {
        warnings.push({
          exerciseName: toText(exercise?.exerciseName, 'Exercise'),
          setNumber: toNumber(set?.setNumber, 0),
          painLevel,
        })
      }
    }
  }

  return warnings
}

// ---------------------------------------------------------------------------
// Suggested target for today's set
// ---------------------------------------------------------------------------

export function getSuggestedSetTarget(
  exercise: ActiveExercise | null,
  previousPerformance: LoggedExercise | null,
  progressionSuggestion: ProgressionSuggestion | null,
  setIndex = 0,
): SuggestedSetTarget {
  if (isTimedExercise(exercise)) {
    const previousSet = pickPreviousSet(previousPerformance, setIndex)
    const previousSeconds = nullableNonNegativeNumber(previousSet?.timeSeconds)
    const durationTarget =
      exercise?.targetDuration || exercise?.targetReps || 'a controlled duration'
    const repsTarget = previousSeconds && previousSeconds > 0
      ? `Maintain ${formatDuration(previousSeconds)}`
      : `Target ${durationTarget}`
    const previousWeight = nullableNumber(previousSet?.weightKg)
    const weightTarget = previousWeight !== null && previousWeight > 0
      ? `Use ${roundHalf(previousWeight)} kg`
      : /carry/i.test(exercise?.exerciseName ?? '')
        ? 'Pick a weight you control'
        : 'No added weight'

    return {
      repsTarget,
      weightTarget,
      message: 'Maintain the target duration with controlled effort.',
    }
  }

  const range = parseRepRange(exercise?.targetReps)
  const previousSet = pickPreviousSet(previousPerformance, setIndex)
  const lastReps = nullableNumber(previousSet?.reps)
  const lastWeight = nullableNumber(previousSet?.weightKg)
  const type = progressionSuggestion?.type ?? 'no-data'
  const usesWeight = lastWeight !== null && lastWeight > 0

  const repsTarget = buildRepsTarget(type, range, lastReps)
  const weightTarget = buildWeightTarget(type, exercise, lastWeight, usesWeight)
  const message = buildTargetMessage(type)

  return { repsTarget, weightTarget, message }
}

function buildRepsTarget(
  type: ProgressionSuggestion['type'],
  range: ReturnType<typeof parseRepRange>,
  lastReps: number | null,
): string {
  const unit = range?.kind === 'duration' ? range.unit ?? 'sec' : 'reps'

  if (type === 'increase') {
    if (range?.kind === 'reps') {
      return `Try ${range.max} reps`
    }
    if (lastReps !== null) {
      return `Try ${lastReps + 1} ${unit}`
    }
  }

  if (type === 'reduce' || type === 'form-warning') {
    if (range) {
      return `Aim for ${range.min} ${unit}`
    }
    return 'Do fewer, cleaner reps'
  }

  if (lastReps !== null) {
    return type === 'keep'
      ? `Aim for ${lastReps + 1} ${unit}`
      : `Aim for ${lastReps} ${unit}`
  }

  if (range) {
    return range.min === range.max
      ? `Aim for ${range.min} ${unit}`
      : `Aim for ${range.min}-${range.max} ${unit}`
  }

  return 'Pick a target you control'
}

function buildWeightTarget(
  type: ProgressionSuggestion['type'],
  exercise: ActiveExercise | null,
  lastWeight: number | null,
  usesWeight: boolean,
): string {
  if (!usesWeight || lastWeight === null) {
    return isBodyweight(exercise)
      ? 'Bodyweight (add load only if easy)'
      : 'Pick a weight you control'
  }

  if (type === 'increase') {
    return `Use ${roundHalf(lastWeight + 2.5)} kg`
  }

  if (type === 'reduce' || type === 'form-warning') {
    return `Use ${roundHalf(Math.max(0, lastWeight - 2.5))} kg`
  }

  return `Use ${roundHalf(lastWeight)} kg`
}

function buildTargetMessage(type: ProgressionSuggestion['type']): string {
  switch (type) {
    case 'increase':
      return 'You earned it - add a little and keep form clean.'
    case 'reduce':
      return 'Back off slightly and rebuild clean reps.'
    case 'form-warning':
      return 'Stay light. Fix form before adding any load.'
    case 'keep':
      return 'Keep the same load and add 1 rep if form stays clean.'
    default:
      return 'Find a load you control for the full set.'
  }
}

// ---------------------------------------------------------------------------
// Previous / best performance summaries
// ---------------------------------------------------------------------------

/** "4 sets: 12 / 11 / 10 / 9 reps at 5 kg" style line for last time. */
export function summarizePreviousPerformance(
  previous: LoggedExercise | null,
): string | null {
  const sets = safeArray<LoggedSet>(previous?.sets).filter(
    (set) =>
      toNumber(set?.reps, 0) > 0 ||
      toNumber(set?.timeSeconds, 0) > 0,
  )
  if (sets.length === 0) {
    return null
  }

  const reps = sets.map((set) => nullableNumber(set.reps)).filter((v) => v !== null)
  const times = sets
    .map((set) => nullableNonNegativeNumber(set.timeSeconds))
    .filter((value): value is number => value !== null && value > 0)
  const weights = sets
    .map((set) => toNumber(set.weightKg, 0))
    .filter((weight) => weight > 0)
  const topWeight = weights.length > 0 ? Math.max(...weights) : 0

  const repsPart = times.length > 0
    ? times.map(formatDuration).join(' / ')
    : reps.length > 0
      ? `${reps.join(' / ')} reps`
      : `${sets.length} sets`
  const loadPart = topWeight > 0
    ? ` at ${roundHalf(topWeight)} kg`
    : times.length > 0
      ? ''
      : ' at bodyweight'

  return `${sets.length} sets: ${repsPart}${loadPart}`
}

/** Best single set ever logged: "15 reps at bodyweight" or "10 kg x 12 reps". */
export function getBestPerformanceSummary(
  exercise: string | ExerciseIdentityInput,
  sessions: WorkoutSession[] = getWorkoutSessions(),
  options: Pick<ExerciseIdentityOptions, 'library'> = {},
): string | null {
  let best: { weight: number; reps: number; timeSeconds: number } | null = null
  const target = typeof exercise === 'string'
    ? { exerciseName: exercise }
    : exercise

  for (const session of safeArray<WorkoutSession>(sessions)) {
    for (const exercise of safeArray<LoggedExercise>(session?.exercises)) {
      if (!exerciseIdentitiesMatch(exercise, target, options)) {
        continue
      }

      for (const set of safeArray<LoggedSet>(exercise?.sets)) {
        const reps = toNumber(set?.reps, 0)
        const weight = toNumber(set?.weightKg, 0)
        const timeSeconds = toNumber(set?.timeSeconds, 0)
        if (reps <= 0 && timeSeconds <= 0) {
          continue
        }

        const score = timeSeconds > 0
          ? timeSeconds
          : weight * 1000 + reps
        const bestScore = best
          ? best.timeSeconds > 0
            ? best.timeSeconds
            : best.weight * 1000 + best.reps
          : -1
        if (score > bestScore) {
          best = { weight, reps, timeSeconds }
        }
      }
    }
  }

  if (!best) {
    return null
  }

  if (best.timeSeconds > 0) {
    const load = best.weight > 0 ? ` at ${roundHalf(best.weight)} kg` : ''
    return `${formatDuration(best.timeSeconds)}${load}`
  }

  if (best.weight > 0) {
    return best.reps > 0
      ? `${roundHalf(best.weight)} kg x ${best.reps} reps`
      : `${roundHalf(best.weight)} kg`
  }

  return `${best.reps} reps at bodyweight`
}

// ---------------------------------------------------------------------------
// "What to do next" assistant
// ---------------------------------------------------------------------------

export type AssistantTone = 'info' | 'warn' | 'danger'

export interface AssistantMessage {
  message: string
  tone: AssistantTone
}

export function getWhatToDoNext(
  exercise: ActiveExercise | null,
): AssistantMessage {
  if (!exercise) {
    return { message: 'Choose a workout to begin.', tone: 'info' }
  }

  const lastSet = getLastLoggedSet(exercise)
  const restSeconds = Math.max(0, toNumber(exercise.restSeconds, 90))
  const postureCue = getPostureCue(exercise.exerciseName)
  const isControlFocus = isPostureOrCore(exercise)
  const timed = isTimedExercise(exercise)

  // Highest priority: pain.
  if (lastSet && toNumber(lastSet.painLevel, 0) >= 4) {
    return {
      message:
        'Stop increasing load. Use lighter weight or skip this exercise if pain continues.',
      tone: 'danger',
    }
  }

  // No set logged yet - starting cue.
  if (!lastSet) {
    if (timed) {
      return {
        message: `Start Set 1. Maintain ${exercise.targetDuration || 'the target duration'} with controlled effort.`,
        tone: 'info',
      }
    }
    if (isControlFocus) {
      return {
        message: 'Focus on control. Do not rush reps.',
        tone: 'info',
      }
    }
    if (postureCue) {
      return { message: postureCue, tone: 'info' }
    }
    return {
      message:
        'Start Set 1. Use controlled reps and stop 1-2 reps before form breaks.',
      tone: 'info',
    }
  }

  const rpe = toNumber(lastSet.rpe, 0)

  if (rpe === 10) {
    return {
      message: timed
        ? 'Next set: shorten the duration or reduce weight slightly.'
        : 'Next set: reduce reps or reduce weight slightly.',
      tone: 'warn',
    }
  }

  if (rpe >= 9) {
    return {
      message: timed
        ? 'Next set: keep the effort controlled and do not extend the duration.'
        : 'Next set: keep the same weight, but do not force extra reps.',
      tone: 'warn',
    }
  }

  if (postureCue) {
    return {
      message: `Rest ${restSeconds} sec. ${postureCue}`,
      tone: 'info',
    }
  }

  if (timed) {
    return {
      message: `Rest ${restSeconds} sec. Then repeat the target duration with controlled effort.`,
      tone: 'info',
    }
  }

  return {
    message: `Rest ${restSeconds} sec. Then repeat with the same weight.`,
    tone: 'info',
  }
}

// ---------------------------------------------------------------------------
// Posture / arched-back cues
// ---------------------------------------------------------------------------

const ARCHED_BACK_CUE =
  'Ribs down. Abs tight. Glutes slightly squeezed. Do not over-arch lower back.'

const ARCHED_BACK_KEYWORDS = [
  'push-up',
  'push up',
  'pushup',
  'bench press',
  'dip',
  'shoulder press',
  'pike',
  'squat',
  'romanian deadlift',
  'rdl',
  'deadlift',
  'plank',
  'dead bug',
  'glute bridge',
  'hip thrust',
]

/** The arched-back reminder for exercises where over-arching is a risk. */
export function getPostureCue(exerciseName: string): string | null {
  const name = toText(exerciseName, '').toLowerCase()
  if (!name) {
    return null
  }

  return ARCHED_BACK_KEYWORDS.some((keyword) => name.includes(keyword))
    ? ARCHED_BACK_CUE
    : null
}

export function isArchedBackRisk(exerciseName: string): boolean {
  return getPostureCue(exerciseName) !== null
}

export function isPostureOrCore(exercise: ActiveExercise | null): boolean {
  if (!exercise) {
    return false
  }

  const type = classifyExercise({
    name: exercise.exerciseName,
    muscleGroup: exercise.muscleGroup,
    equipment: exercise.equipment,
    repRange: exercise.targetReps,
  })

  return type === 'posture' || type === 'abs'
}

function isBodyweight(exercise: ActiveExercise | null): boolean {
  if (!exercise) {
    return false
  }

  const type = classifyExercise({
    name: exercise.exerciseName,
    muscleGroup: exercise.muscleGroup,
    equipment: exercise.equipment,
    repRange: exercise.targetReps,
  })

  return type === 'bodyweight' || type === 'abs' || type === 'posture'
}

// ---------------------------------------------------------------------------
// Small internal helpers
// ---------------------------------------------------------------------------

/** A set is complete only when it has positive reps or positive duration. */
export function isLoggedSet(set: ActiveSet | null | undefined): boolean {
  if (!set) {
    return false
  }

  return toNumber(set.reps, 0) > 0 || toNumber(set.timeSeconds, 0) > 0
}

export function getLastLoggedSet(
  exercise: ActiveExercise | null,
): ActiveSet | null {
  const sets = safeArray<ActiveSet>(exercise?.sets)
  for (let index = sets.length - 1; index >= 0; index -= 1) {
    if (isLoggedSet(sets[index])) {
      return sets[index]
    }
  }

  return null
}

function pickPreviousSet(
  previous: LoggedExercise | null,
  setIndex: number,
): LoggedSet | null {
  const sets = safeArray<LoggedSet>(previous?.sets)
  if (sets.length === 0) {
    return null
  }

  return sets[setIndex] ?? sets[sets.length - 1]
}

function normalizeActiveSession(value: unknown): ActiveWorkoutSession | null {
  if (!isObject(value)) {
    return null
  }

  const exercises = safeArray<unknown>(value.exercises).map(normalizeExercise)
  if (exercises.length === 0) {
    return null
  }
  const sessionType: WorkoutSessionType =
    value.sessionType === 'standalone' ? 'standalone' : 'scheduled'

  return {
    id: toText(value.id, `${Date.now()}`),
    date: toText(value.date, new Date().toISOString().slice(0, 10)),
    workoutDayId:
      sessionType === 'standalone'
        ? null
        : nullablePositiveInteger(value.workoutDayId),
    workoutName: toText(value.workoutName, 'Workout'),
    sessionType,
    standaloneWorkoutId:
      sessionType === 'standalone'
        ? nullableNonEmptyText(value.standaloneWorkoutId)
        : null,
    startedAt: toText(value.startedAt, new Date().toISOString()),
    finishedAt:
      typeof value.finishedAt === 'string' ? value.finishedAt : null,
    currentExerciseIndex: clampIndex(value.currentExerciseIndex, exercises.length),
    currentSetIndex: Math.max(0, toNumber(value.currentSetIndex, 0)),
    completed: value.completed === true,
    exercises,
  }
}

function normalizeExercise(value: unknown): ActiveExercise {
  const source = isObject(value) ? value : {}
  const targetSets = Math.max(1, Math.round(toNumber(source.targetSets, 1)))
  const rawSets = safeArray<unknown>(source.sets)
  const sets =
    rawSets.length > 0
      ? rawSets.map((set, index) => normalizeSet(set, index + 1))
      : Array.from({ length: targetSets }, (_, index) => createEmptySet(index + 1))

  const targetReps = toText(source.targetReps, '')
  const targetDuration = toText(source.targetDuration, '')
  const loggingMode = getExerciseLoggingMode({
    loggingMode: source.loggingMode,
    targetDuration,
    targetReps,
  })

  return {
    exerciseId: toText(source.exerciseId, 'exercise'),
    exerciseName: toText(source.exerciseName, 'Exercise'),
    targetSets,
    targetReps: loggingMode === 'duration' && !targetDuration ? '' : targetReps,
    targetDuration:
      targetDuration || (loggingMode === 'duration' ? targetReps : ''),
    loggingMode,
    restSeconds: Math.max(0, Math.round(toNumber(source.restSeconds, 90))),
    muscleGroup: toText(source.muscleGroup, ''),
    equipment: toText(source.equipment, ''),
    formTips: safeArray<string>(source.formTips).filter(
      (tip) => typeof tip === 'string',
    ),
    sets,
  }
}

function normalizeSet(value: unknown, setNumber: number): ActiveSet {
  const source = isObject(value) ? value : {}
  return {
    setNumber: toNumber(source.setNumber, setNumber),
    reps: nullableNumber(source.reps),
    timeSeconds: nullableNonNegativeNumber(source.timeSeconds),
    weightKg: nullableNumber(source.weightKg),
    rpe: nullableNumber(source.rpe),
    painLevel: nullableNumber(source.painLevel),
    notes: toText(source.notes, ''),
    completedAt: typeof source.completedAt === 'string' ? source.completedAt : null,
  }
}

function clampIndex(value: unknown, length: number): number {
  const index = Math.round(toNumber(value, 0))
  return Math.min(Math.max(index, 0), Math.max(length - 1, 0))
}

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function toNumber(value: unknown, fallback: number): number {
  if (value === null || value === undefined || value === '') {
    return fallback
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function nullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function nullableNonNegativeNumber(value: unknown): number | null {
  const parsed = nullableNumber(value)
  return parsed !== null && parsed >= 0 ? parsed : null
}

function nullablePositiveInteger(value: unknown): number | null {
  const parsed = nullableNumber(value)
  return parsed !== null && Number.isInteger(parsed) && parsed > 0
    ? parsed
    : null
}

function nullableNonEmptyText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function toText(value: unknown, fallback: string): string {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return fallback
}

function roundHalf(value: number): number {
  return Math.round(value * 2) / 2
}
