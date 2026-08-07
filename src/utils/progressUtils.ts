import { WORKOUT_SESSIONS_KEY, type WorkoutSession } from '../data/workoutSessions'
import type { Exercise, WorkoutDay } from '../data/workoutPlan'
import { exerciseLibrary, type LibraryExercise } from '../data/exerciseLibrary'
import {
  exerciseIdentitiesMatch,
  resolveExerciseLibraryEntry,
  type ExerciseIdentityInput,
} from '../data/exerciseIdentity'
import { isRestDay } from './activeWorkoutProgram'
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
  exerciseId?: string | null
  exerciseName?: string
  muscleGroup?: string
  sets?: FlexibleSet[]
  targetDuration?: string
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
  exercise: string | ExerciseIdentityInput,
  library: readonly LibraryExercise[] = exerciseLibrary,
): ExerciseProgressPoint[] {
  const target = typeof exercise === 'string'
    ? { exerciseName: exercise }
    : exercise

  return [...sessions]
    .filter(isWorkoutCompleted)
    .sort((a, b) => getSessionDate(a).getTime() - getSessionDate(b).getTime())
    .flatMap((session) => {
      const matchingExercises = getSessionExercises(session).filter(
        (candidate) => exerciseIdentitiesMatch(candidate, target, { library }),
      )

      if (matchingExercises.length === 0) {
        return []
      }

      // Strength charts intentionally exclude timed-only work, including
      // weighted carries and swimming duration.
      const sets = matchingExercises.flatMap((matchingExercise) =>
        getExerciseSets(matchingExercise).filter(
          (set) => toNumber(set.reps) > 0,
        ),
      )
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
  _workoutPlan: WorkoutDay[],
  date = new Date(),
  library: readonly LibraryExercise[] = exerciseLibrary,
): MuscleVolumePoint[] {
  const volume = Object.fromEntries(
    muscleGroups.map((muscle) => [muscle, 0]),
  ) as Record<(typeof muscleGroups)[number], number>

  getThisWeekSessions(sessions, date)
    .filter(isWorkoutCompleted)
    .forEach((session) => {
      getSessionExercises(session).forEach((exercise) => {
        const muscleGroup = exercise.muscleGroup
          ? normalizeMuscleGroup(exercise.muscleGroup)
          : getResolvedMuscleGroup(exercise, library)
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
  return toNumber(set.reps) > 0 || toNumber(set.timeSeconds) > 0
}

export function createDemoSessions(workoutPlan: WorkoutDay[]) {
  const start = getStartOfWeek(new Date())
  const trainingDays = [...workoutPlan]
    .filter(
      (workout) =>
        !isRestDay(workout) &&
        Array.isArray(workout?.exercises) &&
        workout.exercises.length > 0,
    )
    .sort((left, right) => left.day - right.day)
    .slice(0, 3)

  if (trainingDays.length === 0) {
    return []
  }

  const currentWeek = trainingDays
    .map((workout, index) =>
      makeDemoSession(
        workout,
        addDays(start, clampDayOffset(workout.day, index)),
        1,
      ),
    )
    .sort((left, right) => getSessionDate(right).getTime() - getSessionDate(left).getTime())
  const previousWeek = makeDemoSession(trainingDays[0], addDays(start, -7), 0)

  return [...currentWeek, previousWeek]
}

export function addDemoSessions(workoutPlan: WorkoutDay[]) {
  const sessions = getWorkoutSessions()
  const demoSessions = createDemoSessions(workoutPlan)
  const existingWithoutDemo = sessions.filter(
    (session) => !isGeneratedDemoSession(session),
  )
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
    value.includes('calf') ||
    value.includes('calves') ||
    value.includes('quad') ||
    value.includes('adductor') ||
    value.includes('tibialis')
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

function getResolvedMuscleGroup(
  exercise: FlexibleExercise,
  library: readonly LibraryExercise[],
): (typeof muscleGroups)[number] {
  const libraryEntry = resolveExerciseLibraryEntry(exercise, { library })
  if (!libraryEntry) {
    return 'Other'
  }

  if (libraryEntry.category === 'Conditioning') {
    return 'Cardio'
  }

  const reliableMuscles = libraryEntry.primaryMuscles.join(' ')
  const primaryGroup = normalizeMuscleGroup(reliableMuscles)
  return primaryGroup === 'Other' ? libraryEntry.category : primaryGroup
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(date.getDate() + days)
  return next
}

function makeDemoSession(
  workout: WorkoutDay,
  date: Date,
  progressionStep: number,
): WorkoutSession {
  const startedAt = new Date(date)
  startedAt.setHours(18, 0, 0, 0)
  const finishedAt = new Date(startedAt)
  finishedAt.setMinutes(startedAt.getMinutes() + 52)

  return {
    completed: true,
    date: toDateKey(date),
    exercises: getDemoExercises(workout)
      .map((exercise) => makeDemoExercise(exercise, progressionStep)),
    finishedAt: finishedAt.toISOString(),
    id: `demo-${workout.day}-${toDateKey(date)}`,
    startedAt: startedAt.toISOString(),
    workoutDayId: workout.day,
    workoutName: workout.name,
  }
}

function getDemoExercises(workout: WorkoutDay): Exercise[] {
  const selected = workout.exercises.slice(0, 4)
  const timedExercise = workout.exercises.find((exercise) => exercise.duration)
  if (!timedExercise || selected.some((exercise) => exercise.id === timedExercise.id)) {
    return selected
  }

  return selected.length < 4
    ? [...selected, timedExercise]
    : [...selected.slice(0, 3), timedExercise]
}

function makeDemoExercise(
  exercise: Exercise,
  progressionStep: number,
): WorkoutSession['exercises'][number] {
  const targetSets = Math.max(1, Math.round(exercise.sets || 1))
  const durationSeconds = getDemoDurationSeconds(exercise.duration)
  const targetReps = getDemoRepTarget(exercise.repRange)
  const weightKg = getDemoWeightKg(exercise, progressionStep)

  return {
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    muscleGroup: exercise.muscleGroup,
    sets: Array.from({ length: targetSets }, (_, index) => ({
      notes: '',
      reps:
        durationSeconds === null
          ? Math.max(1, targetReps + progressionStep - Math.min(index, 2))
          : null,
      rpe: Math.min(9, 7.5 + progressionStep * 0.5 + index * 0.25),
      setNumber: index + 1,
      timeSeconds:
        durationSeconds === null
          ? null
          : Math.max(1, durationSeconds + progressionStep * 5 - index * 2),
      weightKg,
    })),
    targetDuration: exercise.duration,
    targetReps: exercise.repRange ?? '',
    targetSets,
  }
}

function getDemoRepTarget(repRange?: string): number {
  const values = String(repRange ?? '').match(/\d+(?:\.\d+)?/g)?.map(Number) ?? []
  return Math.max(1, Math.round(values[0] ?? 8))
}

function getDemoDurationSeconds(duration?: string): number | null {
  if (!duration) {
    return null
  }

  const normalized = duration.toLowerCase()
  const value = Number(normalized.match(/\d+(?:\.\d+)?/)?.[0])
  if (!Number.isFinite(value) || value <= 0) {
    return 60
  }

  return Math.round(/min|minute|hour/.test(normalized) ? value * 60 : value)
}

function getDemoWeightKg(exercise: Exercise, progressionStep: number): number {
  const equipment = exercise.equipment.toLowerCase()
  if (equipment.includes('barbell')) {
    return 40 + progressionStep * 2.5
  }
  if (equipment.includes('dumbbell')) {
    return 12 + progressionStep * 2
  }
  if (equipment.includes('backpack') || equipment.includes('weighted')) {
    return 5 + progressionStep * 2.5
  }
  return 0
}

function clampDayOffset(dayNumber: number, fallbackIndex: number): number {
  return Number.isFinite(dayNumber)
    ? Math.max(0, Math.min(Math.round(dayNumber) - 1, 6))
    : fallbackIndex
}

function isGeneratedDemoSession(session: WorkoutSession): boolean {
  return /^demo-\d+-\d{4}-\d{2}-\d{2}$/.test(session.id)
}
