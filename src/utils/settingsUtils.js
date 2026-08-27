import { t } from '../i18n/t'
import { BODY_CHECK_INS_KEY } from '../data/bodyCheckIns'
import {
  difficultyOptions,
  exerciseCategories,
  exerciseLibrary,
  findLibraryExerciseForWorkout as findDefaultLibraryExerciseForWorkout,
} from '../data/exerciseLibrary'
import { NUTRITION_LOGS_KEY } from '../data/nutritionLogs'
import { WORKOUT_SESSIONS_KEY } from '../data/workoutSessions'
import {
  DISMISSED_WORKOUT_PROGRAMS_KEY,
  CLOUD_WORKOUT_PROGRAM_MANAGER_CACHE_KEY,
  INSTALLED_WORKOUT_PROGRAM_KEY,
  PROFILE_ONBOARDING_KEY,
  WORKOUT_PLAN_BACKUPS_KEY,
  USER_WORKOUT_PROGRAMS_KEY,
  safeGetJSON,
  safeRemove,
  safeSetJSON,
} from './storageUtils'

export const USER_PROFILE_SETTINGS_KEY = 'userProfileSettings'
/**
 * Fired whenever the profile settings document changes. The nav shows the
 * user's photo and name, so it has to re-read after a save, a reset, or a
 * cloud pull instead of only at mount.
 */
export const USER_PROFILE_SETTINGS_EVENT = 'fitness-user-profile-settings-updated'
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

/**
 * A brand new profile: empty.
 *
 * The first-run screen promises this app "never shows you anyone else's"
 * profile, so nothing personal is seeded here. Every field starts unset and
 * stays unset until this user fills it in, either in the onboarding step or in
 * Settings > Profile.
 *
 * Numbers are null rather than 0 so a consumer can tell "not set yet" apart
 * from a real measurement, and text fields use '' for the same reason. Only
 * impersonal values survive: generic nutrition guidance (the same numbers
 * reminderUtils and the Nutrition page already use as standard targets) and
 * the workout display preferences, which are UI choices, not body data.
 */
export const defaultUserProfileSettings = {
  profile: {
    name: '',
    avatarDataUrl: '',
    heightCm: null,
    currentWeightKg: null,
    goalWeightMinKg: null,
    goalWeightMaxKg: null,
    trainingGoal: '',
    mainFocus: '',
    trainingTimePerDay: '',
    experienceLevel: '',
  },
  equipment: [],
  goals: {
    primaryGoal: '',
    secondaryGoal: '',
    bodyGoal: '',
    weakPoint: '',
    cardioPreference: '',
    injuryLimitation: '',
  },
  supplements: {
    // Off by default: owning these is a purchase, not an assumption to make
    // on someone's behalf.
    creatineMonohydrate: false,
    wheyProtein: false,
    proteinTargetMin: 120,
    proteinTargetMax: 160,
    waterTargetMin: 2,
    waterTargetMax: 3,
  },
  coach: {
    coachingStyle: 'Balanced',
    mainPriority: '',
    warningSensitivity: 'Normal',
  },
  workoutDisplay: {
    showExerciseImages: true,
    videosCollapsedByDefault: true,
    autoOpenVideo: false,
    preferCompactView: true,
    // Where the next workout is trained. Remembered rather than re-asked:
    // most people train in the same place most weeks, and defaulting back to
    // home every session quietly hands a gym-goer the home variants.
    trainingLocation: 'home',
  },
}

const appStorageKeys = [
  USER_PROFILE_SETTINGS_KEY,
  CUSTOM_WORKOUT_PLAN_KEY,
  CUSTOM_EXERCISE_LIBRARY_KEY,
  INSTALLED_WORKOUT_PROGRAM_KEY,
  DISMISSED_WORKOUT_PROGRAMS_KEY,
  WORKOUT_PLAN_BACKUPS_KEY,
  USER_WORKOUT_PROGRAMS_KEY,
  CLOUD_WORKOUT_PROGRAM_MANAGER_CACHE_KEY,
  WORKOUT_SESSIONS_KEY,
  BODY_CHECK_INS_KEY,
  NUTRITION_LOGS_KEY,
  PROFILE_ONBOARDING_KEY,
  'reminderSettings',
  'reminderHistory',
  'sentReminderLog',
  'activeWorkoutSession',
  'pendingSyncQueue',
  'lastOfflineSyncAt',
]

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

/**
 * Remembers where the next workout is trained.
 *
 * Written straight into the profile document so it rides the same cloud sync
 * as every other preference - pick Gym on the phone and the tablet opens on
 * Gym too, rather than each device keeping its own idea of where you are.
 */
export function saveTrainingLocation(location) {
  const settings = getUserProfileSettings()
  return saveUserProfileSettings({
    ...settings,
    workoutDisplay: {
      ...settings.workoutDisplay,
      trainingLocation: location === 'gym' ? 'gym' : 'home',
    },
  }).workoutDisplay.trainingLocation
}

export function saveUserProfileSettings(settings) {
  return saveUserProfileSettingsSafely(settings).settings
}

/**
 * Tells the rest of the app that the profile document changed. Called by every
 * write here, and by the cloud->local hydration once it has replaced the
 * mirror.
 */
export function notifyUserProfileSettingsChanged() {
  // Non-DOM hosts (SSR, the verification harness) may define `window` without
  // defining the event target on it, so presence alone is not enough.
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') {
    return
  }

  window.dispatchEvent(new CustomEvent(USER_PROFILE_SETTINGS_EVENT))
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

  notifyUserProfileSettingsChanged()

  return { success, settings: normalized }
}

/**
 * Whether the profile step has already been answered for this account.
 *
 * True once the user completes or skips it. Also true when the stored profile
 * already carries a name or height: an account that predates this step, or one
 * whose profile just arrived from the cloud on a second device, has effectively
 * answered it and must not be asked again.
 */
export function hasCompletedProfileOnboarding() {
  if (typeof window === 'undefined') {
    return true
  }

  if (safeGetJSON(PROFILE_ONBOARDING_KEY, false) === true) {
    return true
  }

  const { profile } = getUserProfileSettings()
  return Boolean(profile.name || profile.heightCm)
}

/** Records that the profile step was answered, whether filled in or skipped. */
export function markProfileOnboardingCompleted() {
  safeSetJSON(PROFILE_ONBOARDING_KEY, true)
}

export function resetUserProfileSettings() {
  removeStorageItem(USER_PROFILE_SETTINGS_KEY)
  notifyUserProfileSettingsChanged()
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

/**
 * Clears the edited plan. No program ships with the app, so there is nothing
 * to fall back to: the caller is left with no plan until a program is
 * uploaded and installed.
 */
export function resetCustomWorkoutPlan() {
  removeStorageItem(CUSTOM_WORKOUT_PLAN_KEY)
  return []
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

/**
 * The data backup: everything this account has recorded, and nothing at all
 * about the plan it was recorded against.
 *
 * The plan is deliberately absent. It has its own file (Settings > Program >
 * Export Current Plan) and its own way back in, so a regenerated plan can
 * never travel with - or overwrite - training that is already logged, and a
 * data restore can never change which program somebody is training from.
 * `kind` marks the file so an import knows what it is holding.
 */
export function exportAllData() {
  const data = {
    kind: DATA_BACKUP_KIND,
    exportedAt: new Date().toISOString(),
    userProfileSettings: withoutProgramMetadata(getUserProfileSettings()),
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
    link.download = `workout-data-backup-${new Date()
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
      return { success: false, message: t('paste.importInvalid') }
    }

    // A data file never changes the plan.
    //
    // That is the whole separation: the plan is one document with one way in
    // (upload a program in Settings > Program), and the training logged
    // against it is another. Older backups still carry plan keys, so they are
    // read only to say they were ignored - never applied.
    const carriedPlan =
      'customWorkoutPlan' in data ||
      'installedWorkoutProgram' in data ||
      'workoutPlanBackups' in data

    if ('userProfileSettings' in data) {
      // The installed program, its dismissals and its backups live inside the
      // settings document. They describe the plan, not the person, so the
      // ones already on this device are kept whatever the file says.
      const current = getUserProfileSettings()
      saveUserProfileSettings({
        ...withoutProgramMetadata(data.userProfileSettings),
        ...(current.workoutProgramManager === undefined
          ? {}
          : { workoutProgramManager: current.workoutProgramManager }),
      })
    }

    if ('customExerciseLibrary' in data) {
      if (data.customExerciseLibrary === null) {
        resetCustomExerciseLibrary()
      } else {
        saveCustomExerciseLibrary(data.customExerciseLibrary)
      }
    }

    // Logged records are MERGED, never replaced.
    //
    // An import is how somebody changes the plan they train from; it must
    // never be how they lose the training they already did. The old code
    // replaced each array with whatever the file held, and wrote an empty
    // array whenever the key was present but not a usable list - so a backup
    // that came back edited, or regenerated by a chat with the bulky arrays
    // dropped, silently erased every workout, check-in and nutrition log.
    // A file with nothing to add now leaves the stored records untouched.
    const merged = {
      workoutSessions: mergeStoredRecords(
        WORKOUT_SESSIONS_KEY,
        data.workoutSessions,
      ),
      bodyCheckIns: mergeStoredRecords(BODY_CHECK_INS_KEY, data.bodyCheckIns),
      nutritionLogs: mergeStoredRecords(NUTRITION_LOGS_KEY, data.nutritionLogs),
    }
    const added = Object.values(merged).reduce(
      (total, entry) => total + entry.added,
      0,
    )
    const kept = Object.values(merged).reduce(
      (total, entry) => total + entry.kept,
      0,
    )

    const summary = t('paste.importDoneSummary', { added, kept })
    return {
      success: true,
      message: carriedPlan ? `${summary} ${t('paste.importPlanIgnored')}` : summary,
      added,
      kept,
      planIgnored: carriedPlan,
    }
  } catch {
    return { success: false, message: t('paste.importInvalid') }
  }
}

/** Marks a file as a data backup, so an import can tell it from a program. */
export const DATA_BACKUP_KIND = 'workout-os-data-backup'

/**
 * A settings document with the plan's metadata taken out.
 *
 * `workoutProgramManager` records which program is installed, which were
 * dismissed, and the cloud plan backups. It rides inside the settings
 * document for sync reasons, but it belongs to the plan - so it neither
 * leaves in a data export nor arrives in a data import.
 */
function withoutProgramMetadata(settings) {
  if (!isPlainObject(settings)) {
    return {}
  }

  const { workoutProgramManager: _ignored, ...rest } = settings
  return clone(rest)
}

/**
 * Folds a backup's records into what is already stored, and returns what it
 * did so the caller can say so plainly.
 *
 * Nothing is written when the file has no usable list for this key: an absent
 * key, a null, or an empty array all mean "this backup has nothing to add",
 * which is not the same as "delete what you have".
 */
function mergeStoredRecords(key, incoming) {
  const existing = readArray(key)
  if (!Array.isArray(incoming) || incoming.length === 0) {
    return { added: 0, kept: existing.length, written: false }
  }

  const next = mergeRecordLists(existing, incoming)
  const written = writeJson(key, next)
  return {
    added: written ? Math.max(0, next.length - existing.length) : 0,
    kept: existing.length,
    written,
  }
}

/**
 * Two record lists as one, newest copy of each id winning.
 *
 * The same rule the cloud pull uses (see mergeCloudIntoLocal in
 * services/serviceUtils.js): `id` is the identity, a later `updatedAt` wins,
 * and a record with no id is kept rather than dropped - it cannot be matched,
 * and guessing would mean losing it. Stored records go in first so a copy of
 * the same age coming from the file wins the tie, which is what restoring a
 * backup is asking for.
 */
function mergeRecordLists(existing, incoming) {
  const byId = new Map()
  const unmatchable = []

  const add = (record) => {
    const id = record?.id
    if (id === undefined || id === null || id === '') {
      // Re-importing the same file must not stack up duplicates of records
      // that have no id to match on.
      if (!unmatchable.some((kept) => sameRecord(kept, record))) {
        unmatchable.push(record)
      }
      return
    }

    const key = String(id)
    const current = byId.get(key)
    if (!current || recordTime(record) >= recordTime(current)) {
      byId.set(key, record)
    }
  }

  existing.forEach(add)
  incoming.forEach(add)

  return [...byId.values(), ...unmatchable].sort((left, right) =>
    recordSortKey(right).localeCompare(recordSortKey(left)),
  )
}

function recordTime(record) {
  const parsed = new Date(record?.updatedAt ?? 0).getTime()
  return Number.isFinite(parsed) ? parsed : 0
}

/** What the lists are ordered by on screen: newest first. */
function recordSortKey(record) {
  const value = record?.finishedAt ?? record?.date ?? ''
  return typeof value === 'string' ? value : ''
}

function sameRecord(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

export function clearAllData() {
  appStorageKeys.forEach(removeStorageItem)
  notifyUserProfileSettingsChanged()
}

export function getWorkoutForDate(date = new Date(), plan = getCustomWorkoutPlan()) {
  const safePlan = normalizeWorkoutPlan(plan)
  const dayOfWeek = date.getDay()
  const mondayBasedIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  // Match on the declared day number first. Array position only agrees with it
  // when a plan has exactly seven days in order, which is not guaranteed for
  // pasted programs, so position is the fallback rather than the rule.
  const targetDayNumber = mondayBasedIndex + 1
  const byDayNumber = safePlan.find((day) => day?.day === targetDayNumber)
  if (byDayNumber) {
    return byDayNumber
  }

  // Shorter cycles (a 3- or 4-day split) repeat across the week.
  if (safePlan.length > 0) {
    return safePlan[mondayBasedIndex % safePlan.length]
  }

  // Only reachable when the stored plan is empty and the default program is
  // missing or failed validation, so show a rest day rather than throwing.
  return clone(emptyDefaultDay)
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
      avatarDataUrl: toImageDataUrl(profile.avatarDataUrl),
      // Body measurements are optional, so these keep null for "not set" and
      // must not collapse to 0 the way toPositiveNumber would for '' or null.
      heightCm: toOptionalPositiveNumber(profile.heightCm),
      currentWeightKg: toOptionalPositiveNumber(profile.currentWeightKg),
      goalWeightMinKg: toOptionalPositiveNumber(profile.goalWeightMinKg),
      goalWeightMaxKg: toOptionalPositiveNumber(profile.goalWeightMaxKg),
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
      // Free text: the user names their own priority rather than picking from
      // a list built around one person's goals.
      mainPriority: toText(
        coach.mainPriority,
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
      trainingLocation:
        workoutDisplay.trainingLocation === 'gym' ? 'gym' : 'home',
      preferCompactView: toBoolean(
        workoutDisplay.preferCompactView,
        defaultUserProfileSettings.workoutDisplay.preferCompactView,
      ),
    },
  }
}

/**
 * Day used to fill in missing display fields on an uploaded program. Nothing
 * is inherited from another program, so every lookup has to survive a day that
 * declares only part of itself.
 */
const emptyDefaultDay = {
  day: 1,
  name: 'No workout scheduled',
  estimatedTime: '0 min',
  focus: ['Rest'],
  exercises: [],
}

function normalizeWorkoutPlan(value) {
  const source = Array.isArray(value) ? value.filter(isPlainObject) : []

  // Nothing stored means no plan at all. The app ships no program, so an empty
  // result is the honest answer and callers must render an upload prompt
  // rather than a workout.
  if (source.length === 0) {
    return []
  }

  // A stored plan defines its own length and order, and missing display fields
  // are filled from emptyDefaultDay rather than from another program.
  return source.map((day, index) => normalizeWorkoutDay(day, null, index))
}

function normalizeWorkoutDay(value, fallback, index) {
  const day = isPlainObject(value) ? value : {}
  const defaultDay = fallback ?? emptyDefaultDay

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
            // Only inherit from the default exercise in the same slot when it
            // is the SAME movement. Position alone would let an unrelated
            // pasted exercise inherit bench-press rest, equipment, and cues.
            matchingDefaultExercise(
              exercise,
              defaultDay.exercises?.[exerciseIndex],
            ),
            `${index + 1}-${exerciseIndex + 1}`,
          ),
        )
      : clone(defaultDay.exercises ?? []).map((exercise, exerciseIndex) =>
          normalizePlanExercise(exercise, null, `${index + 1}-${exerciseIndex + 1}`),
        ),
  }
}

/**
 * Returns the default exercise only when it describes the same movement as the
 * incoming one, matched by id and then by name. Otherwise null, so generic
 * defaults are used instead of another exercise's data.
 */
function matchingDefaultExercise(incoming, defaultExercise) {
  if (!isPlainObject(incoming) || !isPlainObject(defaultExercise)) {
    return null
  }

  const incomingId = toText(incoming.id, '')
  const defaultId = toText(defaultExercise.id, '')
  if (incomingId && defaultId) {
    return incomingId === defaultId ? defaultExercise : null
  }

  const incomingName = toText(incoming.name, '').toLowerCase()
  const defaultName = toText(defaultExercise.name, '').toLowerCase()
  if (incomingName && defaultName) {
    return incomingName === defaultName ? defaultExercise : null
  }

  // Nothing identifies the incoming exercise, so inheriting is the best guess.
  return defaultExercise
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

  const alternatives = normalizeExerciseAlternatives(
    exercise.alternatives,
    defaultExercise.alternatives,
  )
  const phaseTargets = normalizeExercisePhaseTargets(
    exercise.phaseTargets,
    defaultExercise.phaseTargets,
  )
  const guidance = toStringArray(
    exercise.guidance,
    defaultExercise.guidance ?? [],
  )
  const defaultVariantIds = toStringArray(
    exercise.defaultVariantIds,
    defaultExercise.defaultVariantIds ?? [],
  )

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
    ...(alternatives ? { alternatives } : {}),
    ...(phaseTargets.length > 0 ? { phaseTargets } : {}),
    ...(guidance.length > 0 ? { guidance } : {}),
    ...(defaultVariantIds.length > 0 ? { defaultVariantIds } : {}),
    ...(exercise.optional !== undefined || defaultExercise.optional !== undefined
      ? { optional: toBoolean(exercise.optional, Boolean(defaultExercise.optional)) }
      : {}),
    ...(exercise.selectionMode !== undefined || defaultExercise.selectionMode !== undefined
      ? {
          selectionMode: toChoice(
            exercise.selectionMode,
            ['single', 'multiple'],
            defaultExercise.selectionMode ?? 'single',
          ),
        }
      : {}),
    ...(exercise.minSelections !== undefined || defaultExercise.minSelections !== undefined
      ? {
          minSelections: Math.max(
            1,
            Math.round(
              toPositiveNumber(
                exercise.minSelections,
                defaultExercise.minSelections ?? 1,
              ),
            ),
          ),
        }
      : {}),
    ...(exercise.maxSelections !== undefined || defaultExercise.maxSelections !== undefined
      ? {
          maxSelections: Math.max(
            1,
            Math.round(
              toPositiveNumber(
                exercise.maxSelections,
                defaultExercise.maxSelections ?? 1,
              ),
            ),
          ),
        }
      : {}),
    ...(toText(exercise.targetRir, defaultExercise.targetRir ?? '')
      ? { targetRir: toText(exercise.targetRir, defaultExercise.targetRir ?? '') }
      : {}),
  })
}

function normalizeExerciseAlternatives(value, fallback) {
  const source = isPlainObject(value)
    ? value
    : isPlainObject(fallback)
      ? fallback
      : null
  if (!source) return undefined

  const result = {}
  for (const location of ['home', 'gym']) {
    const variants = Array.isArray(source[location]) ? source[location] : []
    const normalized = variants
      .filter(isPlainObject)
      .map((variant) => {
        const id = toText(variant.id, '')
        const name = toText(variant.name, '')
        const equipment = toText(variant.equipment, '')
        const repRange = toText(variant.repRange, '')
        const duration = repRange ? '' : toText(variant.duration, '')
        const formTips = toStringArray(variant.formTips, [])
        return removeEmptyFields({
          id,
          name,
          equipment,
          repRange,
          duration,
          ...(formTips.length > 0 ? { formTips } : {}),
        })
      })
      .filter((variant) => variant.id && variant.name && variant.equipment)
    if (normalized.length > 0) result[location] = normalized
  }

  return Object.keys(result).length > 0 ? result : undefined
}

function normalizeExercisePhaseTargets(value, fallback) {
  const source = Array.isArray(value)
    ? value
    : Array.isArray(fallback)
      ? fallback
      : []

  return source.filter(isPlainObject).flatMap((target) => {
    const weeks = toNumberArray(target.weeks)
      .map((week) => Math.round(week))
      .filter((week) => week > 0)
    if (weeks.length === 0) return []

    const repRange = toText(target.repRange, '')
    const duration = repRange ? '' : toText(target.duration, '')
    const guidance = toStringArray(target.guidance, [])
    return [
      removeEmptyFields({
        weeks,
        ...(target.sets !== undefined
          ? { sets: Math.max(1, Math.round(toPositiveNumber(target.sets, 1))) }
          : {}),
        repRange,
        duration,
        ...(guidance.length > 0 ? { guidance } : {}),
      }),
    ]
  })
}

function normalizeExerciseLibrary(value) {
  const source = Array.isArray(value) ? value : exerciseLibrary
  return source.map(normalizeLibraryExercise)
}

function normalizeExerciseLibraryEntries(value) {
  return Array.isArray(value) ? value.map(normalizeLibraryExercise) : []
}

function isManagedExerciseAnimationUrl(value) {
  return (
    value.startsWith('/exercise-gifs/') ||
    value.startsWith(
      'https://d2m0n84d5tgmh1.cloudfront.net/training-videos-watermarked/',
    )
  )
}

function isLegacyHostedExerciseImageUrl(value) {
  try {
    const url = new URL(value)
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '')

    return (
      url.pathname.toLowerCase().startsWith('/wp-content/uploads/') &&
      (hostname === 'training.fit' || hostname === 'weighttraining.guide')
    )
  } catch {
    return false
  }
}

function isManagedExerciseImageUrl(value) {
  return (
    value.startsWith('/exercise-images/') ||
    value.startsWith('/exercise-gifs/') ||
    value.startsWith('/exercise-placeholders/') ||
    value.startsWith(
      'https://d2m0n84d5tgmh1.cloudfront.net/training-image/',
    ) ||
    isLegacyHostedExerciseImageUrl(value)
  )
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
  // Bundled media is derived from the current defaults so an old saved row
  // cannot freeze a stale thumbnail/animation. Preserve only media the user
  // can genuinely customize: an uploaded data-image or non-managed animation.
  const defaultExercise = defaultExercisesById.get(id)
  const videoUrl = toText(exercise.videoUrl, defaultExercise?.videoUrl ?? '')
  const savedImageUrl = toText(exercise.imageUrl, '')
  const hasCustomImage =
    savedImageUrl !== '' && !isManagedExerciseImageUrl(savedImageUrl)
  const imageUrl = defaultExercise
    ? hasCustomImage
      ? savedImageUrl
      : (defaultExercise.imageUrl ?? savedImageUrl)
    : savedImageUrl
  const savedGifUrl = toText(exercise.gifUrl, '')
  const hasCustomAnimation =
    savedGifUrl !== '' && !isManagedExerciseAnimationUrl(savedGifUrl)
  const gifUrl = defaultExercise
    ? hasCustomAnimation
      ? savedGifUrl
      : (defaultExercise.gifUrl ?? '')
    : savedGifUrl

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
    imageAlt:
      defaultExercise && !hasCustomImage
        ? (defaultExercise.imageAlt ?? '')
        : toText(exercise.imageAlt, defaultExercise?.imageAlt ?? ''),
    gifUrl,
    gifAlt:
      defaultExercise && !hasCustomAnimation
        ? (defaultExercise.gifAlt ?? '')
        : toText(exercise.gifAlt, defaultExercise?.gifAlt ?? ''),
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
    return false
  }

  return safeSetJSON(key, value)
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

/**
 * Profile photos live inline in the settings document as a small data URL, so
 * the avatar survives a reload and rides along with cloud sync. Anything that
 * is not an image data URL is dropped rather than rendered.
 */
function toImageDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:image/') ? value : ''
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

/**
 * A measurement the user may simply not have entered yet.
 *
 * Returns null for anything that is not a real positive number, including ''
 * and null -- Number('') is 0, so the plain toPositiveNumber above would turn
 * a blank height field into a claimed 0 cm.
 */
function toOptionalPositiveNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null
  }

  return parsed
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
