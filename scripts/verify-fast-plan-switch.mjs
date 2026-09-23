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
}

function deferred() {
  let resolve
  const promise = new Promise((complete) => { resolve = complete })
  return { promise, resolve }
}

// The timeout only detects deadlocks. Performance is tested causally: selecting
// must finish while every cloud request is held behind an unreleased gate.
async function finishesWhileBlocked(promise, label) {
  let timer
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} waited for blocked network`)), 5000)
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}

process.env.VITE_SUPABASE_URL = 'https://verification.supabase.co'
process.env.VITE_SUPABASE_ANON_KEY = 'verification-anon-key'
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
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { onLine: true } })
globalThis.fetch = async () => { throw new Error('Unexpected real network request in verification') }

// Exercise the real services through a deterministic Supabase query boundary.
// Rows are partitioned by user so cross-account upload mistakes remain visible.
const cloud = new Map()
const requests = []
let intercept = async () => {}
const rowKey = (userId, table) => `${userId}:${table}`
const row = (userId, table) => cloud.get(rowKey(userId, table)) ?? null
const seed = (userId, table, value) => cloud.set(rowKey(userId, table), structuredClone(value))
function mockFrom(table) {
  let operation = 'select'
  let value
  let single = false
  const filters = {}
  const query = {
    select() { return query },
    upsert(next) { operation = 'upsert'; value = structuredClone(next); return query },
    delete() { operation = 'delete'; return query },
    eq(key, next) { filters[key] = next; return query },
    order() { return query },
    maybeSingle() { single = true; return query },
    single() { single = true; return query },
    async then(resolve, reject) {
      try {
        const userId = value?.user_id ?? filters.user_id
        assert.ok(userId, `Every ${table} request must identify its account`)
        const request = { table, operation, userId, value: structuredClone(value) }
        requests.push(request)
        const previous = structuredClone(row(userId, table))
        await intercept(request)
        if (operation === 'upsert') seed(userId, table, value)
        if (operation === 'delete') cloud.delete(rowKey(userId, table))
        const data = operation === 'select'
          ? single ? previous : previous ? [previous] : []
          : value ?? null
        resolve({ data, error: null })
      } catch (error) {
        reject(error)
      }
    },
  }
  return query
}

const server = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } })
try {
  async function loadModules() {
    const modules = {}
    for (const [name, path] of Object.entries({
      library: '/src/utils/workoutProgramLibrary.ts',
      programs: '/src/utils/userWorkoutPrograms.ts',
      settings: '/src/utils/settingsUtils.js',
      manager: '/src/utils/workoutProgramManager.ts',
      active: '/src/utils/activeWorkoutProgram.ts',
      persistence: '/src/utils/storageUtils.js',
      queue: '/src/utils/offlineSyncQueue.js',
      sync: '/src/services/syncService.js',
      services: '/src/services/serviceUtils.js',
    })) modules[name] = await server.ssrLoadModule(path)
    assert.ok(modules.services.supabase, 'Verification must exercise signed-in cloud mode')
    modules.services.supabase.from = mockFrom
    return modules
  }
  let app = await loadModules()
  const reference = JSON.parse(await readFile(new URL('../public/programs/research-recomp-boxing-v2.1.json', import.meta.url), 'utf8'))
  const user = { id: 'fast-switch-user' }
  app.persistence.setStorageNamespace(user.id)
  const upload = (id, location) => {
    const parsed = app.programs.parseWorkoutProgramInput(JSON.stringify({
      ...structuredClone(reference), id, name: id, version: '1.0.0', trainingLocations: [location],
    }))
    assert.equal(parsed.success, true, parsed.errors.join(' '))
    const saved = app.programs.saveUserWorkoutProgram(parsed.program)
    assert.equal(saved.success, true, saved.message)
    return saved.program
  }
  const home = upload('fast-home', 'home')
  const gym = upload('fast-gym', 'gym')
  const history = [{ id: 'keep-completed-workout', completed: true }]
  app.persistence.safeSetJSON('workoutSessions', history)
  const switchDurations = []
  const select = async (program, location, account = user) => {
    const startedAt = performance.now()
    const result = await finishesWhileBlocked(app.library.selectWorkoutProgram(program, location, account), 'Plan selection')
    switchDurations.push(performance.now() - startedAt)
    assert.equal(result.success, true, result.message)
    assert.equal(app.active.getActiveWorkoutProgram().programId, program.id)
    assert.equal(app.settings.getWorkoutDisplaySettings().trainingLocation, location)
    return result
  }
  const selections = () => app.queue.getSyncQueue().filter((item) => item.type === 'workoutProgramSelection')
  const selectedPayload = () => selections().at(-1)?.payload.value
  const accountSnapshot = (userId) => new Map([...storage.values].filter(([key]) => key.startsWith(`u:${userId}:`)))
  const assertSelectedCloud = (account, program) => {
    assert.equal(row(account.id, 'user_settings')?.settings.workoutProgramManager.installedProgram.id, program.id)
    assert.deepEqual(row(account.id, 'custom_workout_plans')?.plan, app.settings.getCustomWorkoutPlan())
    assert.ok(row(account.id, 'user_workout_programs')?.programs.some((candidate) => candidate.id === program.id))
  }

  navigator.onLine = false
  await select(home, 'home')
  assert.equal(requests.length, 0, 'Offline selection must not call the cloud')
  assert.equal(selections().length, 1)
  assert.equal(selectedPayload().installedProgram.id, home.id)
  const originalStart = app.manager.getInstalledWorkoutProgram().data.installedAt
  const editedHome = app.settings.getCustomWorkoutPlan()
  editedHome[0].name = 'My preserved home edit'
  assert.equal(app.settings.saveCustomWorkoutPlanSafely(editedHome).success, true)

  // Even with an online browser, selection is independent of cloud latency.
  navigator.onLine = true
  const allNetwork = deferred()
  intercept = () => allNetwork.promise
  try {
    await select(gym, 'gym')
    const gymRevision = selections()[0].id
    await select(home, 'home')
    assert.equal(selections().length, 1, 'Rapid choices should replace the pending bundle')
    assert.notEqual(selections()[0].id, gymRevision, 'Replacement must have its own queue revision')
    assert.equal(selectedPayload().installedProgram.id, home.id)
    assert.deepEqual(app.settings.getCustomWorkoutPlan(), editedHome)
    assert.equal(app.manager.getInstalledWorkoutProgram().data.installedAt, originalStart)
    assert.equal(requests.length, 0, 'Selecting should only commit local state and durable sync work')
  } finally {
    allNetwork.resolve()
    intercept = async () => {}
  }

  // A durable queue failure must roll the whole selection back, including
  // metadata and catalog, rather than report a choice that will be lost.
  const beforeFailure = accountSnapshot(user.id)
  storage.failNextKey = `u:${user.id}:pendingSyncQueue`
  const failedSelection = await app.library.selectWorkoutProgram(gym, 'gym', user)
  assert.equal(failedSelection.success, false)
  assert.equal(storage.failNextKey, null, 'Queue storage failure must be exercised')
  for (const [key, value] of beforeFailure) {
    if (!key.endsWith(':workoutPlanBackups')) assert.equal(storage.getItem(key), value, `Rollback changed ${key}`)
  }
  assert.equal(app.active.getActiveWorkoutProgram().programId, home.id)

  // Reload with old cloud documents must retain the durable local selection.
  const staleSettings = {
    ...app.settings.getUserProfileSettings(),
    workoutProgramManager: { installedProgram: { id: gym.id, version: gym.version, installedAt: originalStart }, dismissedPrograms: [], backups: [] },
    workoutProgramLibrary: { version: 1, selections: { gym: { id: gym.id, version: gym.version } }, plans: [] },
    workoutDisplay: { trainingLocation: 'gym' },
    unrelatedCloudPreference: 'retain-me',
  }
  seed(user.id, 'user_settings', { user_id: user.id, settings: staleSettings })
  seed(user.id, 'custom_workout_plans', { user_id: user.id, plan: gym.days })
  seed(user.id, 'user_workout_programs', { user_id: user.id, programs: [gym] })
  const pendingBeforeReload = structuredClone(selections())
  server.moduleGraph.invalidateAll()
  app = await loadModules()
  app.persistence.setStorageNamespace(user.id)
  assert.deepEqual(selections(), pendingBeforeReload)
  const hydration = await app.sync.syncCloudToLocal(user)
  assert.deepEqual(hydration.errors, [])
  assert.equal(app.active.getActiveWorkoutProgram().programId, home.id)
  assert.deepEqual(app.settings.getCustomWorkoutPlan(), editedHome)
  assert.ok(app.programs.getUserWorkoutPrograms().some((program) => program.id === home.id))
  assert.equal(app.settings.getWorkoutDisplaySettings().trainingLocation, 'home')

  // A is already uploading when B is selected. Completing A must not dequeue
  // B, and a single drain must eventually upload the newest complete bundle.
  const started = deferred()
  const release = deferred()
  let delayedFirstPlan = false
  intercept = async (request) => {
    if (!delayedFirstPlan && request.table === 'custom_workout_plans' && request.operation === 'upsert') {
      delayedFirstPlan = true
      started.resolve()
      await release.promise
    }
  }
  const drain = app.sync.syncPendingQueue(user)
  await finishesWhileBlocked(started.promise, 'First plan upload')
  const inFlightRevision = selections()[0].id
  try {
    await select(gym, 'gym')
    assert.notEqual(selections()[0].id, inFlightRevision)
  } finally {
    release.resolve()
  }
  const drained = await drain
  intercept = async () => {}
  assert.deepEqual(drained.errors, [])
  assert.equal(selections().length, 0)
  assertSelectedCloud(user, gym)
  assert.equal(row(user.id, 'user_settings').settings.unrelatedCloudPreference, 'retain-me')
  assert.deepEqual(app.persistence.safeGetJSON('workoutSessions', []), history)

  // A partially failed upload keeps the full bundle retryable and never
  // reverses the selected local workout while waiting for connectivity.
  await select(home, 'home')
  let failSettings = true
  intercept = async (request) => {
    if (failSettings && request.table === 'user_settings' && request.operation === 'upsert') {
      failSettings = false
      throw new Error('Verification cloud settings failure')
    }
  }
  const rejected = await app.sync.syncPendingQueue(user)
  assert.equal(rejected.failed, 1)
  assert.equal(failSettings, false)
  assert.equal(selections().length, 1)
  assert.equal(selections()[0].attempts, 1)
  assert.equal(app.active.getActiveWorkoutProgram().programId, home.id)
  assert.deepEqual(app.settings.getCustomWorkoutPlan(), editedHome)
  intercept = async () => {}
  await app.sync.syncPendingQueue(user)
  assert.equal(selections().length, 0)
  assertSelectedCloud(user, home)

  // A download that began before a local choice must not overwrite it, even
  // if that choice finishes uploading before the stale response is released.
  const hydrationStarted = deferred()
  const hydrationRelease = deferred()
  let heldSettingsRead = false
  intercept = async (request) => {
    if (!heldSettingsRead && request.table === 'user_settings' && request.operation === 'select') {
      heldSettingsRead = true
      hydrationStarted.resolve()
      await hydrationRelease.promise
    }
  }
  const staleHydration = app.sync.syncCloudToLocal(user)
  await finishesWhileBlocked(hydrationStarted.promise, 'Stale settings download')
  await select(gym, 'gym')
  await app.sync.syncPendingQueue(user)
  assert.equal(selections().length, 0)
  hydrationRelease.resolve()
  const staleResult = await staleHydration
  intercept = async () => {}
  assert.deepEqual(staleResult.errors, [])
  assert.equal(app.active.getActiveWorkoutProgram().programId, gym.id)
  assert.equal(app.settings.getWorkoutDisplaySettings().trainingLocation, 'gym')
  assert.deepEqual(app.settings.getCustomWorkoutPlan(), app.settings.normalizeCustomWorkoutPlan(gym.days))

  // Finishing an old account's request after logout/login must not remove the
  // new account's queue or write the new account's data to the old account.
  await select(home, 'home')
  const accountUploadStarted = deferred()
  const accountUploadRelease = deferred()
  let heldAccountUpload = false
  intercept = async (request) => {
    if (!heldAccountUpload && request.table === 'custom_workout_plans' && request.operation === 'upsert') {
      heldAccountUpload = true
      accountUploadStarted.resolve()
      await accountUploadRelease.promise
    }
  }
  const oldAccountDrain = app.sync.syncPendingQueue(user)
  await finishesWhileBlocked(accountUploadStarted.promise, 'Old account upload')
  const otherUser = { id: 'other-fast-switch-user' }
  app.persistence.setStorageNamespace(otherUser.id)
  const privateProgram = upload('other-account-private-program', 'gym')
  await select(privateProgram, 'gym', otherUser)
  const otherAccountBefore = accountSnapshot(otherUser.id)
  accountUploadRelease.resolve()
  await oldAccountDrain
  intercept = async () => {}
  assert.deepEqual(accountSnapshot(otherUser.id), otherAccountBefore)
  assert.equal(app.active.getActiveWorkoutProgram().programId, privateProgram.id)
  assert.equal(selections().length, 1)
  assert.equal(JSON.stringify([...cloud].filter(([key]) => key.startsWith(`${user.id}:`))).includes(privateProgram.id), false)
  await app.sync.syncPendingQueue(otherUser)
  assertSelectedCloud(otherUser, privateProgram)
  app.persistence.setStorageNamespace(user.id)
  await app.sync.syncPendingQueue(user)
  assertSelectedCloud(user, home)
  assert.deepEqual(app.persistence.safeGetJSON('workoutSessions', []), history)

  // A profile queued between two selections must not restore its older plan
  // metadata after the newest selection bundle finishes uploading.
  await select(gym, 'gym')
  app.queue.addToSyncQueue({
    type: 'userSettings', action: 'update',
    payload: { id: 'userSettings', value: app.settings.getUserProfileSettings() },
  })
  await select(home, 'home')
  await app.sync.syncPendingQueue(user)
  assertSelectedCloud(user, home)

  // A fresh choice supersedes even an exhausted older revision.
  await select(gym, 'gym')
  app.queue.updateSyncQueueItem(selections()[0].id, { attempts: 5, status: 'failed' })
  await select(home, 'home')
  assert.equal(selections().length, 1)
  assert.equal(selections()[0].attempts, 0)
  await app.sync.syncPendingQueue(user)
  assertSelectedCloud(user, home)

  console.log(JSON.stringify({
    maximumSwitchMilliseconds: Math.round(Math.max(...switchDurations)),
    offlineAndBlockedNetworkSelection: true,
    durableLatestChoice: true,
    queueStorageRollback: true,
    reloadAndPendingHydration: true,
    inFlightLatestChoiceUploaded: true,
    partialFailureRetry: true,
    staleHydrationProtected: true,
    accountsIsolatedDuringUpload: true,
    editsDatesAndHistoryPreserved: true,
    staleQueuedSettingsProtected: true,
    exhaustedRevisionSuperseded: true,
  }, null, 2))
} finally {
  await server.close()
}
