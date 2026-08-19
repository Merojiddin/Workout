import type { Slug } from 'react-muscle-highlighter'

/**
 * Muscle diagram mapping.
 *
 * Our library names muscles the way a lifter would ("Lats", "Rear Shoulders",
 * "Lower Abs"); the body-map component only knows 23 anatomical regions. This
 * translates one to the other, so the Muscles tab can shade the worked areas.
 *
 * Where our label is finer than the diagram, several labels collapse onto the
 * same region (all three deltoid heads are "deltoids"; "Lats" and "Upper Back"
 * both land on "upper-back"). Where a label has no body region at all -
 * "Heart & Lungs", "Boxing Skill", "Cardiovascular System" - it maps to nothing
 * and is simply not shaded rather than being shown on the wrong body part.
 */
const MUSCLE_REGIONS: Record<string, Slug[]> = {
  // Torso - front
  chest: ['chest'],
  'upper chest': ['chest'],
  serratus: ['chest'],
  abs: ['abs'],
  'lower abs': ['abs'],
  core: ['abs'],
  obliques: ['obliques'],

  // Torso - back
  back: ['upper-back', 'lower-back'],
  'upper back': ['upper-back'],
  lats: ['upper-back'],
  'lower back': ['lower-back'],
  traps: ['trapezius'],
  'lower traps': ['trapezius'],

  // Shoulders + arms
  shoulders: ['deltoids'],
  'front shoulders': ['deltoids'],
  'side shoulders': ['deltoids'],
  'rear shoulders': ['deltoids'],
  'external rotators': ['deltoids'],
  biceps: ['biceps'],
  brachialis: ['biceps'],
  triceps: ['triceps'],
  forearms: ['forearm'],
  grip: ['forearm'],

  // Hips + legs
  glutes: ['gluteal'],
  hips: ['gluteal'],
  quads: ['quadriceps'],
  'hip flexors': ['quadriceps'],
  hamstrings: ['hamstring'],
  adductors: ['adductors'],
  legs: ['quadriceps', 'hamstring', 'calves'],
  calves: ['calves'],
  soleus: ['calves'],
  'tibialis anterior': ['tibialis'],
  'ankle dorsiflexors': ['tibialis'],
  'foot stabilizers': ['feet'],

  // Neck
  'neck flexors': ['neck'],
  'neck extensors': ['neck'],
  'deep neck flexors': ['neck'],
  'lateral neck flexors': ['neck'],
}

/**
 * Body regions for a list of muscle labels, de-duplicated and order-stable.
 * Unknown or non-anatomical labels are dropped.
 */
export function musclesToRegions(muscles: readonly string[] | undefined): Slug[] {
  if (!muscles) {
    return []
  }

  const regions: Slug[] = []
  for (const muscle of muscles) {
    if (typeof muscle !== 'string') {
      continue
    }
    for (const region of MUSCLE_REGIONS[muscle.trim().toLowerCase()] ?? []) {
      if (!regions.includes(region)) {
        regions.push(region)
      }
    }
  }
  return regions
}

/**
 * True when at least one muscle can be shown on the diagram. Used to hide the
 * body map entirely for cardio and skill work instead of rendering a blank body.
 */
export function hasDiagrammableMuscles(
  ...muscleLists: (readonly string[] | undefined)[]
): boolean {
  return muscleLists.some((list) => musclesToRegions(list).length > 0)
}
