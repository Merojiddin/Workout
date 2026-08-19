import {
  getMovementFamily,
  resolveExerciseLibraryEntry,
} from '../data/exerciseIdentity'
import type { LibraryExercise } from '../data/exerciseLibrary'
import type { ActiveExerciseVariant } from './liveWorkoutUtils'

/**
 * Swap options derived from the exercise library, for slots the program left
 * without alternatives.
 *
 * The program's own `alternatives` are always preferred: an author who names
 * them has judged those movements equivalent for the slot. But that block is
 * optional, and a program written without it used to lose the swap button
 * everywhere -- the busy rack still ends the workout. These are the fallback:
 * movements the library says train the same thing.
 */

/** Enough to find a free station, few enough to read at a glance mid-set. */
const MAX_LIBRARY_ALTERNATIVES = 8

/** Family match beats a shared muscle, which beats matching equipment. */
const FAMILY_SCORE = 100
const MUSCLE_SCORE = 12
const CATEGORY_SCORE = 20
const EQUIPMENT_SCORE = 3
/** Big enough to sink a different pattern below every honest match. */
const FAMILY_MISMATCH_PENALTY = 40

/** The live-session fields this needs; a subset of `ActiveExercise`. */
export interface SwapSlot {
  exerciseId: string
  exerciseName: string
  muscleGroup: string
  equipment: string
}

/**
 * Alternatives for a slot, as the swap sheet wants them: the movement
 * currently in the slot first, then its substitutes, best match first.
 *
 * Returns an empty list rather than a single-entry one when nothing matches,
 * so callers can treat "has options" as `length > 1` exactly as they do for
 * program-authored variants.
 */
export function getLibrarySwapOptions(
  slot: SwapSlot,
  library: readonly LibraryExercise[],
  limit: number = MAX_LIBRARY_ALTERNATIVES,
): ActiveExerciseVariant[] {
  const current = resolveExerciseLibraryEntry(
    { exerciseId: slot.exerciseId, exerciseName: slot.exerciseName },
    { library },
  )

  // An unmatched exercise (a movement the program invented) still has the
  // muscle group its author wrote, which is enough to search on.
  const family = current ? getMovementFamily(current.id) : null
  const muscles = new Set(
    (current ? current.primaryMuscles : [slot.muscleGroup]).map(lower),
  )
  const category = current ? lower(current.category) : lower(slot.muscleGroup)
  const equipment = lower(slot.equipment)

  const scored = library.flatMap((candidate) => {
    if (current ? candidate.id === current.id : isSameMovement(candidate, slot)) {
      return []
    }

    const candidateFamily = getMovementFamily(candidate.id)
    const familyMatch = family !== null && candidateFamily === family
    // Two known families that disagree are two different movement patterns:
    // a squat shares glutes with a Romanian deadlift without being a
    // substitute for one. Ranked below everything else rather than dropped,
    // because a taken rack is still a reason to reach for one.
    const familyMismatch =
      family !== null && candidateFamily !== null && candidateFamily !== family
    const categoryMatch = category !== '' && lower(candidate.category) === category
    const muscleOverlap = candidate.primaryMuscles.filter((muscle) =>
      muscles.has(lower(muscle)),
    ).length

    // A shared category alone pairs a Romanian deadlift with a calf raise.
    // Demand a shared muscle too, unless the slot never resolved to a library
    // entry -- there the category is all the signal there is.
    const related =
      familyMatch || (categoryMatch && (muscleOverlap > 0 || !current))
    if (!related) {
      return []
    }

    const score =
      (familyMatch ? FAMILY_SCORE : 0) +
      (categoryMatch && !familyMismatch ? CATEGORY_SCORE : 0) +
      muscleOverlap * MUSCLE_SCORE +
      (sharesEquipment(candidate, equipment) ? EQUIPMENT_SCORE : 0) -
      (familyMismatch ? FAMILY_MISMATCH_PENALTY : 0)

    return [{ candidate, score }]
  })

  if (scored.length === 0) {
    return []
  }

  // Name breaks ties so the list does not reshuffle between renders.
  scored.sort(
    (left, right) =>
      right.score - left.score ||
      left.candidate.name.localeCompare(right.candidate.name),
  )

  return [
    {
      id: slot.exerciseId,
      name: slot.exerciseName,
      equipment: slot.equipment,
      repRange: '',
      duration: '',
    },
    ...scored.slice(0, limit).map(({ candidate }) => ({
      id: candidate.id,
      name: candidate.name,
      equipment: candidate.equipment.join(' / '),
      // Empty on purpose: a library substitute keeps the slot's own sets and
      // rep target rather than inventing one of its own.
      repRange: '',
      duration: '',
    })),
  ]
}

function isSameMovement(candidate: LibraryExercise, slot: SwapSlot): boolean {
  return (
    candidate.id === slot.exerciseId ||
    lower(candidate.name) === lower(slot.exerciseName)
  )
}

/**
 * The slot's equipment is free text from the program ("Dumbbells / Bench"),
 * so this is a substring test in both directions rather than an exact match.
 */
function sharesEquipment(candidate: LibraryExercise, equipment: string): boolean {
  if (!equipment) {
    return false
  }

  return candidate.equipment.some((tag) => {
    const item = lower(tag)
    return item !== '' && (equipment.includes(item) || item.includes(equipment))
  })
}

function lower(value: string): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}
