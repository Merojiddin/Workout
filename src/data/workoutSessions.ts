import type { Exercise, WorkoutDay } from './workoutPlan'
import { safeGetJSON, safeSetJSON } from '../utils/storageUtils'

export const WORKOUT_SESSIONS_KEY = 'workoutSessions'

export interface LoggedSet {
  notes: string
  reps: number | null
  rpe: number | null
  setNumber: number
  weightKg: number | null
  /** Optional live-workout fields (Step 11) - read defensively everywhere. */
  painLevel?: number | null
  completedAt?: string | null
}

export interface LoggedExercise {
  exerciseName: string
  sets: LoggedSet[]
  targetReps: string
  targetSets: number
}

export interface WorkoutSession {
  completed: boolean
  date: string
  exercises: LoggedExercise[]
  finishedAt: string
  id: string
  startedAt: string
  syncStatus?: 'local-only' | 'synced' | 'pending-sync'
  updatedAt?: string
  workoutDayId: number
  workoutName: string
}

export type DraftSet = {
  notes: string
  reps: string
  rpe: string
  weightKg: string
}

export type WorkoutDraft = Record<string, DraftSet[]>

export function createWorkoutDraft(workout: WorkoutDay): WorkoutDraft {
  return workout.exercises.reduce<WorkoutDraft>((draft, exercise) => {
    draft[exercise.id] = Array.from({ length: exercise.sets }, () => ({
      notes: '',
      reps: '',
      rpe: '',
      weightKg: '',
    }))

    return draft
  }, {})
}

export function getWorkoutSessions(): WorkoutSession[] {
  if (typeof window === 'undefined') {
    return []
  }

  const sessions = safeGetJSON(WORKOUT_SESSIONS_KEY, [])
  return Array.isArray(sessions) ? sessions : []
}

export function saveWorkoutSession(session: WorkoutSession) {
  const sessions = getWorkoutSessions()
  safeSetJSON(WORKOUT_SESSIONS_KEY, [session, ...sessions])
}

export function getTargetReps(exercise: Exercise) {
  return exercise.repRange ?? exercise.duration ?? 'timed work'
}

export function buildWorkoutSession({
  draft,
  finishedAt,
  startedAt,
  workout,
}: {
  draft: WorkoutDraft
  finishedAt: Date
  startedAt: Date
  workout: WorkoutDay
}): WorkoutSession {
  return {
    completed: true,
    date: finishedAt.toISOString().slice(0, 10),
    exercises: workout.exercises.map((exercise) => ({
      exerciseName: exercise.name,
      sets: (draft[exercise.id] ?? []).map((set, index) => ({
        notes: set.notes.trim(),
        reps: parseNullableNumber(set.reps),
        rpe: parseNullableNumber(set.rpe),
        setNumber: index + 1,
        weightKg: parseNullableNumber(set.weightKg),
      })),
      targetReps: getTargetReps(exercise),
      targetSets: exercise.sets,
    })),
    finishedAt: finishedAt.toISOString(),
    id: `${finishedAt.getTime()}-${workout.day}`,
    startedAt: startedAt.toISOString(),
    workoutDayId: workout.day,
    workoutName: workout.name,
  }
}

export function findPreviousExercisePerformance(
  exerciseName: string,
  sessions = getWorkoutSessions(),
) {
  for (const session of sessions) {
    const exercise = session.exercises.find(
      (loggedExercise) => loggedExercise.exerciseName === exerciseName,
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

export function getWeeklyCompletedWorkouts(
  sessions = getWorkoutSessions(),
  date = new Date(),
) {
  const start = getStartOfWeek(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 7)

  return sessions.filter((session) => {
    if (!session.completed) {
      return false
    }

    const sessionDate = new Date(session.finishedAt || session.date)
    return sessionDate >= start && sessionDate < end
  }).length
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

function parseNullableNumber(value: string) {
  if (value.trim() === '') {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function getStartOfWeek(date: Date) {
  const start = new Date(date)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  start.setHours(0, 0, 0, 0)

  return start
}
