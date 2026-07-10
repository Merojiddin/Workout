import { WORKOUT_SESSIONS_KEY, type WorkoutSession } from '../data/workoutSessions'
import type { WorkoutDay } from '../data/workoutPlan'
import { safeGetJSON, safeSetJSON } from './storageUtils'

export interface ExerciseProgressPoint {
  date: string
  label: string
  value: number
}

export interface WeeklyCompletionPoint {
  completed: number
  day: string
}

export interface MuscleVolumePoint {
  muscle: string
  sets: number
}

type FlexibleSet = {
  duration?: string
  notes?: string
  reps?: number | null
  rpe?: number | null
  setNumber?: number
  timeSeconds?: number | null
  weightKg?: number | null
}

type FlexibleExercise = {
  exerciseName?: string
  sets?: FlexibleSet[]
  targetReps?: string
  targetSets?: number
}

type FlexibleSession = WorkoutSession & {
  exercises?: FlexibleExercise[]
}

const muscleGroups = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Legs',
  'Abs',
  'Posture',
  'Cardio',
  'Other',
] as const

export function getWorkoutSessions(): WorkoutSession[] {
  if (typeof window === 'undefined') {
    return []
  }

  const sessions = safeGetJSON(WORKOUT_SESSIONS_KEY, [])
  return Array.isArray(sessions) ? sessions.filter(isSessionLike) : []
}

export function saveWorkoutSessions(sessions: WorkoutSession[]) {
  safeSetJSON(WORKOUT_SESSIONS_KEY, Array.isArray(sessions) ? sessions : [])
}

export function getTotalWorkouts(sessions: WorkoutSession[]) {
  return sessions.filter(isWorkoutCompleted).length
}

export function getThisWeekSessions(sessions: WorkoutSession[], date = new Date()) {
  const start = getStartOfWeek(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 7)

  return sessions.filter((session) => {
    const sessionDate = getSessionDate(session)
    return sessionDate >= start && sessionDate < end
  })
}

export function getTotalSets(sessions: WorkoutSession[]) {
  return sessions.reduce(
    (total, session) =>
      total +
      getSessionExercises(session).reduce(
        (exerciseTotal, exercise) =>
          exerciseTotal + getExerciseSets(exercise).filter(isCompletedSet).length,
        0,
      ),
    0,
  )
}

export function getExerciseProgress(
  sessions: WorkoutSession[],
  exerciseName: string,
): ExerciseProgressPoint[] {
  return [...sessions]
    .filter(isWorkoutCompleted)
    .sort((a, b) => getSessionDate(a).getTime() - getSessionDate(b).getTime())
    .flatMap((session) => {
      const exercise = getSessionExercises(session).find(
        (candidate) => candidate.exerciseName === exerciseName,
      )

      if (!exercise) {
        return []
      }

      const sets = getExerciseSets(exercise).filter(isCompletedSet)
      if (sets.length === 0) {
        return []
      }

      const bestWeight = Math.max(
        ...sets.map((set) => toNumber(set.weightKg)).filter((value) => value > 0),
        0,
      )
      const bestReps = Math.max(
        ...sets.map((set) => toNumber(set.reps)).filter((value) => value > 0),
        0,
      )

      const value = bestWeight > 0 ? bestWeight : bestReps
      if (value <= 0) {
        return []
      }

      return [
        {
          date: session.date,
          label: bestWeight > 0 ? `${value} kg` : `${value} reps`,
          value,
        },
      ]
    })
}

export function getWeeklyCompletion(
  sessions: WorkoutSession[],
  date = new Date(),
): WeeklyCompletionPoint[] {
  const start = getStartOfWeek(date)
  const completedDates = new Set(
    getThisWeekSessions(sessions, date)
      .filter(isWorkoutCompleted)
      .map((session) => session.date),
  )

  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
    const current = new Date(start)
    current.setDate(start.getDate() + index)

    return {
      completed: completedDates.has(toDateKey(current)) ? 1 : 0,
      day,
    }
  })
}

export function getWeeklyMuscleVolume(
  sessions: WorkoutSession[],
  workoutPlan: WorkoutDay[],
  date = new Date(),
): MuscleVolumePoint[] {
  const exerciseMuscleMap = buildExerciseMuscleMap(workoutPlan)
  const volume = Object.fromEntries(
    muscleGroups.map((muscle) => [muscle, 0]),
  ) as Record<(typeof muscleGroups)[number], number>

  getThisWeekSessions(sessions, date)
    .filter(isWorkoutCompleted)
    .forEach((session) => {
      getSessionExercises(session).forEach((exercise) => {
        const muscleGroup = exercise.exerciseName
          ? exerciseMuscleMap.get(exercise.exerciseName) ?? 'Other'
          : 'Other'
        const completedSets = getExerciseSets(exercise).filter(isCompletedSet)
        volume[muscleGroup] += completedSets.length
      })
    })

  return muscleGroups.map((muscle) => ({ muscle, sets: volume[muscle] }))
}

export function getMostTrainedMuscle(volumeData: MuscleVolumePoint[]) {
  const topMuscle = volumeData.reduce<MuscleVolumePoint | null>(
    (top, item) => (!top || item.sets > top.sets ? item : top),
    null,
  )

  if (!topMuscle || topMuscle.sets === 0) {
    return 'None yet'
  }

  return topMuscle.muscle
}

export function getLatestWorkoutSession(sessions: WorkoutSession[]) {
  return [...sessions].filter(isWorkoutCompleted).sort(
    (a, b) => getSessionDate(b).getTime() - getSessionDate(a).getTime(),
  )[0] ?? null
}

export function getCurrentWorkoutStreak(sessions: WorkoutSession[]) {
  const completedDates = new Set(
    sessions.filter(isWorkoutCompleted).map((session) => session.date),
  )

  let streak = 0
  const cursor = new Date()

  while (completedDates.has(toDateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

export function getSessionDuration(session: WorkoutSession) {
  const startedAt = new Date(session.startedAt).getTime()
  const finishedAt = new Date(session.finishedAt).getTime()

  if (!Number.isFinite(startedAt) || !Number.isFinite(finishedAt)) {
    return '-'
  }

  const totalMinutes = Math.max(Math.round((finishedAt - startedAt) / 60000), 1)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) {
    return `${minutes} min`
  }

  return `${hours}h ${minutes}m`
}

export function getSessionSetCount(session: WorkoutSession) {
  return getSessionExercises(session).reduce(
    (total, exercise) =>
      total + getExerciseSets(exercise).filter(isCompletedSet).length,
    0,
  )
}

export function getAverageRpe(sets: FlexibleSet[]) {
  const rpes = sets.map((set) => toNumber(set.rpe)).filter((value) => value > 0)

  if (rpes.length === 0) {
    return null
  }

  const average = rpes.reduce((sum, value) => sum + value, 0) / rpes.length
  return Math.round(average * 10) / 10
}

export function isWorkoutCompleted(session: WorkoutSession) {
  return (
    session.completed === true ||
    getSessionExercises(session).some((exercise) =>
      getExerciseSets(exercise).some(isCompletedSet),
    )
  )
}

export function isCompletedSet(set: FlexibleSet) {
  return (
    toNumber(set.reps) > 0 ||
    toNumber(set.timeSeconds) > 0 ||
    Boolean(set.duration)
  )
}

export function createDemoSessions(workoutPlan: WorkoutDay[]) {
  const start = getStartOfWeek(new Date())
  const dayOne = workoutPlan.find((workout) => workout.day === 1) ?? workoutPlan[0]
  const dayTwo = workoutPlan.find((workout) => workout.day === 2) ?? workoutPlan[1]
  const dayThree = workoutPlan.find((workout) => workout.day === 3) ?? workoutPlan[2]

  return [
    makeDemoSession(dayThree, addDays(start, 2), [
      ['Squat', [10, 10, 9, 8], [70, 70, 75, 75], [8, 8, 9, 9]],
      ['Romanian Deadlift', [10, 10, 8, 8], [65, 65, 70, 70], [8, 8, 9, 9]],
      ['Hanging Knee Raise', [14, 12, 12], [0, 0, 0], [8, 8, 9]],
    ]),
    makeDemoSession(dayTwo, addDays(start, 1), [
      ['Pull-ups', [10, 9, 8, 7], [0, 0, 0, 0], [8, 8, 9, 9]],
      ['Barbell Row', [12, 10, 10, 9], [55, 57.5, 57.5, 60], [8, 8, 9, 9]],
      ['Chin-ups', [9, 8, 8], [0, 0, 0], [8, 8, 9]],
    ]),
    makeDemoSession(dayOne, start, [
      ['Bench Press', [8, 7, 6, 6], [70, 72.5, 72.5, 72.5], [8, 8, 9, 9]],
      ['Weighted Push-up', [13, 12, 11, 10], [5, 5, 5, 5], [8, 8, 9, 9]],
      ['Dips', [11, 10, 9], [0, 0, 0], [8, 8, 9]],
      ['Incline Dumbbell Press', [12, 10, 10], [24, 26, 26], [8, 8, 9]],
    ]),
    makeDemoSession(dayOne, addDays(start, -4), [
      ['Bench Press', [8, 7, 6, 5], [67.5, 70, 70, 70], [8, 8, 9, 9]],
      ['Weighted Push-up', [12, 11, 10, 9], [5, 5, 5, 5], [8, 8, 9, 9]],
      ['Dips', [10, 9, 8], [0, 0, 0], [8, 8, 9]],
      ['Incline Dumbbell Press', [12, 10, 9], [22, 24, 24], [8, 8, 9]],
    ]),
  ]
}

export function addDemoSessions(workoutPlan: WorkoutDay[]) {
  const sessions = getWorkoutSessions()
  const demoSessions = createDemoSessions(workoutPlan)
  const demoIds = new Set(demoSessions.map((session) => session.id))
  const existingWithoutDemo = sessions.filter((session) => !demoIds.has(session.id))
  const nextSessions = [...demoSessions, ...existingWithoutDemo]
  saveWorkoutSessions(nextSessions)
  return nextSessions
}

export function formatSessionDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function isSessionLike(session: unknown): session is WorkoutSession {
  return Boolean(
    session &&
      typeof session === 'object' &&
      'date' in session &&
      'workoutName' in session &&
      'exercises' in session,
  )
}

function getSessionExercises(session: WorkoutSession): FlexibleExercise[] {
  const exercises = (session as FlexibleSession).exercises
  return Array.isArray(exercises) ? exercises : []
}

function getExerciseSets(exercise: FlexibleExercise): FlexibleSet[] {
  return Array.isArray(exercise.sets) ? exercise.sets : []
}

function getSessionDate(session: WorkoutSession) {
  const timestamp = session.finishedAt || `${session.date}T00:00:00`
  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return new Date(`${session.date}T00:00:00`)
  }

  return date
}

function getStartOfWeek(date: Date) {
  const start = new Date(date)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  start.setHours(0, 0, 0, 0)

  return start
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return 0
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildExerciseMuscleMap(workoutPlan: WorkoutDay[]) {
  const map = new Map<string, (typeof muscleGroups)[number]>()

  workoutPlan.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      map.set(exercise.name, normalizeMuscleGroup(exercise.muscleGroup))
    })
  })

  return map
}

function normalizeMuscleGroup(muscleGroup: string) {
  const value = muscleGroup.toLowerCase()

  if (value.includes('chest')) {
    return 'Chest'
  }

  if (value.includes('back') || value.includes('lat')) {
    return 'Back'
  }

  if (value.includes('shoulder') || value.includes('delt')) {
    return 'Shoulders'
  }

  if (
    value.includes('biceps') ||
    value.includes('triceps') ||
    value.includes('arms') ||
    value.includes('forearms')
  ) {
    return 'Arms'
  }

  if (
    value.includes('leg') ||
    value.includes('glute') ||
    value.includes('hamstring') ||
    value.includes('calf')
  ) {
    return 'Legs'
  }

  if (value.includes('abs') || value.includes('oblique') || value.includes('core')) {
    return 'Abs'
  }

  if (value.includes('posture') || value.includes('mobility')) {
    return 'Posture'
  }

  if (
    value.includes('conditioning') ||
    value.includes('cardio') ||
    value.includes('recovery')
  ) {
    return 'Cardio'
  }

  return 'Other'
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(date.getDate() + days)
  return next
}

function makeDemoSession(
  workout: WorkoutDay,
  date: Date,
  exerciseData: [string, number[], number[], number[]][],
): WorkoutSession {
  const startedAt = new Date(date)
  startedAt.setHours(18, 0, 0, 0)
  const finishedAt = new Date(startedAt)
  finishedAt.setMinutes(startedAt.getMinutes() + 52)

  return {
    completed: true,
    date: toDateKey(date),
    exercises: exerciseData.map(([exerciseName, reps, weights, rpes]) => {
      const planExercise = workout.exercises.find(
        (exercise) => exercise.name === exerciseName,
      )

      return {
        exerciseName,
        sets: reps.map((repCount, index) => ({
          notes: '',
          reps: repCount,
          rpe: rpes[index] ?? null,
          setNumber: index + 1,
          weightKg: weights[index] ?? 0,
        })),
        targetReps: planExercise?.repRange ?? planExercise?.duration ?? 'work',
        targetSets: planExercise?.sets ?? reps.length,
      }
    }),
    finishedAt: finishedAt.toISOString(),
    id: `demo-${workout.day}-${toDateKey(date)}`,
    startedAt: startedAt.toISOString(),
    workoutDayId: workout.day,
    workoutName: workout.name,
  }
}
