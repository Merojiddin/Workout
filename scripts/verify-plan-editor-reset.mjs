import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
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

const PROBE_PROGRAM_ID = 'plan-editor-reset-probe'
const PROBE_PROGRAM_VERSION = '1.0.0'

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
  const userPrograms = await server.ssrLoadModule(
    '/src/utils/userWorkoutPrograms.ts',
  )

  // No program ships with the app, so nothing can leak into a reset day from a
  // bundled fallback. The reference program is read straight off disk, exactly
  // as a user would upload it, and never enters the registry under its own id.
  assert.deepEqual(
    registry.getWorkoutPrograms(),
    [],
    'No program may be bundled with the app.',
  )
  const referenceProgram = JSON.parse(
    await readFile(
      new URL(
        '../public/programs/research-recomp-boxing-v2.1.json',
        import.meta.url,
      ),
      'utf8',
    ),
  )

  // An uploaded program is the only kind there is, so the probe uploads one
  // built from the reference with a single exercise removed. That missing
  // exercise is what a contaminated reset would reintroduce.
  const probeExerciseId = referenceProgram.days
    .flatMap((day) => day.exercises.map((exercise) => exercise.id))
    .find(
      (id, _index, ids) => ids.filter((other) => other === id).length === 1,
    )
  assert.ok(probeExerciseId, 'The reference program needs a unique exercise id.')

  const pastedSource = {
    ...referenceProgram,
    id: PROBE_PROGRAM_ID,
    version: PROBE_PROGRAM_VERSION,
    name: 'Plan Editor Reset Probe',
    days: referenceProgram.days.map((day) => ({
      ...day,
      exercises: day.exercises.filter(
        (exercise) => exercise.id !== probeExerciseId,
      ),
    })),
  }
  const parsed = userPrograms.parseWorkoutProgramInput(
    JSON.stringify(pastedSource),
  )
  assert.equal(parsed.success, true, parsed.errors.join(' '))
  assert.equal(
    userPrograms.saveUserWorkoutProgram(parsed.program).success,
    true,
  )

  const probeProgram = registry.getWorkoutProgramByIdAndVersion(
    PROBE_PROGRAM_ID,
    PROBE_PROGRAM_VERSION,
  )
  assert.ok(probeProgram, 'The pasted program must be registered.')

  const registeredProbeBefore = JSON.stringify(probeProgram)
  const expectedProbePlan = settings.normalizeCustomWorkoutPlan(
    probeProgram.days,
  )
  const referenceOnlyIds = new Set(
    referenceProgram.days
      .flatMap((day) => day.exercises.map((exercise) => exercise.id))
      .filter(
        (id) =>
          !probeProgram.days.some((day) =>
            day.exercises.some((exercise) => exercise.id === id),
          ),
      ),
  )
  assert.ok(
    referenceOnlyIds.size > 0,
    'The probe needs at least one exercise unique to the reference program.',
  )

  const install = manager.installWorkoutProgramLocally({
    id: probeProgram.id,
    version: probeProgram.version,
  })
  assert.equal(install.success, true, install.message)

  const baseline = activePrograms.resolveActiveWorkoutProgramBaseline()
  assert.equal(baseline.error, null)
  assert.equal(baseline.managed, true)
  assert.equal(baseline.program?.id, PROBE_PROGRAM_ID)
  assert.equal(baseline.program?.version, PROBE_PROGRAM_VERSION)
  assert.deepEqual(
    baseline.program?.days.map((day) => day.day),
    [1, 2, 3, 4, 5, 6, 7],
  )
  assert.deepEqual(
    settings.normalizeCustomWorkoutPlan(baseline.program?.days),
    expectedProbePlan,
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
          name: 'Modified probe program day',
          focus: ['Default program contamination probe'],
          exercises: [
            {
              ...referenceProgram.days[0].exercises[0],
              formTips: [...referenceProgram.days[0].exercises[0].formTips],
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
  assert.deepEqual(firstReload[targetDayNumber - 1], expectedProbePlan[0])
  assert.deepEqual(
    firstReload.filter((day) => day.day !== targetDayNumber),
    unrelatedDaysBeforeReset,
  )
  assert.deepEqual(
    firstReload
      .flatMap((day) => day.exercises.map((exercise) => exercise.id))
      .filter((id) => referenceOnlyIds.has(id)),
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
  assert.deepEqual(secondReload[targetDayNumber - 1], expectedProbePlan[0])
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
      id: PROBE_PROGRAM_ID,
      installed: true,
      source: 'registry',
      version: PROBE_PROGRAM_VERSION,
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

  const registeredProbeAfter = registry.getWorkoutProgramByIdAndVersion(
    PROBE_PROGRAM_ID,
    PROBE_PROGRAM_VERSION,
  )
  assert.equal(JSON.stringify(registeredProbeAfter), registeredProbeBefore)
  assert.equal(storage.getItem('workoutSessions'), historyRaw)

  console.log(
    JSON.stringify(
      {
        activeProgram: `${PROBE_PROGRAM_ID}@${PROBE_PROGRAM_VERSION}`,
        daysResolved: 7,
        historyUnchanged: true,
        defaultOnlyExercisesAfterReset: 0,
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
