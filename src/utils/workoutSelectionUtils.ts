import type {
  Exercise,
  ExercisePhaseTarget,
  ExerciseVariant,
  TrainingLocation,
} from '../data/workoutPlan'
import type { WorkoutProgramPhase } from '../types/workoutProgram'

export interface ExerciseSlotSelection {
  included?: boolean
  variantIds?: string[]
}

export type WorkoutExerciseSelections = Record<string, ExerciseSlotSelection>

export interface WorkoutDefinitionLike {
  exercises: Exercise[]
  name: string
}

export interface ResolveWorkoutOptions {
  location: TrainingLocation
  programWeek?: number | null
  progressionPhases?: readonly WorkoutProgramPhase[]
  selections?: WorkoutExerciseSelections
}

export function getExerciseSlotKey(exercise: Exercise, index: number): string {
  return `${index}:${exercise.id}`
}

export function getExerciseVariantsForLocation(
  exercise: Exercise,
  location: TrainingLocation,
): ExerciseVariant[] {
  return (exercise.alternatives?.[location] ?? []).map(cloneVariant)
}

export function getDefaultVariantIds(
  exercise: Exercise,
  location: TrainingLocation,
): string[] {
  const available = getExerciseVariantsForLocation(exercise, location)
  if (available.length === 0) return []

  const availableIds = new Set(available.map((variant) => variant.id))
  const requested = (exercise.defaultVariantIds ?? []).filter((id) =>
    availableIds.has(id),
  )
  const primary = available.find((variant) => variant.id === exercise.id)?.id
  const minimum = Math.max(1, exercise.minSelections ?? 1)
  const maximum = Math.max(minimum, exercise.maxSelections ?? minimum)

  if (exercise.selectionMode === 'multiple') {
    const defaults = requested.length > 0
      ? requested
      : [primary, ...available.map((variant) => variant.id)].filter(
          (id): id is string => Boolean(id),
        )
    const unique = [...new Set(defaults)]
    const targetCount = Math.min(
      maximum,
      Math.max(minimum, requested.length > 0 ? requested.length : minimum),
    )
    return unique.slice(0, targetCount)
  }

  return [requested[0] ?? primary ?? available[0].id]
}

export function getExercisePhaseTarget(
  exercise: Exercise,
  programWeek: number | null | undefined,
): ExercisePhaseTarget | undefined {
  if (!programWeek || programWeek < 1) return undefined
  return exercise.phaseTargets?.find((target) =>
    target.weeks.includes(programWeek),
  )
}

export function applyExercisePhaseTarget(
  exercise: Exercise,
  programWeek: number | null | undefined,
  progressionPhases: readonly WorkoutProgramPhase[] = [],
): Exercise {
  const target = getExercisePhaseTarget(exercise, programWeek)
  const phase = getWorkoutProgramPhase(progressionPhases, programWeek)
  if (!target && !phase) return cloneExercise(exercise)

  const repRange = target?.repRange ?? exercise.repRange
  const duration = target?.duration ?? (target?.repRange ? undefined : exercise.duration)
  const sets = target?.sets ?? scaleExerciseSets(exercise, phase)
  return {
    ...cloneExercise(exercise),
    sets,
    repRange,
    duration,
    targetRir:
      exercise.targetRir && phase?.targetRir
        ? phase.targetRir
        : exercise.targetRir,
    guidance: [
      ...(exercise.guidance ?? []),
      ...(target?.guidance ?? []),
    ],
  }
}

export function resolveWorkoutDefinition<T extends WorkoutDefinitionLike>(
  workout: T,
  options: ResolveWorkoutOptions,
): T {
  const selections = options.selections ?? {}
  const exercises = workout.exercises.flatMap((exercise, index) => {
    const key = getExerciseSlotKey(exercise, index)
    const selection = selections[key]
    if (exercise.optional && selection?.included !== true) return []

    const prescribed = applyExercisePhaseTarget(
      exercise,
      options.programWeek,
      options.progressionPhases,
    )
    const variants = getExerciseVariantsForLocation(prescribed, options.location)
    if (variants.length === 0) {
      return prescribed.alternatives ? [] : [stripSlotFields(prescribed)]
    }

    const availableById = new Map(variants.map((variant) => [variant.id, variant]))
    const requestedIds = selection?.variantIds?.filter((id) => availableById.has(id)) ?? []
    const defaultIds = getDefaultVariantIds(prescribed, options.location)
    const minimum = Math.max(1, prescribed.minSelections ?? 1)
    const maximum = Math.max(minimum, prescribed.maxSelections ?? minimum)
    const ids = prescribed.selectionMode === 'multiple'
      ? [...new Set(requestedIds.length > 0 ? requestedIds : defaultIds)].slice(0, maximum)
      : [(requestedIds[0] ?? defaultIds[0])]
    const completedIds = prescribed.selectionMode === 'multiple' && ids.length < minimum
      ? [
          ...ids,
          ...variants
            .map((variant) => variant.id)
            .filter((id) => !ids.includes(id)),
        ].slice(0, minimum)
      : ids

    return completedIds.flatMap((id) => {
      const variant = availableById.get(id)
      return variant ? [materializeVariant(prescribed, variant)] : []
    })
  })

  return {
    ...workout,
    exercises,
  }
}

export function getWorkoutProgramPhase(
  phases: readonly WorkoutProgramPhase[],
  programWeek: number | null | undefined,
): WorkoutProgramPhase | undefined {
  if (!programWeek || programWeek < 1) return undefined
  return phases.find((phase) => phase.weeks.includes(programWeek))
}

function scaleExerciseSets(
  exercise: Exercise,
  phase: WorkoutProgramPhase | undefined,
): number {
  const multiplier = phase?.setVolumeMultiplier
  if (multiplier === undefined || !exercise.targetRir) return exercise.sets
  return Math.max(1, Math.round(exercise.sets * multiplier))
}

function materializeVariant(
  prescription: Exercise,
  variant: ExerciseVariant,
): Exercise {
  const repRange =
    variant.repRange ?? (variant.duration ? undefined : prescription.repRange)
  const duration = variant.duration ?? (variant.repRange ? undefined : prescription.duration)
  return stripSlotFields({
    ...prescription,
    id: variant.id,
    name: variant.name,
    equipment: variant.equipment,
    repRange,
    duration,
    formTips: variant.formTips?.length
      ? [...variant.formTips]
      : [...prescription.formTips],
  })
}

function stripSlotFields(exercise: Exercise): Exercise {
  const {
    alternatives: _alternatives,
    defaultVariantIds: _defaultVariantIds,
    maxSelections: _maxSelections,
    minSelections: _minSelections,
    optional: _optional,
    phaseTargets: _phaseTargets,
    selectionMode: _selectionMode,
    ...resolved
  } = exercise
  return resolved
}

function cloneVariant(variant: ExerciseVariant): ExerciseVariant {
  return {
    ...variant,
    formTips: variant.formTips ? [...variant.formTips] : undefined,
  }
}

function cloneExercise(exercise: Exercise): Exercise {
  return {
    ...exercise,
    formTips: [...exercise.formTips],
    guidance: exercise.guidance ? [...exercise.guidance] : undefined,
    defaultVariantIds: exercise.defaultVariantIds
      ? [...exercise.defaultVariantIds]
      : undefined,
    alternatives: exercise.alternatives
      ? {
          home: exercise.alternatives.home?.map(cloneVariant),
          gym: exercise.alternatives.gym?.map(cloneVariant),
        }
      : undefined,
    phaseTargets: exercise.phaseTargets?.map((target) => ({
      ...target,
      weeks: [...target.weeks],
      guidance: target.guidance ? [...target.guidance] : undefined,
    })),
  }
}
