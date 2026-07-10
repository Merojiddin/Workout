import { BODY_CHECK_INS_KEY } from '../data/bodyCheckIns'
import { NUTRITION_LOGS_KEY } from '../data/nutritionLogs'
import { WORKOUT_SESSIONS_KEY } from '../data/workoutSessions'
import {
  CUSTOM_EXERCISE_LIBRARY_KEY,
  CUSTOM_WORKOUT_PLAN_KEY,
  USER_PROFILE_SETTINGS_KEY,
  getUserProfileSettings,
} from './settingsUtils'
import { safeGetJSON } from './storageUtils'

export function downloadCSV(filename, rows) {
  const csv = safeRows(rows)
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\r\n')

  downloadText(filename, csv, 'text/csv;charset=utf-8;')
  return csv
}

export function exportWorkoutSessionsCSV(sessions = []) {
  const rows = [
    [
      'Date',
      'Workout Name',
      'Exercise',
      'Set Number',
      'Reps',
      'Weight Kg',
      'RPE',
      'Pain Level',
      'Notes',
      'Completed',
    ],
  ]

  safeArray(sessions).forEach((session) => {
    const exercises = safeArray(session?.exercises)
    if (exercises.length === 0) {
      rows.push([
        session?.date ?? '',
        session?.workoutName ?? '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        yesNo(session?.completed),
      ])
      return
    }

    exercises.forEach((exercise) => {
      const sets = safeArray(exercise?.sets)
      if (sets.length === 0) {
        rows.push([
          session?.date ?? '',
          session?.workoutName ?? '',
          exercise?.exerciseName ?? '',
          '',
          '',
          '',
          '',
          '',
          '',
          yesNo(session?.completed),
        ])
        return
      }

      sets.forEach((set, index) => {
        rows.push([
          session?.date ?? '',
          session?.workoutName ?? '',
          exercise?.exerciseName ?? '',
          set?.setNumber ?? index + 1,
          set?.reps ?? '',
          set?.weightKg ?? '',
          set?.rpe ?? '',
          set?.painLevel ?? '',
          set?.notes ?? '',
          yesNo(session?.completed),
        ])
      })
    })
  })

  downloadCSV(`workout-sessions-${fileDate()}.csv`, rows)
  return rows
}

export function exportBodyCheckInsCSV(checkIns = []) {
  const rows = [
    [
      'Date',
      'Body Weight Kg',
      'Waist Cm',
      'Belly Cm',
      'Chest Cm',
      'Shoulders Cm',
      'Left Arm Cm',
      'Right Arm Cm',
      'Hips Cm',
      'Posture Rating',
      'Abs Visibility Rating',
      'Energy Level',
      'Sleep Quality',
      'Notes',
    ],
  ]

  safeArray(checkIns).forEach((checkIn) => {
    rows.push([
      checkIn?.date ?? '',
      checkIn?.bodyWeightKg ?? '',
      checkIn?.waistCm ?? '',
      checkIn?.bellyCm ?? '',
      checkIn?.chestCm ?? '',
      checkIn?.shouldersCm ?? '',
      checkIn?.leftArmCm ?? '',
      checkIn?.rightArmCm ?? '',
      checkIn?.hipsCm ?? '',
      checkIn?.postureRating ?? '',
      checkIn?.absVisibilityRating ?? '',
      checkIn?.energyLevel ?? '',
      checkIn?.sleepQuality ?? '',
      checkIn?.notes ?? '',
    ])
  })

  downloadCSV(`body-check-ins-${fileDate()}.csv`, rows)
  return rows
}

export function exportNutritionLogsCSV(logs = []) {
  const rows = [
    [
      'Date',
      'Body Weight Kg',
      'Protein Grams',
      'Water Liters',
      'Calories Estimate',
      'Creatine Taken',
      'Creatine Grams',
      'Whey Taken',
      'Whey Scoops',
      'Eggs Count',
      'Seafood Meal',
      'Oysters Meal',
      'Nuts Serving',
      'Dark Chocolate',
      'Fruits',
      'Coffee Cups',
      'Notes',
    ],
  ]

  safeArray(logs).forEach((log) => {
    rows.push([
      log?.date ?? '',
      log?.bodyWeightKg ?? '',
      log?.proteinGrams ?? '',
      log?.waterLiters ?? '',
      log?.caloriesEstimate ?? '',
      yesNo(log?.creatineTaken),
      log?.creatineGrams ?? '',
      yesNo(log?.wheyTaken),
      log?.wheyScoops ?? '',
      log?.eggsCount ?? '',
      yesNo(log?.seafoodMeal),
      yesNo(log?.oystersMeal),
      yesNo(log?.nutsServing),
      yesNo(log?.darkChocolate),
      log?.fruits ?? '',
      log?.coffeeCups ?? '',
      log?.notes ?? '',
    ])
  })

  downloadCSV(`nutrition-logs-${fileDate()}.csv`, rows)
  return rows
}

export function exportWeeklySummaryCSV(data = {}) {
  const rows = [
    [
      'Week Start',
      'Week End',
      'Weekly Score',
      'Workouts Completed',
      'Total Sets',
      'Chest Sets',
      'Back Sets',
      'Abs Sets',
      'Posture Sets',
      'Average Protein',
      'Average Water',
      'Creatine Days',
      'Body Weight Change',
      'Waist Change',
      'Chest Change',
    ],
    [
      data.weekStart ?? dateKey(data.week?.start),
      data.weekEnd ?? dateKey(data.week?.end),
      data.weeklyScore?.score ?? '',
      data.workoutSummary?.completedWorkouts ?? 0,
      data.workoutSummary?.totalSets ?? 0,
      muscleSets(data.muscleVolume, 'Chest'),
      muscleSets(data.muscleVolume, 'Back'),
      muscleSets(data.muscleVolume, 'Abs'),
      muscleSets(data.muscleVolume, 'Posture'),
      data.nutritionSummary?.averageProtein ?? 0,
      data.nutritionSummary?.averageWater ?? 0,
      data.nutritionSummary?.creatineDays ?? 0,
      metricChange(data.bodySummary, 'Body weight'),
      metricChange(data.bodySummary, 'Waist'),
      metricChange(data.bodySummary, 'Chest'),
    ],
  ]

  downloadCSV(`weekly-summary-${fileDate()}.csv`, rows)
  return rows
}

export function exportAllDataJSON() {
  const data = {
    exportedAt: new Date().toISOString(),
    userProfileSettings:
      readJson(USER_PROFILE_SETTINGS_KEY) ?? getUserProfileSettings(),
    customWorkoutPlan: readJson(CUSTOM_WORKOUT_PLAN_KEY),
    customExerciseLibrary: readJson(CUSTOM_EXERCISE_LIBRARY_KEY),
    workoutSessions: readJson(WORKOUT_SESSIONS_KEY) ?? [],
    bodyCheckIns: readJson(BODY_CHECK_INS_KEY) ?? [],
    nutritionLogs: readJson(NUTRITION_LOGS_KEY) ?? [],
  }

  downloadText(
    `fitness-backup-${fileDate()}.json`,
    JSON.stringify(data, null, 2),
    'application/json;charset=utf-8;',
  )
  return data
}

function safeRows(rows) {
  return safeArray(rows).map((row) => safeArray(row))
}

function safeArray(value) {
  return Array.isArray(value) ? value : []
}

function escapeCsvCell(value) {
  const text = String(value ?? '')
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }

  return text
}

function downloadText(filename, content, type) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }

  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function yesNo(value) {
  return value ? 'Yes' : 'No'
}

function fileDate(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

function dateKey(date) {
  if (!date) {
    return ''
  }

  const parsed = date instanceof Date ? date : new Date(date)
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10)
}

function muscleSets(volume = [], muscle) {
  return safeArray(volume).find((item) => item?.muscle === muscle)?.sets ?? 0
}

function metricChange(bodySummary, label) {
  const metric = safeArray(bodySummary?.metrics).find(
    (item) => item?.label === label,
  )
  if (!metric || typeof metric.change !== 'number') {
    return ''
  }

  return metric.change
}

function readJson(key) {
  if (typeof window === 'undefined') {
    return null
  }

  return safeGetJSON(key, null)
}
