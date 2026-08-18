import type { LoggedExercise, LoggedSet, WorkoutSession } from '../data/workoutSessions'

export interface PersonalRecord {
  exerciseName: string
  weightKg: number
  reps: number | null
  date: string
}

export interface MuscleShare {
  muscleGroup: string
  sets: number
  share: number
}

/**
 * Heaviest set ever logged per exercise, best first.
 *
 * Deliberately not an estimated 1RM: the app never asks for a true max, and
 * presenting a formula's guess as a "record" would be inventing a number the
 * user never lifted.
 */
export function getPersonalRecords(
  sessions: WorkoutSession[],
  limit = 5,
): PersonalRecord[] {
  const best = new Map<string, PersonalRecord>()

  for (const session of safeArray<WorkoutSession>(sessions)) {
    for (const exercise of safeArray<LoggedExercise>(session?.exercises)) {
      const name = text(exercise?.exerciseName)
      if (!name) {
        continue
      }

      for (const set of safeArray<LoggedSet>(exercise?.sets)) {
        const weightKg = positive(set?.weightKg)
        if (weightKg === null) {
          continue
        }

        const current = best.get(name)
        if (!current || weightKg > current.weightKg) {
          best.set(name, {
            exerciseName: name,
            weightKg,
            reps: positive(set?.reps),
            date: text(session?.date),
          })
        }
      }
    }
  }

  return [...best.values()]
    .sort((left, right) => right.weightKg - left.weightKg)
    .slice(0, limit)
}

/**
 * Share of the training week by muscle group, counted in sets actually worked
 * through. Sets are the honest unit here -- counting exercises would rate a
 * two-set finisher the same as a five-set main lift.
 */
export function getMuscleFocus(
  sessions: WorkoutSession[],
  limit = 6,
): MuscleShare[] {
  const counts = new Map<string, number>()
  let total = 0

  for (const session of safeArray<WorkoutSession>(sessions)) {
    for (const exercise of safeArray<LoggedExercise>(session?.exercises)) {
      const group = primaryMuscleGroup(exercise?.muscleGroup)
      if (!group) {
        continue
      }

      const sets = safeArray<LoggedSet>(exercise?.sets).filter(isWorkedSet).length
      if (sets === 0) {
        continue
      }

      counts.set(group, (counts.get(group) ?? 0) + sets)
      total += sets
    }
  }

  if (total === 0) {
    return []
  }

  return [...counts.entries()]
    .map(([muscleGroup, sets]) => ({
      muscleGroup,
      sets,
      share: sets / total,
    }))
    .sort((left, right) => right.sets - left.sets)
    .slice(0, limit)
}

/** Total sets worked through across the given sessions. */
export function countWorkedSets(sessions: WorkoutSession[]): number {
  return safeArray<WorkoutSession>(sessions).reduce(
    (total, session) =>
      total +
      safeArray<LoggedExercise>(session?.exercises).reduce(
        (count, exercise) =>
          count + safeArray<LoggedSet>(exercise?.sets).filter(isWorkedSet).length,
        0,
      ),
    0,
  )
}

/**
 * Programs label a slot with every muscle it touches ("Quads / Glutes /
 * Adductors / Core"). The first is the one the movement is chosen for, and
 * splitting the credit evenly would flatten every chart to the same shape.
 */
function primaryMuscleGroup(value: unknown): string {
  const raw = text(value)
  if (!raw) {
    return ''
  }

  const first = raw.split(/[/,]/)[0]?.trim() ?? ''
  if (!first) {
    return ''
  }

  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
}

function isWorkedSet(set: LoggedSet | null | undefined): boolean {
  if (!set) {
    return false
  }

  return (
    positive(set.reps) !== null ||
    positive(set.timeSeconds) !== null ||
    Boolean(set.completedAt)
  )
}

function positive(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}
