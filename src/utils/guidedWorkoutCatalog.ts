import { guidedWorkouts, type GuidedWorkout } from '../data/guidedWorkouts'
import {
  deleteCustomGuidedWorkout,
  getCustomGuidedWorkouts,
  replaceDeletedGuidedWorkouts,
} from './customGuidedWorkouts'
import {
  HIDDEN_GUIDED_WORKOUTS_AT_KEY,
  HIDDEN_GUIDED_WORKOUTS_KEY,
  safeGetJSON,
  safeSetJSON,
} from './storageUtils'

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

/**
 * When the hidden list last changed. The catalog syncs across devices and the
 * hidden list is merged whole rather than per id, so this is what decides
 * which device's list wins.
 */
export function getHiddenGuidedWorkoutsAt(): string {
  const stored = safeGetJSON(HIDDEN_GUIDED_WORKOUTS_AT_KEY, '')
  return typeof stored === 'string' && stored ? stored : '1970-01-01T00:00:00.000Z'
}

/** Writes the hidden list and stamps when it changed, so a sync can order it. */
function writeHiddenGuidedWorkoutIds(ids: string[]): boolean {
  if (!safeSetJSON(HIDDEN_GUIDED_WORKOUTS_KEY, ids)) {
    return false
  }
  safeSetJSON(HIDDEN_GUIDED_WORKOUTS_AT_KEY, new Date().toISOString())
  return true
}

/**
 * Puts a merged catalog's removals back on this device in one go. Takes the
 * timestamp rather than stamping a new one: this is the sync writing back what
 * both devices agreed on, not the user changing their list.
 */
export function replaceGuidedRemovals(
  hidden: string[],
  hiddenAt: string,
  deleted: Record<string, string>,
): boolean {
  const hiddenWritten =
    Boolean(safeSetJSON(HIDDEN_GUIDED_WORKOUTS_KEY, hidden)) &&
    Boolean(safeSetJSON(HIDDEN_GUIDED_WORKOUTS_AT_KEY, hiddenAt))
  return replaceDeletedGuidedWorkouts(deleted) && hiddenWritten
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
  return writeHiddenGuidedWorkoutIds([...hidden, workout.id])
}

/** Puts one removed shipped session back. */
export function restoreGuidedWorkout(id: string): boolean {
  const remaining = getHiddenGuidedWorkoutIds().filter((hiddenId) => hiddenId !== id)
  return writeHiddenGuidedWorkoutIds(remaining)
}

/** Puts every removed shipped session back. */
export function restoreAllGuidedWorkouts(): boolean {
  return writeHiddenGuidedWorkoutIds([])
}
