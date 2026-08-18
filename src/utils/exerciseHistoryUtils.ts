import { getWorkoutSessions } from '../data/workoutSessions'
import type { LoggedExercise, LoggedSet, WorkoutSession } from '../data/workoutSessions'

export interface ExerciseHistoryEntry {
  /** ISO date of the session, e.g. "2026-08-18". */
  date: string
  /** Sets actually worked through that day. */
  setCount: number
  /** Heaviest set of the day, when any weight was logged. */
  topWeightKg: number | null
  /** Reps of that heaviest set, for "60 kg x 8" style lines. */
  topReps: number | null
  /** Sum of weight x reps over the day. Null when nothing numeric was logged. */
  volumeKg: number | null
  /** Total reps, which is the only number a bodyweight movement produces. */
  totalReps: number
  /** Total seconds, for timed movements. */
  totalSeconds: number
}

export interface ExerciseHistory {
  entries: ExerciseHistoryEntry[]
  /** Best single set ever recorded, by weight then reps. */
  bestWeightKg: number | null
  bestReps: number | null
  /** True when no session has numbers, so the UI can say so plainly. */
  isEmpty: boolean
}

/**
 * Everything this exercise has ever been logged as, newest first.
 *
 * Matched on id first and name second: a program can be reinstalled under a
 * new id, and an exercise swapped in mid-workout is stored under the variant's
 * own id, so name is the fallback that keeps a movement's history together.
 */
export function getExerciseHistory(
  exerciseId: string,
  exerciseName: string,
  sessions: WorkoutSession[] = getWorkoutSessions(),
): ExerciseHistory {
  const wantedId = normalize(exerciseId)
  const wantedName = normalize(exerciseName)
  const entries: ExerciseHistoryEntry[] = []
  let bestWeightKg: number | null = null
  let bestReps: number | null = null

  for (const session of sessions) {
    const matches = safeArray<LoggedExercise>(session?.exercises).filter(
      (exercise) =>
        (wantedId && normalize(exercise?.exerciseId) === wantedId) ||
        (wantedName && normalize(exercise?.exerciseName) === wantedName),
    )
    if (matches.length === 0) {
      continue
    }

    const sets = matches
      .flatMap((exercise) => safeArray<LoggedSet>(exercise?.sets))
      .filter(isLoggedSet)
    if (sets.length === 0) {
      continue
    }

    let topWeightKg: number | null = null
    let topReps: number | null = null
    let volumeKg = 0
    let hasVolume = false
    let totalReps = 0
    let totalSeconds = 0

    for (const set of sets) {
      const weight = numberOrNull(set.weightKg)
      const reps = numberOrNull(set.reps)
      const seconds = numberOrNull(set.timeSeconds)

      if (reps !== null) totalReps += reps
      if (seconds !== null) totalSeconds += seconds

      if (weight !== null && reps !== null) {
        volumeKg += weight * reps
        hasVolume = true
      }

      if (weight !== null && (topWeightKg === null || weight > topWeightKg)) {
        topWeightKg = weight
        topReps = reps
      }
    }

    if (
      topWeightKg !== null &&
      (bestWeightKg === null || topWeightKg > bestWeightKg)
    ) {
      bestWeightKg = topWeightKg
      bestReps = topReps
    }

    entries.push({
      date: String(session?.date ?? ''),
      setCount: sets.length,
      topWeightKg,
      topReps,
      volumeKg: hasVolume ? Math.round(volumeKg) : null,
      totalReps,
      totalSeconds,
    })
  }

  entries.sort((left, right) => right.date.localeCompare(left.date))

  return {
    entries,
    bestWeightKg,
    bestReps,
    isEmpty: entries.length === 0,
  }
}

/**
 * The series the sparkline draws: volume when loads are logged, otherwise
 * total reps, otherwise total seconds. Oldest first, because a chart reads
 * left to right.
 */
export function getExerciseTrend(history: ExerciseHistory): {
  label: string
  unit: string
  points: { date: string; value: number }[]
} {
  const chronological = [...history.entries].reverse()
  const hasVolume = chronological.some((entry) => entry.volumeKg !== null)
  if (hasVolume) {
    return {
      label: 'Volume per session',
      unit: 'kg',
      points: chronological
        .filter((entry) => entry.volumeKg !== null)
        .map((entry) => ({ date: entry.date, value: entry.volumeKg as number })),
    }
  }

  const hasReps = chronological.some((entry) => entry.totalReps > 0)
  if (hasReps) {
    return {
      label: 'Reps per session',
      unit: 'reps',
      points: chronological
        .filter((entry) => entry.totalReps > 0)
        .map((entry) => ({ date: entry.date, value: entry.totalReps })),
    }
  }

  return {
    label: 'Time per session',
    unit: 'sec',
    points: chronological
      .filter((entry) => entry.totalSeconds > 0)
      .map((entry) => ({ date: entry.date, value: entry.totalSeconds })),
  }
}

function isLoggedSet(set: LoggedSet | null | undefined): boolean {
  if (!set) {
    return false
  }

  return (
    numberOrNull(set.reps) !== null ||
    numberOrNull(set.timeSeconds) !== null ||
    numberOrNull(set.weightKg) !== null
  )
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function normalize(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}
