import {
  exerciseIdentitiesMatch,
  type ExerciseIdentityOptions,
  type ExerciseIdentityInput,
} from './exerciseIdentity'
import { safeGetJSON, safeSetJSON } from '../utils/storageUtils'

export const WORKOUT_SESSIONS_KEY = 'workoutSessions'

export interface LoggedSet {
  notes: string
  reps: number | null
  timeSeconds?: number | null
  rpe: number | null
  rir?: number | null
  setNumber: number
  weightKg: number | null
  /** Optional live-workout fields (Step 11) - read defensively everywhere. */
  painLevel?: number | null
  completedAt?: string | null
}

export interface LoggedExercise {
  exerciseId?: string
  exerciseName: string
  muscleGroup?: string
  sets: LoggedSet[]
  targetReps: string
  targetDuration?: string
  targetRir?: string
  targetSets: number
}

export type WorkoutSessionType = 'scheduled' | 'standalone'

export interface WorkoutSession {
  completed: boolean
  date: string
  exercises: LoggedExercise[]
  finishedAt: string
  id: string
  programId?: string | null
  programVersion?: string | null
  programWeek?: number | null
  progressionMode?: 'standard' | 'reentry' | 'recovery'
  workoutGuidance?: string[]
  startedAt: string
  syncStatus?: 'local-only' | 'synced' | 'pending-sync'
  sessionType?: WorkoutSessionType
  standaloneWorkoutId?: string | null
  updatedAt?: string
  workoutDayId: number | null
  workoutName: string
}

export function getWorkoutSessions(): WorkoutSession[] {
  if (typeof window === 'undefined') {
    return []
  }

  const sessions = safeGetJSON(WORKOUT_SESSIONS_KEY, [])
  return Array.isArray(sessions) ? sessions : []
}

/** Returns false when the write failed, e.g. storage is full. */
export function saveWorkoutSession(session: WorkoutSession): boolean {
  const sessions = getWorkoutSessions()
  return safeSetJSON(WORKOUT_SESSIONS_KEY, [session, ...sessions])
}

export function findPreviousExercisePerformance(
  exercise: string | ExerciseIdentityInput,
  sessions = getWorkoutSessions(),
  options: Pick<ExerciseIdentityOptions, 'library'> = {},
) {
  const target = typeof exercise === 'string'
    ? { exerciseName: exercise }
    : exercise

  for (const session of sessions) {
    const exercise = session.exercises.find(
      (loggedExercise) =>
        exerciseIdentitiesMatch(loggedExercise, target, options),
    )

    if (exercise) {
      return exercise
    }
  }

  return null
}

export function getLatestWorkoutSession(sessions = getWorkoutSessions()) {
  return sessions[0] ?? null
}

export function getCurrentWorkoutStreak(sessions = getWorkoutSessions()) {
  const completedDates = new Set(
    sessions
      .filter((session) => session.completed)
      .map((session) => session.date),
  )

  if (completedDates.size === 0) {
    return 0
  }

  let streak = 0
  const cursor = new Date()

  while (completedDates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}
