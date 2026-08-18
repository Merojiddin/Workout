import type { Exercise, WorkoutDay } from '../data/workoutPlan'
import { toLocalIsoDate, todayIsoDate } from './dateUtils'
import {
  saveWorkoutSession,
  type LoggedExercise,
  type LoggedSet,
  type WorkoutSession,
  type WorkoutSessionType,
} from '../data/workoutSessions'
import {
  getExerciseLoggingMode,
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
  rir: number | null
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
  targetRir: string
  loggingMode: ExerciseLoggingMode
  restSeconds: number
  muscleGroup: string
  equipment: string
  formTips: string[]
  guidance: string[]
  sets: ActiveSet[]
}

export interface ActiveWorkoutSession {
  id: string
  date: string
  workoutDayId: number | null
  workoutName: string
  sessionType?: WorkoutSessionType
  standaloneWorkoutId?: string | null
  programId?: string | null
  programVersion?: string | null
  programWeek?: number | null
  progressionMode?: 'standard' | 'reentry' | 'recovery'
  workoutGuidance?: string[]
  startedAt: string
  finishedAt: string | null
  currentExerciseIndex: number
  currentSetIndex: number
  completed: boolean
  exercises: ActiveExercise[]
}

type LiveWorkoutDefinition = Pick<WorkoutDay, 'exercises' | 'name'> &
  Partial<Pick<WorkoutDay, 'day'>>

interface ActiveWorkoutProgramContext {
  programId?: string | null
  programVersion?: string | null
  programWeek?: number | null
  progressionMode?: 'standard' | 'reentry' | 'recovery'
  workoutGuidance?: string[]
}

export type CreateActiveWorkoutSessionOptions = ActiveWorkoutProgramContext &
  (
    | {
      sessionType?: 'scheduled'
      standaloneWorkoutId?: null
      }
    | {
      sessionType: 'standalone'
      standaloneWorkoutId: string
      }
  )

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
    date: toLocalIsoDate(now),
    workoutDayId,
    workoutName: toText(workoutDay?.name, 'Workout'),
    sessionType,
    standaloneWorkoutId,
    programId: nullableNonEmptyText(options.programId),
    programVersion: nullableNonEmptyText(options.programVersion),
    programWeek: nullablePositiveInteger(options.programWeek),
    progressionMode: normalizeProgressionMode(options.progressionMode),
    workoutGuidance: safeArray<string>(options.workoutGuidance).filter(
      (item) => typeof item === 'string' && item.trim().length > 0,
    ),
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
    targetRir: toText(exercise?.targetRir, ''),
    loggingMode: getExerciseLoggingMode(exercise),
    restSeconds: Math.max(0, Math.round(toNumber(exercise?.restSeconds, 90))),
    muscleGroup: toText(exercise?.muscleGroup, ''),
    equipment: toText(exercise?.equipment, ''),
    formTips: safeArray<string>(exercise?.formTips).filter(
      (tip) => typeof tip === 'string',
    ),
    guidance: safeArray<string>(exercise?.guidance).filter(
      (item) => typeof item === 'string',
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
    rir: null,
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

export interface CompleteWorkoutResult {
  /** False when history could not be written; the active session is kept. */
  saved: boolean
  session: WorkoutSession
}

/**
 * Moves a finished active session into workoutSessions, clearing the active
 * session only if that write succeeded.
 */
export function completeActiveWorkoutSession(
  session: ActiveWorkoutSession,
): CompleteWorkoutResult {
  const finishedAt = new Date().toISOString()
  const sessionType: WorkoutSessionType =
    session?.sessionType === 'standalone' ? 'standalone' : 'scheduled'
  const standaloneWorkoutId =
    sessionType === 'standalone'
      ? nullableNonEmptyText(session?.standaloneWorkoutId)
      : null
  const finished: WorkoutSession = {
    completed: true,
    date: toText(session?.date, toLocalIsoDate(finishedAt)),
    exercises: safeArray<ActiveExercise>(session?.exercises).map(
      toLoggedExercise,
    ),
    finishedAt,
    id: toText(session?.id, `${Date.now()}`),
    sessionType,
    standaloneWorkoutId,
    programId: nullableNonEmptyText(session?.programId),
    programVersion: nullableNonEmptyText(session?.programVersion),
    programWeek: nullablePositiveInteger(session?.programWeek),
    progressionMode: normalizeProgressionMode(session?.progressionMode),
    workoutGuidance: safeArray<string>(session?.workoutGuidance).filter(
      (item) => typeof item === 'string' && item.trim().length > 0,
    ),
    startedAt: toText(session?.startedAt, finishedAt),
    workoutDayId:
      sessionType === 'standalone'
        ? null
        : nullablePositiveInteger(session?.workoutDayId),
    workoutName: toText(session?.workoutName, 'Workout'),
  }

  // Only discard the in-progress session once history has actually accepted
  // it. Clearing unconditionally meant a failed write (a full localStorage is
  // the realistic cause) destroyed the workout that was just completed.
  const saved = saveWorkoutSession(finished)
  if (saved) {
    clearActiveWorkoutSession()
  }

  return { saved, session: finished }
}

function toLoggedExercise(exercise: ActiveExercise): LoggedExercise {
  return {
    exerciseId: toText(exercise?.exerciseId, ''),
    exerciseName: toText(exercise?.exerciseName, 'Exercise'),
    muscleGroup: toText(exercise?.muscleGroup, ''),
    targetReps: toText(exercise?.targetReps, ''),
    targetDuration: toText(exercise?.targetDuration, '') || undefined,
    targetRir: toText(exercise?.targetRir, '') || undefined,
    targetSets: Math.max(1, toNumber(exercise?.targetSets, 1)),
    sets: safeArray<ActiveSet>(exercise?.sets).map(
      (set, index): LoggedSet => ({
        setNumber: toNumber(set?.setNumber, index + 1),
        reps: nullableNumber(set?.reps),
        timeSeconds: nullableNonNegativeNumber(set?.timeSeconds),
        weightKg: nullableNumber(set?.weightKg),
        rpe: nullableNumber(set?.rpe),
        rir: nullableNumber(set?.rir),
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

export function getTotalPlannedSets(
  session: ActiveWorkoutSession | null,
): number {
  return safeArray<ActiveExercise>(session?.exercises).reduce(
    (total, exercise) => total + safeArray<ActiveSet>(exercise?.sets).length,
    0,
  )
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
// ---------------------------------------------------------------------------
// Small internal helpers
// ---------------------------------------------------------------------------

/**
 * A set carries NUMBERS only when it has positive reps or positive duration.
 * Progression rules need this: they cannot compare loads they were never told.
 */
export function isLoggedSet(set: ActiveSet | null | undefined): boolean {
  if (!set) {
    return false
  }

  return toNumber(set.reps, 0) > 0 || toNumber(set.timeSeconds, 0) > 0
}

/**
 * A set was DONE when the user moved past it, whether or not they typed
 * anything. Logging reps/kg is optional, so counting only numbered sets would
 * report "0 of 24 sets" for a whole workout that actually happened.
 */
export function isDoneSet(set: ActiveSet | null | undefined): boolean {
  if (!set) {
    return false
  }

  return Boolean(set.completedAt) || isLoggedSet(set)
}

/** Number of sets the user has worked through, logged or not. */
export function getDoneSetsCount(
  session: ActiveWorkoutSession | null,
): number {
  return safeArray<ActiveExercise>(session?.exercises).reduce(
    (total, exercise) =>
      total + safeArray<ActiveSet>(exercise?.sets).filter(isDoneSet).length,
    0,
  )
}

/**
 * How many exercises are left *after* the one on screen. The screen labels
 * this "Rest of the workout", so counting the current one would make the
 * number never go down. Earlier exercises still count while unfinished:
 * jumping around the list leaves gaps that are genuinely still to do.
 */
export function countRemainingExercises(
  exercises: ActiveExercise[],
  currentIndex: number,
): number {
  return safeArray<ActiveExercise>(exercises).reduce(
    (count, exercise, index) =>
      index !== currentIndex &&
      (index > currentIndex || !safeArray<ActiveSet>(exercise?.sets).every(isDoneSet))
        ? count + 1
        : count,
    0,
  )
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
    date: toText(value.date, todayIsoDate()),
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
    programId: nullableNonEmptyText(value.programId),
    programVersion: nullableNonEmptyText(value.programVersion),
    programWeek: nullablePositiveInteger(value.programWeek),
    progressionMode: normalizeProgressionMode(value.progressionMode),
    workoutGuidance: safeArray<string>(value.workoutGuidance).filter(
      (item) => typeof item === 'string' && item.trim().length > 0,
    ),
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
    targetRir: toText(source.targetRir, ''),
    loggingMode,
    restSeconds: Math.max(0, Math.round(toNumber(source.restSeconds, 90))),
    muscleGroup: toText(source.muscleGroup, ''),
    equipment: toText(source.equipment, ''),
    formTips: safeArray<string>(source.formTips).filter(
      (tip) => typeof tip === 'string',
    ),
    guidance: safeArray<string>(source.guidance).filter(
      (item) => typeof item === 'string',
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
    rir: nullableNumber(source.rir),
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

function normalizeProgressionMode(
  value: unknown,
): 'standard' | 'reentry' | 'recovery' {
  if (value === 'reentry' || value === 'recovery') return value
  return 'standard'
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

