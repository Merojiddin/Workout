import type { CustomGuidedWorkout } from './customGuidedWorkouts'
import {
  getCustomGuidedWorkouts,
  getDeletedGuidedWorkouts,
  replaceCustomGuidedWorkouts,
} from './customGuidedWorkouts'
import {
  getHiddenGuidedWorkoutIds,
  getHiddenGuidedWorkoutsAt,
  replaceGuidedRemovals,
} from './guidedWorkoutCatalog'

/**
 * The guided catalog as one syncable document.
 *
 * Guided sessions are per-user content that people build on one device and
 * expect on the next, so the catalog rides the same one-row-per-user JSON
 * pattern the pasted programs use. What it cannot borrow from them is their
 * merge rule: programs are replaced wholesale by whatever the cloud holds,
 * which is fine for a single installed program and wrong for a list two
 * devices both add to. Import three sessions on a laptop and two on a phone
 * and you want five, not whichever set synced last.
 *
 * So the merge here is per session, by id, newest `updatedAt` winning. That
 * makes it order-independent: both devices reach the same catalog whichever
 * one syncs first, and a session edited on one device beats its older copy on
 * the other.
 *
 * Deletions need their own record. A merge that only unions the two sides can
 * never delete anything - the device that still has the session hands it back
 * on the next sync - so a delete leaves a tombstone (id -> when), and a
 * session is dropped when its tombstone is newer than the session itself.
 * Re-importing something you deleted still works: the new copy carries a later
 * `updatedAt` than the tombstone, so it wins and the tombstone is discarded.
 */

export interface GuidedCatalogDocument {
  /** The user's own sessions. */
  workouts: CustomGuidedWorkout[]
  /** Deleted sessions: id -> ISO timestamp of the delete. */
  deleted: Record<string, string>
  /** Ids of shipped sessions taken off the list. */
  hidden: string[]
  /** When `hidden` last changed, so the newer of two lists wins. */
  hiddenAt: string
}

/**
 * How long a tombstone is kept. Long enough that a device left in a drawer for
 * a month still learns about the delete when it wakes up; short enough that
 * the document does not grow forever.
 */
const TOMBSTONE_RETENTION_DAYS = 90

const EPOCH = '1970-01-01T00:00:00.000Z'

function toTime(value: unknown): number {
  if (typeof value !== 'string') {
    return 0
  }
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

/** The later of two ISO timestamps, treating unparseable ones as oldest. */
function laterOf(a: string, b: string): string {
  return toTime(a) >= toTime(b) ? a : b
}

/** Accepts anything - a cloud row, a stale local mirror - and makes it usable. */
export function normalizeGuidedCatalog(raw: unknown): GuidedCatalogDocument {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Partial<
    Record<keyof GuidedCatalogDocument, unknown>
  >

  const deleted: Record<string, string> = {}
  if (source.deleted && typeof source.deleted === 'object') {
    for (const [id, at] of Object.entries(source.deleted as Record<string, unknown>)) {
      if (typeof id === 'string' && id && typeof at === 'string' && toTime(at) > 0) {
        deleted[id] = at
      }
    }
  }

  return {
    deleted,
    hidden: Array.isArray(source.hidden)
      ? source.hidden.filter((id): id is string => typeof id === 'string')
      : [],
    hiddenAt: typeof source.hiddenAt === 'string' ? source.hiddenAt : EPOCH,
    workouts: Array.isArray(source.workouts)
      ? (source.workouts.filter(
          (workout) => workout && typeof workout === 'object',
        ) as CustomGuidedWorkout[])
      : [],
  }
}

/** Drops tombstones nothing needs any more, so the document stops growing. */
function pruneTombstones(
  deleted: Record<string, string>,
  now: number,
): Record<string, string> {
  const cutoff = now - TOMBSTONE_RETENTION_DAYS * 24 * 60 * 60 * 1000
  const kept: Record<string, string> = {}
  for (const [id, at] of Object.entries(deleted)) {
    if (toTime(at) >= cutoff) {
      kept[id] = at
    }
  }
  return kept
}

/**
 * Combines two catalogs into the one both devices should end up with.
 *
 * Symmetric on purpose: merge(a, b) and merge(b, a) produce the same catalog,
 * so it does not matter which device syncs first.
 */
export function mergeGuidedCatalogs(
  a: GuidedCatalogDocument,
  b: GuidedCatalogDocument,
): GuidedCatalogDocument {
  const left = normalizeGuidedCatalog(a)
  const right = normalizeGuidedCatalog(b)

  // Deletes first: the winning tombstone per id is the most recent one.
  const deleted: Record<string, string> = { ...left.deleted }
  for (const [id, at] of Object.entries(right.deleted)) {
    deleted[id] = id in deleted ? laterOf(deleted[id], at) : at
  }

  // Then sessions, newest edit per id.
  const byId = new Map<string, CustomGuidedWorkout>()
  for (const workout of [...left.workouts, ...right.workouts]) {
    const existing = byId.get(workout.id)
    if (!existing || toTime(workout.updatedAt) > toTime(existing.updatedAt)) {
      byId.set(workout.id, workout)
    }
  }

  // A session survives its tombstone only if it was saved after the delete,
  // which is what makes re-importing a deleted session work.
  const workouts: CustomGuidedWorkout[] = []
  for (const workout of byId.values()) {
    const deletedAt = deleted[workout.id]
    if (deletedAt && toTime(deletedAt) >= toTime(workout.updatedAt)) {
      continue
    }
    if (deletedAt) {
      delete deleted[workout.id]
    }
    workouts.push(workout)
  }

  // The hidden list is a small preference rather than a collection, so the
  // whole list from the device that touched it last wins.
  const hiddenFrom = toTime(left.hiddenAt) >= toTime(right.hiddenAt) ? left : right

  return {
    deleted: pruneTombstones(deleted, Date.now()),
    hidden: hiddenFrom.hidden,
    hiddenAt: hiddenFrom.hiddenAt,
    workouts: workouts.sort((x, y) => y.updatedAt.localeCompare(x.updatedAt)),
  }
}

/** The catalog as this device currently has it. */
export function readLocalGuidedCatalog(): GuidedCatalogDocument {
  return {
    deleted: getDeletedGuidedWorkouts(),
    hidden: getHiddenGuidedWorkoutIds(),
    hiddenAt: getHiddenGuidedWorkoutsAt(),
    workouts: getCustomGuidedWorkouts(),
  }
}

/**
 * Writes a merged catalog back to this device. Returns false when any part of
 * the write was refused, so a caller can say the sync did not stick.
 */
export function writeLocalGuidedCatalog(document: GuidedCatalogDocument): boolean {
  const normalized = normalizeGuidedCatalog(document)
  const workoutsWritten = replaceCustomGuidedWorkouts(normalized.workouts)
  const removalsWritten = replaceGuidedRemovals(
    normalized.hidden,
    normalized.hiddenAt,
    normalized.deleted,
  )
  return workoutsWritten && removalsWritten
}

/** True when the catalog holds nothing worth a cloud round trip. */
export function isEmptyGuidedCatalog(document: GuidedCatalogDocument): boolean {
  return (
    document.workouts.length === 0 &&
    document.hidden.length === 0 &&
    Object.keys(document.deleted).length === 0
  )
}
