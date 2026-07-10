import {
  BODY_CHECK_INS_KEY,
  NUTRITION_LOGS_KEY,
  WORKOUT_SESSIONS_KEY,
  safeGetJSON,
  safeSetJSON,
} from './storageUtils'

/**
 * Step 20 - production smoke-test data.
 *
 * Small, obviously-labelled demo records for verifying a fresh deployment
 * end to end (lists, charts, export). Every record carries isTestData: true
 * and a "test-" id prefix so removal is exact and never touches real data.
 */

const TEST_ID_PREFIX = 'test-'

export function hasProductionTestData() {
  return (
    readArray(WORKOUT_SESSIONS_KEY).some(isTestRecord) ||
    readArray(BODY_CHECK_INS_KEY).some(isTestRecord) ||
    readArray(NUTRITION_LOGS_KEY).some(isTestRecord)
  )
}

/** Creates 1 workout + 1 body check-in + 1 nutrition log (skips duplicates). */
export function createProductionTestData() {
  if (hasProductionTestData()) {
    return { created: false, message: 'Production test data already exists.' }
  }

  const now = new Date()
  const date = now.toISOString().slice(0, 10)
  const createdAt = now.toISOString()

  const workoutSession = {
    completed: true,
    date,
    exercises: [
      {
        exerciseName: 'Test Push-up',
        sets: [
          { notes: 'Deployment test set', reps: 10, rpe: 6, setNumber: 1, weightKg: null },
          { notes: '', reps: 10, rpe: 7, setNumber: 2, weightKg: null },
        ],
        targetReps: '10-12',
        targetSets: 2,
      },
    ],
    finishedAt: createdAt,
    id: `${TEST_ID_PREFIX}workout-${now.getTime()}`,
    isTestData: true,
    startedAt: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
    syncStatus: 'local-only',
    workoutDayId: 1,
    workoutName: 'Production Test Workout',
  }

  const bodyCheckIn = {
    id: `${TEST_ID_PREFIX}checkin-${now.getTime()}`,
    isTestData: true,
    date,
    bodyWeightKg: 75,
    waistCm: 82,
    bellyCm: null,
    chestCm: 100,
    shouldersCm: null,
    leftArmCm: null,
    rightArmCm: null,
    hipsCm: null,
    postureRating: 3,
    absVisibilityRating: 2,
    energyLevel: 4,
    sleepQuality: 4,
    notes: 'Production test check-in (safe to delete).',
    frontPhoto: null,
    sidePhoto: null,
    backPhoto: null,
    createdAt,
    syncStatus: 'local-only',
  }

  const nutritionLog = {
    id: `${TEST_ID_PREFIX}nutrition-${now.getTime()}`,
    isTestData: true,
    date,
    bodyWeightKg: 75,
    proteinGrams: 120,
    waterLiters: 2.5,
    caloriesEstimate: 2400,
    creatineTaken: true,
    creatineGrams: 5,
    wheyTaken: true,
    wheyScoops: 1,
    eggsCount: 3,
    seafoodMeal: false,
    oystersMeal: false,
    nutsServing: true,
    darkChocolate: false,
    fruits: 'Apple, banana',
    coffeeCups: 1,
    notes: 'Production test nutrition log (safe to delete).',
    createdAt,
    syncStatus: 'local-only',
  }

  safeSetJSON(WORKOUT_SESSIONS_KEY, [workoutSession, ...readArray(WORKOUT_SESSIONS_KEY)])
  safeSetJSON(BODY_CHECK_INS_KEY, [bodyCheckIn, ...readArray(BODY_CHECK_INS_KEY)])
  safeSetJSON(NUTRITION_LOGS_KEY, [nutritionLog, ...readArray(NUTRITION_LOGS_KEY)])

  return {
    created: true,
    message: 'Created 1 test workout, 1 test body check-in, and 1 test nutrition log.',
  }
}

/** Removes only records marked isTestData (or with a test- id). */
export function removeProductionTestData() {
  let removed = 0

  for (const key of [WORKOUT_SESSIONS_KEY, BODY_CHECK_INS_KEY, NUTRITION_LOGS_KEY]) {
    const records = readArray(key)
    const kept = records.filter((record) => !isTestRecord(record))
    removed += records.length - kept.length
    safeSetJSON(key, kept)
  }

  return {
    removed,
    message:
      removed === 0
        ? 'No production test data found.'
        : `Removed ${removed} test record${removed === 1 ? '' : 's'}.`,
  }
}

function isTestRecord(record) {
  if (!record || typeof record !== 'object') {
    return false
  }
  return (
    record.isTestData === true ||
    (typeof record.id === 'string' && record.id.startsWith(TEST_ID_PREFIX))
  )
}

function readArray(key) {
  const value = safeGetJSON(key, [])
  return Array.isArray(value) ? value : []
}
