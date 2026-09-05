import { Activity, Flame, PersonStanding, Waves } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { GuidedExercise } from './guidedExercises'

/**
 * Guided workouts: follow-along sessions that run as one continuous timeline.
 *
 * Everything a workout is made of lives in this file. A new workout is a new
 * object in `guidedWorkouts` - name it, pick a category, list the movements in
 * the order they should run, and give each one its seconds. The player, the
 * timeline, the audio guide and the progress bar are all derived from that;
 * none of them knows about any particular workout.
 *
 * A step names a movement from `guidedExercises` by id. When a workout needs
 * something the catalog does not have, it can define the movement inline
 * instead - same fields, including its own GIF/video URL and instructions.
 */

export type GuidedCategoryId = 'cardio' | 'posture' | 'abs' | 'mobility'

export type GuidedLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export interface GuidedCategory {
  id: GuidedCategoryId
  name: string
  description: string
  icon: LucideIcon
  /** Which accent the category's cards and the player's ring are drawn in. */
  accent: 'cyan' | 'orange' | 'blue' | 'purple'
}

export interface GuidedWorkoutStep {
  /** A movement from the guided catalog. */
  exerciseId?: string
  /** A movement defined here instead, for something the catalog lacks. */
  exercise?: GuidedExercise
  /** Seconds of work. Falls back to the workout's `workSeconds`. */
  seconds?: number
  /** Seconds of rest after it. Falls back to `restSeconds`; 0 means none. */
  restSeconds?: number
  /** Replaces the catalog's coaching line for this workout only. */
  cue?: string
}

export interface GuidedWorkout {
  id: string
  categoryId: GuidedCategoryId
  name: string
  description: string
  level: GuidedLevel
  /** Get-ready countdown before the first movement. */
  prepareSeconds?: number
  /** How many times the whole step list runs. Defaults to 1. */
  rounds?: number
  /** The longer break between rounds. Falls back to `restSeconds`. */
  roundRestSeconds?: number
  /** Default seconds of work for a step that does not name its own. */
  workSeconds: number
  /** Default seconds of rest after a step. */
  restSeconds: number
  /** Empty means bodyweight and a bit of floor. */
  equipment?: string[]
  /** Two or three words each: what the session is for. */
  focus?: string[]
  steps: GuidedWorkoutStep[]
}

/**
 * The categories, in the order they appear. Adding one is a new entry here
 * plus workouts that point at its id.
 */
export const guidedCategories: readonly GuidedCategory[] = [
  {
    id: 'cardio',
    name: 'Cardio / HIIT',
    description: 'Short bursts of work with timed rest. Gets the heart rate up fast.',
    icon: Flame,
    accent: 'orange',
  },
  {
    id: 'abs',
    name: 'Abs',
    description: 'Core circuits held for time, floor-based and equipment free.',
    icon: Activity,
    accent: 'cyan',
  },
  {
    id: 'posture',
    name: 'Posture Correction',
    description: 'Undo a day at a desk: upper back, neck and hip position.',
    icon: PersonStanding,
    accent: 'blue',
  },
  {
    id: 'mobility',
    name: 'Mobility / Stretching',
    description: 'Longer holds for range of motion, warm-ups and cool-downs.',
    icon: Waves,
    accent: 'purple',
  },
]

export const guidedWorkouts: readonly GuidedWorkout[] = [
  // --------------------------------------------------------- cardio / HIIT
  {
    id: 'cardio-classic-hiit',
    categoryId: 'cardio',
    name: 'Classic HIIT',
    description:
      'The standard thirty-on, ten-off circuit through five bodyweight movements.',
    level: 'Intermediate',
    focus: ['Conditioning', 'Fat loss'],
    prepareSeconds: 10,
    rounds: 3,
    roundRestSeconds: 30,
    workSeconds: 30,
    restSeconds: 10,
    steps: [
      { exerciseId: 'jumping-jacks' },
      { exerciseId: 'high-knees' },
      { exerciseId: 'mountain-climbers' },
      { exerciseId: 'squat-jumps' },
      { exerciseId: 'burpees' },
    ],
  },
  {
    id: 'cardio-express-burner',
    categoryId: 'cardio',
    name: 'Express Burner',
    description: 'Eight hard minutes when that is all the time there is.',
    level: 'Advanced',
    focus: ['Conditioning', 'Full body'],
    prepareSeconds: 10,
    rounds: 4,
    roundRestSeconds: 25,
    workSeconds: 30,
    restSeconds: 15,
    steps: [
      { exerciseId: 'burpees' },
      { exerciseId: 'squat-jumps' },
      { exerciseId: 'mountain-climbers' },
      { exerciseId: 'plank-jacks' },
    ],
  },
  {
    id: 'cardio-low-impact',
    categoryId: 'cardio',
    name: 'No-Jump Cardio',
    description:
      'The same work with one foot always on the floor - easy on knees and on neighbours.',
    level: 'Beginner',
    focus: ['Low impact', 'Conditioning'],
    prepareSeconds: 10,
    rounds: 2,
    roundRestSeconds: 30,
    workSeconds: 40,
    restSeconds: 20,
    steps: [
      { exerciseId: 'marching-on-spot' },
      { exerciseId: 'step-jacks' },
      { exerciseId: 'ankle-touches' },
      { exerciseId: 'front-kicks' },
      { exerciseId: 'slow-burpees' },
      { exerciseId: 'bodyweight-squats' },
    ],
  },
  {
    id: 'cardio-first-session',
    categoryId: 'cardio',
    name: 'First Cardio Session',
    description: 'Six minutes, generous rest, nothing that needs coordination.',
    level: 'Beginner',
    focus: ['Starter', 'Low impact'],
    prepareSeconds: 15,
    rounds: 2,
    roundRestSeconds: 30,
    workSeconds: 30,
    restSeconds: 25,
    steps: [
      { exerciseId: 'marching-on-spot' },
      { exerciseId: 'step-jacks' },
      { exerciseId: 'bodyweight-squats' },
    ],
  },

  // ------------------------------------------------------------------- abs
  {
    id: 'abs-core-basics',
    categoryId: 'abs',
    name: 'Core Basics',
    description: 'Four movements that teach the shape everything else needs.',
    level: 'Beginner',
    focus: ['Core', 'Technique'],
    prepareSeconds: 10,
    rounds: 2,
    roundRestSeconds: 30,
    workSeconds: 30,
    restSeconds: 15,
    steps: [
      { exerciseId: 'crunch' },
      { exerciseId: 'reverse-crunch' },
      { exerciseId: 'dead-bug' },
      { exerciseId: 'plank', seconds: 30 },
    ],
  },
  {
    id: 'abs-six-pack-burner',
    categoryId: 'abs',
    name: 'Ab Burner',
    description: 'Six movements, three rounds, ten seconds between each.',
    level: 'Intermediate',
    focus: ['Core', 'Endurance'],
    prepareSeconds: 10,
    rounds: 3,
    roundRestSeconds: 30,
    workSeconds: 35,
    restSeconds: 10,
    steps: [
      { exerciseId: 'bicycle-crunch' },
      { exerciseId: 'leg-raise' },
      { exerciseId: 'flutter-kicks' },
      { exerciseId: 'russian-twist' },
      { exerciseId: 'heel-touches' },
      { exerciseId: 'hollow-hold', seconds: 25 },
    ],
  },
  {
    id: 'abs-plank-challenge',
    categoryId: 'abs',
    name: 'Plank Challenge',
    description: 'Every plank there is, held back to back.',
    level: 'Advanced',
    focus: ['Core', 'Isometric'],
    prepareSeconds: 10,
    rounds: 2,
    roundRestSeconds: 40,
    workSeconds: 40,
    restSeconds: 20,
    steps: [
      { exerciseId: 'plank' },
      { exerciseId: 'side-plank' },
      { exerciseId: 'hip-raise-plank' },
      { exerciseId: 'plank-jacks', seconds: 30 },
      { exerciseId: 'reverse-plank', seconds: 30 },
    ],
  },
  {
    id: 'abs-standing',
    categoryId: 'abs',
    name: 'Standing Abs',
    description: 'Core work with no floor needed - good for a hotel room or an office.',
    level: 'Beginner',
    focus: ['Core', 'No floor'],
    prepareSeconds: 10,
    rounds: 2,
    roundRestSeconds: 30,
    workSeconds: 35,
    restSeconds: 15,
    steps: [
      { exerciseId: 'torso-rotation' },
      { exerciseId: 'ankle-touches' },
      { exerciseId: 'high-knees', seconds: 30 },
      { exerciseId: 'front-kicks' },
    ],
  },

  // ---------------------------------------------------- posture correction
  {
    id: 'posture-desk-reset',
    categoryId: 'posture',
    name: 'Desk Reset',
    description: 'Six minutes to undo a morning hunched over a laptop.',
    level: 'Beginner',
    focus: ['Neck', 'Upper back'],
    prepareSeconds: 10,
    rounds: 1,
    workSeconds: 45,
    restSeconds: 10,
    steps: [
      { exerciseId: 'chin-tuck' },
      { exerciseId: 'neck-stretch', seconds: 60 },
      { exerciseId: 'back-slaps' },
      { exerciseId: 'chest-stretch' },
      { exerciseId: 'reach-up-rotation' },
      { exerciseId: 'cat-cow' },
      { exerciseId: 'wall-walks' },
    ],
  },
  {
    id: 'posture-upper-back',
    categoryId: 'posture',
    name: 'Upper Back Strength',
    description:
      'The pulling and lifting work that holds a straight posture up once it is stretched.',
    level: 'Intermediate',
    focus: ['Upper back', 'Shoulders'],
    equipment: ['Resistance bands'],
    prepareSeconds: 10,
    rounds: 2,
    roundRestSeconds: 30,
    workSeconds: 35,
    restSeconds: 15,
    steps: [
      { exerciseId: 'prone-w-raise' },
      { exerciseId: 'superman' },
      { exerciseId: 'band-reverse-fly' },
      { exerciseId: 'face-pull' },
      { exerciseId: 'wall-push-up' },
    ],
  },
  {
    id: 'posture-foundation',
    categoryId: 'posture',
    name: 'Posture Foundation',
    description: 'Rib position, hip position, and holding both while you move.',
    level: 'Beginner',
    focus: ['Core', 'Hips'],
    prepareSeconds: 10,
    rounds: 2,
    roundRestSeconds: 30,
    workSeconds: 35,
    restSeconds: 15,
    steps: [
      { exerciseId: 'dead-bug' },
      { exerciseId: 'bird-dog' },
      { exerciseId: 'good-morning' },
      { exerciseId: 'superman' },
      { exerciseId: 'plank', seconds: 30 },
      { exerciseId: 'chin-tuck', seconds: 30 },
    ],
  },

  // ------------------------------------------------- mobility / stretching
  {
    id: 'mobility-full-body',
    categoryId: 'mobility',
    name: 'Full Body Stretch',
    description: 'Head to heel, forty-five seconds a hold, one time through.',
    level: 'Beginner',
    focus: ['Flexibility', 'Cool-down'],
    prepareSeconds: 10,
    rounds: 1,
    workSeconds: 45,
    restSeconds: 5,
    steps: [
      { exerciseId: 'neck-stretch', seconds: 60 },
      { exerciseId: 'shoulder-stretch', seconds: 60 },
      { exerciseId: 'lat-stretch' },
      { exerciseId: 'cobra-stretch' },
      { exerciseId: 'standing-hamstring-stretch' },
      { exerciseId: 'quad-stretch', seconds: 60 },
      { exerciseId: 'butterfly-stretch' },
      { exerciseId: 'calf-stretch' },
      { exerciseId: 'downward-dog' },
    ],
  },
  {
    id: 'mobility-morning',
    categoryId: 'mobility',
    name: 'Morning Mobility',
    description: 'Moving stretches to start the day, nothing held for long.',
    level: 'Beginner',
    focus: ['Warm-up', 'Full body'],
    prepareSeconds: 10,
    rounds: 2,
    roundRestSeconds: 20,
    workSeconds: 40,
    restSeconds: 10,
    steps: [
      { exerciseId: 'cat-cow' },
      { exerciseId: 'downward-dog' },
      { exerciseId: 'low-lunge', seconds: 60 },
      { exerciseId: 'lunge-twist' },
      { exerciseId: 'dynamic-chest-stretch' },
      { exerciseId: 'dynamic-back-stretch' },
    ],
  },
  {
    id: 'mobility-hips-lower-back',
    categoryId: 'mobility',
    name: 'Hips And Lower Back',
    description: 'For hips that have been folded into a chair all day.',
    level: 'Beginner',
    focus: ['Hips', 'Lower back'],
    prepareSeconds: 10,
    rounds: 1,
    workSeconds: 45,
    restSeconds: 10,
    steps: [
      { exerciseId: 'cat-cow' },
      { exerciseId: 'hip-flexor-stretch', seconds: 60 },
      { exerciseId: 'lunge-stretch', seconds: 60 },
      { exerciseId: 'butterfly-stretch' },
      { exerciseId: 'lying-hamstring-stretch', seconds: 60 },
      { exerciseId: 'cobra-stretch' },
    ],
  },
  {
    id: 'mobility-wind-down',
    categoryId: 'mobility',
    name: 'Wind Down',
    description: 'Five easy floor holds to finish a session or a day.',
    level: 'Beginner',
    focus: ['Cool-down', 'Relaxation'],
    prepareSeconds: 10,
    rounds: 1,
    workSeconds: 50,
    restSeconds: 5,
    steps: [
      { exerciseId: 'lying-hamstring-stretch', seconds: 60 },
      { exerciseId: 'butterfly-stretch' },
      { exerciseId: 'cat-cow' },
      { exerciseId: 'cobra-stretch' },
      { exerciseId: 'neck-stretch', seconds: 60 },
    ],
  },
]
