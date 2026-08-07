import type { WorkoutProgramValidationResult } from '../types/workoutProgram'

export interface WorkoutProgramValidationOptions {
  knownExerciseIds?: Set<string>
  requireKnownExercises?: boolean
}

export function validateWorkoutProgram(
  program: unknown,
  options: WorkoutProgramValidationOptions = {},
): WorkoutProgramValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!isPlainObject(program)) {
    return {
      valid: false,
      errors: ['Program is not an object.'],
      warnings,
    }
  }

  if (!isNonEmptyString(program.id)) {
    errors.push('Missing or empty program id.')
  }
  if (!isNonEmptyString(program.name)) {
    errors.push('Missing or empty name.')
  }
  if (!isNonEmptyString(program.version)) {
    errors.push('Missing or empty version.')
  }
  if (!isValidDateString(program.updatedAt)) {
    errors.push('Missing or invalid updatedAt.')
  }
  if (
    program.durationWeeks !== undefined &&
    !isPositiveInteger(program.durationWeeks)
  ) {
    errors.push('durationWeeks must be a positive integer when supplied.')
  }
  if (
    program.normalWeeklyDays !== undefined &&
    !isPositiveInteger(program.normalWeeklyDays)
  ) {
    errors.push('normalWeeklyDays must be a positive integer when supplied.')
  }

  if (
    program.description === undefined ||
    (typeof program.description === 'string' &&
      program.description.trim().length === 0)
  ) {
    warnings.push('Missing optional description.')
  } else if (typeof program.description !== 'string') {
    errors.push('Description must be a string when supplied.')
  }
  if (program.goals === undefined || program.goals === null) {
    warnings.push('Empty goals.')
  } else if (!Array.isArray(program.goals)) {
    errors.push('Goals must be an array of strings.')
  } else if (program.goals.length === 0) {
    warnings.push('Empty goals.')
  } else if (!program.goals.every(isNonEmptyString)) {
    errors.push('Goals must contain only non-empty strings.')
  }
  if (
    program.benchmarkExerciseIds === undefined ||
    program.benchmarkExerciseIds === null
  ) {
    warnings.push('Empty benchmark list.')
  } else if (!Array.isArray(program.benchmarkExerciseIds)) {
    errors.push('Benchmark exercise IDs must be an array of strings.')
  } else if (program.benchmarkExerciseIds.length === 0) {
    warnings.push('Empty benchmark list.')
  } else if (!program.benchmarkExerciseIds.every(isNonEmptyString)) {
    errors.push('Benchmark exercise IDs must contain only non-empty strings.')
  }
  validateRules(program.rules, errors)
  validateProgressionPhases(
    program.progressionPhases,
    isPositiveInteger(program.durationWeeks) ? program.durationWeeks : undefined,
    errors,
  )
  validateCoaching(program.coaching, errors)
  validateStandaloneWorkouts(program.standaloneWorkouts, options, errors)

  if (!Array.isArray(program.days) || program.days.length === 0) {
    errors.push('Missing or empty days array.')
    return { valid: false, errors, warnings }
  }

  if (program.days.length !== 7) {
    warnings.push('Program does not have exactly seven days.')
  }

  const seenDayNumbers = new Set<number>()
  const validDayNumbers: number[] = []

  program.days.forEach((candidate, dayIndex) => {
    const day = isPlainObject(candidate) ? candidate : undefined
    const dayLabel = `Day at index ${dayIndex}`
    const dayNumber = day?.day

    if (!isPositiveInteger(dayNumber)) {
      errors.push(`${dayLabel}: Invalid day number.`)
    } else {
      validDayNumbers.push(dayNumber)
      if (seenDayNumbers.has(dayNumber)) {
        errors.push(`${dayLabel}: Duplicate day number ${dayNumber}.`)
      }
      seenDayNumbers.add(dayNumber)
    }

    if (!isNonEmptyString(day?.name)) {
      errors.push(`${dayLabel}: Missing day name.`)
    }
    if (!isNonEmptyString(day?.estimatedTime)) {
      errors.push(`${dayLabel}: Missing estimated time.`)
    }
    if (!Array.isArray(day?.focus)) {
      errors.push(`${dayLabel}: Missing focus array.`)
    } else if (!day.focus.every(isNonEmptyString)) {
      errors.push(`${dayLabel}: Focus must contain only non-empty strings.`)
    }
    if (!Array.isArray(day?.exercises)) {
      errors.push(`${dayLabel}: Missing exercises array.`)
      return
    }

    const seenExerciseIds = new Set<string>()

    day.exercises.forEach((candidateExercise, exerciseIndex) => {
      const exercise = isPlainObject(candidateExercise)
        ? candidateExercise
        : undefined
      const exerciseLabel = `${dayLabel}, exercise at index ${exerciseIndex}`
      const exerciseId = isNonEmptyString(exercise?.id)
        ? exercise.id.trim()
        : ''

      if (!exerciseId) {
        errors.push(`${exerciseLabel}: Empty exercise ID.`)
      } else {
        if (seenExerciseIds.has(exerciseId)) {
          errors.push(
            `${exerciseLabel}: Duplicate exercise ID inside the same day: ${exerciseId}.`,
          )
        }
        seenExerciseIds.add(exerciseId)

        if (
          options.knownExerciseIds &&
          !options.knownExerciseIds.has(exerciseId)
        ) {
          const message = `${exerciseLabel}: Exercise ID not found in the supplied exercise library: ${exerciseId}.`
          if (options.requireKnownExercises) {
            errors.push(message)
          } else {
            warnings.push(message)
          }
        }
      }

      if (!isNonEmptyString(exercise?.name)) {
        errors.push(`${exerciseLabel}: Empty exercise name.`)
      }
      if (!isFiniteNumber(exercise?.sets) || exercise.sets < 1) {
        errors.push(`${exerciseLabel}: Sets less than 1.`)
      }
      if (!isFiniteNumber(exercise?.restSeconds)) {
        errors.push(`${exerciseLabel}: Missing or invalid restSeconds.`)
      } else if (exercise.restSeconds < 0) {
        errors.push(`${exerciseLabel}: Negative restSeconds.`)
      }

      const hasRepRange = isNonEmptyString(exercise?.repRange)
      const hasDuration = isNonEmptyString(exercise?.duration)
      if (!hasRepRange && !hasDuration) {
        errors.push(`${exerciseLabel}: Exercise has neither repRange nor duration.`)
      } else if (hasRepRange && hasDuration) {
        errors.push(
          `${exerciseLabel}: Exercise has both repRange and duration; the current data model cannot safely support both.`,
        )
      }

      if (!isNonEmptyString(exercise?.muscleGroup)) {
        errors.push(`${exerciseLabel}: Missing muscleGroup.`)
      }
      if (!isNonEmptyString(exercise?.equipment)) {
        errors.push(`${exerciseLabel}: Missing equipment.`)
      }
      if (!Array.isArray(exercise?.formTips)) {
        errors.push(`${exerciseLabel}: Missing formTips array.`)
      } else if (!exercise.formTips.every(isNonEmptyString)) {
        errors.push(
          `${exerciseLabel}: formTips must contain only non-empty strings.`,
        )
      }
      validateExerciseExtensions(exercise, exerciseLabel, options, errors)
    })
  })

  if (
    isPositiveInteger(program.normalWeeklyDays) &&
    program.normalWeeklyDays !== program.days.length
  ) {
    errors.push(
      `normalWeeklyDays (${program.normalWeeklyDays}) does not match the days array (${program.days.length}).`,
    )
  }

  const uniqueSortedDays = [...new Set(validDayNumbers)].sort((left, right) =>
    left - right,
  )
  if (
    uniqueSortedDays.some((dayNumber, index) => dayNumber !== index + 1)
  ) {
    warnings.push('Day numbers are not sequential.')
  }

  return { valid: errors.length === 0, errors, warnings }
}

function validateStandaloneWorkouts(
  value: unknown,
  options: WorkoutProgramValidationOptions,
  errors: string[],
) {
  if (value === undefined) {
    return
  }
  if (!Array.isArray(value)) {
    errors.push('standaloneWorkouts must be an array when supplied.')
    return
  }

  const seenWorkoutIds = new Set<string>()

  value.forEach((candidate, workoutIndex) => {
    const workout = isPlainObject(candidate) ? candidate : undefined
    const workoutLabel = `Standalone workout at index ${workoutIndex}`
    const workoutId = isNonEmptyString(workout?.id) ? workout.id.trim() : ''

    if (!workoutId) {
      errors.push(`${workoutLabel}: Empty standalone workout ID.`)
    } else {
      if (seenWorkoutIds.has(workoutId)) {
        errors.push(`${workoutLabel}: Duplicate standalone workout ID: ${workoutId}.`)
      }
      seenWorkoutIds.add(workoutId)
    }

    if (!isNonEmptyString(workout?.name)) {
      errors.push(`${workoutLabel}: Missing name.`)
    }
    if (!isNonEmptyString(workout?.description)) {
      errors.push(`${workoutLabel}: Missing description.`)
    }
    if (!isNonEmptyString(workout?.recommendedUse)) {
      errors.push(`${workoutLabel}: Missing recommendedUse.`)
    }
    if (!isNonEmptyString(workout?.estimatedTime)) {
      errors.push(`${workoutLabel}: Missing estimatedTime.`)
    }
    if (!Array.isArray(workout?.focus)) {
      errors.push(`${workoutLabel}: Missing focus array.`)
    } else if (!workout.focus.every(isNonEmptyString)) {
      errors.push(`${workoutLabel}: Focus must contain only non-empty strings.`)
    }
    const standaloneRules = workout?.rules
    if (standaloneRules !== undefined) {
      if (
        !Array.isArray(standaloneRules) ||
        !standaloneRules.every(isNonEmptyString)
      ) {
        errors.push(`${workoutLabel}: rules must be an array of non-empty strings.`)
      }
    }
    if (
      workout?.progressionMode !== undefined &&
      workout.progressionMode !== 'standard' &&
      workout.progressionMode !== 'reentry'
    ) {
      errors.push(`${workoutLabel}: progressionMode must be standard or reentry.`)
    }
    const standaloneExercises = workout?.exercises
    if (
      !Array.isArray(standaloneExercises) ||
      standaloneExercises.length === 0
    ) {
      errors.push(`${workoutLabel}: Missing or empty exercises array.`)
      return
    }

    validateStandaloneExercises(
      standaloneExercises,
      workoutLabel,
      options.knownExerciseIds,
      errors,
    )
  })
}

function validateStandaloneExercises(
  exercises: unknown[],
  workoutLabel: string,
  knownExerciseIds: Set<string> | undefined,
  errors: string[],
) {
  const seenExerciseIds = new Set<string>()

  exercises.forEach((candidate, exerciseIndex) => {
    const exercise = isPlainObject(candidate) ? candidate : undefined
    const exerciseLabel = `${workoutLabel}, exercise at index ${exerciseIndex}`
    const exerciseId = isNonEmptyString(exercise?.id) ? exercise.id.trim() : ''

    if (!exerciseId) {
      errors.push(`${exerciseLabel}: Empty exercise ID.`)
    } else {
      if (seenExerciseIds.has(exerciseId)) {
        errors.push(
          `${exerciseLabel}: Duplicate exercise ID inside the same standalone workout: ${exerciseId}.`,
        )
      }
      seenExerciseIds.add(exerciseId)

      if (knownExerciseIds && !knownExerciseIds.has(exerciseId)) {
        errors.push(
          `${exerciseLabel}: Exercise ID not found in the supplied exercise library: ${exerciseId}.`,
        )
      }
    }

    if (!isNonEmptyString(exercise?.name)) {
      errors.push(`${exerciseLabel}: Empty exercise name.`)
    }
    if (!isFiniteNumber(exercise?.sets) || exercise.sets < 1) {
      errors.push(`${exerciseLabel}: Sets less than 1.`)
    }
    if (!isFiniteNumber(exercise?.restSeconds)) {
      errors.push(`${exerciseLabel}: Missing or invalid restSeconds.`)
    } else if (exercise.restSeconds < 0) {
      errors.push(`${exerciseLabel}: Negative restSeconds.`)
    }

    const hasRepRange = isNonEmptyString(exercise?.repRange)
    const hasDuration = isNonEmptyString(exercise?.duration)
    if (!hasRepRange && !hasDuration) {
      errors.push(`${exerciseLabel}: Exercise has neither repRange nor duration.`)
    } else if (hasRepRange && hasDuration) {
      errors.push(
        `${exerciseLabel}: Exercise has both repRange and duration; the current data model cannot safely support both.`,
      )
    }

    if (!isNonEmptyString(exercise?.muscleGroup)) {
      errors.push(`${exerciseLabel}: Missing muscleGroup.`)
    }
    if (!isNonEmptyString(exercise?.equipment)) {
      errors.push(`${exerciseLabel}: Missing equipment.`)
    }
    if (!Array.isArray(exercise?.formTips)) {
      errors.push(`${exerciseLabel}: Missing formTips array.`)
    } else if (!exercise.formTips.every(isNonEmptyString)) {
      errors.push(`${exerciseLabel}: formTips must contain only non-empty strings.`)
    }
    validateExerciseExtensions(exercise, exerciseLabel, {
      knownExerciseIds,
      requireKnownExercises: true,
    }, errors)
  })
}

function validateExerciseExtensions(
  exercise: Record<string, unknown> | undefined,
  exerciseLabel: string,
  options: WorkoutProgramValidationOptions,
  errors: string[],
) {
  if (!exercise) return

  if (exercise.optional !== undefined && typeof exercise.optional !== 'boolean') {
    errors.push(`${exerciseLabel}: optional must be a boolean when supplied.`)
  }
  if (
    exercise.selectionMode !== undefined &&
    exercise.selectionMode !== 'single' &&
    exercise.selectionMode !== 'multiple'
  ) {
    errors.push(`${exerciseLabel}: selectionMode must be single or multiple.`)
  }
  for (const field of ['minSelections', 'maxSelections'] as const) {
    if (exercise[field] !== undefined && !isPositiveInteger(exercise[field])) {
      errors.push(`${exerciseLabel}: ${field} must be a positive integer.`)
    }
  }
  if (
    isPositiveInteger(exercise.minSelections) &&
    isPositiveInteger(exercise.maxSelections) &&
    exercise.minSelections > exercise.maxSelections
  ) {
    errors.push(`${exerciseLabel}: minSelections cannot exceed maxSelections.`)
  }
  validateOptionalStringArray(exercise.guidance, `${exerciseLabel}.guidance`, errors)
  if (exercise.targetRir !== undefined && !isRirTarget(exercise.targetRir)) {
    errors.push(`${exerciseLabel}: targetRir must be a numeric RIR value or range.`)
  }

  const alternatives = exercise.alternatives
  const variantIds = new Set<string>()
  if (alternatives !== undefined) {
    if (!isPlainObject(alternatives)) {
      errors.push(`${exerciseLabel}: alternatives must be an object.`)
    } else {
      let variantCount = 0
      for (const location of ['home', 'gym'] as const) {
        const variants = alternatives[location]
        if (variants === undefined) continue
        if (!Array.isArray(variants) || variants.length === 0) {
          errors.push(`${exerciseLabel}: alternatives.${location} must be a non-empty array.`)
          continue
        }

        const locationIds = new Set<string>()
        variants.forEach((candidate, variantIndex) => {
          const variant = isPlainObject(candidate) ? candidate : undefined
          const label = `${exerciseLabel}, ${location} variant at index ${variantIndex}`
          const id = isNonEmptyString(variant?.id) ? variant.id.trim() : ''
          if (!id) {
            errors.push(`${label}: Missing exercise ID.`)
          } else {
            if (locationIds.has(id)) {
              errors.push(`${label}: Duplicate variant ID ${id}.`)
            }
            locationIds.add(id)
            variantIds.add(id)
            if (options.knownExerciseIds && !options.knownExerciseIds.has(id)) {
              errors.push(`${label}: Exercise ID not found in the supplied exercise library: ${id}.`)
            }
          }
          if (!isNonEmptyString(variant?.name)) {
            errors.push(`${label}: Missing name.`)
          }
          if (!isNonEmptyString(variant?.equipment)) {
            errors.push(`${label}: Missing equipment.`)
          }
          if (
            variant?.repRange !== undefined &&
            !isNonEmptyString(variant.repRange)
          ) {
            errors.push(`${label}: repRange must be a non-empty string.`)
          }
          if (
            variant?.duration !== undefined &&
            !isNonEmptyString(variant.duration)
          ) {
            errors.push(`${label}: duration must be a non-empty string.`)
          }
          if (
            variant?.repRange !== undefined &&
            variant?.duration !== undefined
          ) {
            errors.push(`${label}: repRange and duration cannot both be supplied.`)
          }
          if (
            variant?.formTips !== undefined &&
            (!Array.isArray(variant.formTips) ||
              !variant.formTips.every(isNonEmptyString))
          ) {
            errors.push(`${label}: formTips must contain only non-empty strings.`)
          }
          variantCount += 1
        })
      }
      if (variantCount === 0) {
        errors.push(`${exerciseLabel}: alternatives must provide at least one variant.`)
      }
      if (isNonEmptyString(exercise.id) && !variantIds.has(exercise.id.trim())) {
        errors.push(`${exerciseLabel}: the primary exercise ID must appear in alternatives.`)
      }
    }
  }

  if (exercise.defaultVariantIds !== undefined) {
    if (
      !Array.isArray(exercise.defaultVariantIds) ||
      exercise.defaultVariantIds.length === 0 ||
      !exercise.defaultVariantIds.every(isNonEmptyString)
    ) {
      errors.push(`${exerciseLabel}: defaultVariantIds must be a non-empty string array.`)
    } else if (
      variantIds.size > 0 &&
      exercise.defaultVariantIds.some((id) => !variantIds.has(id.trim()))
    ) {
      errors.push(`${exerciseLabel}: defaultVariantIds contains an unavailable variant.`)
    }
  }

  const phaseTargets = exercise.phaseTargets
  if (phaseTargets !== undefined) {
    if (!Array.isArray(phaseTargets) || phaseTargets.length === 0) {
      errors.push(`${exerciseLabel}: phaseTargets must be a non-empty array.`)
    } else {
      const seenWeeks = new Set<number>()
      phaseTargets.forEach((candidate, targetIndex) => {
        const target = isPlainObject(candidate) ? candidate : undefined
        const label = `${exerciseLabel}, phase target at index ${targetIndex}`
        if (
          !Array.isArray(target?.weeks) ||
          target.weeks.length === 0 ||
          !target.weeks.every(isPositiveInteger)
        ) {
          errors.push(`${label}: weeks must be a non-empty positive-integer array.`)
        } else {
          target.weeks.forEach((week) => {
            if (seenWeeks.has(week)) errors.push(`${label}: week ${week} overlaps another phase target.`)
            seenWeeks.add(week)
          })
        }
        if (target?.sets !== undefined && !isPositiveInteger(target.sets)) {
          errors.push(`${label}: sets must be a positive integer.`)
        }
        if (target?.repRange !== undefined && !isNonEmptyString(target.repRange)) {
          errors.push(`${label}: repRange must be a non-empty string.`)
        }
        if (target?.duration !== undefined && !isNonEmptyString(target.duration)) {
          errors.push(`${label}: duration must be a non-empty string.`)
        }
        if (target?.repRange !== undefined && target?.duration !== undefined) {
          errors.push(`${label}: repRange and duration cannot both be supplied.`)
        }
        validateOptionalStringArray(target?.guidance, `${label}.guidance`, errors)
      })
    }
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  )
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isPositiveInteger(value: unknown): value is number {
  return isFiniteNumber(value) && Number.isInteger(value) && value >= 1
}

function isValidDateString(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) {
    return false
  }

  const [, year, month, day] = match
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  return date.toISOString().slice(0, 10) === value
}

function validateRules(value: unknown, errors: string[]) {
  if (value === undefined) {
    return
  }
  if (!isPlainObject(value)) {
    errors.push('Rules must be an object.')
    return
  }

  validateOptionalStringArray(value.effort, 'rules.effort', errors)
  validateOptionalStringArray(value.progression, 'rules.progression', errors)
  validateOptionalStringArray(
    value.returnAfterBreak,
    'rules.returnAfterBreak',
    errors,
  )
  validateOptionalStringArray(value.rest, 'rules.rest', errors)
  validateOptionalStringArray(value.substitutions, 'rules.substitutions', errors)
  validateOptionalStringArray(value.safety, 'rules.safety', errors)
  validateOptionalStringArray(
    value.optionalNeckWork,
    'rules.optionalNeckWork',
    errors,
  )
  if (
    value.postureCue !== undefined &&
    !isNonEmptyString(value.postureCue)
  ) {
    errors.push('rules.postureCue must be a non-empty string when supplied.')
  }
}

function validateProgressionPhases(
  value: unknown,
  durationWeeks: number | undefined,
  errors: string[],
) {
  if (value === undefined) return
  if (!Array.isArray(value) || value.length === 0) {
    errors.push('progressionPhases must be a non-empty array when supplied.')
    return
  }

  const seenWeeks = new Set<number>()
  value.forEach((candidate, index) => {
    const phase = isPlainObject(candidate) ? candidate : undefined
    const label = `Progression phase at index ${index}`
    if (
      !Array.isArray(phase?.weeks) ||
      phase.weeks.length === 0 ||
      !phase.weeks.every(isPositiveInteger)
    ) {
      errors.push(`${label}: weeks must be a non-empty positive-integer array.`)
    } else {
      phase.weeks.forEach((week) => {
        if (durationWeeks !== undefined && week > durationWeeks) {
          errors.push(`${label}: week ${week} exceeds durationWeeks.`)
        }
        if (seenWeeks.has(week)) {
          errors.push(`${label}: week ${week} overlaps another phase.`)
        }
        seenWeeks.add(week)
      })
    }
    for (const field of ['name', 'volumeGuidance', 'rirGuidance'] as const) {
      if (!isNonEmptyString(phase?.[field])) {
        errors.push(`${label}: Missing ${field}.`)
      }
    }
    if (
      phase?.setVolumeMultiplier !== undefined &&
      (!isFiniteNumber(phase.setVolumeMultiplier) ||
        phase.setVolumeMultiplier <= 0 ||
        phase.setVolumeMultiplier > 1)
    ) {
      errors.push(`${label}: setVolumeMultiplier must be greater than 0 and no more than 1.`)
    }
    if (phase?.targetRir !== undefined && !isRirTarget(phase.targetRir)) {
      errors.push(`${label}: targetRir must be a numeric RIR value or range.`)
    }
    if (!Array.isArray(phase?.priorities) || !phase.priorities.every(isNonEmptyString)) {
      errors.push(`${label}: priorities must be an array of non-empty strings.`)
    }
    validateOptionalStringArray(phase?.restrictions, `${label}.restrictions`, errors)
    validateOptionalStringArray(
      phase?.assessmentItems,
      `${label}.assessmentItems`,
      errors,
    )
  })

  if (durationWeeks !== undefined) {
    for (let week = 1; week <= durationWeeks; week += 1) {
      if (!seenWeeks.has(week)) {
        errors.push(`progressionPhases does not cover week ${week}.`)
      }
    }
  }
}

function validateCoaching(value: unknown, errors: string[]) {
  if (value === undefined) return
  if (!isPlainObject(value)) {
    errors.push('coaching must be an object when supplied.')
    return
  }

  for (const field of [
    'proteinMinGrams',
    'proteinDefaultGrams',
    'proteinMaxGrams',
  ] as const) {
    if (value[field] !== undefined && (!isFiniteNumber(value[field]) || value[field] < 0)) {
      errors.push(`coaching.${field} must be a non-negative number.`)
    }
  }
  for (const field of [
    'creatineDailyGrams',
    'sleepHours',
    'targetWeightLossKgPerWeek',
    'stalledTrendGuidance',
    'fastLossGuidance',
  ] as const) {
    if (value[field] !== undefined && !isNonEmptyString(value[field])) {
      errors.push(`coaching.${field} must be a non-empty string.`)
    }
  }
  validateOptionalStringArray(value.healthContext, 'coaching.healthContext', errors)

  const min = value.proteinMinGrams
  const target = value.proteinDefaultGrams
  const max = value.proteinMaxGrams
  if (
    isFiniteNumber(min) &&
    isFiniteNumber(target) &&
    isFiniteNumber(max) &&
    (min > target || target > max)
  ) {
    errors.push('coaching protein targets must satisfy min <= default <= max.')
  }
}

function isRirTarget(value: unknown): value is string {
  if (!isNonEmptyString(value)) return false
  const normalized = value.trim()
  const match = /^(\d+(?:\.\d+)?)(?:\s*[-–]\s*(\d+(?:\.\d+)?))?$/.exec(normalized)
  if (!match) return false
  const minimum = Number(match[1])
  const maximum = Number(match[2] ?? match[1])
  return minimum >= 0 && maximum <= 10 && minimum <= maximum
}

function validateOptionalStringArray(
  value: unknown,
  field: string,
  errors: string[],
) {
  if (value === undefined) {
    return
  }
  if (!Array.isArray(value) || !value.every(isNonEmptyString)) {
    errors.push(`${field} must be an array of non-empty strings.`)
  }
}
