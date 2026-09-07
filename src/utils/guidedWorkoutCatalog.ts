import { guidedWorkouts, type GuidedWorkout } from '../data/guidedWorkouts'
import { deleteCustomGuidedWorkout, getCustomGuidedWorkouts } from './customGuidedWorkouts'
import { HIDDEN_GUIDED_WORKOUTS_KEY, safeGetJSON, safeSetJSON } from './storageUtils'

/**
 * Which guided sessions this account actually has.
 *
 * There are two kinds and they are removed in two different ways. A session
 * the user built or imported is theirs, so deleting it deletes it. A session
 * that ships with the app lives in code and cannot be deleted at all - what is
 * stored instead is the id, and the catalog stops offering it. That keeps the
 * removal reversible, which matters: nobody who tidies up their list expects
 * the app to have thrown away something it came with.
 */

/** Ids of the shipped sessions this account has removed. */
export function getHiddenGuidedWorkoutIds(): string[] {
  try {
    const stored = safeGetJSON(HIDDEN_GUIDED_WORKOUTS_KEY, [])
    return Array.isArray(stored)
      ? stored.filter((id): id is string => typeof id === 'string')
      : []
  } catch {
    return []
  }
}

/** Every session on offer: the user's own first, then the shipped ones they kept. */
export function getAvailableGuidedWorkouts(): GuidedWorkout[] {
  const hidden = new Set(getHiddenGuidedWorkoutIds())

  return [
    ...getCustomGuidedWorkouts(),
    ...guidedWorkouts.filter((workout) => !hidden.has(workout.id)),
  ]
}

/** The shipped sessions currently removed, so they can be offered back. */
export function getRemovedGuidedWorkouts(): GuidedWorkout[] {
  const hidden = new Set(getHiddenGuidedWorkoutIds())
  return guidedWorkouts.filter((workout) => hidden.has(workout.id))
}

/**
 * Takes a session out of the list. Returns false when storage refused, so the
 * screen can say it is still there rather than closing on a lie.
 */
export function removeGuidedWorkout(workout: GuidedWorkout): boolean {
  if (workout.custom) {
    return deleteCustomGuidedWorkout(workout.id)
  }

  const hidden = getHiddenGuidedWorkoutIds()
  if (hidden.includes(workout.id)) {
    return true
  }
  return Boolean(safeSetJSON(HIDDEN_GUIDED_WORKOUTS_KEY, [...hidden, workout.id]))
}

/** Puts one removed shipped session back. */
export function restoreGuidedWorkout(id: string): boolean {
  const remaining = getHiddenGuidedWorkoutIds().filter((hiddenId) => hiddenId !== id)
  return Boolean(safeSetJSON(HIDDEN_GUIDED_WORKOUTS_KEY, remaining))
}

/** Puts every removed shipped session back. */
export function restoreAllGuidedWorkouts(): boolean {
  return Boolean(safeSetJSON(HIDDEN_GUIDED_WORKOUTS_KEY, []))
}
