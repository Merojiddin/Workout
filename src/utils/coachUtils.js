import { exerciseIdentitiesMatch } from '../data/exerciseIdentity'
import { isTimedExercise } from './exerciseLoggingUtils'
import { getTrainingDays, isRestDay } from './activeWorkoutProgram'
import { nutritionTargets } from './nutritionUtils'

const postureCue =
  'Ribs down. Abs tight. Glutes slightly squeezed. Do not over-arch lower back.'

const absReminder =
  'Visible abs come from lower overall body fat and stronger abs. You cannot spot-reduce lower-back fat.'

const postureCautionKeywords = [
  'push-up',
  'push up',
  'plank',
  'squat',
  'deadlift',
  'romanian',
  'rdl',
  'bench',
  'dip',
  'row',
  'overhead',
  'hinge',
]

export function getTodayWorkoutAdvice({
  todayWorkout,
  sessions,
  progressionSuggestions,
  activeProgram,
  library,
}) {
  const exercises = safeArray(todayWorkout?.exercises)
  const suggestions = safeArray(progressionSuggestions).filter((suggestion) =>
    exercises.some((exercise) =>
      exerciseIdentitiesMatch(
        { exerciseName: suggestion?.exerciseName },
        { exerciseId: exercise?.id, exerciseName: exercise?.name },
        { library },
      ),
    ),
  )
  const title = todayWorkout
    ? `Day ${todayWorkout.day ?? '-'} - ${todayWorkout.name ?? 'Workout'}`
    : 'Today workout'
  const focusAreas = safeArray(todayWorkout?.focus).filter(Boolean)
  const programLabel = activeProgram?.programName
    ? `${activeProgram.programName}${activeProgram.programVersion ? ` ${activeProgram.programVersion}` : ''}`
    : ''
  const effortRule = safeArray(activeProgram?.rules?.effort)[0] ?? ''
  const activePostureCue = activeProgram?.rules?.postureCue || postureCue

  if (todayWorkout && isRestDay(todayWorkout)) {
    return {
      title,
      message: `${todayWorkout.name} is the scheduled rest day${programLabel ? ` in ${programLabel}` : ''}. Recover and resume the next prescribed training day.`,
      pushExercises: [],
      controlExercises: [],
      postureCautionExercises: [],
      focusAreas,
      programLabel,
      programRule: effortRule,
      restDay: true,
      intensityRecommendation:
        'Rest today. Optional easy mobility or walking should stay comfortable.',
    }
  }

  if (exercises.length === 0) {
    return {
      title,
      message: 'Complete workouts and logs to unlock better coaching.',
      pushExercises: [],
      controlExercises: [],
      postureCautionExercises: [],
      focusAreas,
      programLabel,
      programRule: effortRule,
      restDay: false,
      intensityRecommendation: 'Keep the day light and log what you complete.',
    }
  }

  const repetitionExercises = exercises.filter((exercise) => !isTimedExercise(exercise))
  const timedExercises = exercises.filter(isTimedExercise)
  const pushExercises = uniqueNames([
    ...suggestions
      .filter((suggestion) => ['increase', 'keep'].includes(suggestion?.type))
      .map((suggestion) => suggestion.exerciseName),
    ...repetitionExercises.map((exercise) => exercise.name),
  ]).slice(0, 3)

  const controlExercises = uniqueNames([
    ...suggestions
      .filter((suggestion) =>
        ['reduce', 'form-warning'].includes(suggestion?.type),
      )
      .map((suggestion) => suggestion.exerciseName),
    ...timedExercises.map((exercise) => exercise.name),
    ...exercises
      .filter((exercise) => needsControl(exercise) && !pushExercises.includes(exercise.name))
      .map((exercise) => exercise.name),
  ]).slice(0, 4)

  const postureCautionExercises = uniqueNames(
    exercises.filter(hasPostureCaution).map((exercise) => exercise.name),
  ).slice(0, 6)

  const latestSession = getLatestCompletedSession(sessions)
  const latestAverageRpe = getSessionAverageRpe(latestSession)
  const recentPain = getRecentMaxPain(sessions, 7)
  const hasReduceSuggestion = suggestions.some((suggestion) =>
    ['reduce', 'form-warning'].includes(suggestion?.type),
  )

  let intensityRecommendation =
    effortRule || 'Normal training. Keep most sets controlled with reps in reserve.'
  if (recentPain >= 4) {
    intensityRecommendation =
      'Reduce intensity. Stop any exercise that keeps hurting.'
  } else if (latestAverageRpe >= 9.5 || hasReduceSuggestion) {
    intensityRecommendation =
      'Train, but reduce intensity and leave 2-3 reps in reserve.'
  } else if (suggestions.some((suggestion) => suggestion?.type === 'increase')) {
    intensityRecommendation =
      'Good day to progress, but keep 1-2 reps in reserve.'
  } else if (timedExercises.length === exercises.length) {
    intensityRecommendation =
      'Use the prescribed durations at controlled effort; do not chase extra time or load.'
  }

  const focus = focusAreas.join(', ') || "today's prescribed work"
  const postureSuffix = postureCautionExercises.length > 0
    ? ` ${activePostureCue}`
    : ''
  const message =
    recentPain >= 4
      ? 'Pain was logged recently. Reduce intensity or stop the exercise. If pain continues, get checked by a professional.'
      : `Focus on ${focus}. Follow the prescribed exercises and keep every set controlled.${postureSuffix}`

  return {
    title,
    message,
    pushExercises,
    controlExercises,
    postureCautionExercises,
    focusAreas,
    programLabel,
    programRule: effortRule,
    restDay: false,
    intensityRecommendation,
  }
}

export function calculateReadinessScore({
  sessions,
  nutritionLogs,
  bodyCheckIns,
  activeProgram,
  targets = nutritionTargets,
}) {
  let score = 75
  const reasons = []
  const proteinMinimum =
    toNumber(targets?.proteinMin) || nutritionTargets.proteinMin
  const proteinLowThreshold = Math.max(1, proteinMinimum - 20)
  const yesterday = getDateKey(addDays(new Date(), -1))
  const yesterdayNutrition = safeArray(nutritionLogs).find(
    (log) => log?.date === yesterday,
  )
  const latestCheckIn = getLatestDatedItem(bodyCheckIns)
  const recentPain = getRecentMaxPain(sessions, 7)
  const latestSession = getLatestCompletedSession(sessions)
  const latestAverageRpe = getSessionAverageRpe(latestSession)
  const hardYesterday = isHardSessionYesterday(latestSession)

  if (yesterdayNutrition) {
    const protein = toNumber(yesterdayNutrition.proteinGrams)
    const water = toNumber(yesterdayNutrition.waterLiters)

    if (protein >= proteinMinimum) {
      score += 10
      reasons.push(`Protein target (${proteinMinimum}+ g) reached yesterday.`)
    } else if (protein > 0 && protein < proteinLowThreshold) {
      score -= 10
      reasons.push(`Protein was below ${proteinLowThreshold} g yesterday.`)
    }

    if (yesterdayNutrition.creatineTaken) {
      score += 5
      reasons.push('Creatine taken yesterday.')
    }

    if (water >= nutritionTargets.waterMin) {
      score += 5
      reasons.push('Water reached 2 L yesterday.')
    } else if (water > 0 && water < nutritionTargets.waterMin) {
      score -= 5
      reasons.push('Water was below 2 L yesterday.')
    }
  } else {
    reasons.push('No nutrition log from yesterday.')
  }

  if (toNumber(latestCheckIn?.sleepQuality) >= 7) {
    score += 5
    reasons.push('Latest sleep quality was 7/10 or better.')
  } else if (latestCheckIn?.sleepQuality != null) {
    reasons.push('Latest sleep quality was below 7/10.')
  }

  if (recentPain >= 4) {
    score -= 15
    reasons.push('Pain level 4+ was logged recently.')
  } else if (safeArray(sessions).length > 0) {
    score += 5
    reasons.push('No high pain logged recently.')
  }

  if (latestAverageRpe >= 9.8) {
    score -= 10
    reasons.push('Latest workout averaged around RPE 10.')
  }

  if (hardYesterday) {
    score -= 10
    reasons.push('A hard workout was logged yesterday.')
  }

  if (hasNoRestDayInLastSevenDays(sessions, activeProgram)) {
    score -= 10
    reasons.push('No rest or light day found in the last 7 days.')
  }

  score = clamp(Math.round(score), 0, 100)

  return {
    score,
    label: getReadinessLabel(score),
    message: getReadinessMessage(score),
    reasons: reasons.slice(0, 5),
  }
}

export function getNutritionCoachAdvice(
  nutritionLogs,
  targets = nutritionTargets,
) {
  const logs = safeArray(nutritionLogs)
  const todayLog = logs.find((log) => log?.date === getDateKey(new Date()))

  if (!todayLog) {
    return [
      `Log nutrition today. Protein target is ${targets.proteinMin}-${targets.proteinMax} g.`,
      'Take 3-5 g creatine today.',
      'Drink at least 2 L water.',
    ]
  }

  const advice = []
  const protein = toNumber(todayLog.proteinGrams)
  const water = toNumber(todayLog.waterLiters)

  if (protein < targets.proteinMin) {
    advice.push('Protein is low. Add whey, eggs, seafood, or yogurt.')
  } else if (protein <= targets.proteinMax) {
    advice.push('Protein target reached.')
  } else if (protein > (targets.proteinHigh ?? targets.proteinMax + 20)) {
    advice.push('Protein is high. Make sure calories are controlled.')
  } else {
    advice.push('Protein is above target. Keep calories controlled.')
  }

  if (water < nutritionTargets.waterMin) {
    advice.push('Drink more water, especially with creatine.')
  }

  if (!todayLog.creatineTaken) {
    advice.push('Take 3-5 g creatine today.')
  }

  if (!todayLog.wheyTaken && protein < targets.proteinMin) {
    advice.push('Use whey to close the protein gap.')
  }

  if (advice.length === 1 && todayLog.creatineTaken && water >= nutritionTargets.waterMin) {
    advice.push('Keep meals halal-friendly and repeat the same simple protein habits tomorrow.')
  }

  return advice
}

export function getBodyRecompositionAdvice(
  bodyCheckIns,
  workoutSessions,
  options = {},
) {
  const checkIns = sortByDate(safeArray(bodyCheckIns))
  const latest = checkIns.at(-1)
  const previous = checkIns.length > 1 ? checkIns.at(-2) : null

  if (!latest) {
    return ['Complete a body check-in this week to unlock body recomposition advice.']
  }

  const advice = []
  const daysSinceLatest = daysBetween(new Date(`${latest.date}T00:00:00`), new Date())

  if (daysSinceLatest >= 7) {
    advice.push('Do body check-in this week.')
  }

  if (!previous) {
    advice.push('Need one more body check-in before trend advice becomes reliable.')
    return advice
  }

  const chestChange = diff(latest.chestCm, previous.chestCm)
  const shoulderChange = diff(latest.shouldersCm, previous.shouldersCm)
  const waistChange = diff(latest.waistCm, previous.waistCm)
  const bellyChange = diff(latest.bellyCm, previous.bellyCm)
  const weightChange = diff(latest.bodyWeightKg, previous.bodyWeightKg)
  const strengthDecreased = hasRecentStrengthDecrease(
    workoutSessions,
    options.library,
  )

  if ((chestChange > 0 || shoulderChange > 0) && waistChange <= 0.3) {
    advice.push('Good recomposition signal.')
  }

  if (weightChange > 0.3 && (waistChange > 0.8 || bellyChange > 0.8)) {
    advice.push('Calorie surplus may be too high. Reduce snacks/nuts slightly.')
  }

  if ((waistChange < -0.3 || bellyChange < -0.3) && strengthDecreased) {
    advice.push('You may be under-eating. Do not cut too hard.')
  }

  if (advice.length === 0) {
    advice.push('Body direction is stable. Keep waist controlled while strength moves up.')
  }

  return advice
}

export function getAbsPostureAdvice(
  sessions,
  programOrPlan,
  options = {},
) {
  const weekSessions = getThisWeekCompletedSessions(sessions)
  const trainingDays = getProgramTrainingDays(programOrPlan)
  const planExercises = trainingDays.flatMap((day) => safeArray(day?.exercises))
  const muscleTargets = buildProgramMuscleFrequencyTargets(programOrPlan)
  const absSessionsThisWeek = countSessionsMatching(weekSessions, (exercise) =>
    loggedExerciseMatchesMuscle(
      exercise,
      planExercises,
      'Abs',
      options.library,
    ),
  )
  const postureSessionsThisWeek = countSessionsMatching(weekSessions, (exercise) =>
    loggedExerciseMatchesMuscle(
      exercise,
      planExercises,
      'Posture',
      options.library,
    ),
  )
  const absTargetSessions = muscleTargets.Abs
  const postureTargetSessions = muscleTargets.Posture
  const advice = []
  const recommendedExercises = []
  const scheduledAbsExercises = getExercisesForMuscles(
    trainingDays,
    ['Abs'],
  )
  const scheduledPostureExercises = getExercisesForMuscles(
    trainingDays,
    ['Posture'],
  )

  if (absTargetSessions === 0) {
    advice.push('No dedicated abs frequency is prescribed by the active program.')
  } else if (absSessionsThisWeek < absTargetSessions) {
    advice.push(
      `Complete the active program’s scheduled abs work (${absSessionsThisWeek}/${absTargetSessions} sessions logged).`,
    )
    recommendedExercises.push(...scheduledAbsExercises)
  } else {
    advice.push('Abs frequency is on target. Keep every rep controlled.')
  }

  if (postureTargetSessions === 0) {
    advice.push('No dedicated posture frequency is prescribed by the active program.')
  } else if (postureSessionsThisWeek < postureTargetSessions) {
    advice.push(
      `Complete the active program’s scheduled posture work (${postureSessionsThisWeek}/${postureTargetSessions} sessions logged).`,
    )
    recommendedExercises.push(...scheduledPostureExercises)
  } else {
    advice.push('Posture frequency is on target.')
  }

  advice.push(programOrPlan?.rules?.postureCue || postureCue)
  advice.push(absReminder)

  return {
    absSessionsThisWeek,
    absTargetSessions,
    postureSessionsThisWeek,
    postureTargetSessions,
    advice,
    recommendedExercises: uniqueNames(recommendedExercises).slice(0, 5),
  }
}

export function getCoachWarnings({
  sessions,
  nutritionLogs,
  bodyCheckIns,
  muscleVolume,
  warningSensitivity = 'Normal',
  activeProgram,
  targets = nutritionTargets,
}) {
  const warnings = []
  const add = (warning) => {
    if (warning && !warnings.includes(warning)) {
      warnings.push(warning)
    }
  }
  const sensitivity = String(warningSensitivity).toLowerCase()
  const proteinMinimum =
    toNumber(targets?.proteinMin) || nutritionTargets.proteinMin
  const proteinFloor = Math.max(
    1,
    proteinMinimum + (sensitivity === 'high' ? 10 : sensitivity === 'low' ? -20 : 0),
  )
  const waterFloor = sensitivity === 'low' ? 1.7 : 2
  const recentPain = getRecentMaxPain(sessions, 7)
  const rpes = getRecentSets(sessions, 7).map((set) => toNumber(set.rpe)).filter(Boolean)
  const highRpeCount = rpes.filter((rpe) => rpe >= 10).length
  const chest = findMuscle(muscleVolume, 'Chest')
  const back = findMuscle(muscleVolume, 'Back')
  const legs = findMuscle(muscleVolume, 'Legs')
  const posture = findMuscle(muscleVolume, 'Posture')
  const latestNutrition = getLatestDatedItem(nutritionLogs)
  const checkIns = sortByDate(safeArray(bodyCheckIns))
  const latestCheckIn = checkIns.at(-1)
  const previousCheckIn = checkIns.length > 1 ? checkIns.at(-2) : null

  if (recentPain >= 4) {
    add('Pain level 4+ logged. Reduce intensity or stop the exercise. If pain continues, get checked by a professional.')
  }

  if (highRpeCount >= (sensitivity === 'high' ? 1 : 2)) {
    add('RPE 10 is showing up too often. Do not force extra reps next set.')
  }

  if (
    getMuscleTargetRatio(chest) >= 1 &&
    getMuscleTargetRatio(back) < 0.7 &&
    back.targetSets > 0
  ) {
    add('You trained chest heavily but back volume is low. Keep back training strong to protect shoulders.')
  }

  if (hasNoRestDayInLastSevenDays(sessions, activeProgram)) {
    const restDay = getProgramRestDayLabel(activeProgram)
    add(
      restDay
        ? `No rest day found in the last 7 days. Keep the scheduled ${restDay}.`
        : 'No rest or light day found in the last 7 days. Protect recovery.',
    )
  }

  if (
    getThisWeekCompletedSessions(sessions).length > 0 &&
    legs.targetSessions > 0 &&
    legs.sets === 0
  ) {
    add('No legs this week. Do not skip legs; they support posture and balance.')
  }

  if (latestNutrition && toNumber(latestNutrition.proteinGrams) < proteinFloor) {
    add(`Protein low. Reach at least ${proteinFloor} g today.`)
  }

  if (latestNutrition && toNumber(latestNutrition.waterLiters) < waterFloor) {
    add('Water low. Hydration can affect training and recovery.')
  }

  if (!latestCheckIn || daysBetween(new Date(`${latestCheckIn.date}T00:00:00`), new Date()) >= 7) {
    add('No body check-in this week.')
  }

  if (previousCheckIn && latestCheckIn) {
    const waistChange = diff(latestCheckIn.waistCm, previousCheckIn.waistCm)
    const bellyChange = diff(latestCheckIn.bellyCm, previousCheckIn.bellyCm)
    if (waistChange > 1 || bellyChange > 1) {
      add('Waist/belly increased quickly. Control calories and reduce snacks/nuts slightly.')
    }
  }

  if (posture.targetSessions > 0 && posture.sessions === 0) {
    const postureExercises = getExercisesForMuscles(
      getProgramTrainingDays(activeProgram),
      ['Posture'],
    ).slice(0, 3)
    add(
      postureExercises.length > 0
        ? `No posture work logged. Complete the scheduled work: ${postureExercises.join(', ')}.`
        : 'No scheduled posture work was logged this week.',
    )
  }

  return warnings
}

export function generateTodayActionPlan({
  todayWorkout,
  readiness,
  nutritionAdvice,
  bodyAdvice,
  absPostureAdvice,
  warnings,
  targets = nutritionTargets,
}) {
  const items = []
  const add = (item) => {
    if (item && !items.includes(item) && items.length < 5) {
      items.push(item)
    }
  }
  const workoutName = todayWorkout?.name ? `Day ${todayWorkout.day} workout` : 'today workout'
  const restDay = todayWorkout ? isRestDay(todayWorkout) : false

  if (restDay) {
    add(`Follow the scheduled ${todayWorkout.name || 'rest day'}.`)
  } else if (safeArray(todayWorkout?.exercises).length > 0) {
    add(`Complete ${workoutName}.`)
  } else {
    add('Set up today workout or complete a light recovery session.')
  }

  if (restDay) {
    add('Keep optional recovery activity easy and comfortable.')
  } else if ((readiness?.score ?? 0) >= 85) {
    add('Push key lifts while keeping 1-2 reps in reserve.')
  } else if ((readiness?.score ?? 0) >= 70) {
    add('Keep most sets at RPE 8-9.')
  } else if ((readiness?.score ?? 0) >= 50) {
    add('Reduce load or volume by 10-20%.')
  } else {
    add('Use recovery work and stop any painful exercise.')
  }

  const nutritionText = safeArray(nutritionAdvice).join(' ').toLowerCase()
  const bodyText = safeArray(bodyAdvice).join(' ').toLowerCase()
  if (nutritionText.includes('creatine')) {
    add('Take 3-5 g creatine.')
  }
  if (nutritionText.includes('protein') || nutritionText.includes('nutrition')) {
    const proteinMinimum =
      toNumber(targets?.proteinMin) || nutritionTargets.proteinMin
    add(`Reach at least ${proteinMinimum} g protein.`)
  }
  if (nutritionText.includes('water')) {
    add('Drink at least 2 L water.')
  }

  if (
    absPostureAdvice?.absTargetSessions > 0 &&
    absPostureAdvice.absSessionsThisWeek < absPostureAdvice.absTargetSessions
  ) {
    add(
      absPostureAdvice.recommendedExercises?.length
        ? `Complete scheduled core work: ${absPostureAdvice.recommendedExercises.slice(0, 3).join(', ')}.`
        : 'Complete the active program’s scheduled core work.',
    )
  } else if (
    absPostureAdvice?.postureTargetSessions > 0 &&
    absPostureAdvice.postureSessionsThisWeek <
      absPostureAdvice.postureTargetSessions
  ) {
    add(
      absPostureAdvice.recommendedExercises?.length
        ? `Complete scheduled posture work: ${absPostureAdvice.recommendedExercises.slice(0, 3).join(', ')}.`
        : 'Complete the active program’s scheduled posture work.',
    )
  }

  if (bodyText.includes('surplus')) {
    add('Keep calories controlled and reduce snacks/nuts slightly.')
  } else if (bodyText.includes('under-eating')) {
    add('Do not cut too hard; keep strength stable.')
  }

  if (safeArray(warnings).some((warning) => warning.toLowerCase().includes('pain'))) {
    add('Do not increase load through pain.')
  }

  while (items.length < 3) {
    add('Log workout, nutrition, and body notes today.')
    add('Keep form clean from the first set.')
  }

  return items.slice(0, 5)
}

export function getMotivationalCoachMessage(readiness, weeklyScore) {
  const readinessScore = readiness?.score ?? 0
  const weekScore = weeklyScore?.score ?? 0

  if (readinessScore < 50) {
    return 'Recovery is not perfect today. Train light or recover; do not chase max reps.'
  }

  if (readinessScore < 70) {
    return 'Train today, but keep the session clean and leave extra reps in reserve.'
  }

  if (weekScore >= 80) {
    return 'Good day to train. Stay controlled and beat last week by small margins.'
  }

  return 'Your consistency is the main target today. Finish the session clean.'
}

export function getWeeklyCoachConclusion({
  workoutSummary,
  nutritionSummary,
  bodySummary,
  focusItems,
  muscleVolume,
}) {
  const targetWorkouts = workoutSummary?.targetWorkouts ?? 0
  const scheduledCompletedWorkouts =
    workoutSummary?.scheduledCompletedWorkouts ??
    workoutSummary?.completedWorkouts ??
    0
  const training =
    targetWorkouts > 0 &&
    scheduledCompletedWorkouts >= targetWorkouts
      ? 'Training consistency was strong.'
      : `Training consistency was ${scheduledCompletedWorkouts}/${targetWorkouts} workouts.`
  const chest = findMuscle(muscleVolume, 'Chest')
  const back = findMuscle(muscleVolume, 'Back')
  const volume =
    isMuscleTargetMet(chest) && isMuscleTargetMet(back)
      ? 'Chest and back volume were balanced.'
      : isMuscleTargetMet(chest)
        ? 'Chest volume was strong; keep back volume high too.'
        : 'Complete the active program’s scheduled training volume next week.'
  const nutrition =
    (nutritionSummary?.proteinTargetDays ?? 0) >= 5
      ? 'Protein consistency was good.'
      : 'Protein tracking was inconsistent.'
  const body =
    bodySummary?.messages?.[0] ??
    (bodySummary?.hasCurrent
      ? 'Body direction is being tracked.'
      : 'Body check-in is missing.')
  const next = safeArray(focusItems)[0] ?? 'Next week, log every workout and keep water at 2-3 L.'

  return `${training} ${volume} ${nutrition} ${body} Next week: ${next}`
}

export function getLiveWorkoutCoachMessage(set) {
  const rpe = toNumber(set?.rpe)
  const pain = toNumber(set?.painLevel)

  if (pain >= 4) {
    return {
      tone: 'danger',
      message: 'Stop increasing load. Reduce intensity or stop this exercise.',
    }
  }

  if (rpe >= 9.5) {
    return {
      tone: 'warn',
      message: 'Do not force extra reps next set.',
    }
  }

  return {
    tone: 'info',
    message: 'Controlled reps. Stop 1-2 reps before form breaks.',
  }
}

export function getCoachPriorityItems(advice) {
  const items = []
  const add = (item) => {
    if (item && !items.includes(item) && items.length < 4) {
      items.push(item)
    }
  }

  safeArray(advice?.pushExercises).slice(0, 2).forEach((exercise) => add(`${exercise} strength`))
  safeArray(advice?.controlExercises).slice(0, 1).forEach((exercise) =>
    add(`${exercise} control`),
  )
  safeArray(advice?.focusAreas).slice(0, 2).forEach(add)
  if (advice?.restDay) {
    add('Scheduled recovery')
  }
  return items
}

function needsControl(exercise) {
  const text = getExerciseText(exercise)
  return (
    text.includes('dip') ||
    text.includes('deadlift') ||
    text.includes('romanian') ||
    text.includes('rdl') ||
    text.includes('squat') ||
    text.includes('plank')
  )
}

function hasPostureCaution(exercise) {
  const text = getExerciseText(exercise)
  return postureCautionKeywords.some((keyword) => text.includes(keyword))
}

function getExerciseText(exercise) {
  return [
    exercise?.name,
    exercise?.muscleGroup,
    exercise?.equipment,
    safeArray(exercise?.formTips).join(' '),
    exercise?.notes,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function countSessionsMatching(sessions, predicate) {
  return safeArray(sessions).filter((session) =>
    safeArray(session?.exercises).some(predicate),
  ).length
}

function getProgramTrainingDays(programOrPlan) {
  return Array.isArray(programOrPlan)
    ? programOrPlan.filter((day) => !isRestDay(day))
    : safeArray(getTrainingDays(programOrPlan))
}

function buildProgramMuscleFrequencyTargets(programOrPlan) {
  const targets = { Abs: 0, Posture: 0 }

  getProgramTrainingDays(programOrPlan).forEach((day) => {
    const muscles = new Set(
      normalizeMuscleGroups(safeArray(day?.focus).join(' ')),
    )
    safeArray(day?.exercises).forEach((exercise) => {
      normalizeMuscleGroups(exercise?.muscleGroup).forEach((muscle) =>
        muscles.add(muscle),
      )
    })
    Object.keys(targets).forEach((muscle) => {
      if (muscles.has(muscle)) {
        targets[muscle] += 1
      }
    })
  })

  return targets
}

function loggedExerciseMatchesMuscle(exercise, planExercises, muscle, library) {
  const storedGroups = normalizeMuscleGroups(exercise?.muscleGroup)
  if (storedGroups.length > 0) {
    return storedGroups.includes(muscle)
  }

  const planExercise = safeArray(planExercises).find((candidate) =>
    exerciseIdentitiesMatch(
      {
        exerciseId: exercise?.exerciseId,
        exerciseName: exercise?.exerciseName,
      },
      {
        exerciseId: candidate?.id,
        exerciseName: candidate?.name,
      },
      { library },
    ),
  )
  return normalizeMuscleGroups(planExercise?.muscleGroup).includes(muscle)
}

function getExercisesForMuscles(days, muscles) {
  const wanted = new Set(safeArray(muscles))
  return uniqueNames(
    safeArray(days).flatMap((day) =>
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

function normalizeMuscleGroups(value) {
  const text = String(value ?? '').toLowerCase()
  const groups = []

  if (text.includes('chest')) groups.push('Chest')
  if (text.includes('back') || text.includes('lat')) groups.push('Back')
  if (text.includes('shoulder') || text.includes('delt')) groups.push('Shoulders')
  if (
    text.includes('biceps') ||
    text.includes('triceps') ||
    text.includes('forearm') ||
    text.includes('arm')
  ) groups.push('Arms')
  if (
    text.includes('leg') ||
    text.includes('glute') ||
    text.includes('hamstring') ||
    text.includes('calf') ||
    text.includes('quad')
  ) groups.push('Legs')
  if (
    text.includes('abs') ||
    text.includes('oblique') ||
    text.includes('core')
  ) groups.push('Abs')
  if (text.includes('posture') || text.includes('mobility')) {
    groups.push('Posture')
  }
  if (
    text.includes('conditioning') ||
    text.includes('cardio') ||
    text.includes('recovery') ||
    text.includes('walking') ||
    text.includes('swimming')
  ) groups.push('Cardio')

  return [...new Set(groups)]
}

function getLatestCompletedSession(sessions) {
  return safeArray(sessions)
    .filter(isCompletedSession)
    .sort((a, b) => getSessionTime(b) - getSessionTime(a))[0] ?? null
}

function getThisWeekCompletedSessions(sessions) {
  const weekStart = getStartOfWeek(new Date())
  const weekEnd = addDays(weekStart, 7)
  return safeArray(sessions)
    .filter(isCompletedSession)
    .filter((session) => {
      const time = getSessionTime(session)
      return time >= weekStart.getTime() && time < weekEnd.getTime()
    })
}

function getRecentSets(sessions, days) {
  const cutoff = addDays(new Date(), -days).getTime()
  return safeArray(sessions)
    .filter((session) => getSessionTime(session) >= cutoff)
    .flatMap((session) =>
      safeArray(session?.exercises).flatMap((exercise) => safeArray(exercise?.sets)),
    )
}

function getRecentMaxPain(sessions, days) {
  return getRecentSets(sessions, days).reduce((max, set) => {
    const notes = String(set?.notes ?? '').toLowerCase()
    const notePain = notes.includes('pain') ? 4 : 0
    return Math.max(max, toNumber(set?.painLevel), notePain)
  }, 0)
}

function getSessionAverageRpe(session) {
  const rpes = safeArray(session?.exercises)
    .flatMap((exercise) => safeArray(exercise?.sets))
    .map((set) => toNumber(set?.rpe))
    .filter((rpe) => rpe > 0)

  if (rpes.length === 0) {
    return 0
  }

  return rpes.reduce((sum, rpe) => sum + rpe, 0) / rpes.length
}

function hasNoRestDayInLastSevenDays(sessions, programOrPlan) {
  const recentCompleted = safeArray(sessions)
    .filter(isCompletedSession)
    .filter(
      (session) =>
        daysBetween(new Date(getSessionTime(session)), new Date()) < 7,
    )
  const recoveryDayIds = new Set(
    (Array.isArray(programOrPlan)
      ? programOrPlan
      : safeArray(programOrPlan?.days)
    )
      .filter(isRestDay)
      .map((day) => Number(day?.day))
      .filter((day) => Number.isFinite(day)),
  )

  if (
    recentCompleted.some(
      (session) =>
        session?.sessionType !== 'standalone' &&
        recoveryDayIds.has(Number(session?.workoutDayId)),
    )
  ) {
    return false
  }

  const completedDateKeys = new Set(
    recentCompleted.map((session) =>
      getDateKey(new Date(getSessionTime(session))),
    ),
  )

  return completedDateKeys.size >= 7
}

function isHardSessionYesterday(session) {
  if (!session) {
    return false
  }

  const yesterday = getDateKey(addDays(new Date(), -1))
  return getDateKey(new Date(getSessionTime(session))) === yesterday && getSessionAverageRpe(session) >= 9
}

function hasRecentStrengthDecrease(sessions, library) {
  const completed = safeArray(sessions)
    .filter(isCompletedSession)
    .sort((a, b) => getSessionTime(b) - getSessionTime(a))
  const latest = completed[0]
  const previous = completed.find((session) => session?.id !== latest?.id)

  if (!latest || !previous) {
    return false
  }

  return safeArray(latest.exercises).some((exercise) => {
    const previousExercise = safeArray(previous.exercises).find(
      (candidate) =>
        exerciseIdentitiesMatch(
          {
            exerciseId: candidate?.exerciseId,
            exerciseName: candidate?.exerciseName,
          },
          {
            exerciseId: exercise?.exerciseId,
            exerciseName: exercise?.exerciseName,
          },
          { library },
        ),
    )
    if (!previousExercise) {
      return false
    }

    const latestBest = getBestSetScore(exercise)
    const previousBest = getBestSetScore(previousExercise)
    return latestBest > 0 && previousBest > 0 && latestBest < previousBest * 0.95
  })
}

function getBestSetScore(exercise) {
  return Math.max(
    0,
    ...safeArray(exercise?.sets).map((set) => {
      const reps = toNumber(set?.reps)
      const weight = toNumber(set?.weightKg)
      return reps > 0 ? (weight > 0 ? weight * 1000 + reps : reps) : 0
    }),
  )
}

function isCompletedSession(session) {
  return (
    session?.completed === true ||
    safeArray(session?.exercises).some((exercise) =>
      safeArray(exercise?.sets).some((set) => toNumber(set?.reps) > 0 || toNumber(set?.timeSeconds) > 0),
    )
  )
}

function getSessionTime(session) {
  const finished = new Date(session?.finishedAt ?? '').getTime()
  if (Number.isFinite(finished)) {
    return finished
  }

  const date = new Date(`${String(session?.date ?? '').slice(0, 10)}T00:00:00`).getTime()
  return Number.isFinite(date) ? date : 0
}

function getLatestDatedItem(items) {
  return sortByDate(safeArray(items)).at(-1) ?? null
}

function sortByDate(items) {
  return safeArray(items).sort((a, b) => getItemTime(a) - getItemTime(b))
}

function getItemTime(item) {
  const date = new Date(`${String(item?.date ?? '').slice(0, 10)}T00:00:00`).getTime()
  if (Number.isFinite(date)) {
    return date
  }

  const created = new Date(item?.createdAt ?? '').getTime()
  return Number.isFinite(created) ? created : 0
}

function findMuscle(muscleVolume, muscle) {
  return (
    safeArray(muscleVolume).find((item) => item?.muscle === muscle) ?? {
      muscle,
      sets: 0,
      sessions: 0,
      targetSets: 0,
      targetSessions: 0,
    }
  )
}

function getMuscleTargetRatio(summary) {
  if (summary?.targetSets > 0) {
    return toNumber(summary.sets) / summary.targetSets
  }
  if (summary?.targetSessions > 0) {
    return toNumber(summary.sessions) / summary.targetSessions
  }
  return 0
}

function isMuscleTargetMet(summary) {
  if ((summary?.targetSets ?? 0) <= 0 && (summary?.targetSessions ?? 0) <= 0) {
    return false
  }
  return (
    ((summary?.targetSets ?? 0) <= 0 || summary.sets >= summary.targetSets) &&
    ((summary?.targetSessions ?? 0) <= 0 ||
      summary.sessions >= summary.targetSessions)
  )
}

function getProgramRestDayLabel(programOrPlan) {
  const days = Array.isArray(programOrPlan)
    ? programOrPlan
    : safeArray(programOrPlan?.days)
  const restDay = days.find(isRestDay)
  return restDay
    ? `Day ${restDay.day ?? '-'} — ${restDay.name || 'Rest'}`
    : ''
}

function diff(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) {
    return 0
  }
  return Math.round((current - previous) * 10) / 10
}

function getReadinessLabel(score) {
  if (score >= 85) {
    return 'Ready to train hard'
  }
  if (score >= 70) {
    return 'Normal training'
  }
  if (score >= 50) {
    return 'Train but reduce intensity'
  }
  return 'Recovery/light session recommended'
}

function getReadinessMessage(score) {
  if (score >= 85) {
    return 'Ready to train hard. Keep clean form and leave 1-2 reps in reserve.'
  }
  if (score >= 70) {
    return 'Normal training. Do not max out today.'
  }
  if (score >= 50) {
    return 'Train, but reduce intensity and avoid max-effort sets.'
  }
  return 'Recovery or light session recommended today.'
}

function getStartOfWeek(date) {
  const start = new Date(date)
  const day = start.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diffToMonday)
  start.setHours(0, 0, 0, 0)
  return start
}

function daysBetween(start, end) {
  const startTime = start instanceof Date ? start.getTime() : new Date(start).getTime()
  const endTime = end instanceof Date ? end.getTime() : new Date(end).getTime()
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
    return 999
  }
  return Math.floor(Math.abs(endTime - startTime) / 86400000)
}

function addDays(date, days) {
  const next = new Date(date)
  next.setDate(date.getDate() + days)
  return next
}

function getDateKey(date) {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') {
    return 0
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function uniqueNames(items) {
  return [...new Set(safeArray(items).map((item) => String(item ?? '').trim()).filter(Boolean))]
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function safeArray(value) {
  return Array.isArray(value) ? value : []
}
