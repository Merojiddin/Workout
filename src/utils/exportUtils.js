import { BODY_CHECK_INS_KEY } from '../data/bodyCheckIns'
import { NUTRITION_LOGS_KEY } from '../data/nutritionLogs'
import { WORKOUT_SESSIONS_KEY } from '../data/workoutSessions'
import { resolveExerciseIdentity } from '../data/exerciseIdentity'
import { toLocalIsoDate } from './dateUtils'
import {
  CUSTOM_EXERCISE_LIBRARY_KEY,
  CUSTOM_WORKOUT_PLAN_KEY,
  USER_PROFILE_SETTINGS_KEY,
  getEffectiveExerciseLibrary,
  getUserProfileSettings,
} from './settingsUtils'
import {
  formatDuration,
} from './exerciseLoggingUtils'
import {
  CLOUD_WORKOUT_PROGRAM_MANAGER_CACHE_KEY,
  DISMISSED_WORKOUT_PROGRAMS_KEY,
  INSTALLED_WORKOUT_PROGRAM_KEY,
  WORKOUT_PLAN_BACKUPS_KEY,
  safeGetJSON,
} from './storageUtils'
import { getActiveWorkoutProgram } from './activeWorkoutProgram'

export function downloadCSV(filename, rows) {
  const csv = safeRows(rows)
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\r\n')

  downloadText(filename, csv, 'text/csv;charset=utf-8;')
  return csv
}

export function buildWorkoutPlanExportData(
  activeProgram = getActiveWorkoutProgram(),
  exportedAt = new Date().toISOString(),
) {
  const standaloneWorkouts = safeArray(activeProgram?.standaloneWorkouts)

  return {
    exportedAt,
    program: {
      id: activeProgram?.programId ?? null,
      version: activeProgram?.programVersion ?? null,
      name: activeProgram?.programName ?? 'Custom Workout Plan',
      modifiedAfterInstallation: Boolean(
        activeProgram?.modifiedAfterInstallation,
      ),
    },
    days: safeArray(activeProgram?.days),
    ...(standaloneWorkouts.length > 0 ? { standaloneWorkouts } : {}),
  }
}

export function exportWorkoutPlanJSON(activeProgram = getActiveWorkoutProgram()) {
  const data = buildWorkoutPlanExportData(activeProgram)
  downloadText(
    `current-workout-plan-${fileDate(new Date(data.exportedAt))}.json`,
    JSON.stringify(data, null, 2),
    'application/json;charset=utf-8;',
  )
  return data
}

export function exportWorkoutSessionsCSV(sessions = []) {
  const rows = [
    [
      'Date',
      'Workout Name',
      'Session Type',
      'Standalone Workout ID',
      'Program ID',
      'Program Version',
      'Program Week',
      'Exercise',
      'Exercise ID',
      'Resolved Canonical ID',
      'Archived',
      'Set Number',
      'Reps',
      'Duration Seconds',
      'Formatted Duration',
      'Weight Kg',
      'RPE',
      'RIR',
      'Pain Level',
      'Notes',
      'Completed',
    ],
  ]
  const activeProgram = getActiveWorkoutProgram()
  const activePlan = [
    ...safeArray(activeProgram?.days),
    ...safeArray(activeProgram?.standaloneWorkouts),
  ]
  const library = getEffectiveExerciseLibrary()

  safeArray(sessions).forEach((session) => {
    const sessionIdentity = getSessionExportIdentity(session)
    const exercises = safeArray(session?.exercises)
    if (exercises.length === 0) {
      rows.push([
        session?.date ?? '',
        session?.workoutName ?? '',
        sessionIdentity.label,
        sessionIdentity.standaloneWorkoutId,
        session?.programId ?? '',
        session?.programVersion ?? '',
        session?.programWeek ?? '',
        '',
        '',
        '',
        '',
        '',
        '',
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
      const identity = resolveExerciseIdentity(exercise, {
        activePlan,
        library,
      })
      const sets = safeArray(exercise?.sets)
      if (sets.length === 0) {
        rows.push([
          session?.date ?? '',
          session?.workoutName ?? '',
          sessionIdentity.label,
          sessionIdentity.standaloneWorkoutId,
          session?.programId ?? '',
          session?.programVersion ?? '',
          session?.programWeek ?? '',
          exercise?.exerciseName ?? '',
          exercise?.exerciseId ?? '',
          identity.canonicalId ?? '',
          yesNo(identity.archived),
          '',
          '',
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

      sets.forEach((set, index) => {
        const durationSeconds = nonNegativeNumber(set?.timeSeconds)

        rows.push([
          session?.date ?? '',
          session?.workoutName ?? '',
          sessionIdentity.label,
          sessionIdentity.standaloneWorkoutId,
          session?.programId ?? '',
          session?.programVersion ?? '',
          session?.programWeek ?? '',
          exercise?.exerciseName ?? '',
          exercise?.exerciseId ?? '',
          identity.canonicalId ?? '',
          yesNo(identity.archived),
          set?.setNumber ?? index + 1,
          set?.reps ?? '',
          durationSeconds ?? '',
          durationSeconds === null ? '' : formatDuration(durationSeconds),
          set?.weightKg ?? '',
          set?.rpe ?? '',
          set?.rir ?? '',
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
      'Scheduled Workouts Completed',
      'Standalone Workouts Completed',
      'Target Workouts',
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
      data.workoutSummary?.scheduledCompletedWorkouts ??
        data.workoutSummary?.completedWorkouts ??
        0,
      data.workoutSummary?.standaloneWorkoutsCompleted ?? 0,
      data.workoutSummary?.targetWorkouts ?? 0,
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
    installedWorkoutProgram: readJson(INSTALLED_WORKOUT_PROGRAM_KEY),
    dismissedWorkoutPrograms: readJson(DISMISSED_WORKOUT_PROGRAMS_KEY),
    workoutPlanBackups: readJson(WORKOUT_PLAN_BACKUPS_KEY),
    cloudWorkoutProgramManagerCache: readJson(
      CLOUD_WORKOUT_PROGRAM_MANAGER_CACHE_KEY,
    ),
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

function nonNegativeNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

function getSessionExportIdentity(session) {
  const standalone = session?.sessionType === 'standalone'
  const standaloneWorkoutId =
    standalone && typeof session?.standaloneWorkoutId === 'string'
      ? session.standaloneWorkoutId.trim()
      : ''

  return {
    label: standalone ? 'Standalone workout' : 'Scheduled workout',
    standaloneWorkoutId,
  }
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
  return toLocalIsoDate(date)
}

function dateKey(date) {
  if (!date) {
    return ''
  }

  return toLocalIsoDate(date)
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
