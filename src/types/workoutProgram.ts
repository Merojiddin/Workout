import type { Exercise, WorkoutDay } from '../data/workoutPlan'

export interface WorkoutProgramRules {
  effort?: string[]
  progression?: string[]
  postureCue?: string
  returnAfterBreak?: string[]
}

export interface StandaloneWorkout {
  id: string
  name: string
  description: string
  recommendedUse: string
  estimatedTime: string
  focus: string[]
  rules?: string[]
  exercises: Exercise[]
}

export interface WorkoutProgram {
  id: string
  name: string
  version: string
  updatedAt: string
  description: string
  goals?: string[]
  benchmarkExerciseIds?: string[]
  rules?: WorkoutProgramRules
  days: WorkoutDay[]
  standaloneWorkouts?: StandaloneWorkout[]
}

export interface WorkoutProgramValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}
