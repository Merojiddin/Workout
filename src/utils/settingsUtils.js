import { BODY_CHECK_INS_KEY } from '../data/bodyCheckIns'
import {
  difficultyOptions,
  exerciseCategories,
  exerciseLibrary,
  findLibraryExerciseForWorkout as findDefaultLibraryExerciseForWorkout,
} from '../data/exerciseLibrary'
import { NUTRITION_LOGS_KEY } from '../data/nutritionLogs'
import { userProfile } from '../data/userProfile'
import { WORKOUT_SESSIONS_KEY } from '../data/workoutSessions'
import { weeklyPlan } from '../data/workoutPlan'
import {
  DISMISSED_WORKOUT_PROGRAMS_KEY,
  CLOUD_WORKOUT_PROGRAM_MANAGER_CACHE_KEY,
  INSTALLED_WORKOUT_PROGRAM_KEY,
  WORKOUT_PLAN_BACKUPS_KEY,
  safeGetJSON,
  safeRemove,
  safeSetJSON,
} from './storageUtils'

export const USER_PROFILE_SETTINGS_KEY = 'userProfileSettings'
export const CUSTOM_WORKOUT_PLAN_KEY = 'customWorkoutPlan'
export const CUSTOM_EXERCISE_LIBRARY_KEY = 'customExerciseLibrary'

export const equipmentSettingsOptions = [
  'Pull-up bar',
  'Dips station',
  'Dumbbells',
  'Barbell',
  'Bench',
  'Treadmill',
  'Skipping rope',
  'Backpack with books',
  'VR Quest 2',
]

export const defaultUserProfileSettings = {
  profile: {
    name: 'Mike',
    heightCm: 188,
    currentWeightKg: 76,
    goalWeightMinKg: 78,
    goalWeightMaxKg: 82,
    trainingGoal: 'Bigger upper body, visible abs, better posture',
    mainFocus: 'Chest, shoulders, abs, posture',
    trainingTimePerDay: '30-60 minutes/day',
    experienceLevel: 'Intermediate/Advanced',
  },
  equipment: [...equipmentSettingsOptions],
  goals: {
    primaryGoal: 'Build bigger upper body',
    secondaryGoal: 'Visible abs',
    bodyGoal: 'Lean muscle gain / recomposition',
    weakPoint: 'Chest',
    cardioPreference: 'Incline walking',
    injuryLimitation: 'Shins hurt after around 1 km running',
  },
  supplements: {
    creatineMonohydrate: true,
    wheyProtein: true,
    proteinTargetMin: 120,
    proteinTargetMax: 160,
    waterTargetMin: 2,
    waterTargetMax: 3,
  },
  coach: {
    coachingStyle: 'Direct',
    mainPriority: 'Bigger chest + visible abs',
    warningSensitivity: 'Normal',
  },
  workoutDisplay: {
    showExerciseImages: true,
    videosCollapsedByDefault: true,
    autoOpenVideo: false,
    preferCompactView: true,
  },
}

const appStorageKeys = [
  USER_PROFILE_SETTINGS_KEY,
  CUSTOM_WORKOUT_PLAN_KEY,
  CUSTOM_EXERCISE_LIBRARY_KEY,
  INSTALLED_WORKOUT_PROGRAM_KEY,
  DISMISSED_WORKOUT_PROGRAMS_KEY,
  WORKOUT_PLAN_BACKUPS_KEY,
  CLOUD_WORKOUT_PROGRAM_MANAGER_CACHE_KEY,
  WORKOUT_SESSIONS_KEY,
  BODY_CHECK_INS_KEY,
  NUTRITION_LOGS_KEY,
  'reminderSettings',
  'reminderHistory',
  'sentReminderLog',
  'activeWorkoutSession',
  'pendingSyncQueue',
  'lastOfflineSyncAt',
]

const defaultExerciseIds = new Set(exerciseLibrary.map((exercise) => exercise.id))
const defaultExercisesById = new Map(
  exerciseLibrary.map((exercise) => [exercise.id, exercise]),
)

export function getUserProfileSettings() {
  const stored = readJson(USER_PROFILE_SETTINGS_KEY)
  return normalizeUserProfileSettings(stored)
}

/** Workout display preferences (Step 18) - always returns a complete object. */
export function getWorkoutDisplaySettings() {
  return getUserProfileSettings().workoutDisplay
}

export function saveUserProfileSettings(settings) {
  return saveUserProfileSettingsSafely(settings).settings
}

/**
 * Saves normalized settings while exposing whether localStorage accepted the
 * write. Transactional cloud callers can use this to avoid treating an
 * in-memory normalized value as a successful local mirror.
 */
export function saveUserProfileSettingsSafely(settings) {
  const normalized = normalizeUserProfileSettings(settings)
  const success =
    typeof window !== 'undefined' &&
    safeSetJSON(USER_PROFILE_SETTINGS_KEY, normalized)

  return { success, settings: normalized }
}

export function resetUserProfileSettings() {
  removeStorageItem(USER_PROFILE_SETTINGS_KEY)
  return clone(defaultUserProfileSettings)
}

export function getCustomWorkoutPlan() {
  const stored = readJson(CUSTOM_WORKOUT_PLAN_KEY)
  return normalizeWorkoutPlan(stored)
}

export function saveCustomWorkoutPlan(plan) {
  const normalized = normalizeWorkoutPlan(plan)
  writeJson(CUSTOM_WORKOUT_PLAN_KEY, normalized)
  return normalized
}

/**
 * Saves through the same plan normalizer while exposing the storage result.
 * Transactional callers must use this instead of assuming a returned plan
 * means localStorage accepted the write.
 */
export function saveCustomWorkoutPlanSafely(plan) {
  const normalized = normalizeWorkoutPlan(plan)
  const success =
    typeof window !== 'undefined' &&
    safeSetJSON(CUSTOM_WORKOUT_PLAN_KEY, normalized)

  return { success, plan: normalized }
}

/** Canonical plan shape used for storage comparisons without writing. */
export function normalizeCustomWorkoutPlan(plan) {
  return normalizeWorkoutPlan(plan)
}

export function resetCustomWorkoutPlan() {
  removeStorageItem(CUSTOM_WORKOUT_PLAN_KEY)
  return clone(weeklyPlan)
}

export function hasCustomWorkoutPlan() {
  return readJson(CUSTOM_WORKOUT_PLAN_KEY) !== null
}

export function getCustomExerciseLibrary() {
  const stored = readJson(CUSTOM_EXERCISE_LIBRARY_KEY)
  return normalizeExerciseLibrary(stored)
}

/**
 * Returns only records actually stored under customExerciseLibrary.
 * Unlike getCustomExerciseLibrary(), a missing key produces an empty array
 * instead of the bundled fallback. This keeps raw custom data separate from
 * the effective read-only library used by the UI.
 */
export function getStoredCustomExerciseLibrary() {
  const stored = readJson(CUSTOM_EXERCISE_LIBRARY_KEY)
  return Array.isArray(stored) ? stored.map(normalizeLibraryExercise) : []
}

/**
 * Removes bundled records that were copied unchanged into an older full
 * custom-library snapshot. The operation is read-only; callers choose when
 * to persist the compact override list after an explicit user edit.
 */
export function getCustomExerciseLibraryOverrides(library) {
  const source =
    library === undefined ? getStoredCustomExerciseLibrary() : library
  const bundledById = new Map(
    exerciseLibrary.map((exercise) => [
      exercise.id,
      normalizeLibraryExercise(exercise),
    ]),
  )
  const overrides = []
  const overrideIndexById = new Map()

  normalizeExerciseLibraryEntries(source).forEach((exercise) => {
    const bundled = bundledById.get(exercise.id)
    if (bundled && libraryExercisesEqual(exercise, bundled)) {
      return
    }

    const existingIndex = overrideIndexById.get(exercise.id)
    if (existingIndex === undefined) {
      overrideIndexById.set(exercise.id, overrides.length)
      overrides.push(clone(exercise))
    } else {
      overrides[existingIndex] = clone(exercise)
    }
  })

  return overrides
}

/**
 * Read-only library used for display and lookup. Bundled order is stable;
 * stored custom entries replace matching IDs in place and custom-only IDs
 * are appended in stored order.
 */
export function getEffectiveExerciseLibrary() {
  const merged = exerciseLibrary.map((exercise) => clone(exercise))
  const indexById = new Map(
    merged.map((exercise, index) => [exercise.id, index]),
  )

  getStoredCustomExerciseLibrary().forEach((exercise) => {
    const copy = clone(exercise)
    const existingIndex = indexById.get(copy.id)

    if (existingIndex === undefined) {
      indexById.set(copy.id, merged.length)
      merged.push(copy)
    } else {
      merged[existingIndex] = copy
    }
  })

  return merged
}

export function saveCustomExerciseLibrary(library) {
  const normalized = normalizeExerciseLibrary(library)
  writeJson(CUSTOM_EXERCISE_LIBRARY_KEY, normalized)
  return normalized
}

export function resetCustomExerciseLibrary() {
  removeStorageItem(CUSTOM_EXERCISE_LIBRARY_KEY)
  return clone(exerciseLibrary)
}

export function hasCustomExerciseLibrary() {
  return readJson(CUSTOM_EXERCISE_LIBRARY_KEY) !== null
}

export function exportAllData() {
  const data = {
    exportedAt: new Date().toISOString(),
    userProfileSettings: getUserProfileSettings(),
    customWorkoutPlan: readJson(CUSTOM_WORKOUT_PLAN_KEY),
    customExerciseLibrary: readJson(CUSTOM_EXERCISE_LIBRARY_KEY),
    workoutSessions: readArray(WORKOUT_SESSIONS_KEY),
    bodyCheckIns: readArray(BODY_CHECK_INS_KEY),
    nutritionLogs: readArray(NUTRITION_LOGS_KEY),
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `workout-app-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`
    document.body.append(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return data
}

export function importAllData(jsonData) {
  try {
    const data =
      typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData

    if (!isPlainObject(data)) {
      return { success: false, message: 'Invalid backup file.' }
    }

    if ('userProfileSettings' in data) {
      saveUserProfileSettings(data.userProfileSettings)
    }

    if ('customWorkoutPlan' in data) {
      if (data.customWorkoutPlan === null) {
        resetCustomWorkoutPlan()
      } else {
        saveCustomWorkoutPlan(data.customWorkoutPlan)
      }
    }

    if ('customExerciseLibrary' in data) {
      if (data.customExerciseLibrary === null) {
        resetCustomExerciseLibrary()
      } else {
        saveCustomExerciseLibrary(data.customExerciseLibrary)
      }
    }

    if ('workoutSessions' in data) {
      writeJson(WORKOUT_SESSIONS_KEY, Array.isArray(data.workoutSessions) ? data.workoutSessions : [])
    }

    if ('bodyCheckIns' in data) {
      writeJson(BODY_CHECK_INS_KEY, Array.isArray(data.bodyCheckIns) ? data.bodyCheckIns : [])
    }

    if ('nutritionLogs' in data) {
      writeJson(NUTRITION_LOGS_KEY, Array.isArray(data.nutritionLogs) ? data.nutritionLogs : [])
    }

    return { success: true, message: 'Data imported.' }
  } catch {
    return { success: false, message: 'Invalid backup file.' }
  }
}

export function clearAllData() {
  appStorageKeys.forEach(removeStorageItem)
}

export function getWorkoutForDate(date = new Date(), plan = getCustomWorkoutPlan()) {
  const safePlan = normalizeWorkoutPlan(plan)
  const dayOfWeek = date.getDay()
  const mondayBasedIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  return safePlan[mondayBasedIndex] ?? safePlan[0] ?? clone(weeklyPlan[0])
}

export function getExerciseTargetLabel(exercise) {
  const sets = toPositiveNumber(exercise?.sets, 1)
  if (nonEmptyString(exercise?.repRange)) {
    return `${sets} sets x ${exercise.repRange} reps`
  }

  if (nonEmptyString(exercise?.duration)) {
    return `${sets} sets x ${exercise.duration}`
  }

  return `${sets} sets x rep range unknown`
}

export function findLibraryExerciseForWorkout(
  workout,
  library = getEffectiveExerciseLibrary(),
) {
  const customMatch = findExerciseInLibrary(workout, library)
  if (customMatch) {
    return customMatch
  }

  const defaultMatch = findDefaultLibraryExerciseForWorkout(workout)
  if (!defaultMatch) {
    return undefined
  }

  return (
    library.find((exercise) => exercise.id === defaultMatch.id) ?? defaultMatch
  )
}

export function isDefaultLibraryExercise(id) {
  return defaultExerciseIds.has(id)
}

export function createPlanExerciseFromLibrary(libraryExercise) {
  const name = toText(libraryExercise?.name, 'Custom Exercise')

  return {
    equipment: toStringArray(libraryExercise?.equipment, ['Bodyweight']).join(' / '),
    formTips: toStringArray(libraryExercise?.formTips, [
      'Keep control',
      'Stop before form breaks',
    ]),
    id: toText(libraryExercise?.id, slugify(name)),
    muscleGroup: toStringArray(libraryExercise?.primaryMuscles, ['Other']).join(' / '),
    name,
    repRange: '',
    restSeconds: 60,
    sets: 3,
    notes: '',
  }
}

export function createLibraryExerciseFromPlanExercise(planExercise) {
  const name = toText(planExercise?.name, 'Custom Exercise')

  return normalizeLibraryExercise({
    id: toText(planExercise?.id, `custom-${slugify(name)}`),
    name,
    category: toText(planExercise?.category, 'Conditioning'),
    primaryMuscles: toStringArray(planExercise?.muscleGroup, ['Other']),
    secondaryMuscles: [],
    equipment: toStringArray(planExercise?.equipment, ['Bodyweight']),
    difficulty: 'Beginner',
    formCue: toStringArray(planExercise?.formTips, ['Keep control']).join(' '),
    instructions: toStringArray(planExercise?.notes, ['Move with control.']),
    formTips: toStringArray(planExercise?.formTips, ['Keep control']),
    commonMistakes: [],
    progression: [],
    regression: [],
    postureNotes: '',
    demoLinks: [],
    relatedWorkoutDays: [],
  })
}

function normalizeUserProfileSettings(value) {
  const settings = isPlainObject(value) ? value : {}
  const profile = isPlainObject(settings.profile) ? settings.profile : {}
  const goals = isPlainObject(settings.goals) ? settings.goals : {}
  const supplements = isPlainObject(settings.supplements)
    ? settings.supplements
    : {}
  const coach = isPlainObject(settings.coach) ? settings.coach : {}
  const workoutDisplay = isPlainObject(settings.workoutDisplay)
    ? settings.workoutDisplay
    : {}

  return {
    ...clone(settings),
    profile: {
      ...clone(profile),
      name: toText(profile.name, defaultUserProfileSettings.profile.name),
      heightCm: toPositiveNumber(
        profile.heightCm,
        numberFromText(userProfile.height) ?? defaultUserProfileSettings.profile.heightCm,
      ),
      currentWeightKg: toPositiveNumber(
        profile.currentWeightKg,
        numberFromText(userProfile.currentWeight) ??
          defaultUserProfileSettings.profile.currentWeightKg,
      ),
      goalWeightMinKg: toPositiveNumber(
        profile.goalWeightMinKg,
        defaultUserProfileSettings.profile.goalWeightMinKg,
      ),
      goalWeightMaxKg: toPositiveNumber(
        profile.goalWeightMaxKg,
        defaultUserProfileSettings.profile.goalWeightMaxKg,
      ),
      trainingGoal: toText(
        profile.trainingGoal,
        defaultUserProfileSettings.profile.trainingGoal,
      ),
      mainFocus: toText(
        profile.mainFocus,
        defaultUserProfileSettings.profile.mainFocus,
      ),
      trainingTimePerDay: toText(
        profile.trainingTimePerDay,
        defaultUserProfileSettings.profile.trainingTimePerDay,
      ),
      experienceLevel: toText(
        profile.experienceLevel,
        defaultUserProfileSettings.profile.experienceLevel,
      ),
    },
    equipment: toStringArray(settings.equipment, defaultUserProfileSettings.equipment),
    goals: {
      ...clone(goals),
      primaryGoal: toText(
        goals.primaryGoal,
        defaultUserProfileSettings.goals.primaryGoal,
      ),
      secondaryGoal: toText(
        goals.secondaryGoal,
        defaultUserProfileSettings.goals.secondaryGoal,
      ),
      bodyGoal: toText(goals.bodyGoal, defaultUserProfileSettings.goals.bodyGoal),
      weakPoint: toText(goals.weakPoint, defaultUserProfileSettings.goals.weakPoint),
      cardioPreference: toText(
        goals.cardioPreference,
        defaultUserProfileSettings.goals.cardioPreference,
      ),
      injuryLimitation: toText(
        goals.injuryLimitation,
        defaultUserProfileSettings.goals.injuryLimitation,
      ),
    },
    supplements: {
      ...clone(supplements),
      creatineMonohydrate: toBoolean(
        supplements.creatineMonohydrate,
        defaultUserProfileSettings.supplements.creatineMonohydrate,
      ),
      wheyProtein: toBoolean(
        supplements.wheyProtein,
        defaultUserProfileSettings.supplements.wheyProtein,
      ),
      proteinTargetMin: toPositiveNumber(
        supplements.proteinTargetMin,
        defaultUserProfileSettings.supplements.proteinTargetMin,
      ),
      proteinTargetMax: toPositiveNumber(
        supplements.proteinTargetMax,
        defaultUserProfileSettings.supplements.proteinTargetMax,
      ),
      waterTargetMin: toPositiveNumber(
        supplements.waterTargetMin,
        defaultUserProfileSettings.supplements.waterTargetMin,
      ),
      waterTargetMax: toPositiveNumber(
        supplements.waterTargetMax,
        defaultUserProfileSettings.supplements.waterTargetMax,
      ),
    },
    coach: {
      ...clone(coach),
      coachingStyle: toChoice(
        coach.coachingStyle,
        ['Direct', 'Balanced', 'Detailed'],
        defaultUserProfileSettings.coach.coachingStyle,
      ),
      mainPriority: toChoice(
        coach.mainPriority,
        [
          'Bigger chest + visible abs',
          'Bigger chest',
          'Visible abs',
          'Lean muscle gain',
          'Posture correction',
        ],
        defaultUserProfileSettings.coach.mainPriority,
      ),
      warningSensitivity: toChoice(
        coach.warningSensitivity,
        ['Low', 'Normal', 'High'],
        defaultUserProfileSettings.coach.warningSensitivity,
      ),
    },
    workoutDisplay: {
      ...clone(workoutDisplay),
      showExerciseImages: toBoolean(
        workoutDisplay.showExerciseImages,
        defaultUserProfileSettings.workoutDisplay.showExerciseImages,
      ),
      videosCollapsedByDefault: toBoolean(
        workoutDisplay.videosCollapsedByDefault,
        defaultUserProfileSettings.workoutDisplay.videosCollapsedByDefault,
      ),
      autoOpenVideo: toBoolean(
        workoutDisplay.autoOpenVideo,
        defaultUserProfileSettings.workoutDisplay.autoOpenVideo,
      ),
      preferCompactView: toBoolean(
        workoutDisplay.preferCompactView,
        defaultUserProfileSettings.workoutDisplay.preferCompactView,
      ),
    },
  }
}

function normalizeWorkoutPlan(value) {
  const source = Array.isArray(value) ? value : []

  return weeklyPlan.map((defaultDay, index) => {
    const incoming =
      source.find((day) => Number(day?.day) === defaultDay.day) ?? source[index]
    return normalizeWorkoutDay(incoming, defaultDay, index)
  })
}

function normalizeWorkoutDay(value, fallback, index) {
  const day = isPlainObject(value) ? value : {}
  const defaultDay = fallback ?? weeklyPlan[index] ?? weeklyPlan[0]

  return {
    day: toPositiveNumber(day.day, defaultDay.day ?? index + 1),
    name: toText(day.name, defaultDay.name ?? `Day ${index + 1}`),
    estimatedTime: toText(
      day.estimatedTime ?? day.estimatedMinutes,
      defaultDay.estimatedTime ?? '30-60 min',
    ),
    focus: toStringArray(day.focus, defaultDay.focus ?? ['General']),
    notes: toText(day.notes, ''),
    exercises: Array.isArray(day.exercises)
      ? day.exercises.map((exercise, exerciseIndex) =>
          normalizePlanExercise(
            exercise,
            defaultDay.exercises?.[exerciseIndex],
            `${index + 1}-${exerciseIndex + 1}`,
          ),
        )
      : clone(defaultDay.exercises ?? []).map((exercise, exerciseIndex) =>
          normalizePlanExercise(exercise, null, `${index + 1}-${exerciseIndex + 1}`),
        ),
  }
}

function normalizePlanExercise(value, fallback, suffix) {
  const exercise = isPlainObject(value) ? value : {}
  const defaultExercise = isPlainObject(fallback) ? fallback : {}
  const name = toText(exercise.name, defaultExercise.name ?? 'Custom Exercise')
  const explicitRepRange = toText(exercise.repRange, '')
  const explicitDuration = toText(exercise.duration, '')
  const fallbackRepRange = toText(defaultExercise.repRange, '')
  const fallbackDuration = toText(defaultExercise.duration, '')
  const repRange = explicitRepRange
    ? explicitRepRange
    : explicitDuration
      ? ''
      : fallbackRepRange
  const duration = explicitRepRange
    ? ''
    : explicitDuration || (fallbackRepRange ? '' : fallbackDuration)

  return removeEmptyFields({
    id: toText(exercise.id, defaultExercise.id ?? `custom-${slugify(name)}-${suffix}`),
    name,
    sets: toPositiveNumber(exercise.sets, defaultExercise.sets ?? 3),
    repRange,
    duration,
    restSeconds: toPositiveNumber(
      exercise.restSeconds,
      defaultExercise.restSeconds ?? 60,
    ),
    muscleGroup: toText(
      exercise.muscleGroup,
      defaultExercise.muscleGroup ?? 'Other',
    ),
    equipment: toText(exercise.equipment, defaultExercise.equipment ?? 'Bodyweight'),
    formTips: toStringArray(
      exercise.formTips,
      defaultExercise.formTips ?? ['Keep control'],
    ),
    notes: toText(exercise.notes, defaultExercise.notes ?? ''),
  })
}

function normalizeExerciseLibrary(value) {
  const source = Array.isArray(value) ? value : exerciseLibrary
  return source.map(normalizeLibraryExercise)
}

function normalizeExerciseLibraryEntries(value) {
  return Array.isArray(value) ? value.map(normalizeLibraryExercise) : []
}

function normalizeLibraryExercise(value) {
  const exercise = isPlainObject(value) ? value : {}
  const name = toText(exercise.name, 'Custom Exercise')
  const id = toText(exercise.id, `custom-${slugify(name)}`)
  const category = exerciseCategories.includes(exercise.category)
    ? exercise.category
    : 'Conditioning'
  const difficulty = difficultyOptions.includes(exercise.difficulty)
    ? exercise.difficulty
    : 'Beginner'
  // Media fields (Step 18). Stored custom libraries created before Step 18
  // have no media, so fall back to the default library entry with the same id.
  const defaultExercise = defaultExercisesById.get(id)
  const videoUrl = toText(exercise.videoUrl, defaultExercise?.videoUrl ?? '')
  const savedImageUrl = toText(exercise.imageUrl, '')
  const imageUrl = savedImageUrl.startsWith('/exercise-placeholders/')
    ? (defaultExercise?.imageUrl ?? savedImageUrl)
    : savedImageUrl || (defaultExercise?.imageUrl ?? '')

  return {
    id,
    name,
    category,
    primaryMuscles: toStringArray(exercise.primaryMuscles, ['Other']),
    secondaryMuscles: toStringArray(exercise.secondaryMuscles, []),
    equipment: toStringArray(exercise.equipment, ['Bodyweight']),
    difficulty,
    formCue: toText(exercise.formCue, ''),
    instructions: toStringArray(exercise.instructions, []),
    formTips: toStringArray(exercise.formTips, []),
    commonMistakes: toStringArray(exercise.commonMistakes, []),
    progression: toStringArray(exercise.progression, []),
    regression: toStringArray(exercise.regression, []),
    postureNotes: toText(exercise.postureNotes, ''),
    imageUrl,
    imageAlt: toText(exercise.imageAlt, defaultExercise?.imageAlt ?? ''),
    videoUrl,
    videoType: toChoice(
      exercise.videoType,
      ['youtube', 'external', 'none'],
      defaultExercise?.videoType ?? (videoUrl ? 'youtube' : 'none'),
    ),
    videoTitle: toText(exercise.videoTitle, defaultExercise?.videoTitle ?? ''),
    demoLinks: normalizeDemoLinks(exercise.demoLinks),
    relatedWorkoutDays: toNumberArray(exercise.relatedWorkoutDays),
    postureFocus: toBoolean(exercise.postureFocus, false),
  }
}

function normalizeDemoLinks(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((link) => {
    if (!isPlainObject(link)) {
      return []
    }

    const label = toText(link.label, '')
    const url = toText(link.url, '')
    return label && url ? [{ label, url }] : []
  })
}

function findExerciseInLibrary(workout, library) {
  if (!workout || !Array.isArray(library)) {
    return undefined
  }

  const id = toText(workout.id, '')
  if (id) {
    const byId = library.find((exercise) => exercise.id === id)
    if (byId) {
      return byId
    }
  }

  const normalizedWorkoutName = normalizeName(toText(workout.name, ''))
  if (!normalizedWorkoutName) {
    return undefined
  }

  return library.find(
    (exercise) => normalizeName(toText(exercise.name, '')) === normalizedWorkoutName,
  )
}

function readJson(key) {
  if (typeof window === 'undefined') {
    return null
  }

  return safeGetJSON(key, null)
}

function readArray(key) {
  const value = readJson(key)
  return Array.isArray(value) ? value : []
}

function writeJson(key, value) {
  if (typeof window === 'undefined') {
    return
  }

  safeSetJSON(key, value)
}

function removeStorageItem(key) {
  if (typeof window === 'undefined') {
    return
  }

  safeRemove(key)
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function libraryExercisesEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function toText(value, fallback) {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed ? trimmed : fallback
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return fallback
}

function toChoice(value, choices, fallback) {
  const text = toText(value, fallback)
  return choices.includes(text) ? text : fallback
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== ''
}

function toStringArray(value, fallback) {
  if (Array.isArray(value)) {
    const clean = value
      .map((item) => toText(item, ''))
      .map((item) => item.trim())
      .filter(Boolean)
    return clean.length > 0 ? clean : clone(fallback)
  }

  if (typeof value === 'string') {
    const clean = value
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean)
    return clean.length > 0 ? clean : clone(fallback)
  }

  return clone(fallback)
}

function toNumberArray(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item))
}

function toPositiveNumber(value, fallback) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback
  }

  return parsed
}

function numberFromText(value) {
  if (typeof value !== 'string') {
    return null
  }

  const match = value.match(/\d+(\.\d+)?/)
  if (!match) {
    return null
  }

  const parsed = Number(match[0])
  return Number.isFinite(parsed) ? parsed : null
}

function toBoolean(value, fallback) {
  return typeof value === 'boolean' ? value : fallback
}

function normalizeName(value) {
  return value
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\bups\b/g, 'up')
    .replace(/\bs\b/g, '')
    .trim()
}

function slugify(value) {
  const slug = toText(value, 'custom-exercise')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  return slug || 'custom-exercise'
}

function removeEmptyFields(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== ''),
  )
}
