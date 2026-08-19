import { t } from '../i18n/t'
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
      t('csv.date'),
      t('csv.workoutName'),
      t('csv.sessionType'),
      t('csv.standaloneId'),
      t('csv.programId'),
      t('csv.programVersion'),
      t('csv.programWeek'),
      t('csv.exercise'),
      t('csv.exerciseId'),
      t('csv.canonicalId'),
      t('csv.archived'),
      t('csv.setNumber'),
      t('csv.reps'),
      t('csv.durationSeconds'),
      t('csv.formattedDuration'),
      t('csv.weightKg'),
      t('csv.rpe'),
      t('csv.rir'),
      t('csv.painLevel'),
      t('csv.notes'),
      t('csv.completed'),
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
      t('csv.date'),
      t('csv.bodyWeightKg'),
      t('csv.waistCm'),
      t('csv.bellyCm'),
      t('csv.chestCm'),
      t('csv.shouldersCm'),
      t('csv.leftArmCm'),
      t('csv.rightArmCm'),
      t('csv.hipsCm'),
      t('csv.postureRating'),
      t('csv.absVisibilityRating'),
      t('csv.energyLevel'),
      t('csv.sleepQuality'),
      t('csv.notes'),
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
    label: standalone ? t('csv.standaloneWorkout') : t('csv.scheduledWorkout'),
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
  return value ? t('state.yes') : t('state.no')
}

function fileDate(date = new Date()) {
  return toLocalIsoDate(date)
}

function readJson(key) {
  if (typeof window === 'undefined') {
    return null
  }

  return safeGetJSON(key, null)
}
