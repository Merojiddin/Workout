import { nutritionTargets } from './nutritionUtils'

const postureCue =
  'Ribs down. Abs tight. Glutes slightly squeezed. Do not over-arch lower back.'

const absReminder =
  'Visible abs come from lower overall body fat and stronger abs. You cannot spot-reduce lower-back fat.'

const postureKeywords = [
  'posture',
  'mobility',
  'dead bug',
  'glute bridge',
  'posterior pelvic',
  'hip flexor',
  'bird dog',
  'plank',
  'stretch',
]

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

const absKeywords = ['abs', 'core', 'oblique', 'plank', 'knee raise', 'leg raise']

export function getTodayWorkoutAdvice({
  todayWorkout,
  sessions,
  progressionSuggestions,
}) {
  const exercises = safeArray(todayWorkout?.exercises)
  const suggestions = safeArray(progressionSuggestions)
  const title = todayWorkout
    ? `Day ${todayWorkout.day ?? '-'} - ${todayWorkout.name ?? 'Workout'}`
    : 'Today workout'

  if (exercises.length === 0) {
    return {
      title,
      message: 'Complete workouts and logs to unlock better coaching.',
      pushExercises: [],
      controlExercises: [],
      postureCautionExercises: [],
      intensityRecommendation: 'Keep the day light and log what you complete.',
    }
  }

  const pushExercises = uniqueNames([
    ...suggestions
      .filter((suggestion) => ['increase', 'keep'].includes(suggestion?.type))
      .map((suggestion) => suggestion.exerciseName),
    ...exercises
      .filter(isUpperBodyGoalExercise)
      .map((exercise) => exercise.name),
  ]).slice(0, 3)

  const controlExercises = uniqueNames([
    ...suggestions
      .filter((suggestion) =>
        ['reduce', 'form-warning'].includes(suggestion?.type),
      )
      .map((suggestion) => suggestion.exerciseName),
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

  let intensityRecommendation = 'Normal training. Keep most sets at RPE 8-9.'
  if (recentPain >= 4) {
    intensityRecommendation =
      'Reduce intensity. Stop any exercise that keeps hurting.'
  } else if (latestAverageRpe >= 9.5 || hasReduceSuggestion) {
    intensityRecommendation =
      'Train, but reduce intensity and leave 2-3 reps in reserve.'
  } else if (suggestions.some((suggestion) => suggestion?.type === 'increase')) {
    intensityRecommendation =
      'Good day to progress, but keep 1-2 reps in reserve.'
  }

  const focus = safeArray(todayWorkout?.focus).join(', ') || "today's main lifts"
  const message =
    recentPain >= 4
      ? 'Pain was logged recently. Reduce intensity or stop the exercise. If pain continues, get checked by a professional.'
      : `Focus on ${focus}. Push the main work, keep form controlled, and protect your lower back position.`

  return {
    title,
    message,
    pushExercises: pushExercises.length > 0 ? pushExercises : exercises.slice(0, 2).map((exercise) => exercise.name),
    controlExercises,
    postureCautionExercises,
    intensityRecommendation,
  }
}

export function calculateReadinessScore({
  sessions,
  nutritionLogs,
  bodyCheckIns,
}) {
  let score = 75
  const reasons = []
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

    if (protein >= nutritionTargets.proteinMin) {
      score += 10
      reasons.push('Protein target reached yesterday.')
    } else if (protein > 0 && protein < 100) {
      score -= 10
      reasons.push('Protein was below 100 g yesterday.')
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

  if (hasNoRestDayInLastSevenDays(sessions)) {
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

export function getNutritionCoachAdvice(nutritionLogs) {
  const logs = safeArray(nutritionLogs)
  const todayLog = logs.find((log) => log?.date === getDateKey(new Date()))

  if (!todayLog) {
    return [
      'Log nutrition today. Protein target is 120-160 g.',
      'Take 3-5 g creatine today.',
      'Drink at least 2 L water.',
    ]
  }

  const advice = []
  const protein = toNumber(todayLog.proteinGrams)
  const water = toNumber(todayLog.waterLiters)

  if (protein < nutritionTargets.proteinMin) {
    advice.push('Protein is low. Add whey, eggs, seafood, or yogurt.')
  } else if (protein <= nutritionTargets.proteinMax) {
    advice.push('Protein target reached.')
  } else if (protein > nutritionTargets.proteinHigh) {
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

  if (!todayLog.wheyTaken && protein < nutritionTargets.proteinMin) {
    advice.push('Use whey to close the protein gap.')
  }

  if (advice.length === 1 && todayLog.creatineTaken && water >= nutritionTargets.waterMin) {
    advice.push('Keep meals halal-friendly and repeat the same simple protein habits tomorrow.')
  }

  return advice
}

export function getBodyRecompositionAdvice(bodyCheckIns, workoutSessions) {
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
  const strengthDecreased = hasRecentStrengthDecrease(workoutSessions)

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

export function getAbsPostureAdvice(sessions, workoutPlan) {
  const weekSessions = getThisWeekCompletedSessions(sessions)
  const muscleMap = buildPlanMuscleMap(workoutPlan)
  const absSessionsThisWeek = countSessionsMatching(weekSessions, (exercise) =>
    isAbsExercise(exercise, muscleMap),
  )
  const postureSessionsThisWeek = countSessionsMatching(weekSessions, (exercise) =>
    isPostureExercise(exercise, muscleMap),
  )
  const advice = []
  const recommendedExercises = []

  if (absSessionsThisWeek < 3) {
    advice.push('Add abs work today: hanging knee raises, dead bug, side plank.')
    recommendedExercises.push('Hanging knee raises', 'Dead bug', 'Side plank')
  } else {
    advice.push('Abs frequency is on target. Keep every rep controlled.')
  }

  if (postureSessionsThisWeek < 4) {
    advice.push('Add 10 minutes posture work: dead bug, glute bridge, posterior pelvic tilt, hip flexor stretch.')
    recommendedExercises.push(
      'Dead bug',
      'Glute bridge',
      'Posterior pelvic tilt',
      'Hip flexor stretch',
    )
  } else {
    advice.push('Posture frequency is on target.')
  }

  advice.push(postureCue)
  advice.push(absReminder)

  return {
    absSessionsThisWeek,
    postureSessionsThisWeek,
    advice,
    recommendedExercises: uniqueNames(recommendedExercises),
  }
}

export function getCoachWarnings({
  sessions,
  nutritionLogs,
  bodyCheckIns,
  muscleVolume,
  warningSensitivity = 'Normal',
}) {
  const warnings = []
  const add = (warning) => {
    if (warning && !warnings.includes(warning)) {
      warnings.push(warning)
    }
  }
  const sensitivity = String(warningSensitivity).toLowerCase()
  const proteinFloor = sensitivity === 'high' ? 130 : sensitivity === 'low' ? 100 : 120
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

  if (chest.sets >= 18 && back.sets < 12) {
    add('You trained chest heavily but back volume is low. Keep back training strong to protect shoulders.')
  }

  if (hasNoRestDayInLastSevenDays(sessions)) {
    add('No rest day logged in the last 7 days. Keep one recovery day.')
  }

  if (getThisWeekCompletedSessions(sessions).length > 0 && legs.sets === 0) {
    add('No legs this week. Do not skip legs; they support posture and balance.')
  }

  if (latestNutrition && toNumber(latestNutrition.proteinGrams) < proteinFloor) {
    add('Protein low. Reach at least 120 g today for muscle gain.')
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

  if (posture.sessions === 0) {
    add('No posture work logged. Add dead bug, glute bridge, and hip flexor stretch.')
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
}) {
  const items = []
  const add = (item) => {
    if (item && !items.includes(item) && items.length < 5) {
      items.push(item)
    }
  }
  const workoutName = todayWorkout?.name ? `Day ${todayWorkout.day} workout` : 'today workout'

  if (safeArray(todayWorkout?.exercises).length > 0) {
    add(`Complete ${workoutName}.`)
  } else {
    add('Set up today workout or complete a light recovery session.')
  }

  if ((readiness?.score ?? 0) >= 85) {
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
    add('Reach at least 120 g protein.')
  }
  if (nutritionText.includes('water')) {
    add('Drink at least 2 L water.')
  }

  if (absPostureAdvice?.absSessionsThisWeek < 3) {
    add('Add dead bug, side plank, or hanging knee raises.')
  } else if (absPostureAdvice?.postureSessionsThisWeek < 4) {
    add('Add 10 minutes posture work after training.')
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
  const training =
    (workoutSummary?.completedWorkouts ?? 0) >= (workoutSummary?.targetWorkouts ?? 6)
      ? 'Training consistency was strong.'
      : `Training consistency was ${workoutSummary?.completedWorkouts ?? 0}/${workoutSummary?.targetWorkouts ?? 6} workouts.`
  const chest = findMuscle(muscleVolume, 'Chest')
  const back = findMuscle(muscleVolume, 'Back')
  const volume =
    chest.sets >= 18 && back.sets >= 12
      ? 'Chest and back volume were balanced.'
      : chest.sets >= 18
        ? 'Chest volume was strong; keep back volume high too.'
        : 'Keep building upper-body volume next week.'
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
  add('Abs control')
  add('No lower-back arching')
  return items
}

function isUpperBodyGoalExercise(exercise) {
  const text = getExerciseText(exercise)
  return (
    text.includes('chest') ||
    text.includes('shoulder') ||
    text.includes('triceps') ||
    text.includes('bench') ||
    text.includes('push') ||
    text.includes('dip')
  )
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

function isAbsExercise(exercise, muscleMap) {
  const text = getLoggedExerciseText(exercise, muscleMap)
  return absKeywords.some((keyword) => text.includes(keyword))
}

function isPostureExercise(exercise, muscleMap) {
  const text = getLoggedExerciseText(exercise, muscleMap)
  return postureKeywords.some((keyword) => text.includes(keyword))
}

function getLoggedExerciseText(exercise, muscleMap) {
  const name = String(exercise?.exerciseName ?? exercise?.name ?? '')
  return [name, muscleMap.get(normalize(name)) ?? '', exercise?.muscleGroup]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function buildPlanMuscleMap(workoutPlan) {
  const map = new Map()
  safeArray(workoutPlan).forEach((day) => {
    safeArray(day?.exercises).forEach((exercise) => {
      map.set(normalize(exercise?.name), String(exercise?.muscleGroup ?? ''))
    })
  })
  return map
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

function hasNoRestDayInLastSevenDays(sessions) {
  const completedDateKeys = new Set(
    safeArray(sessions)
      .filter(isCompletedSession)
      .filter((session) => daysBetween(new Date(getSessionTime(session)), new Date()) < 7)
      .map((session) => getDateKey(new Date(getSessionTime(session)))),
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

function hasRecentStrengthDecrease(sessions) {
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
      (candidate) => normalize(candidate?.exerciseName) === normalize(exercise?.exerciseName),
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
      const time = toNumber(set?.timeSeconds)
      return weight > 0 ? weight * 1000 + reps : reps || time
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
    }
  )
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

function normalize(value) {
  return String(value ?? '').trim().toLowerCase()
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function safeArray(value) {
  return Array.isArray(value) ? value : []
}
