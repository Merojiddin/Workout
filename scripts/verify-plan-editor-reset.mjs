import assert from 'node:assert/strict'
import { createServer } from 'vite'

class MemoryStorage {
  constructor() {
    this.values = new Map()
  }

  get length() {
    return this.values.size
  }

  key(index) {
    return [...this.values.keys()][index] ?? null
  }

  getItem(key) {
    const normalized = String(key)
    return this.values.has(normalized) ? this.values.get(normalized) : null
  }

  setItem(key, value) {
    this.values.set(String(key), String(value))
  }

  removeItem(key) {
    this.values.delete(String(key))
  }

  clear() {
    this.values.clear()
  }
}

const storage = new MemoryStorage()
globalThis.window = globalThis
globalThis.localStorage = storage
globalThis.sessionStorage = new MemoryStorage()

const historyRaw =
  '[ {"id":"history-sentinel","exerciseName":"Bench Press","sets":[]} ]\n'
storage.setItem('workoutSessions', historyRaw)

const server = await createServer({
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
})

try {
  const registry = await server.ssrLoadModule(
    '/src/data/workoutProgramRegistry.ts',
  )
  const activePrograms = await server.ssrLoadModule(
    '/src/utils/activeWorkoutProgram.ts',
  )
  const manager = await server.ssrLoadModule(
    '/src/utils/workoutProgramManager.ts',
  )
  const settings = await server.ssrLoadModule('/src/utils/settingsUtils.js')

  const version2 = registry.getWorkoutProgramByIdAndVersion(
    'upper-recomposition',
    '2.0.0',
  )
  const legacy = registry.getWorkoutProgramByIdAndVersion(
    'legacy-workout-v1',
    '1.0.0',
  )
  assert.ok(version2, 'Version 2 must be registered.')
  assert.ok(legacy, 'The legacy registry program must be available.')

  const registeredVersion2Before = JSON.stringify(version2)
  const expectedVersion2Plan = settings.normalizeCustomWorkoutPlan(
    version2.days,
  )
  const legacyOnlyIds = new Set(
    legacy.days
      .flatMap((day) => day.exercises.map((exercise) => exercise.id))
      .filter(
        (id) =>
          !version2.days.some((day) =>
            day.exercises.some((exercise) => exercise.id === id),
          ),
      ),
  )

  const install = manager.installWorkoutProgramLocally({
    id: version2.id,
    version: version2.version,
  })
  assert.equal(install.success, true, install.message)

  const baseline = activePrograms.resolveActiveWorkoutProgramBaseline()
  assert.equal(baseline.error, null)
  assert.equal(baseline.managed, true)
  assert.equal(baseline.program?.id, 'upper-recomposition')
  assert.equal(baseline.program?.version, '2.0.0')
  assert.deepEqual(
    baseline.program?.days.map((day) => day.day),
    [1, 2, 3, 4, 5, 6, 7],
  )
  assert.deepEqual(
    settings.normalizeCustomWorkoutPlan(baseline.program?.days),
    expectedVersion2Plan,
  )
  assert.equal(activePrograms.getTrainingDays(baseline.program).length, 6)
  assert.equal(activePrograms.getRestDays(baseline.program).length, 1)
  assert.equal(activePrograms.isRestDay(baseline.program.days[6]), true)

  const installedMetadataRaw = storage.getItem('installedWorkoutProgram')
  const targetDayNumber = 1
  const modifiedPlan = settings.getCustomWorkoutPlan().map((day) =>
    day.day === targetDayNumber
      ? {
          ...day,
          name: 'Modified Version 2 Day',
          focus: ['Legacy contamination probe'],
          exercises: [
            {
              ...legacy.days[0].exercises[0],
              formTips: [...legacy.days[0].exercises[0].formTips],
            },
            ...[...day.exercises].reverse().map((exercise) => ({
              ...exercise,
              formTips: [...exercise.formTips],
              restSeconds: exercise.restSeconds + 7,
            })),
          ],
        }
      : day,
  )
  assert.equal(settings.saveCustomWorkoutPlanSafely(modifiedPlan).success, true)

  const persistedModifiedPlan = settings.getCustomWorkoutPlan()
  const unrelatedDaysBeforeReset = persistedModifiedPlan
    .filter((day) => day.day !== targetDayNumber)
    .map((day) => structuredClone(day))
  const firstReset = activePrograms.resetWorkoutPlanDayToActiveProgram(
    persistedModifiedPlan,
    targetDayNumber,
  )
  assert.equal(firstReset.success, true, firstReset.message)
  assert.equal(settings.saveCustomWorkoutPlanSafely(firstReset.plan).success, true)

  const firstReload = settings.getCustomWorkoutPlan()
  assert.deepEqual(firstReload[targetDayNumber - 1], expectedVersion2Plan[0])
  assert.deepEqual(
    firstReload.filter((day) => day.day !== targetDayNumber),
    unrelatedDaysBeforeReset,
  )
  assert.deepEqual(
    firstReload
      .flatMap((day) => day.exercises.map((exercise) => exercise.id))
      .filter((id) => legacyOnlyIds.has(id)),
    [],
  )

  const secondEdit = firstReload.map((day) =>
    day.day === targetDayNumber
      ? {
          ...day,
          exercises: day.exercises.slice(1),
          name: 'Persisted second edit',
        }
      : day,
  )
  assert.equal(settings.saveCustomWorkoutPlanSafely(secondEdit).success, true)
  const secondReloadBeforeReset = settings.getCustomWorkoutPlan()
  const unrelatedDaysBeforeSecondReset = secondReloadBeforeReset
    .filter((day) => day.day !== targetDayNumber)
    .map((day) => structuredClone(day))
  const secondReset = activePrograms.resetWorkoutPlanDayToActiveProgram(
    secondReloadBeforeReset,
    targetDayNumber,
  )
  assert.equal(secondReset.success, true, secondReset.message)
  assert.equal(settings.saveCustomWorkoutPlanSafely(secondReset.plan).success, true)

  const secondReload = settings.getCustomWorkoutPlan()
  assert.deepEqual(secondReload[targetDayNumber - 1], expectedVersion2Plan[0])
  assert.deepEqual(
    secondReload.filter((day) => day.day !== targetDayNumber),
    unrelatedDaysBeforeSecondReset,
  )

  const activeAfterReload = activePrograms.getActiveWorkoutProgram()
  assert.deepEqual(
    {
      id: activeAfterReload.programId,
      installed: activeAfterReload.installed,
      source: activeAfterReload.source,
      version: activeAfterReload.programVersion,
    },
    {
      id: 'upper-recomposition',
      installed: true,
      source: 'registry',
      version: '2.0.0',
    },
  )
  assert.equal(storage.getItem('installedWorkoutProgram'), installedMetadataRaw)
  assert.equal(storage.getItem('workoutSessions'), historyRaw)

  const invalidDay = activePrograms.resetWorkoutPlanDayToActiveProgram(
    secondReload,
    8,
  )
  assert.equal(invalidDay.success, false)
  assert.equal(invalidDay.code, 'program-day-unavailable')
  assert.strictEqual(invalidDay.plan, secondReload)

  storage.setItem(
    'installedWorkoutProgram',
    JSON.stringify({
      id: 'missing-managed-program',
      version: '9.9.9',
      installedAt: '2026-08-07T00:00:00.000Z',
    }),
  )
  const missingProgramPlanBefore = storage.getItem('customWorkoutPlan')
  const unavailableProgram = activePrograms.resetWorkoutPlanDayToActiveProgram(
    secondReload,
    targetDayNumber,
  )
  assert.equal(unavailableProgram.success, false)
  assert.equal(unavailableProgram.code, 'baseline-unavailable')
  assert.strictEqual(unavailableProgram.plan, secondReload)
  assert.equal(storage.getItem('customWorkoutPlan'), missingProgramPlanBefore)
  storage.setItem('installedWorkoutProgram', installedMetadataRaw)

  const cloneProbe = activePrograms.resetWorkoutPlanDayToActiveProgram(
    secondReload,
    targetDayNumber,
  )
  assert.equal(cloneProbe.success, true)
  cloneProbe.plan[0].name = 'Mutation probe'
  cloneProbe.plan[0].exercises[0].formTips.push('Mutation probe')

  const registeredVersion2After = registry.getWorkoutProgramByIdAndVersion(
    'upper-recomposition',
    '2.0.0',
  )
  assert.equal(JSON.stringify(registeredVersion2After), registeredVersion2Before)
  assert.equal(storage.getItem('workoutSessions'), historyRaw)

  console.log(
    JSON.stringify(
      {
        activeProgram: 'upper-recomposition@2.0.0',
        daysResolved: 7,
        historyUnchanged: true,
        legacyOnlyExercisesAfterReset: 0,
        registeredProgramMutated: false,
        restDays: 1,
        status: 'passed',
        trainingDays: 6,
      },
      null,
      2,
    ),
  )
} finally {
  await server.close()
}
