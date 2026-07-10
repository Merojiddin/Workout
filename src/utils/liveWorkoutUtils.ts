import type { Exercise, WorkoutDay } from '../data/workoutPlan'
import {
  getWorkoutSessions,
  saveWorkoutSession,
  type LoggedExercise,
  type LoggedSet,
  type WorkoutSession,
} from '../data/workoutSessions'
import {
  classifyExercise,
  parseRepRange,
  type ProgressionSuggestion,
} from './progressionUtils'
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
  restSeconds: number
  muscleGroup: string
  equipment: string
  formTips: string[]
  sets: ActiveSet[]
}

export interface ActiveWorkoutSession {
  id: string
  date: string
  workoutDayId: number
  workoutName: string
  startedAt: string
  finishedAt: string | null
  currentExerciseIndex: number
  currentSetIndex: number
  completed: boolean
  exercises: ActiveExercise[]
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
  workoutDay: WorkoutDay,
): ActiveWorkoutSession {
  const now = new Date()
  const exercises = safeArray<Exercise>(workoutDay?.exercises).map((exercise) =>
    createActiveExercise(exercise),
  )

  return {
    id: `${now.getTime()}-${toNumber(workoutDay?.day, 0)}`,
    date: now.toISOString().slice(0, 10),
    workoutDayId: toNumber(workoutDay?.day, 0),
    workoutName: toText(workoutDay?.name, 'Workout'),
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
    targetReps: toText(exercise?.repRange, toText(exercise?.duration, '')),
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
  const finished: WorkoutSession = {
    completed: true,
    date: toText(session?.date, finishedAt.slice(0, 10)),
    exercises: safeArray<ActiveExercise>(session?.exercises).map(
      toLoggedExercise,
    ),
    finishedAt,
    id: toText(session?.id, `${Date.now()}`),
    startedAt: toText(session?.startedAt, finishedAt),
    workoutDayId: toNumber(session?.workoutDayId, 0),
    workoutName: toText(session?.workoutName, 'Workout'),
  }

  saveWorkoutSession(finished)
  clearActiveWorkoutSession()
  return finished
}

function toLoggedExercise(exercise: ActiveExercise): LoggedExercise {
  return {
    exerciseName: toText(exercise?.exerciseName, 'Exercise'),
    targetReps: toText(exercise?.targetReps, ''),
    targetSets: Math.max(1, toNumber(exercise?.targetSets, 1)),
    sets: safeArray<ActiveSet>(exercise?.sets).map(
      (set, index): LoggedSet => ({
        setNumber: toNumber(set?.setNumber, index + 1),
        reps: nullableNumber(set?.reps),
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
  return {
    ...session,
    exercises: session.exercises.map((exercise, index) => {
      if (index !== exerciseIndex) {
        return exercise
      }

      return {
        ...exercise,
        sets: exercise.sets.map((set, innerIndex) =>
          innerIndex === setIndex ? { ...set, ...setData } : set,
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
    (set) => nullableNumber(set?.reps) !== null || nullableNumber(set?.weightKg) !== null,
  )
  if (sets.length === 0) {
    return null
  }

  const reps = sets.map((set) => nullableNumber(set.reps)).filter((v) => v !== null)
  const weights = sets
    .map((set) => toNumber(set.weightKg, 0))
    .filter((weight) => weight > 0)
  const topWeight = weights.length > 0 ? Math.max(...weights) : 0

  const repsPart =
    reps.length > 0 ? `${reps.join(' / ')} reps` : `${sets.length} sets`
  const loadPart = topWeight > 0 ? ` at ${roundHalf(topWeight)} kg` : ' at bodyweight'

  return `${sets.length} sets: ${repsPart}${loadPart}`
}

/** Best single set ever logged: "15 reps at bodyweight" or "10 kg x 12 reps". */
export function getBestPerformanceSummary(
  exerciseName: string,
  sessions: WorkoutSession[] = getWorkoutSessions(),
): string | null {
  let best: { weight: number; reps: number } | null = null

  for (const session of safeArray<WorkoutSession>(sessions)) {
    for (const exercise of safeArray<LoggedExercise>(session?.exercises)) {
      if (exercise?.exerciseName !== exerciseName) {
        continue
      }

      for (const set of safeArray<LoggedSet>(exercise?.sets)) {
        const reps = toNumber(set?.reps, 0)
        const weight = toNumber(set?.weightKg, 0)
        if (reps <= 0 && weight <= 0) {
          continue
        }

        const score = weight * 1000 + reps
        const bestScore = best ? best.weight * 1000 + best.reps : -1
        if (score > bestScore) {
          best = { weight, reps }
        }
      }
    }
  }

  if (!best) {
    return null
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
      message: 'Next set: reduce reps or reduce weight slightly.',
      tone: 'warn',
    }
  }

  if (rpe >= 9) {
    return {
      message: 'Next set: keep the same weight, but do not force extra reps.',
      tone: 'warn',
    }
  }

  if (postureCue) {
    return {
      message: `Rest ${restSeconds} sec. ${postureCue}`,
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

/** A set counts as "logged" once it has reps, weight, or a completed stamp. */
export function isLoggedSet(set: ActiveSet | null | undefined): boolean {
  if (!set) {
    return false
  }

  return (
    Boolean(set.completedAt) ||
    nullableNumber(set.reps) !== null ||
    nullableNumber(set.weightKg) !== null ||
    nullableNumber(set.rpe) !== null
  )
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

  return {
    id: toText(value.id, `${Date.now()}`),
    date: toText(value.date, new Date().toISOString().slice(0, 10)),
    workoutDayId: toNumber(value.workoutDayId, 0),
    workoutName: toText(value.workoutName, 'Workout'),
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

  return {
    exerciseId: toText(source.exerciseId, 'exercise'),
    exerciseName: toText(source.exerciseName, 'Exercise'),
    targetSets,
    targetReps: toText(source.targetReps, ''),
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
