import { exerciseIdentitiesMatch } from '../data/exerciseIdentity'
import {
  getRestDays,
  getTrainingDays,
  getWeeklyWorkoutTarget,
  isRestDay,
} from './activeWorkoutProgram'
import { nutritionTargets } from './nutritionUtils'

const targetMuscles = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Legs',
  'Abs',
  'Posture',
  'Cardio',
]

export function getWeekRange(date) {
  const anchor = toValidDate(date) ?? new Date()
  const start = new Date(anchor)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

export function getSessionsForWeek(sessions, weekStart, weekEnd) {
  return filterByWeek(sessions, weekStart, weekEnd, getSessionDate)
}

export function getNutritionForWeek(logs, weekStart, weekEnd) {
  return filterByWeek(logs, weekStart, weekEnd, getDatedItemDate)
}

export function getCheckInsForWeek(checkIns, weekStart, weekEnd) {
  return filterByWeek(checkIns, weekStart, weekEnd, getDatedItemDate)
}

export function getWorkoutCompletionSummary(weekSessions, programOrPlan) {
  const completedSessions = safeArray(weekSessions).filter(isWorkoutCompleted)
  const standaloneSessions = completedSessions.filter(isStandaloneWorkoutSession)
  const scheduledSessions = completedSessions.filter(
    (session) => !isStandaloneWorkoutSession(session),
  )
  const targetDays = getTargetWorkoutDays(programOrPlan)
  const completedDayIds = new Set(
    scheduledSessions.flatMap((session) => {
      const dayId = toNumber(session?.workoutDayId)
      const matchedById = targetDays.find(
        (day) => toNumber(day?.day) === dayId,
      )
      if (dayId > 0) {
        return matchedById ? [matchedById.day] : []
      }

      const matchedDay = targetDays.find(
        (day) => normalizeText(day.name) === normalizeText(session?.workoutName),
      )
      return matchedDay ? [matchedDay.day] : []
    }),
  )

  const missedWorkoutDays = targetDays
    .filter((day) => !completedDayIds.has(day.day))
    .map((day) => `Day ${day.day} ${day.name}`)
  const missedWorkoutDayDetails = targetDays
    .filter((day) => !completedDayIds.has(day.day))
    .map((day) => ({
      day: day.day,
      name: day.name,
      focus: safeArray(day.focus).filter(Boolean),
    }))

  const totalExercises = completedSessions.reduce(
    (total, session) =>
      total +
      getSessionExercises(session).filter(
        (exercise) => getCompletedSets(exercise).length > 0,
      ).length,
    0,
  )

  const totalSets = completedSessions.reduce(
    (total, session) =>
      total +
      getSessionExercises(session).reduce(
        (exerciseTotal, exercise) =>
          exerciseTotal + getCompletedSets(exercise).length,
        0,
      ),
    0,
  )

  const totalDuration = completedSessions.reduce(
    (total, session) => total + getSessionDurationMinutes(session),
    0,
  )

  return {
    completedWorkouts: completedSessions.length,
    scheduledCompletedWorkouts: completedDayIds.size,
    standaloneWorkoutsCompleted: standaloneSessions.length,
    targetWorkouts: getProgramWeeklyTarget(programOrPlan, targetDays),
    missedWorkoutDays,
    missedWorkoutDayDetails,
    totalSets,
    totalExercises,
    totalDuration,
    totalDurationLabel: formatMinutes(totalDuration),
  }
}

export function getMuscleVolumeSummary(weekSessions, programOrPlan, options = {}) {
  const workoutPlan = getProgramDays(programOrPlan)
  const exerciseMuscleMap = buildExerciseMuscleMap(workoutPlan, options.library)
  const programTargets = buildProgramMuscleTargets(programOrPlan)
  const volume = Object.fromEntries(
    targetMuscles.map((muscle) => [
      muscle,
      {
        muscle,
        sets: 0,
        sessions: 0,
        targetSets: programTargets[muscle].sets,
        targetSessions: programTargets[muscle].sessions,
        message: '',
        status: 'neutral',
      },
    ]),
  )

  safeArray(weekSessions)
    .filter(isWorkoutCompleted)
    .forEach((session) => {
      const musclesInSession = new Set()

      getSessionExercises(session).forEach((exercise) => {
        const completedSets = getCompletedSets(exercise)
        if (completedSets.length === 0) {
          return
        }

        const groups = resolveLoggedExerciseMuscles(
          exercise,
          exerciseMuscleMap,
          options.library,
        )

        groups.forEach((muscle) => {
          if (!volume[muscle]) {
            return
          }
          volume[muscle].sets += completedSets.length
          musclesInSession.add(muscle)
        })
      })

      musclesInSession.forEach((muscle) => {
        volume[muscle].sessions += 1
      })
    })

  targetMuscles.forEach((muscle) => {
    const summary = volume[muscle]
    if (summary.targetSessions === 0 && summary.targetSets === 0) {
      summary.message = `${muscle} is not specifically scheduled in this program.`
      summary.status = 'neutral'
      return
    }

    const sessionsMet =
      summary.targetSessions === 0 || summary.sessions >= summary.targetSessions
    const setsMet = summary.targetSets === 0 || summary.sets >= summary.targetSets
    summary.message =
      sessionsMet && setsMet
        ? `${muscle} work is on target for the active program.`
        : `${muscle} work is below the active program schedule.`
    summary.status = sessionsMet && setsMet ? 'good' : 'warn'
  })

  return targetMuscles.map((muscle) => volume[muscle])
}

export function getStrengthComparison(
  currentWeekSessions,
  previousWeekSessions,
  benchmarkExercises,
  options = {},
) {
  return normalizeBenchmarkExercises(benchmarkExercises).map((benchmark) => {
    const current = getBestExercisePerformance(
      currentWeekSessions,
      benchmark,
      options,
    )
    const previous = getBestExercisePerformance(
      previousWeekSessions,
      benchmark,
      options,
    )
    const exerciseName = benchmark.displayName

    if (!current && !previous) {
      return {
        exerciseId: benchmark.exerciseId,
        exerciseName,
        currentBest: 'No data',
        previousBest: 'No data',
        change: '-',
        status: 'no data',
      }
    }

    if (!current) {
      return {
        exerciseId: benchmark.exerciseId,
        exerciseName,
        currentBest: 'No data',
        previousBest: formatBest(previous),
        change: '-',
        status: 'no data',
      }
    }

    if (!previous) {
      return {
        exerciseId: benchmark.exerciseId,
        exerciseName,
        currentBest: formatBest(current),
        previousBest: 'No data',
        change: 'New',
        status: 'no data',
      }
    }

    const comparison = compareBestPerformances(current, previous)

    return {
      exerciseId: benchmark.exerciseId,
      exerciseName,
      currentBest: formatBest(current),
      previousBest: formatBest(previous),
      change: comparison.change,
      status: comparison.status,
    }
  })
}

export function getBodyProgressSummary(currentWeekCheckIns, allCheckIns) {
  const sortedAll = sortByDate(safeArray(allCheckIns))
  const current = sortByDate(safeArray(currentWeekCheckIns)).at(-1) ?? null

  if (!current) {
    return {
      current: null,
      previous: null,
      hasCurrent: false,
      metrics: [],
      messages: ['No body check-in this week. Add one to track body changes.'],
    }
  }

  const currentTime = getCheckInTime(current)
  const previous =
    sortedAll
      .filter((checkIn) => getCheckInTime(checkIn) < currentTime)
      .at(-1) ?? null

  const metrics = [
    makeBodyMetric('Body weight', 'bodyWeightKg', 'kg', current, previous, 'either'),
    makeBodyMetric('Waist', 'waistCm', 'cm', current, previous, 'down'),
    makeBodyMetric('Belly', 'bellyCm', 'cm', current, previous, 'down'),
    makeBodyMetric('Chest', 'chestCm', 'cm', current, previous, 'up'),
    makeBodyMetric('Shoulders', 'shouldersCm', 'cm', current, previous, 'up'),
    makeBodyMetric('Arms average', 'armAverage', 'cm', current, previous, 'up'),
    makeBodyMetric('Abs rating', 'absVisibilityRating', '/10', current, previous, 'up'),
    makeBodyMetric('Posture rating', 'postureRating', '/10', current, previous, 'up'),
  ]

  const messages = []
  const chestChange = getMetricChange(metrics, 'Chest')
  const waistChange = getMetricChange(metrics, 'Waist')
  const weightChange = getMetricChange(metrics, 'Body weight')

  if (previous) {
    if (chestChange > 0 && waistChange <= 0) {
      messages.push('Good recomposition signal.')
    }

    if (weightChange > 0.4 && waistChange > 1) {
      messages.push('Muscle gain may be too aggressive. Control calories.')
    }

    if (waistChange < 0) {
      messages.push('Waist is moving down. Keep strength stable.')
    }
  } else {
    messages.push('This is the first check-in in the comparison window.')
  }

  return {
    current,
    previous,
    hasCurrent: true,
    metrics,
    messages,
  }
}

export function getNutritionSummary(
  weekNutritionLogs,
  targets = nutritionTargets,
) {
  const logs = safeArray(weekNutritionLogs)
  const summary = {
    averageProtein: average(logs.map((log) => log?.proteinGrams)),
    proteinMin: targets.proteinMin,
    proteinMax: targets.proteinMax,
    proteinTargetDays: logs.filter(
      (log) => toNumber(log?.proteinGrams) >= targets.proteinMin,
    ).length,
    averageWater: average(logs.map((log) => log?.waterLiters), 1),
    creatineDays: logs.filter((log) => Boolean(log?.creatineTaken)).length,
    wheyDays: logs.filter((log) => Boolean(log?.wheyTaken)).length,
    averageCalories: average(logs.map((log) => log?.caloriesEstimate)),
    seafoodMeals: logs.filter((log) => Boolean(log?.seafoodMeal)).length,
    oysterMeals: logs.filter((log) => Boolean(log?.oystersMeal)).length,
    averageCoffee: average(logs.map((log) => log?.coffeeCups), 1),
    logCount: logs.length,
    messages: [],
  }

  if (summary.logCount === 0) {
    summary.messages.push('No nutrition logs this week.')
    return summary
  }

  if (summary.averageProtein < targets.proteinMin) {
    summary.messages.push('Protein too low for muscle gain.')
  } else if (summary.averageProtein <= targets.proteinMax) {
    summary.messages.push('Protein target good.')
  } else {
    summary.messages.push('Protein is high. Keep calories controlled.')
  }

  if (summary.creatineDays >= 5) {
    summary.messages.push('Creatine consistency good.')
  }

  if (summary.averageWater < nutritionTargets.waterMin) {
    summary.messages.push('Water intake low.')
  }

  return summary
}

export function calculateWeeklyScore({
  workoutSummary,
  nutritionSummary,
  bodySummary,
  muscleVolume,
  strengthComparison,
}) {
  const scheduledCompletedWorkouts =
    workoutSummary?.scheduledCompletedWorkouts ??
    workoutSummary?.completedWorkouts ??
    0
  const workoutPoints =
    getRatio(
      scheduledCompletedWorkouts,
      workoutSummary?.targetWorkouts ?? 0,
    ) * 40

  const nutritionPoints = calculateNutritionPoints(nutritionSummary)
  const bodyPoints = bodySummary?.hasCurrent ? 10 : 0
  const absPosturePoints = calculateAbsPosturePoints(muscleVolume)
  const progressionPoints = calculateProgressionPoints(strengthComparison)
  const score = Math.round(
    workoutPoints +
      nutritionPoints +
      bodyPoints +
      absPosturePoints +
      progressionPoints,
  )
  const label = getScoreLabel(score)

  return {
    score,
    label,
    message: buildScoreMessage(label, {
      workoutSummary,
      nutritionSummary,
      bodySummary,
      muscleVolume,
      strengthComparison,
    }),
    breakdown: {
      workout: Math.round(workoutPoints),
      nutrition: Math.round(nutritionPoints),
      body: Math.round(bodyPoints),
      absPosture: Math.round(absPosturePoints),
      progression: Math.round(progressionPoints),
    },
  }
}

export function generateNextWeekFocus({
  workoutSummary,
  nutritionSummary,
  bodySummary,
  muscleVolume,
  strengthComparison,
  progressionSuggestions,
  activeProgram,
}) {
  const items = []
  const add = (item) => {
    if (item && !items.includes(item) && items.length < 5) {
      items.push(item)
    }
  }
  const abs = findMuscle(muscleVolume, 'Abs')
  const posture = findMuscle(muscleVolume, 'Posture')
  const chest = findMuscle(muscleVolume, 'Chest')
  const legs = findMuscle(muscleVolume, 'Legs')
  const missedProgramDays = safeArray(workoutSummary?.missedWorkoutDayDetails)
  const missedCoreOrPostureDay = missedProgramDays.find((day) => {
    const text = [day?.name, ...safeArray(day?.focus)].join(' ')
    const groups = normalizeMuscleGroups(text)
    return groups.includes('Abs') || groups.includes('Posture')
  })
  const increaseSuggestion = safeArray(progressionSuggestions).find(
    (suggestion) => suggestion?.type === 'increase',
  )
  const decreasedLift = safeArray(strengthComparison).find(
    (item) => item?.status === 'decreased',
  )

  if (missedCoreOrPostureDay) {
    const focus = safeArray(missedCoreOrPostureDay.focus).join(', ')
    add(
      `Complete Day ${missedCoreOrPostureDay.day} — ${missedCoreOrPostureDay.name}${focus ? ` (${focus})` : ''}.`,
    )
  } else if (isBelowScheduledFrequency(abs) || isBelowScheduledFrequency(posture)) {
    const scheduledNames = getScheduledExerciseNames(activeProgram, [
      'Abs',
      'Posture',
    ]).slice(0, 3)
    add(
      scheduledNames.length > 0
        ? `Complete the scheduled core/posture work: ${scheduledNames.join(', ')}.`
        : 'Complete the active program’s scheduled core and posture work.',
    )
  }

  if (chest.targetSets > 0 && chest.sets < chest.targetSets) {
    add('Complete the active program’s remaining chest work with clean sets.')
  }

  if (nutritionSummary?.proteinTargetDays < 5) {
    add('Hit protein target at least 5 days.')
  }

  if (nutritionSummary?.creatineDays < 5) {
    add('Take creatine daily.')
  }

  if (legs.targetSessions > 0 && legs.sessions === 0) {
    add('Do not skip legs next week.')
  }

  if (decreasedLift) {
    add(`Rebuild ${decreasedLift.exerciseName} before adding load.`)
  } else if (increaseSuggestion?.exerciseName) {
    add(
      `Progress ${increaseSuggestion.exerciseName}: ${increaseSuggestion.nextTarget}.`,
    )
  } else {
    add('Progress only after every prescribed set is completed with clean form.')
  }

  if (!bodySummary?.hasCurrent) {
    add('Add one body check-in for the week.')
  }

  while (items.length < 3) {
    add('Keep training consistent and log every session.')
    add('Keep water at 2-3 L per day.')
  }

  return items.slice(0, 5)
}

export function generateWarnings({
  nutritionSummary,
  bodySummary,
  muscleVolume,
  weekSessions,
  strengthComparison,
  activeProgram,
}) {
  const warnings = []
  const add = (warning) => {
    if (warning && !warnings.includes(warning)) {
      warnings.push(warning)
    }
  }
  const chest = findMuscle(muscleVolume, 'Chest')
  const back = findMuscle(muscleVolume, 'Back')
  const legs = findMuscle(muscleVolume, 'Legs')
  const posture = findMuscle(muscleVolume, 'Posture')

  if (hasPainLogged(weekSessions)) {
    add('Pain logged. Do not progress load through pain.')
  }

  if (hasTooMuchHighRpe(weekSessions)) {
    add('RPE too high too often. Leave 1-2 reps in reserve.')
  }

  if (chest.targetSets > 0 && chest.sets > chest.targetSets * 1.4) {
    add('Chest volume is very high. Watch shoulder fatigue.')
  }

  const completedRestDay = findCompletedRestDay(weekSessions, activeProgram)
  if (completedRestDay) {
    add(
      `A workout was logged on scheduled rest day ${completedRestDay.day} — ${completedRestDay.name}. Protect recovery unless this was intentional.`,
    )
  }

  if (legs.targetSessions > 0 && legs.sets === 0) {
    add('No legs completed. Do not skip legs.')
  }

  if (
    chest.targetSets > 0 &&
    back.targetSets > 0 &&
    getMuscleCompletionRatio(chest) >= 1 &&
    getMuscleCompletionRatio(back) < 0.7
  ) {
    add(
      'You trained chest hard but did not log enough back work. Keep back volume strong to protect shoulders.',
    )
  }

  const proteinMinimum =
    toNumber(nutritionSummary?.proteinMin) || nutritionTargets.proteinMin
  if (
    nutritionSummary?.logCount > 0 &&
    nutritionSummary.averageProtein < proteinMinimum
  ) {
    add(`Protein low. Aim for at least ${proteinMinimum} g per day.`)
  }

  if (nutritionSummary?.logCount > 0 && nutritionSummary.averageWater < 2) {
    add('Water low. Hydration can affect training and recovery.')
  }

  if (!bodySummary?.hasCurrent) {
    add('No body check-in this week.')
  }

  if (posture.targetSessions > 0 && posture.sessions === 0) {
    add('Posture exercises skipped.')
  }

  const waistDown = safeArray(bodySummary?.metrics).some(
    (metric) => metric.label === 'Waist' && metric.change < 0,
  )
  const strengthDropped = safeArray(strengthComparison).some(
    (item) => item?.status === 'decreased',
  )

  if (waistDown && strengthDropped) {
    add('Waist dropped but strength also dropped. Possible under-eating.')
  }

  const waistUp = safeArray(bodySummary?.metrics).some(
    (metric) => metric.label === 'Waist' && metric.change > 1,
  )

  if (waistUp && nutritionSummary?.averageCalories > 0) {
    add('Waist increased. Reduce snacks or nuts slightly.')
  }

  return warnings
}

export function formatWeekRange(start, end) {
  const sameMonth =
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  const firstFormat = new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'long',
  })
  const endFormat = new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: sameMonth ? undefined : 'long',
  })

  return `${firstFormat.format(start)} - ${endFormat.format(end)}`
}

function filterByWeek(items, weekStart, weekEnd, getDate) {
  const start = toValidDate(weekStart)
  const end = toValidDate(weekEnd)
  if (!start || !end) {
    return []
  }

  return safeArray(items).filter((item) => {
    const date = getDate(item)
    return date ? date >= start && date <= end : false
  })
}

function getTargetWorkoutDays(programOrPlan) {
  if (Array.isArray(programOrPlan)) {
    return programOrPlan.filter(
      (day) => toNumber(day?.day) > 0 && !isRestDay(day),
    )
  }

  return safeArray(getTrainingDays(programOrPlan)).filter(
    (day) => toNumber(day?.day) > 0,
  )
}

function getProgramWeeklyTarget(programOrPlan, targetDays) {
  if (Array.isArray(programOrPlan)) {
    return safeArray(targetDays).length
  }

  const target = toNumber(getWeeklyWorkoutTarget(programOrPlan))
  return target >= 0 ? target : safeArray(targetDays).length
}

function getProgramDays(programOrPlan) {
  return Array.isArray(programOrPlan)
    ? programOrPlan
    : safeArray(programOrPlan?.days)
}

function buildExerciseMuscleMap(workoutPlan, library) {
  const entries = []

  safeArray(workoutPlan).forEach((day) => {
    safeArray(day?.exercises).forEach((exercise) => {
      const groups = normalizeMuscleGroups(exercise?.muscleGroup)
      if (!exercise?.name || groups.length === 0) {
        return
      }

      entries.push({
        identity: {
          exerciseId: exercise?.id,
          exerciseName: exercise?.name,
        },
        groups,
      })
    })
  })

  return { entries, library }
}

function resolveLoggedExerciseMuscles(exercise, exerciseMuscleMap, library) {
  const storedGroups = normalizeMuscleGroups(exercise?.muscleGroup)
  if (storedGroups.length > 0) {
    return storedGroups
  }

  const match = safeArray(exerciseMuscleMap?.entries).find((entry) =>
    exerciseIdentitiesMatch(
      {
        exerciseId: exercise?.exerciseId,
        exerciseName: exercise?.exerciseName,
      },
      entry.identity,
      { library: library ?? exerciseMuscleMap?.library },
    ),
  )
  return match?.groups ?? []
}

function buildProgramMuscleTargets(programOrPlan) {
  const targets = Object.fromEntries(
    targetMuscles.map((muscle) => [muscle, { sets: 0, sessions: 0 }]),
  )

  getTargetWorkoutDays(programOrPlan).forEach((day) => {
    const musclesInDay = new Set(normalizeMuscleGroups(safeArray(day?.focus).join(' ')))

    safeArray(day?.exercises)
      .filter((exercise) => exercise?.optional !== true)
      .forEach((exercise) => {
        const groups = normalizeMuscleGroups(exercise?.muscleGroup)
        groups.forEach((muscle) => {
          if (!targets[muscle]) {
            return
          }
          targets[muscle].sets += Math.max(0, toNumber(exercise?.sets))
          musclesInDay.add(muscle)
        })
      })

    musclesInDay.forEach((muscle) => {
      if (targets[muscle]) {
        targets[muscle].sessions += 1
      }
    })
  })

  return targets
}

function normalizeMuscleGroups(muscleGroup) {
  const value = String(muscleGroup ?? '').toLowerCase()
  const groups = []

  if (value.includes('chest')) {
    groups.push('Chest')
  }
  if (value.includes('back') || value.includes('lat')) {
    groups.push('Back')
  }
  if (value.includes('shoulder') || value.includes('delt')) {
    groups.push('Shoulders')
  }
  if (
    value.includes('biceps') ||
    value.includes('triceps') ||
    value.includes('forearm') ||
    value.includes('arm')
  ) {
    groups.push('Arms')
  }
  if (
    value.includes('leg') ||
    value.includes('glute') ||
    value.includes('hamstring') ||
    value.includes('calf')
  ) {
    groups.push('Legs')
  }
  if (value.includes('abs') || value.includes('oblique') || value.includes('core')) {
    groups.push('Abs')
  }
  if (value.includes('posture') || value.includes('mobility')) {
    groups.push('Posture')
  }
  if (
    value.includes('conditioning') ||
    value.includes('cardio') ||
    value.includes('recovery') ||
    value.includes('walking')
  ) {
    groups.push('Cardio')
  }

  return groups
}

function getBestExercisePerformance(sessions, benchmark, options = {}) {
  const candidates = safeArray(sessions)
    .filter(isWorkoutCompleted)
    .flatMap((session) =>
      getSessionExercises(session).filter(
        (exercise) => exerciseIdentitiesMatch(
          {
            exerciseId: exercise?.exerciseId,
            exerciseName: exercise?.exerciseName,
          },
          {
            exerciseId: benchmark.exerciseId,
            exerciseName: benchmark.exerciseName,
          },
          { library: options.library },
        ),
      ),
    )
    .flatMap((exercise) =>
      getSets(exercise).filter((set) => toNumber(set?.reps) > 0),
    )

  if (candidates.length === 0) {
    return null
  }

  const scored = candidates.map((set) => {
    const weight = toNumber(set?.weightKg)
    const reps = toNumber(set?.reps)
    return {
      weight,
      reps,
      score: weight > 0 ? weight * 1000 + reps : reps,
      unit: weight > 0 ? 'kg' : 'reps',
    }
  })

  return scored.sort((a, b) => b.score - a.score)[0] ?? null
}

function normalizeBenchmarkExercises(benchmarks) {
  const seen = new Set()
  const normalized = []

  safeArray(benchmarks).forEach((benchmark) => {
    const exerciseId = nonEmptyText(
      benchmark?.exerciseId ?? benchmark?.canonicalId ?? benchmark?.id,
    )
    const exerciseName = nonEmptyText(
      benchmark?.exerciseName ??
        benchmark?.canonicalName ??
        benchmark?.displayName ??
        benchmark?.name ??
        (typeof benchmark === 'string' ? benchmark : ''),
    )
    if (!exerciseId && !exerciseName) {
      return
    }

    const key = exerciseId
      ? `id:${exerciseId}`
      : `name:${normalizeText(exerciseName)}`
    if (seen.has(key)) {
      return
    }
    seen.add(key)
    normalized.push({
      exerciseId: exerciseId || null,
      exerciseName,
      displayName: exerciseName || exerciseId,
    })
  })

  return normalized
}

function compareBestPerformances(current, previous) {
  if (current.unit === 'kg' || previous.unit === 'kg') {
    const weightDelta = roundOne(current.weight - previous.weight)
    if (weightDelta !== 0) {
      return {
        change: `${formatSigned(weightDelta)} kg`,
        status: weightDelta > 0 ? 'improved' : 'decreased',
      }
    }

    const repDelta = current.reps - previous.reps
    return {
      change: `${formatSigned(repDelta)} reps`,
      status: repDelta > 0 ? 'improved' : repDelta < 0 ? 'decreased' : 'same',
    }
  }

  const delta = current.reps - previous.reps

  return {
    change: `${formatSigned(delta)} reps`,
    status: delta > 0 ? 'improved' : delta < 0 ? 'decreased' : 'same',
  }
}

function formatBest(best) {
  if (!best) {
    return 'No data'
  }

  if (best.weight > 0) {
    return `${roundOne(best.weight)} kg x ${best.reps || '-'}`
  }

  return `${best.reps} reps`
}

function makeBodyMetric(label, key, unit, current, previous, goodDirection) {
  const currentValue = getBodyValue(current, key)
  const previousValue = previous ? getBodyValue(previous, key) : null
  const change =
    currentValue !== null && previousValue !== null
      ? roundOne(currentValue - previousValue)
      : null
  const status = getBodyMetricStatus(change, goodDirection)

  return {
    label,
    current: currentValue,
    previous: previousValue,
    change,
    unit,
    status,
  }
}

function getBodyMetricStatus(change, goodDirection) {
  if (change === null || change === 0 || goodDirection === 'either') {
    return 'neutral'
  }

  return (change > 0 && goodDirection === 'up') ||
    (change < 0 && goodDirection === 'down')
    ? 'good'
    : 'warn'
}

function getMetricChange(metrics, label) {
  const change = safeArray(metrics).find((metric) => metric.label === label)?.change
  return typeof change === 'number' ? change : 0
}

function getBodyValue(checkIn, key) {
  if (!checkIn) {
    return null
  }

  if (key === 'armAverage') {
    const values = [checkIn.leftArmCm, checkIn.rightArmCm].filter(
      (value) => typeof value === 'number' && Number.isFinite(value),
    )
    return values.length > 0 ? roundOne(sum(values) / values.length) : null
  }

  const value = checkIn[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function calculateNutritionPoints(summary) {
  if (!summary || summary.logCount === 0) {
    return 0
  }

  const proteinPoints = getRatio(summary.proteinTargetDays, 5) * 12
  const creatinePoints = getRatio(summary.creatineDays, 5) * 7
  const waterPoints = summary.averageWater >= nutritionTargets.waterMin ? 4 : 0
  const loggingPoints = getRatio(summary.logCount, 5) * 2

  return proteinPoints + creatinePoints + waterPoints + loggingPoints
}

function calculateAbsPosturePoints(muscleVolume) {
  const abs = findMuscle(muscleVolume, 'Abs')
  const posture = findMuscle(muscleVolume, 'Posture')
  const absPoints = abs.targetSessions > 0
    ? getRatio(abs.sessions, abs.targetSessions) * 8
    : 8
  const posturePoints = posture.targetSessions > 0
    ? getRatio(posture.sessions, posture.targetSessions) * 7
    : 7
  return absPoints + posturePoints
}

function calculateProgressionPoints(strengthComparison) {
  const comparable = safeArray(strengthComparison).filter((item) =>
    ['improved', 'same', 'decreased'].includes(item?.status),
  )
  if (comparable.length === 0) {
    return 0
  }

  const improved = comparable.filter((item) => item.status === 'improved').length
  const same = comparable.filter((item) => item.status === 'same').length

  return getRatio(improved + same * 0.35, comparable.length) * 10
}

function buildScoreMessage(label, data) {
  const messages = []
  const chest = findMuscle(data.muscleVolume, 'Chest')
  const back = findMuscle(data.muscleVolume, 'Back')
  const nutrition = data.nutritionSummary

  if ((data.workoutSummary?.completedWorkouts ?? 0) === 0 && nutrition?.logCount === 0) {
    return 'Start logging workouts, nutrition, and check-ins to unlock the review.'
  }

  if (isMuscleTargetMet(chest) && isMuscleTargetMet(back)) {
    messages.push('Chest and back volume were strong.')
  } else if (chest.targetSets > 0 && chest.sets < chest.targetSets) {
    messages.push('Chest volume was low.')
  }

  if (nutrition?.logCount === 0 || nutrition?.proteinTargetDays < 3) {
    messages.push('Nutrition tracking was inconsistent.')
  } else if (
    nutrition?.averageProtein >=
    (toNumber(nutrition?.proteinMin) || nutritionTargets.proteinMin)
  ) {
    messages.push('Protein target was solid.')
  }

  if (!data.bodySummary?.hasCurrent) {
    messages.push('Body check-in is missing.')
  }

  return `${label} week. ${messages.slice(0, 2).join(' ')}`.trim()
}

function getScoreLabel(score) {
  if (score >= 85) {
    return 'Excellent'
  }
  if (score >= 70) {
    return 'Good'
  }
  if (score >= 50) {
    return 'Average'
  }
  return 'Poor consistency'
}

function hasPainLogged(sessions) {
  return safeArray(sessions).some((session) =>
    getSessionExercises(session).some((exercise) =>
      getSets(exercise).some((set) => {
        const notes = String(set?.notes ?? '').toLowerCase()
        return toNumber(set?.painLevel) > 0 || notes.includes('pain')
      }),
    ),
  )
}

function hasTooMuchHighRpe(sessions) {
  const rpes = safeArray(sessions).flatMap((session) =>
    getSessionExercises(session).flatMap((exercise) =>
      getSets(exercise).map((set) => toNumber(set?.rpe)).filter((rpe) => rpe > 0),
    ),
  )
  if (rpes.length === 0) {
    return false
  }

  const high = rpes.filter((rpe) => rpe >= 9.5).length
  return high >= 4 || high / rpes.length > 0.3
}

function findMuscle(muscleVolume, muscle) {
  return (
    safeArray(muscleVolume).find((item) => item?.muscle === muscle) ?? {
      muscle,
      sets: 0,
      sessions: 0,
      targetSets: 0,
      targetSessions: 0,
      message: '',
      status: 'neutral',
    }
  )
}

function isBelowScheduledFrequency(summary) {
  return summary.targetSessions > 0 && summary.sessions < summary.targetSessions
}

function isMuscleTargetMet(summary) {
  if (summary.targetSets <= 0 && summary.targetSessions <= 0) {
    return false
  }
  return (
    (summary.targetSets <= 0 || summary.sets >= summary.targetSets) &&
    (summary.targetSessions <= 0 || summary.sessions >= summary.targetSessions)
  )
}

function getMuscleCompletionRatio(summary) {
  if (summary.targetSets > 0) {
    return summary.sets / summary.targetSets
  }
  if (summary.targetSessions > 0) {
    return summary.sessions / summary.targetSessions
  }
  return 1
}

function getScheduledExerciseNames(programOrPlan, muscles) {
  const wanted = new Set(safeArray(muscles))
  return uniqueTexts(
    getTargetWorkoutDays(programOrPlan).flatMap((day) =>
      safeArray(day?.exercises)
        .filter((exercise) =>
          normalizeMuscleGroups(exercise?.muscleGroup).some((muscle) =>
            wanted.has(muscle),
          ),
        )
        .map((exercise) => exercise?.name),
    ),
  )
}

function findCompletedRestDay(weekSessions, programOrPlan) {
  const restDays = Array.isArray(programOrPlan)
    ? programOrPlan.filter(isRestDay)
    : safeArray(getRestDays(programOrPlan))
  const trueRestDays = restDays.filter(
    (day) => normalizeText(day?.name) === 'rest',
  )

  return trueRestDays.find((day) =>
    safeArray(weekSessions).some((session) => {
      if (!isWorkoutCompleted(session) || isStandaloneWorkoutSession(session)) {
        return false
      }
      const dayId = toNumber(session?.workoutDayId)
      return dayId > 0
        ? dayId === toNumber(day?.day)
        : normalizeText(session?.workoutName) === normalizeText(day?.name)
    }),
  ) ?? null
}

function sortByDate(items) {
  return safeArray(items).sort((a, b) => getCheckInTime(a) - getCheckInTime(b))
}

function getCheckInTime(checkIn) {
  const date = getDatedItemDate(checkIn)
  if (date) {
    return date.getTime()
  }

  const createdAt = toValidDate(checkIn?.createdAt)
  return createdAt ? createdAt.getTime() : 0
}

function getSessionDate(session) {
  const finishedAt = toValidDate(session?.finishedAt)
  if (finishedAt) {
    return finishedAt
  }

  return getDatedItemDate(session)
}

function getDatedItemDate(item) {
  const dateValue = typeof item?.date === 'string' ? item.date : ''
  if (!dateValue) {
    return null
  }

  const parsed = new Date(`${dateValue.slice(0, 10)}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function getSessionDurationMinutes(session) {
  const started = toValidDate(session?.startedAt)
  const finished = toValidDate(session?.finishedAt)
  if (!started || !finished) {
    return 0
  }

  const minutes = Math.round((finished.getTime() - started.getTime()) / 60000)
  return Number.isFinite(minutes) && minutes > 0 ? minutes : 0
}

function formatMinutes(minutes) {
  if (!minutes) {
    return '-'
  }

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return hours > 0 ? `${hours}h ${rest}m` : `${rest} min`
}

function isWorkoutCompleted(session) {
  return (
    session?.completed === true ||
    getSessionExercises(session).some((exercise) => getCompletedSets(exercise).length)
  )
}

function isStandaloneWorkoutSession(session) {
  return session?.sessionType === 'standalone'
}

function getSessionExercises(session) {
  return safeArray(session?.exercises)
}

function getCompletedSets(exercise) {
  return getSets(exercise).filter(isCompletedSet)
}

function getSets(exercise) {
  return safeArray(exercise?.sets)
}

function isCompletedSet(set) {
  return toNumber(set?.reps) > 0 || toNumber(set?.timeSeconds) > 0
}

function average(values, decimals = 0) {
  const numbers = safeArray(values)
    .map(toNumberOrNull)
    .filter((value) => value !== null)

  if (numbers.length === 0) {
    return 0
  }

  const factor = 10 ** decimals
  return Math.round((sum(numbers) / numbers.length) * factor) / factor
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0)
}

function getRatio(value, target) {
  if (!target) {
    return 0
  }
  return Math.max(0, Math.min(toNumber(value) / target, 1))
}

function toValidDate(value) {
  const date = value instanceof Date ? new Date(value) : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') {
    return 0
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function roundOne(value) {
  return Math.round(value * 10) / 10
}

function formatSigned(value) {
  if (value > 0) {
    return `+${roundOne(value)}`
  }
  return String(roundOne(value))
}

function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase()
}

function nonEmptyText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function uniqueTexts(values) {
  return [...new Set(safeArray(values).map(nonEmptyText).filter(Boolean))]
}

function safeArray(value) {
  return Array.isArray(value) ? value : []
}
