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
    })
  })

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
  })
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
  if (
    value.postureCue !== undefined &&
    !isNonEmptyString(value.postureCue)
  ) {
    errors.push('rules.postureCue must be a non-empty string when supplied.')
  }
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
