import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'

class MemoryStorage {
  values = new Map()
  failNextKey = null

  get length() { return this.values.size }
  key(index) { return [...this.values.keys()][index] ?? null }
  getItem(key) { return this.values.get(String(key)) ?? null }
  setItem(key, value) {
    if (String(key) === this.failNextKey) {
      this.failNextKey = null
      throw new Error('Verification storage failure')
    }
    this.values.set(String(key), String(value))
  }
  removeItem(key) { this.values.delete(String(key)) }
  clear() { this.values.clear() }
}

process.env.VITE_SUPABASE_URL ??= 'https://verification.supabase.co'
process.env.VITE_SUPABASE_ANON_KEY ??= 'verification-anon-key'
const storage = new MemoryStorage()
globalThis.window = globalThis
globalThis.localStorage = storage
globalThis.sessionStorage = new MemoryStorage()
const events = new EventTarget()
for (const method of ['addEventListener', 'removeEventListener', 'dispatchEvent']) {
  Object.defineProperty(globalThis, method, {
    configurable: true,
    value: (...args) => events[method](...args),
  })
}
Object.defineProperty(globalThis, 'navigator', {
  configurable: true,
  value: { onLine: true },
})

const server = await createServer({
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
})

try {
  const registry = await server.ssrLoadModule('/src/data/workoutProgramRegistry.ts')
  const library = await server.ssrLoadModule('/src/utils/workoutProgramLibrary.ts')
  const userPrograms = await server.ssrLoadModule('/src/utils/userWorkoutPrograms.ts')
  const settings = await server.ssrLoadModule('/src/utils/settingsUtils.js')
  const manager = await server.ssrLoadModule('/src/utils/workoutProgramManager.ts')
  const active = await server.ssrLoadModule('/src/utils/activeWorkoutProgram.ts')
  const live = await server.ssrLoadModule('/src/utils/liveWorkoutUtils.ts')
  const persistence = await server.ssrLoadModule('/src/utils/storageUtils.js')
  const reference = JSON.parse(await readFile(new URL(
    '../public/programs/research-recomp-boxing-v2.1.json', import.meta.url,
  ), 'utf8'))

  const identity = (program) => program && `${program.id}@${program.version}`
  const available = (location) => library.getProgramsForLocation(location).map(identity).sort()
  const snapshot = () => new Map(storage.values)
  const assertSnapshot = (actual, expected, excluded = []) => {
    const keys = new Set([...actual.keys(), ...expected.keys()])
    for (const key of keys) {
      if (!excluded.includes(key)) {
        assert.equal(actual.get(key) === expected.get(key), true, `Storage changed unexpectedly: ${key}`)
      }
    }
  }
  const makeProgram = (id, trainingLocations) => {
    const source = { ...structuredClone(reference), id, name: id, version: '1.0.0' }
    if (trainingLocations !== undefined) source.trainingLocations = trainingLocations
    else delete source.trainingLocations
    const parsed = userPrograms.parseWorkoutProgramInput(JSON.stringify(source))
    assert.equal(parsed.success, true, parsed.errors.join(' '))
    assert.ok(parsed.program)
    return parsed.program
  }
  const upload = (program) => {
    const result = userPrograms.saveUserWorkoutProgram(program)
    assert.equal(result.success, true, result.message)
    assert.ok(result.program, 'Saving must return the identity actually added to the catalog.')
    return result.program
  }
  const choose = async (program, location) => {
    const result = await library.selectWorkoutProgram(program, location, null)
    assert.equal(result.success, true, result.message)
    assert.equal(active.getActiveWorkoutProgram().programId, program.id)
    assert.equal(active.getActiveWorkoutProgram().programVersion, program.version)
    assert.equal(settings.getWorkoutDisplaySettings().trainingLocation, location)
    assert.equal(identity(library.getPreferredWorkoutProgram(location)), identity(program))
    return result
  }

  assert.deepEqual(available('home'), [])
  assert.deepEqual(available('gym'), [])
  assert.equal(library.getPreferredWorkoutProgram('home'), null)
  assert.equal(library.getPreferredWorkoutProgram('gym'), null)

  // Importing is additive, including when a user imports an edited JSON file
  // with the same id and version. The original definition and active plan stay.
  const homeA = upload(makeProgram('home-strength', ['home']))
  const homeB = upload(makeProgram('home-mobility', ['home']))
  const gymA = upload(makeProgram('gym-strength', ['gym']))
  const gymB = upload(makeProgram('gym-hypertrophy', ['gym']))
  const legacy = upload(makeProgram('legacy-untagged'))
  assert.equal(active.hasActiveWorkoutProgram(), false, 'Uploads must not activate a plan.')
  const originalHomeRaw = JSON.stringify(registry.getWorkoutProgramByIdAndVersion(homeA.id, homeA.version))
  const duplicateSource = structuredClone(homeA)
  duplicateSource.name = 'Another home strength plan'
  duplicateSource.days[0].name = 'Different duplicate-import day'
  const duplicate = upload(duplicateSource)
  assert.notEqual(identity(duplicate), identity(homeA))
  assert.equal(duplicate.days[0].name, 'Different duplicate-import day')
  assert.equal(JSON.stringify(registry.getWorkoutProgramByIdAndVersion(homeA.id, homeA.version)), originalHomeRaw)
  assert.equal(userPrograms.getUserWorkoutPrograms().length, 6)
  assert.deepEqual(available('home'), [homeA, homeB, duplicate, legacy].map(identity).sort())
  assert.deepEqual(available('gym'), [gymA, gymB, legacy].map(identity).sort())

  // The first switch upgrades an existing installation. Preserve the exact
  // user's edited days and program start date, not just the uploaded baseline.
  const initialInstall = manager.installWorkoutProgramLocally(legacy)
  assert.equal(initialInstall.success, true, initialInstall.message)
  const legacyStart = '2026-07-01T08:00:00.000Z'
  assert.equal(manager.setInstalledWorkoutProgram({ ...legacy, installedAt: legacyStart }).success, true)
  const legacyDays = settings.getCustomWorkoutPlan()
  legacyDays[0].name = 'Legacy personal day edit'
  legacyDays[0].exercises[0].restSeconds += 23
  assert.equal(settings.saveCustomWorkoutPlanSafely(legacyDays).success, true)
  const historyRaw = '[ {"id":"history-sentinel","completed":true,"exercises":[]} ]\n'
  storage.setItem('workoutSessions', historyRaw)
  await choose(gymA, 'gym')
  assert.deepEqual(settings.getCustomWorkoutPlan(), settings.normalizeCustomWorkoutPlan(gymA.days))
  await choose(legacy, 'home')
  assert.deepEqual(settings.getCustomWorkoutPlan(), legacyDays)
  assert.equal(manager.getInstalledWorkoutProgram().data.installedAt, legacyStart)

  await choose(homeA, 'home')
  const homeStart = '2026-08-03T09:30:00.000Z'
  assert.equal(manager.setInstalledWorkoutProgram({ ...homeA, installedAt: homeStart }).success, true)
  const editedHome = settings.getCustomWorkoutPlan()
  editedHome[0].name = 'My edited home workout'
  editedHome[0].exercises = editedHome[0].exercises.slice(1)
  assert.equal(settings.saveCustomWorkoutPlanSafely(editedHome).success, true)
  const activeBeforeUpload = storage.getItem('installedWorkoutProgram')
  const daysBeforeUpload = storage.getItem('customWorkoutPlan')
  const extraHome = upload(makeProgram('home-weekend', ['home']))
  assert.equal(storage.getItem('installedWorkoutProgram'), activeBeforeUpload)
  assert.equal(storage.getItem('customWorkoutPlan'), daysBeforeUpload)
  assert.ok(available('home').includes(identity(extraHome)))
  assert.equal(identity(library.getPreferredWorkoutProgram('home')), identity(homeA))

  await choose(homeB, 'home')
  await choose(gymB, 'gym')
  const gymStart = manager.getInstalledWorkoutProgram().data.installedAt
  const editedGym = settings.getCustomWorkoutPlan()
  editedGym[1].name = 'My edited gym workout'
  editedGym[1].exercises[0].sets += 1
  assert.equal(settings.saveCustomWorkoutPlanSafely(editedGym).success, true)
  assert.equal(identity(library.getPreferredWorkoutProgram('home')), identity(homeB))
  assert.equal(identity(library.getPreferredWorkoutProgram('gym')), identity(gymB))
  await choose(homeA, 'home')
  assert.deepEqual(settings.getCustomWorkoutPlan(), editedHome)
  assert.equal(manager.getInstalledWorkoutProgram().data.installedAt, homeStart)
  assert.equal(identity(library.getPreferredWorkoutProgram('gym')), identity(gymB))
  await choose(library.getPreferredWorkoutProgram('gym'), 'gym')
  assert.deepEqual(settings.getCustomWorkoutPlan(), editedGym)
  assert.equal(manager.getInstalledWorkoutProgram().data.installedAt, gymStart)
  assert.equal(storage.getItem('workoutSessions'), historyRaw)

  const beforeWrongLocation = snapshot()
  const wrongLocation = await library.selectWorkoutProgram(homeA, 'gym', null)
  assert.equal(wrongLocation.success, false, 'A Home-only plan cannot be selected for Gym.')
  assertSnapshot(snapshot(), beforeWrongLocation)
  const missing = await library.selectWorkoutProgram({ id: 'missing', version: '1.0.0' }, 'home', null)
  assert.equal(missing.success, false)
  assertSnapshot(snapshot(), beforeWrongLocation)

  // A started session is an independent snapshot; switching must not strand
  // or rewrite it, its sets, the active plan, or the remembered selections.
  const session = live.createActiveWorkoutSession(editedGym[0], {
    programId: gymB.id, programVersion: gymB.version, programWeek: 2,
  })
  session.exercises[0].sets[0].reps = 9
  live.saveActiveWorkoutSession(session)
  const beforeBlockedSwitch = snapshot()
  const blocked = await library.selectWorkoutProgram(homeA, 'home', null)
  assert.equal(blocked.success, false, 'A live session must block switching programs.')
  assertSnapshot(snapshot(), beforeBlockedSwitch)
  live.clearActiveWorkoutSession()

  // One failed local mirror write must not leave half a plan selected.
  const beforeStorageFailure = snapshot()
  storage.failNextKey = 'installedWorkoutProgram'
  const storageFailure = await library.selectWorkoutProgram(homeA, 'home', null)
  assert.equal(storageFailure.success, false)
  assert.equal(storage.failNextKey, null, 'The failure must exercise an actual metadata write.')
  assertSnapshot(snapshot(), beforeStorageFailure, ['workoutPlanBackups'])
  assert.ok(manager.getWorkoutPlanBackups().data.some((backup) =>
    JSON.stringify(backup.plan) === JSON.stringify(editedGym)),
  'Failed changes may keep a safety backup of the outgoing plan.')
  await choose(homeA, 'home')

  // All library state rides the same account namespace as programs/history.
  // A second account can even use the same program id without sharing edits.
  const anonymousBefore = snapshot()
  persistence.setStorageNamespace('library-user-a')
  assert.deepEqual(available('home'), [])
  assert.equal(library.getPreferredWorkoutProgram('gym'), null)
  const accountAPlan = upload(makeProgram('shared-id', ['home']))
  await choose(accountAPlan, 'home')
  const accountADays = settings.getCustomWorkoutPlan()
  accountADays[0].name = 'Account A private edit'
  assert.equal(settings.saveCustomWorkoutPlanSafely(accountADays).success, true)
  persistence.safeSetJSON('workoutSessions', [{ id: 'account-a-history' }])
  const accountASnapshot = new Map([...storage.values].filter(([key]) => key.startsWith('u:library-user-a:')))
  persistence.setStorageNamespace('library-user-b')
  assert.deepEqual(available('home'), [])
  assert.deepEqual(available('gym'), [])
  assert.equal(active.hasActiveWorkoutProgram(), false)
  assert.equal(library.getPreferredWorkoutProgram('home'), null)
  const accountBPlan = upload(makeProgram('shared-id', ['gym']))
  await choose(accountBPlan, 'gym')
  assert.equal(settings.getCustomWorkoutPlan()[0].name, accountBPlan.days[0].name)
  assert.deepEqual(persistence.safeGetJSON('workoutSessions', []), [])
  persistence.setStorageNamespace('library-user-a')
  assert.deepEqual(available('home'), [identity(accountAPlan)])
  assert.deepEqual(available('gym'), [])
  assert.deepEqual(settings.getCustomWorkoutPlan(), accountADays)
  assert.deepEqual(persistence.safeGetJSON('workoutSessions', []), [{ id: 'account-a-history' }])
  assertSnapshot(new Map([...storage.values].filter(([key]) => key.startsWith('u:library-user-a:'))), accountASnapshot)
  persistence.setStorageNamespace(null)
  assertSnapshot(new Map([...storage.values].filter(([key]) => !key.startsWith('u:'))), anonymousBefore)

  // Older accounts may only have editable days and no installed identity.
  // Their previous plan must become a selectable entry on the first switch.
  persistence.setStorageNamespace('legacy-custom-account')
  const legacyCustomTarget = upload(makeProgram('new-gym-plan', ['gym']))
  const anonymousDays = settings.normalizeCustomWorkoutPlan(reference.days)
  anonymousDays[0].name = 'Older custom plan with no program metadata'
  assert.equal(settings.saveCustomWorkoutPlanSafely(anonymousDays).success, true)
  await choose(legacyCustomTarget, 'gym')
  const recoveredCustom = library.getProgramsForLocation('home').find((program) =>
    program.days[0].name === anonymousDays[0].name)
  assert.ok(recoveredCustom, 'An older custom-only plan needs a recoverable library entry.')
  await choose(recoveredCustom, 'home')
  assert.deepEqual(settings.getCustomWorkoutPlan(), anonymousDays)

  // Exercise the cloud transaction using deterministic documents, with no
  // real network or account data. Switching must round-trip edited snapshots
  // and dates through the same settings document hydrated on other devices.
  persistence.setStorageNamespace('library-cloud-user')
  const cloudHome = upload(makeProgram('cloud-home', ['home']))
  const cloudGym = upload(makeProgram('cloud-gym', ['gym']))
  await choose(cloudHome, 'home')
  const cloudHomeStart = '2026-07-12T10:00:00.000Z'
  assert.equal(manager.setInstalledWorkoutProgram({ ...cloudHome, installedAt: cloudHomeStart }).success, true)
  const cloudHomeDays = settings.getCustomWorkoutPlan()
  cloudHomeDays[0].name = 'Cloud home personal edit'
  assert.equal(settings.saveCustomWorkoutPlanSafely(cloudHomeDays).success, true)
  persistence.safeSetJSON('workoutSessions', [{ id: 'cloud-history-sentinel' }])
  let cloudPlan = structuredClone(cloudHomeDays)
  let cloudSettings = {
    ...settings.getUserProfileSettings(),
    unrelatedPreference: { retained: true },
    workoutProgramManager: {
      installedProgram: manager.getInstalledWorkoutProgram().data,
      dismissedPrograms: [],
      backups: [],
      unrelatedManagerPreference: 'retained',
    },
  }
  let failFinalSettings = false
  const cloudStore = {
    async fetchPlan() { return { exists: cloudPlan !== null, value: structuredClone(cloudPlan) } },
    async fetchSettings() { return { exists: cloudSettings !== null, value: structuredClone(cloudSettings) } },
    async writePlan(_user, value) {
      cloudPlan = structuredClone(value)
      return { exists: true, value: structuredClone(cloudPlan) }
    },
    async writeSettings(_user, value) {
      if (failFinalSettings && value.workoutProgramManager?.installedProgram?.id === cloudGym.id) {
        failFinalSettings = false
        throw new Error('Verification cloud settings failure')
      }
      cloudSettings = structuredClone(value)
      return { exists: true, value: structuredClone(cloudSettings) }
    },
    async deletePlan() { cloudPlan = null; return { exists: false, value: null } },
    async deleteSettings() { cloudSettings = null; return { exists: false, value: null } },
  }
  const cloudService = await server.ssrLoadModule('/src/services/workoutProgramService.ts')
  let cloudOperation = 0
  const cloudSelect = (program, location) => cloudService.installWorkoutProgramInCloud(
    program,
    { id: 'library-cloud-user' },
    {
      store: cloudStore,
      selectionLocation: location,
      now: () => '2026-09-22T10:00:00.000Z',
      createId: () => `library-cloud-backup-${++cloudOperation}`,
    },
  )
  const firstCloudSwitch = await cloudSelect(cloudGym, 'gym')
  assert.equal(firstCloudSwitch.success, true, `${firstCloudSwitch.message} ${firstCloudSwitch.details.join(' ')}`)
  assert.deepEqual(cloudPlan, settings.normalizeCustomWorkoutPlan(cloudGym.days))
  assert.equal(cloudSettings.workoutDisplay.trainingLocation, 'gym')
  assert.equal(identity(cloudSettings.workoutProgramLibrary.selections.home), identity(cloudHome))
  assert.equal(identity(cloudSettings.workoutProgramLibrary.selections.gym), identity(cloudGym))
  const savedCloudHome = cloudSettings.workoutProgramLibrary.plans.find((program) => program.id === cloudHome.id)
  assert.deepEqual(savedCloudHome.days, cloudHomeDays)
  assert.equal(savedCloudHome.installedAt, cloudHomeStart)
  assert.deepEqual(library.getWorkoutProgramLibrary(), library.getWorkoutProgramLibrary(cloudSettings))
  const cloudGymStart = manager.getInstalledWorkoutProgram().data.installedAt
  const cloudGymDays = settings.getCustomWorkoutPlan()
  cloudGymDays[1].name = 'Cloud gym personal edit'
  assert.equal(settings.saveCustomWorkoutPlanSafely(cloudGymDays).success, true)
  cloudPlan = structuredClone(cloudGymDays)
  const homeCloudSwitch = await cloudSelect(cloudHome, 'home')
  assert.equal(homeCloudSwitch.success, true, homeCloudSwitch.message)
  assert.deepEqual(cloudPlan, cloudHomeDays)
  assert.deepEqual(settings.getCustomWorkoutPlan(), cloudHomeDays)
  assert.equal(manager.getInstalledWorkoutProgram().data.installedAt, cloudHomeStart)
  assert.deepEqual(cloudSettings.unrelatedPreference, { retained: true })
  assert.equal(cloudSettings.workoutProgramManager.unrelatedManagerPreference, 'retained')

  const libraryBeforeCloudFailure = structuredClone(cloudSettings.workoutProgramLibrary)
  const cloudMetadataBeforeFailure = structuredClone(cloudSettings.workoutProgramManager.installedProgram)
  failFinalSettings = true
  const failedCloudSwitch = await cloudSelect(cloudGym, 'gym')
  assert.equal(failedCloudSwitch.success, false)
  assert.equal(failFinalSettings, false, 'The failure must occur after the cloud plan was written.')
  assert.equal(failedCloudSwitch.data.rollback.success, true)
  assert.deepEqual(cloudPlan, cloudHomeDays)
  assert.deepEqual(cloudSettings.workoutProgramLibrary, libraryBeforeCloudFailure)
  assert.deepEqual(cloudSettings.workoutProgramManager.installedProgram, cloudMetadataBeforeFailure)
  assert.deepEqual(settings.getCustomWorkoutPlan(), cloudHomeDays)
  assert.deepEqual(library.getWorkoutProgramLibrary(), library.getWorkoutProgramLibrary(cloudSettings))
  const finalCloudSwitch = await cloudSelect(cloudGym, 'gym')
  assert.equal(finalCloudSwitch.success, true, finalCloudSwitch.message)
  assert.deepEqual(cloudPlan, cloudGymDays)
  assert.deepEqual(settings.getCustomWorkoutPlan(), cloudGymDays)
  assert.equal(manager.getInstalledWorkoutProgram().data.installedAt, cloudGymStart)
  assert.deepEqual(persistence.safeGetJSON('workoutSessions', []), [{ id: 'cloud-history-sentinel' }])
  persistence.setStorageNamespace(null)

  // A reload must recover per-location choices and per-program edited days.
  server.moduleGraph.invalidateAll()
  const reloadedLibrary = await server.ssrLoadModule('/src/utils/workoutProgramLibrary.ts')
  const reloadedSettings = await server.ssrLoadModule('/src/utils/settingsUtils.js')
  const reloadedManager = await server.ssrLoadModule('/src/utils/workoutProgramManager.ts')
  assert.equal(identity(reloadedLibrary.getPreferredWorkoutProgram('home')), identity(homeA))
  assert.equal(identity(reloadedLibrary.getPreferredWorkoutProgram('gym')), identity(gymB))
  assert.deepEqual(reloadedSettings.getCustomWorkoutPlan(), editedHome)
  const afterReloadSwitch = await reloadedLibrary.selectWorkoutProgram(gymB, 'gym', null)
  assert.equal(afterReloadSwitch.success, true, afterReloadSwitch.message)
  assert.deepEqual(reloadedSettings.getCustomWorkoutPlan(), editedGym)
  assert.equal(reloadedManager.getInstalledWorkoutProgram().data.installedAt, gymStart)
  assert.equal(storage.getItem('workoutSessions'), historyRaw)

  console.log(JSON.stringify({
    status: 'passed',
    additiveImports: 7,
    duplicateDefinitionsPreserved: true,
    legacyPlanMigrated: true,
    locationSelectionsRemembered: true,
    programEditsAndDatesPreserved: true,
    activeSessionProtected: true,
    failedWriteRolledBack: true,
    accountsIsolated: true,
    customOnlyPlanRecovered: true,
    cloudSelectionsAndRollbackVerified: true,
    historyUnchanged: true,
    reloadVerified: true,
  }, null, 2))
} finally {
  await server.close()
}
