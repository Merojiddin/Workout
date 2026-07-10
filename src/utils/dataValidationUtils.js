const BODY_MEASUREMENT_KEYS = [
  'bodyWeightKg',
  'waistCm',
  'bellyCm',
  'chestCm',
  'shouldersCm',
  'leftArmCm',
  'rightArmCm',
  'hipsCm',
]

const BODY_RATING_KEYS = [
  'postureRating',
  'absVisibilityRating',
  'energyLevel',
  'sleepQuality',
]

const PHOTO_KEYS = ['frontPhoto', 'sidePhoto', 'backPhoto']
const PHOTO_WARN_BYTES = 900 * 1024
const VALID_SYNC_TYPES = new Set([
  'workoutSession',
  'bodyCheckIn',
  'nutritionLog',
  'userSettings',
  'customWorkoutPlan',
  'customExerciseLibrary',
])
const VALID_SYNC_ACTIONS = new Set(['create', 'update', 'delete'])

export function validateWorkoutSessions(sessions) {
  if (!Array.isArray(sessions)) {
    return [issue('workoutSessions', 'Workout sessions are not an array.')]
  }

  return sessions.flatMap((session, sessionIndex) => {
    if (!isObject(session)) {
      return [
        issue(
          `workoutSessions[${sessionIndex}]`,
          'Workout session is malformed.',
        ),
      ]
    }

    const issues = []
    const label = getWorkoutLabel(session, sessionIndex)

    if (!hasText(session.id)) {
      issues.push(issue(label, 'Missing id.'))
    }
    if (!hasText(session.date)) {
      issues.push(issue(label, 'Missing date.'))
    }
    if (!hasText(session.workoutName)) {
      issues.push(issue(label, 'Missing workout name.'))
    }
    if (!Array.isArray(session.exercises)) {
      issues.push(issue(label, 'Exercises are missing or malformed.'))
      return issues
    }

    session.exercises.forEach((exercise, exerciseIndex) => {
      const exerciseLabel = `${label} / ${getExerciseLabel(
        exercise,
        exerciseIndex,
      )}`
      if (!isObject(exercise) || !Array.isArray(exercise.sets)) {
        issues.push(issue(exerciseLabel, 'Exercise is missing sets.'))
        return
      }

      exercise.sets.forEach((set, setIndex) => {
        const setLabel = `${exerciseLabel} / set ${setIndex + 1}`
        if (!isObject(set)) {
          issues.push(issue(setLabel, 'Set is malformed.'))
          return
        }
        if (isNegativeNumber(set.reps)) {
          issues.push(issue(setLabel, 'Negative reps.'))
        }
        if (isNegativeNumber(set.weightKg)) {
          issues.push(issue(setLabel, 'Negative weight.'))
        }
        if (hasNumber(set.rpe) && !isBetween(set.rpe, 1, 10)) {
          issues.push(issue(setLabel, 'Invalid RPE.'))
        }
        if (hasNumber(set.painLevel) && !isBetween(set.painLevel, 0, 10)) {
          issues.push(issue(setLabel, 'Invalid pain level.'))
        }
      })
    })

    return issues
  })
}

export function validateBodyCheckIns(checkIns) {
  if (!Array.isArray(checkIns)) {
    return [issue('bodyCheckIns', 'Body check-ins are not an array.')]
  }

  return checkIns.flatMap((checkIn, index) => {
    if (!isObject(checkIn)) {
      return [issue(`bodyCheckIns[${index}]`, 'Body check-in is malformed.')]
    }

    const issues = []
    const label = getCheckInLabel(checkIn, index)
    if (!hasText(checkIn.date)) {
      issues.push(issue(label, 'Missing date.'))
    }

    BODY_MEASUREMENT_KEYS.forEach((key) => {
      if (isNegativeNumber(checkIn[key])) {
        issues.push(issue(label, `Negative ${humanizeKey(key)}.`))
      }
    })

    BODY_RATING_KEYS.forEach((key) => {
      if (hasNumber(checkIn[key]) && !isBetween(checkIn[key], 1, 10)) {
        issues.push(issue(label, `${humanizeKey(key)} outside 1-10.`))
      }
    })

    PHOTO_KEYS.forEach((key) => {
      if (isLargeBase64Photo(checkIn[key])) {
        issues.push(issue(label, `Very large ${humanizeKey(key)}.`))
      }
    })

    return issues
  })
}

export function validateNutritionLogs(logs) {
  if (!Array.isArray(logs)) {
    return [issue('nutritionLogs', 'Nutrition logs are not an array.')]
  }

  return logs.flatMap((log, index) => {
    if (!isObject(log)) {
      return [issue(`nutritionLogs[${index}]`, 'Nutrition log is malformed.')]
    }

    const issues = []
    const label = getNutritionLabel(log, index)
    if (!hasText(log.date)) {
      issues.push(issue(label, 'Missing date.'))
    }
    if (isNegativeNumber(log.proteinGrams)) {
      issues.push(issue(label, 'Negative protein.'))
    }
    if (hasNumber(log.waterLiters) && log.waterLiters > 10) {
      issues.push(issue(label, 'Water above 10 L.'))
    }
    if (hasNumber(log.creatineGrams) && log.creatineGrams > 10) {
      issues.push(issue(label, 'Creatine above 10 g.'))
    }
    if (hasNumber(log.proteinGrams) && log.proteinGrams > 220) {
      issues.push(issue(label, 'Protein above 220 g.'))
    }
    if (isNegativeNumber(log.waterLiters)) {
      issues.push(issue(label, 'Negative water.'))
    }
    if (isNegativeNumber(log.creatineGrams)) {
      issues.push(issue(label, 'Negative creatine.'))
    }

    return issues
  })
}

export function validatePendingSyncQueue(queue) {
  if (!Array.isArray(queue)) {
    return [issue('pendingSyncQueue', 'Pending sync queue is not an array.')]
  }

  return queue.flatMap((item, index) => {
    if (!isObject(item)) {
      return [issue(`pendingSyncQueue[${index}]`, 'Malformed sync item.')]
    }

    const issues = []
    const label = `pendingSyncQueue[${index}]`
    if (!hasText(item.id)) {
      issues.push(issue(label, 'Malformed sync item.'))
    }
    if (!VALID_SYNC_TYPES.has(item.type) || !VALID_SYNC_ACTIONS.has(item.action)) {
      issues.push(issue(label, 'Malformed sync item.'))
    }
    if (Number(item.attempts) >= 5 || item.status === 'failed') {
      issues.push(issue(label, 'Failed attempts >= 5.'))
    }

    return issues
  })
}

export function findDuplicateWorkoutSessions(sessions) {
  if (!Array.isArray(sessions)) {
    return []
  }

  const seen = new Set()
  return sessions.filter((session, index) => {
    const signature = getSessionSignature(session, index)
    if (seen.has(signature)) {
      return true
    }
    seen.add(signature)
    return false
  })
}

export function findEmptyWorkoutSessions(sessions) {
  if (!Array.isArray(sessions)) {
    return []
  }

  return sessions.filter((session) => {
    if (!isObject(session) || !Array.isArray(session.exercises)) {
      return true
    }
    if (session.exercises.length === 0) {
      return true
    }

    return session.exercises.every((exercise) => {
      if (!isObject(exercise) || !Array.isArray(exercise.sets)) {
        return true
      }
      return exercise.sets.every((set) => !hasCompletedSetValue(set))
    })
  })
}

export function repairWorkoutSessions(sessions) {
  if (!Array.isArray(sessions)) {
    return []
  }

  return sessions.filter(isObject).map((session, index) => {
    const repairedDate = getDateFromSession(session)
    const repairedExercises = Array.isArray(session.exercises)
      ? session.exercises.filter(isObject).map(repairExercise)
      : []

    return {
      ...session,
      id: hasText(session.id) ? String(session.id) : createId('workout', index),
      date: hasText(session.date) ? session.date : repairedDate,
      exercises: repairedExercises,
      workoutName: hasText(session.workoutName) ? session.workoutName : 'Workout',
    }
  })
}

export function repairBodyCheckIns(checkIns) {
  if (!Array.isArray(checkIns)) {
    return []
  }

  return checkIns.filter(isObject).map((checkIn, index) => {
    const repaired = {
      ...checkIn,
      id: hasText(checkIn.id) ? String(checkIn.id) : createId('check-in', index),
    }

    BODY_MEASUREMENT_KEYS.forEach((key) => {
      if (isNegativeNumber(repaired[key])) {
        repaired[key] = null
      }
    })

    BODY_RATING_KEYS.forEach((key) => {
      if (hasNumber(repaired[key])) {
        repaired[key] = clamp(Number(repaired[key]), 1, 10)
      }
    })

    return repaired
  })
}

export function repairNutritionLogs(logs) {
  if (!Array.isArray(logs)) {
    return []
  }

  return logs.filter(isObject).map((log, index) => ({
    ...log,
    id: hasText(log.id) ? String(log.id) : createId('nutrition', index),
    date: hasText(log.date) ? log.date : todayIso(),
    proteinGrams: nonNegativeOrNull(log.proteinGrams),
    waterLiters: nonNegativeOrNull(log.waterLiters),
    creatineGrams: nonNegativeOrNull(log.creatineGrams),
  }))
}

function repairExercise(exercise) {
  return {
    ...exercise,
    exerciseName: hasText(exercise.exerciseName)
      ? exercise.exerciseName
      : hasText(exercise.name)
        ? exercise.name
        : 'Exercise',
    sets: Array.isArray(exercise.sets)
      ? exercise.sets.filter(isObject).map(repairSet)
      : [],
  }
}

function repairSet(set, index) {
  return {
    ...set,
    setNumber:
      Number.isFinite(Number(set.setNumber)) && Number(set.setNumber) > 0
        ? Math.round(Number(set.setNumber))
        : index + 1,
    reps: nonNegativeOrNull(set.reps),
    weightKg: nonNegativeOrNull(set.weightKg),
    rpe: hasNumber(set.rpe) ? clamp(Number(set.rpe), 1, 10) : null,
    painLevel: hasNumber(set.painLevel)
      ? clamp(Number(set.painLevel), 0, 10)
      : null,
    notes: typeof set.notes === 'string' ? set.notes : '',
  }
}

function issue(scope, message) {
  return {
    id: `${scope}-${message}`,
    message,
    scope,
    severity: 'warning',
  }
}

function getWorkoutLabel(session, index) {
  return hasText(session?.workoutName)
    ? `${session.workoutName} (${session.date || `item ${index + 1}`})`
    : `Workout session ${index + 1}`
}

function getExerciseLabel(exercise, index) {
  return hasText(exercise?.exerciseName)
    ? exercise.exerciseName
    : `exercise ${index + 1}`
}

function getCheckInLabel(checkIn, index) {
  return hasText(checkIn?.date)
    ? `Check-in ${checkIn.date}`
    : `Body check-in ${index + 1}`
}

function getNutritionLabel(log, index) {
  return hasText(log?.date) ? `Nutrition ${log.date}` : `Nutrition log ${index + 1}`
}

function getSessionSignature(session, index) {
  if (!isObject(session)) {
    return `malformed-${index}`
  }
  if (hasText(session.id)) {
    return `id:${session.id}`
  }
  return [
    'session',
    session.date ?? '',
    session.workoutName ?? '',
    session.startedAt ?? '',
    session.finishedAt ?? '',
  ].join('|')
}

function getDateFromSession(session) {
  const candidates = [session.finishedAt, session.startedAt, session.createdAt]
  for (const candidate of candidates) {
    if (!hasText(candidate)) {
      continue
    }
    const parsed = new Date(candidate)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10)
    }
  }
  return todayIso()
}

function hasCompletedSetValue(set) {
  if (!isObject(set)) {
    return false
  }

  return [set.reps, set.weightKg, set.timeSeconds].some(
    (value) => Number.isFinite(Number(value)) && Number(value) > 0,
  ) || hasText(set.completedAt)
}

function isLargeBase64Photo(value) {
  return typeof value === 'string' && value.startsWith('data:image/')
    ? estimateBytes(value) > PHOTO_WARN_BYTES
    : false
}

function nonNegativeOrNull(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return null
  }
  return parsed < 0 ? 0 : parsed
}

function isNegativeNumber(value) {
  return hasNumber(value) && Number(value) < 0
}

function hasNumber(value) {
  if (value === null || value === undefined || value === '') {
    return false
  }
  return Number.isFinite(Number(value))
}

function isBetween(value, min, max) {
  const parsed = Number(value)
  return parsed >= min && parsed <= max
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function humanizeKey(key) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (letter) => letter.toUpperCase())
}

function todayIso() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

function createId(prefix, index) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${prefix}-${Date.now()}-${index}`
}

function estimateBytes(value) {
  if (typeof Blob !== 'undefined') {
    return new Blob([String(value)]).size
  }
  return String(value).length * 2
}
