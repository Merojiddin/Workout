/**
 * Shared shape of a workout day and its exercises.
 *
 * Program content itself lives in src/data/workout-programs/*.json and is read
 * through the registry; this module only describes the structure that both
 * bundled and pasted programs normalize into.
 */
export type TrainingLocation = 'home' | 'gym'

export interface ExerciseVariant {
  id: string
  name: string
  equipment: string
  /** Optional variation-specific target when a substitution uses another range. */
  repRange?: string
  duration?: string
  formTips?: string[]
}

export interface ExerciseAlternatives {
  home?: ExerciseVariant[]
  gym?: ExerciseVariant[]
}

export interface ExercisePhaseTarget {
  weeks: number[]
  sets?: number
  repRange?: string
  duration?: string
  guidance?: string[]
}

export interface Exercise {
  /** Home/gym choices for one movement slot. Only selected variants are logged. */
  alternatives?: ExerciseAlternatives
  /** Optional slots are excluded until the user explicitly includes them. */
  optional?: boolean
  /** Multi-select is reserved for short choose-a-few recovery routines. */
  selectionMode?: 'single' | 'multiple'
  minSelections?: number
  maxSelections?: number
  defaultVariantIds?: string[]
  /** Week-specific prescriptions such as boxing round progressions. */
  phaseTargets?: ExercisePhaseTarget[]
  guidance?: string[]
  targetRir?: string
  duration?: string
  equipment: string
  formTips: string[]
  id: string
  muscleGroup: string
  name: string
  repRange?: string
  restSeconds: number
  sets: number
}

export interface WorkoutDay {
  day: number
  estimatedTime: string
  exercises: Exercise[]
  focus: string[]
  name: string
}
