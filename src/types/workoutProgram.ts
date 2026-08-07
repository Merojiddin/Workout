import type { Exercise, WorkoutDay } from '../data/workoutPlan'

export interface WorkoutProgramRules {
  effort?: string[]
  progression?: string[]
  postureCue?: string
  returnAfterBreak?: string[]
  rest?: string[]
  substitutions?: string[]
  safety?: string[]
  optionalNeckWork?: string[]
}

export interface WorkoutProgramPhase {
  weeks: number[]
  name: string
  volumeGuidance: string
  rirGuidance: string
  /** Scales resistance-work sets without overriding explicit phase targets. */
  setVolumeMultiplier?: number
  /** Overrides the ordinary exercise target for this phase when supplied. */
  targetRir?: string
  priorities: string[]
  restrictions?: string[]
  assessmentItems?: string[]
}

export interface WorkoutProgramCoaching {
  proteinMinGrams?: number
  proteinDefaultGrams?: number
  proteinMaxGrams?: number
  creatineDailyGrams?: string
  sleepHours?: string
  targetWeightLossKgPerWeek?: string
  stalledTrendGuidance?: string
  fastLossGuidance?: string
  healthContext?: string[]
}

export interface StandaloneWorkout {
  id: string
  name: string
  description: string
  recommendedUse: string
  estimatedTime: string
  focus: string[]
  rules?: string[]
  progressionMode?: 'standard' | 'reentry'
  exercises: Exercise[]
}

export interface WorkoutProgram {
  id: string
  name: string
  version: string
  updatedAt: string
  description: string
  durationWeeks?: number
  normalWeeklyDays?: number
  goals?: string[]
  benchmarkExerciseIds?: string[]
  rules?: WorkoutProgramRules
  progressionPhases?: WorkoutProgramPhase[]
  coaching?: WorkoutProgramCoaching
  days: WorkoutDay[]
  standaloneWorkouts?: StandaloneWorkout[]
}

export interface WorkoutProgramValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}
