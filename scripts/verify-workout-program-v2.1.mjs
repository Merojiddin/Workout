import nodeAssert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'

const PROGRAM_ID = 'research-recomp-boxing-v2'
const PROGRAM_VERSION = '2.1.0'
process.env.VITE_SUPABASE_URL ??= 'https://verification.supabase.co'
process.env.VITE_SUPABASE_ANON_KEY ??= 'verification-anon-key'
let assertionCount = 0
const assert = new Proxy(nodeAssert, {
  get(target, property, receiver) {
    const value = Reflect.get(target, property, receiver)
    if (typeof value !== 'function') return value
    return (...args) => {
      assertionCount += 1
      return Reflect.apply(value, target, args)
    }
  },
})

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
// `window` here is Node's globalThis, which is not an EventTarget. Modules under
// test dispatch change notifications, so delegate the event methods to a real
// EventTarget instead of leaving them undefined.
const eventTarget = new EventTarget()
for (const method of ['addEventListener', 'removeEventListener', 'dispatchEvent']) {
  Object.defineProperty(globalThis, method, {
    configurable: true,
    writable: true,
    value: (...args) => eventTarget[method](...args),
  })
}
globalThis.localStorage = storage
globalThis.sessionStorage = new MemoryStorage()
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
  const registry = await server.ssrLoadModule(
    '/src/data/workoutProgramRegistry.ts',
  )
  const libraryModule = await server.ssrLoadModule(
    '/src/data/exerciseLibrary.ts',
  )
  const validation = await server.ssrLoadModule(
    '/src/utils/workoutProgramValidation.ts',
  )
  const settings = await server.ssrLoadModule('/src/utils/settingsUtils.js')
  const selections = await server.ssrLoadModule(
    '/src/utils/workoutSelectionUtils.ts',
  )
  const liveWorkouts = await server.ssrLoadModule(
    '/src/utils/liveWorkoutUtils.ts',
  )
  const progress = await server.ssrLoadModule('/src/utils/progressUtils.ts')
  const progression = await server.ssrLoadModule(
    '/src/utils/progressionUtils.ts',
  )
  const manager = await server.ssrLoadModule(
    '/src/utils/workoutProgramManager.ts',
  )
  const activePrograms = await server.ssrLoadModule(
    '/src/utils/activeWorkoutProgram.ts',
  )
  const weeklyReview = await server.ssrLoadModule(
    '/src/utils/weeklyReviewUtils.js',
  )
  const exports = await server.ssrLoadModule('/src/utils/exportUtils.js')
  const cloudPrograms = await server.ssrLoadModule(
    '/src/services/workoutProgramService.ts',
  )

  const userPrograms = await server.ssrLoadModule(
    '/src/utils/userWorkoutPrograms.ts',
  )

  // Nothing ships with the app, so a fresh account has no program at all and
  // cannot inherit one. This is the state the first-run upload screen exists
  // for, and it must hold before anything is uploaded.
  assert.deepEqual(
    registry.getWorkoutPrograms(),
    [],
    'No workout program may be bundled with the app.',
  )
  const initialActiveProgram = activePrograms.getActiveWorkoutProgram()
  assert.equal(initialActiveProgram.programId, null)
  assert.equal(initialActiveProgram.programVersion, null)
  assert.equal(initialActiveProgram.installed, false)
  assert.equal(initialActiveProgram.source, 'none')
  assert.deepEqual(initialActiveProgram.days, [])
  assert.equal(activePrograms.hasActiveWorkoutProgram(), false)
  assert.deepEqual(settings.getCustomWorkoutPlan(), [])

  assert.equal(
    registry.getWorkoutProgramByIdAndVersion('legacy-workout-v1', '1.0.0'),
    undefined,
    'The retired legacy program must no longer be registered.',
  )

  // V2.1 enters the registry the only way any program now can: uploaded by
  // this user, into this user's own program list.
  const uploadedSource = await readFile(
    new URL(
      '../public/programs/research-recomp-boxing-v2.1.json',
      import.meta.url,
    ),
    'utf8',
  )
  const uploaded = userPrograms.parseWorkoutProgramInput(uploadedSource)
  assert.ok(
    uploaded.success && uploaded.program,
    `The V2.1 program file must parse: ${uploaded.errors.join(' ')}`,
  )
  assert.equal(uploaded.program.id, PROGRAM_ID)
  assert.equal(uploaded.program.version, PROGRAM_VERSION)
  assert.equal(
    userPrograms.saveUserWorkoutProgram(uploaded.program).success,
    true,
  )

  // Uploading is not installing: the account still has no active program.
  assert.equal(activePrograms.hasActiveWorkoutProgram(), false)

  const version21 = registry.getWorkoutProgramByIdAndVersion(
    PROGRAM_ID,
    PROGRAM_VERSION,
  )
  assert.ok(version21, 'The V2.1 registry program must be available.')

  // Stand-in for "some other plan the user had before installing V2.1". This
  // used to be the bundled upper-recomposition@2.0.0 program; that file is
  // gone, so derive a distinct plan from V2.1 instead.
  const priorPlanDays = version21.days.map((day) =>
    day.day === 1
      ? { ...day, exercises: [...day.exercises].reverse() }
      : day,
  )

  const knownExerciseIds = new Set(
    libraryModule.exerciseLibrary.map((exercise) => exercise.id),
  )
  const directValidation = validation.validateWorkoutProgram(version21, {
    knownExerciseIds,
  })
  assert.equal(
    directValidation.valid,
    true,
    directValidation.errors.join('\n'),
  )
  assert.deepEqual(directValidation.errors, [])

  // Bundled-file validation results now cover nothing, because nothing is
  // bundled. The upload parser is what stands between a bad file and the app.
  assert.deepEqual(
    registry.getWorkoutProgramValidationResults(),
    [],
    'No bundled program files may be validated at build time.',
  )
  assert.deepEqual(uploaded.errors, [], uploaded.errors.join('\n'))

  assert.equal(version21.durationWeeks, 12)
  assert.equal(version21.normalWeeklyDays, 7)
  assert.equal(version21.days.length, 7)
  assert.deepEqual(
    version21.days.map((day) => day.day),
    [1, 2, 3, 4, 5, 6, 7],
  )
  assert.equal(
    version21.days.some((day) => day.day === 8),
    false,
    'Full-Body Re-entry must not be represented as Day 8.',
  )

  const reentry = version21.standaloneWorkouts?.find(
    (workout) => workout.id === 'full-body-reentry',
  )
  assert.ok(reentry, 'Full-Body Re-entry must be present as a standalone workout.')
  assert.equal(Object.hasOwn(reentry, 'day'), false)
  assert.equal(reentry.progressionMode, 'reentry')
  assert.match(reentry.recommendedUse, /restart(?:ing)? Day 1/i)
  assert.match(
    version21.rules.safety.join(' '),
    /significant unusual joint pain/i,
  )
  assert.match(
    version21.coaching.creatineDailyGrams,
    /3-5 g\/day creatine monohydrate/i,
  )

  const phaseWeeks = version21.progressionPhases.flatMap(
    (phase) => phase.weeks,
  )
  assert.deepEqual(
    [...phaseWeeks].sort((left, right) => left - right),
    Array.from({ length: 12 }, (_, index) => index + 1),
    'Program phases must cover every week from 1 through 12 exactly once.',
  )
  assert.equal(new Set(phaseWeeks).size, 12)

  const baselinePhase = version21.progressionPhases.find((phase) =>
    phase.weeks.includes(1),
  )
  const accumulationPhase = version21.progressionPhases.find((phase) =>
    phase.weeks.includes(5),
  )
  const intensificationPhase = version21.progressionPhases.find((phase) =>
    phase.weeks.includes(9),
  )
  assert.equal(baselinePhase?.setVolumeMultiplier, undefined)
  assert.equal(baselinePhase?.targetRir, '2-3')
  assert.equal(accumulationPhase?.setVolumeMultiplier, undefined)
  assert.equal(accumulationPhase?.targetRir, '1-2')
  assert.equal(intensificationPhase?.setVolumeMultiplier, undefined)
  assert.equal(intensificationPhase?.targetRir, '1-2')

  for (const week of [4, 8]) {
    const phase = version21.progressionPhases.find((candidate) =>
      candidate.weeks.includes(week),
    )
    assert.ok(phase, `Week ${week} must have a recovery phase.`)
    assert.match(phase.name, /recovery|pivot/i)
    assert.match(phase.volumeGuidance, /60-70%/)
    assert.match(phase.rirGuidance, /3-4 RIR/i)
    assert.equal(phase.setVolumeMultiplier, 0.65)
    assert.equal(phase.targetRir, '3-4')
    assert.match((phase.restrictions ?? []).join(' '), /no|do not/i)
  }

  const taper = version21.progressionPhases.find((phase) =>
    phase.weeks.includes(12),
  )
  assert.ok(taper, 'Week 12 must have a taper and assessment phase.')
  assert.match(taper.name, /taper.*assessment/i)
  assert.match(taper.volumeGuidance, /50-60%/)
  assert.equal(taper.setVolumeMultiplier, 0.55)
  assert.equal(taper.targetRir, '3-4')
  assert.match(
    [taper.rirGuidance, ...(taper.restrictions ?? [])].join(' '),
    /no failure/i,
  )
  assert.ok((taper.assessmentItems ?? []).length >= 7)

  const allWorkoutDefinitions = [
    ...version21.days,
    ...(version21.standaloneWorkouts ?? []),
  ]
  let nestedVariantCount = 0
  for (const workout of allWorkoutDefinitions) {
    for (const exercise of workout.exercises) {
      assert.ok(
        knownExerciseIds.has(exercise.id),
        `Exercise slot ${exercise.id} must resolve in the canonical library.`,
      )
      for (const location of ['home', 'gym']) {
        for (const variant of exercise.alternatives?.[location] ?? []) {
          nestedVariantCount += 1
          assert.ok(
            knownExerciseIds.has(variant.id),
            `Nested ${location} variant ${variant.id} must resolve in the canonical library.`,
          )
        }
      }
    }
  }
  assert.ok(nestedVariantCount > 100)

  const normalizedPlan = settings.normalizeCustomWorkoutPlan(version21.days)
  const normalizedAgain = settings.normalizeCustomWorkoutPlan(normalizedPlan)
  assert.deepEqual(normalizedAgain, normalizedPlan)
  assert.deepEqual(
    normalizedPlan[0].exercises[0].alternatives,
    version21.days[0].exercises[0].alternatives,
  )
  assert.deepEqual(
    normalizedPlan[2].exercises[0].phaseTargets,
    version21.days[2].exercises[0].phaseTargets,
  )
  const normalizedMedicineBall = normalizedPlan[2].exercises.find(
    (exercise) => exercise.id === 'rotational-medicine-ball-throw',
  )
  assert.deepEqual(
    Object.keys(normalizedMedicineBall.alternatives),
    ['gym'],
    'Normalization must preserve a valid single-location alternative without inventing a Home option.',
  )
  assert.deepEqual(
    normalizedMedicineBall.alternatives.gym.map((variant) => variant.id),
    ['rotational-medicine-ball-throw'],
  )
  assert.equal(normalizedPlan[1].exercises[0].optional, true)
  assert.deepEqual(
    normalizedPlan[3].exercises[1].alternatives.home
      .filter((variant) => ['weighted-push-up', 'dips'].includes(variant.id))
      .map((variant) => ({ id: variant.id, repRange: variant.repRange })),
    [
      { id: 'weighted-push-up', repRange: '8-15' },
      { id: 'dips', repRange: '8-15' },
    ],
    'Plan normalization must preserve variation-specific rep ranges.',
  )
  assert.deepEqual(
    {
      defaultVariantIds: normalizedPlan[6].exercises[1].defaultVariantIds,
      maxSelections: normalizedPlan[6].exercises[1].maxSelections,
      minSelections: normalizedPlan[6].exercises[1].minSelections,
      selectionMode: normalizedPlan[6].exercises[1].selectionMode,
    },
    {
      defaultVariantIds: ['chin-tuck', 'wall-slide', 'dead-bug'],
      maxSelections: 4,
      minSelections: 2,
      selectionMode: 'multiple',
    },
  )

  const day1FirstSlotKey = selections.getExerciseSlotKey(
    version21.days[0].exercises[0],
    0,
  )
  const homeDay1 = selections.resolveWorkoutDefinition(version21.days[0], {
    location: 'home',
    programWeek: 1,
    selections: {
      [day1FirstSlotKey]: { variantIds: ['weighted-chin-up'] },
    },
  })
  const gymDay1 = selections.resolveWorkoutDefinition(version21.days[0], {
    location: 'gym',
    programWeek: 1,
    selections: {
      [day1FirstSlotKey]: { variantIds: ['neutral-grip-lat-pulldown'] },
    },
  })
  assert.equal(homeDay1.exercises[0].id, 'weighted-chin-up')
  assert.equal(gymDay1.exercises[0].id, 'neutral-grip-lat-pulldown')
  assert.equal(homeDay1.exercises.length, version21.days[0].exercises.length)
  assert.equal(gymDay1.exercises.length, version21.days[0].exercises.length)
  assert.ok(
    [...homeDay1.exercises, ...gymDay1.exercises].every(
      (exercise) => !exercise.alternatives,
    ),
    'Resolved workouts must contain only the chosen canonical variation.',
  )

  const day4HorizontalSlot = version21.days[3].exercises[1]
  const weightedPushUpVariant = day4HorizontalSlot.alternatives.home.find(
    (variant) => variant.id === 'weighted-push-up',
  )
  const dipVariant = day4HorizontalSlot.alternatives.home.find(
    (variant) => variant.id === 'dips',
  )
  assert.deepEqual(
    {
      dipRepRange: dipVariant?.repRange,
      weightedPushUpRepRange: weightedPushUpVariant?.repRange,
    },
    { dipRepRange: '8-15', weightedPushUpRepRange: '8-15' },
    'Day 4 push-up and dip substitutions must retain their 8-15 rep range.',
  )

  const day4HorizontalSlotKey = selections.getExerciseSlotKey(
    day4HorizontalSlot,
    1,
  )
  const resolvedDay4PushUp = selections.resolveWorkoutDefinition(
    version21.days[3],
    {
      location: 'home',
      programWeek: 1,
      progressionPhases: version21.progressionPhases,
      selections: {
        [day4HorizontalSlotKey]: {
          variantIds: ['weighted-push-up'],
        },
      },
    },
  )
  const resolvedPushUp = resolvedDay4PushUp.exercises.find(
    (exercise) => exercise.id === 'weighted-push-up',
  )
  assert.deepEqual(
    {
      duration: resolvedPushUp?.duration,
      equipment: resolvedPushUp?.equipment,
      repRange: resolvedPushUp?.repRange,
      targetRir: resolvedPushUp?.targetRir,
    },
    {
      duration: undefined,
      equipment: 'Bodyweight / Added load',
      repRange: '8-15',
      targetRir: '2-3',
    },
    'The chosen variation must carry its own range/equipment and the current phase RIR.',
  )

  const activeDay4PushUp = liveWorkouts.createActiveWorkoutSession(
    resolvedDay4PushUp,
    {
      programId: PROGRAM_ID,
      programVersion: PROGRAM_VERSION,
      programWeek: 1,
      progressionMode: 'standard',
    },
  )
  const activePushUp = activeDay4PushUp.exercises.find(
    (exercise) => exercise.exerciseId === 'weighted-push-up',
  )
  assert.deepEqual(
    {
      equipment: activePushUp?.equipment,
      targetReps: activePushUp?.targetReps,
      targetRir: activePushUp?.targetRir,
    },
    {
      equipment: 'Bodyweight / Added load',
      targetReps: '8-15',
      targetRir: '2-3',
    },
    'Variant prescriptions must survive live-session creation.',
  )
  const activePushUpIndex = activeDay4PushUp.exercises.findIndex(
    (exercise) => exercise.exerciseId === 'weighted-push-up',
  )
  const { session: loggedDay4PushUp } = liveWorkouts.completeActiveWorkoutSession(
    liveWorkouts.updateActiveSet(
      activeDay4PushUp,
      activePushUpIndex,
      0,
      {
        completedAt: new Date().toISOString(),
        reps: 15,
        rir: 3,
        weightKg: 20,
      },
    ),
  )
  const loggedPushUp = loggedDay4PushUp.exercises.find(
    (exercise) => exercise.exerciseId === 'weighted-push-up',
  )
  assert.deepEqual(
    {
      loggedRir: loggedPushUp?.sets[0].rir,
      targetReps: loggedPushUp?.targetReps,
      targetRir: loggedPushUp?.targetRir,
    },
    { loggedRir: 3, targetReps: '8-15', targetRir: '2-3' },
    'Variation-specific targets and logged RIR must survive session completion.',
  )

  const optionalSlotKey = selections.getExerciseSlotKey(
    version21.days[1].exercises[0],
    0,
  )
  const day2WithoutOptional = selections.resolveWorkoutDefinition(
    version21.days[1],
    { location: 'gym', programWeek: 1 },
  )
  const day2WithOptional = selections.resolveWorkoutDefinition(
    version21.days[1],
    {
      location: 'gym',
      programWeek: 1,
      selections: {
        [optionalSlotKey]: {
          included: true,
          variantIds: ['box-jump'],
        },
      },
    },
  )
  assert.equal(
    day2WithoutOptional.exercises.length,
    version21.days[1].exercises.length - 1,
  )
  assert.equal(day2WithoutOptional.exercises.some(({ id }) => id === 'box-jump'), false)
  assert.equal(day2WithOptional.exercises[0].id, 'box-jump')

  const recoveryChoiceKey = selections.getExerciseSlotKey(
    version21.days[6].exercises[1],
    1,
  )
  const defaultRecovery = selections.resolveWorkoutDefinition(
    version21.days[6],
    { location: 'home', programWeek: 1 },
  )
  const selectedRecovery = selections.resolveWorkoutDefinition(
    version21.days[6],
    {
      location: 'home',
      programWeek: 1,
      selections: {
        [recoveryChoiceKey]: {
          variantIds: [
            'chin-tuck',
            'thoracic-extension-reach',
            'wall-slide',
            'dead-bug',
          ],
        },
      },
    },
  )
  assert.deepEqual(
    defaultRecovery.exercises.slice(1).map((exercise) => exercise.id),
    ['chin-tuck', 'wall-slide', 'dead-bug'],
  )
  assert.deepEqual(
    selectedRecovery.exercises.slice(1).map((exercise) => exercise.id),
    [
      'chin-tuck',
      'thoracic-extension-reach',
      'wall-slide',
      'dead-bug',
    ],
  )

  const day6BoxingSlot = version21.days[5].exercises[8]
  const day6BoxingSlotKey = selections.getExerciseSlotKey(
    day6BoxingSlot,
    8,
  )
  const resolvedDay6Boxing = selections.resolveWorkoutDefinition(
    version21.days[5],
    {
      location: 'home',
      programWeek: 5,
      progressionPhases: version21.progressionPhases,
      selections: {
        [day6BoxingSlotKey]: { variantIds: ['skipping-rope'] },
      },
    },
  )
  const resolvedDay6Intervals = resolvedDay6Boxing.exercises.find(
    (exercise) => exercise.id === 'skipping-rope',
  )
  assert.deepEqual(
    {
      duration: resolvedDay6Intervals?.duration,
      repRange: resolvedDay6Intervals?.repRange,
      restSeconds: resolvedDay6Intervals?.restSeconds,
      sets: resolvedDay6Intervals?.sets,
    },
    {
      duration: '30 sec fast',
      repRange: undefined,
      restSeconds: 60,
      sets: 6,
    },
    'Day 6 boxing must resolve as 30-second work intervals with 60-second rests.',
  )
  const activeDay6Boxing = liveWorkouts.createActiveWorkoutSession(
    resolvedDay6Boxing,
    {
      programId: PROGRAM_ID,
      programVersion: PROGRAM_VERSION,
      programWeek: 5,
    },
  )
  const activeDay6Intervals = activeDay6Boxing.exercises.find(
    (exercise) => exercise.exerciseId === 'skipping-rope',
  )
  assert.deepEqual(
    {
      loggingMode: activeDay6Intervals?.loggingMode,
      restSeconds: activeDay6Intervals?.restSeconds,
      targetDuration: activeDay6Intervals?.targetDuration,
      targetReps: activeDay6Intervals?.targetReps,
    },
    {
      loggingMode: 'duration',
      restSeconds: 60,
      targetDuration: '30 sec fast',
      targetReps: '',
    },
  )

  const medicineBallIndex = version21.days[2].exercises.findIndex(
    (exercise) => exercise.id === 'rotational-medicine-ball-throw',
  )
  const medicineBallSlot = version21.days[2].exercises[medicineBallIndex]
  const medicineBallSlotKey = selections.getExerciseSlotKey(
    medicineBallSlot,
    medicineBallIndex,
  )
  const medicineBallSelection = {
    [medicineBallSlotKey]: {
      included: true,
      variantIds: ['rotational-medicine-ball-throw'],
    },
  }
  const homeDay3WithMedicineRequested = selections.resolveWorkoutDefinition(
    version21.days[2],
    {
      location: 'home',
      programWeek: 1,
      progressionPhases: version21.progressionPhases,
      selections: medicineBallSelection,
    },
  )
  const gymDay3WithMedicine = selections.resolveWorkoutDefinition(
    version21.days[2],
    {
      location: 'gym',
      programWeek: 1,
      progressionPhases: version21.progressionPhases,
      selections: medicineBallSelection,
    },
  )
  assert.equal(
    homeDay3WithMedicineRequested.exercises.some(
      (exercise) => exercise.id === 'rotational-medicine-ball-throw',
    ),
    false,
    'A Gym-only medicine-ball option must not fall back into the Home workout.',
  )
  const resolvedMedicineBall = gymDay3WithMedicine.exercises.find(
    (exercise) => exercise.id === 'rotational-medicine-ball-throw',
  )
  assert.deepEqual(
    {
      equipment: resolvedMedicineBall?.equipment,
      id: resolvedMedicineBall?.id,
      repRange: resolvedMedicineBall?.repRange,
      sets: resolvedMedicineBall?.sets,
    },
    {
      equipment: 'Medicine ball / Safe wall',
      id: 'rotational-medicine-ball-throw',
      repRange: '4-6 each side',
      sets: 3,
    },
    'The Gym medicine-ball option must remain explicitly selectable.',
  )

  const hipFlexorRecovery = selections.resolveWorkoutDefinition(
    version21.days[6],
    {
      location: 'home',
      programWeek: 1,
      selections: {
        [recoveryChoiceKey]: {
          variantIds: ['hip-flexor-stretch', 'chin-tuck'],
        },
      },
    },
  )
  const resolvedHipFlexor = hipFlexorRecovery.exercises.find(
    (exercise) => exercise.id === 'hip-flexor-stretch',
  )
  assert.deepEqual(
    {
      duration: resolvedHipFlexor?.duration,
      repRange: resolvedHipFlexor?.repRange,
    },
    { duration: '20-30 sec per side', repRange: undefined },
    'A duration-only recovery variation must not inherit the slot rep range.',
  )
  const activeHipFlexorRecovery = liveWorkouts.createActiveWorkoutSession(
    hipFlexorRecovery,
    {
      programId: PROGRAM_ID,
      programVersion: PROGRAM_VERSION,
      programWeek: 1,
    },
  )
  const activeHipFlexor = activeHipFlexorRecovery.exercises.find(
    (exercise) => exercise.exerciseId === 'hip-flexor-stretch',
  )
  assert.deepEqual(
    {
      loggingMode: activeHipFlexor?.loggingMode,
      targetDuration: activeHipFlexor?.targetDuration,
      targetReps: activeHipFlexor?.targetReps,
    },
    {
      loggingMode: 'duration',
      targetDuration: '20-30 sec per side',
      targetReps: '',
    },
  )
  assert.equal(activePrograms.isRestDay(version21.days[6]), true)
  assert.equal(
    version21.days.slice(0, 6).every((day) => !activePrograms.isRestDay(day)),
    true,
  )
  assert.deepEqual(
    activePrograms.getTrainingDays(version21).map((day) => day.day),
    [1, 2, 3, 4, 5, 6],
  )
  assert.deepEqual(
    activePrograms.getRestDays(version21).map((day) => day.day),
    [7],
  )
  assert.equal(activePrograms.getWeeklyWorkoutTarget(version21), 6)

  const emptyWeekSummary = weeklyReview.getWorkoutCompletionSummary(
    [],
    version21,
  )
  assert.equal(emptyWeekSummary.targetWorkouts, 6)
  assert.equal(emptyWeekSummary.missedWorkoutDays.length, 6)
  assert.equal(
    emptyWeekSummary.missedWorkoutDays.some((label) => /Day 7/.test(label)),
    false,
  )
  const optionalExerciseCount = version21.days.reduce(
    (total, day) =>
      total + day.exercises.filter((exercise) => exercise.optional).length,
    0,
  )
  const programWithoutOptionalExercises = {
    ...version21,
    days: version21.days.map((day) => ({
      ...day,
      exercises: day.exercises.filter((exercise) => !exercise.optional),
    })),
  }
  const muscleTargetsWithOptionalDefinitions =
    weeklyReview.getMuscleVolumeSummary([], version21, {
      library: libraryModule.exerciseLibrary,
    })
  const muscleTargetsWithoutOptionalDefinitions =
    weeklyReview.getMuscleVolumeSummary([], programWithoutOptionalExercises, {
      library: libraryModule.exerciseLibrary,
    })
  const projectMuscleTargets = (summaries) =>
    summaries.map(({ muscle, targetSets, targetSessions }) => ({
      muscle,
      targetSessions,
      targetSets,
    }))
  assert.equal(optionalExerciseCount, 3)
  assert.deepEqual(
    projectMuscleTargets(muscleTargetsWithOptionalDefinitions),
    projectMuscleTargets(muscleTargetsWithoutOptionalDefinitions),
    'Optional exercises must not inflate Weekly Review set or session targets.',
  )

  const week1Boxing = selections.resolveWorkoutDefinition(version21.days[2], {
    location: 'home',
    programWeek: 1,
    progressionPhases: version21.progressionPhases,
  })
  const week9Boxing = selections.resolveWorkoutDefinition(version21.days[2], {
    location: 'home',
    programWeek: 9,
    progressionPhases: version21.progressionPhases,
  })
  assert.deepEqual(
    {
      duration: week1Boxing.exercises[1].duration,
      sets: week1Boxing.exercises[1].sets,
    },
    { duration: '2 min', sets: 3 },
  )
  assert.deepEqual(
    {
      duration: week9Boxing.exercises[1].duration,
      sets: week9Boxing.exercises[1].sets,
    },
    { duration: '3 min', sets: 4 },
  )
  assert.equal(
    [...week1Boxing.exercises, ...week9Boxing.exercises].every(
      (exercise) => exercise.targetRir === undefined,
    ),
    true,
    'Resistance-training phase RIR overrides must not be assigned to boxing or cardio work.',
  )

  const scheduledStrengthByWeek = new Map(
    [1, 4, 8, 9, 12].map((programWeek) => [
      programWeek,
      selections.resolveWorkoutDefinition(version21.days[1], {
        location: 'home',
        programWeek,
        progressionPhases: version21.progressionPhases,
      }),
    ]),
  )
  assert.deepEqual(
    {
      sets: scheduledStrengthByWeek.get(1).exercises[0].sets,
      targetRir: scheduledStrengthByWeek.get(1).exercises[0].targetRir,
    },
    { sets: 4, targetRir: '2-3' },
  )
  for (const week of [4, 8]) {
    assert.deepEqual(
      {
        sets: scheduledStrengthByWeek.get(week).exercises[0].sets,
        targetRir: scheduledStrengthByWeek.get(week).exercises[0].targetRir,
      },
      { sets: 3, targetRir: '3-4' },
      `Week ${week} must apply the 65% recovery volume and RIR override.`,
    )
  }
  assert.deepEqual(
    {
      sets: scheduledStrengthByWeek.get(9).exercises[0].sets,
      targetRir: scheduledStrengthByWeek.get(9).exercises[0].targetRir,
    },
    { sets: 4, targetRir: '1-2' },
    'Week 9 must restore normal volume with the intensification compound RIR target.',
  )
  assert.deepEqual(
    {
      sets: scheduledStrengthByWeek.get(12).exercises[0].sets,
      targetRir: scheduledStrengthByWeek.get(12).exercises[0].targetRir,
    },
    { sets: 2, targetRir: '3-4' },
    'Week 12 must apply the 55% taper volume and RIR override.',
  )

  const historySentinel = {
    completed: true,
    date: '2026-07-01',
    exercises: [],
    id: 'history-sentinel',
    sessionType: 'scheduled',
    workoutDayId: 1,
    workoutName: 'History Sentinel',
  }
  storage.setItem('workoutSessions', JSON.stringify([historySentinel]))

  const resolvedReentry = selections.resolveWorkoutDefinition(reentry, {
    location: 'gym',
    programWeek: 1,
  })
  let activeReentry = liveWorkouts.createActiveWorkoutSession(resolvedReentry, {
    programId: PROGRAM_ID,
    programVersion: PROGRAM_VERSION,
    programWeek: 1,
    progressionMode: reentry.progressionMode,
    sessionType: 'standalone',
    standaloneWorkoutId: reentry.id,
    workoutGuidance: reentry.rules,
  })
  assert.equal(activeReentry.sessionType, 'standalone')
  assert.equal(activeReentry.workoutDayId, null)
  assert.equal(activeReentry.standaloneWorkoutId, 'full-body-reentry')
  assert.equal(activeReentry.programId, PROGRAM_ID)
  assert.equal(activeReentry.programVersion, PROGRAM_VERSION)
  assert.equal(activeReentry.programWeek, 1)
  assert.equal(activeReentry.progressionMode, 'reentry')
  assert.equal(activeReentry.exercises[0].targetRir, '3')

  activeReentry = liveWorkouts.updateActiveSet(activeReentry, 0, 0, {
    completedAt: new Date().toISOString(),
    reps: 10,
    rir: 3,
    weightKg: 40,
  })
  const { session: finishedReentry } =
    liveWorkouts.completeActiveWorkoutSession(activeReentry)
  assert.equal(finishedReentry.sessionType, 'standalone')
  assert.equal(finishedReentry.workoutDayId, null)
  assert.equal(finishedReentry.standaloneWorkoutId, 'full-body-reentry')
  assert.equal(finishedReentry.programId, PROGRAM_ID)
  assert.equal(finishedReentry.programVersion, PROGRAM_VERSION)
  assert.equal(finishedReentry.programWeek, 1)
  assert.equal(finishedReentry.progressionMode, 'reentry')
  assert.equal(finishedReentry.exercises[0].targetRir, '3')
  assert.equal(finishedReentry.exercises[0].sets[0].rir, 3)
  assert.equal(
    JSON.parse(storage.getItem('workoutSessions')).some(
      (session) => session.id === 'history-sentinel',
    ),
    true,
  )

  const weeklyCompletion = progress.getWeeklyCompletion(
    [finishedReentry],
    new Date(`${finishedReentry.date}T12:00:00`),
  )
  assert.equal(
    weeklyCompletion.reduce((total, day) => total + day.completed, 0),
    0,
    'A standalone re-entry session must not increment scheduled completion.',
  )

  const scheduledRecoveryDaySession = {
    ...finishedReentry,
    exercises: [],
    id: 'scheduled-recovery-day',
    progressionMode: 'standard',
    sessionType: 'scheduled',
    standaloneWorkoutId: null,
    workoutDayId: 7,
    workoutName: version21.days[6].name,
  }
  const mixedCompletionSummary = weeklyReview.getWorkoutCompletionSummary(
    [finishedReentry, scheduledRecoveryDaySession],
    version21,
  )
  assert.deepEqual(
    {
      completedWorkouts: mixedCompletionSummary.completedWorkouts,
      missedWorkoutDays: mixedCompletionSummary.missedWorkoutDays.length,
      scheduledCompletedWorkouts:
        mixedCompletionSummary.scheduledCompletedWorkouts,
      standaloneWorkoutsCompleted:
        mixedCompletionSummary.standaloneWorkoutsCompleted,
      targetWorkouts: mixedCompletionSummary.targetWorkouts,
    },
    {
      completedWorkouts: 2,
      missedWorkoutDays: 6,
      scheduledCompletedWorkouts: 0,
      standaloneWorkoutsCompleted: 1,
      targetWorkouts: 6,
    },
    'Recovery Day 7 and standalone re-entry must not inflate the six scheduled training-day completions.',
  )

  const sessionRows = exports.exportWorkoutSessionsCSV([finishedReentry])
  const sessionHeaders = sessionRows[0]
  const sessionColumn = Object.fromEntries(
    sessionHeaders.map((header, index) => [header, index]),
  )
  const firstLoggedSessionRow = sessionRows.find(
    (row, index) =>
      index > 0 &&
      row[sessionColumn['Exercise ID']] ===
        finishedReentry.exercises[0].exerciseId &&
      row[sessionColumn['Set Number']] === 1,
  )
  assert.ok(firstLoggedSessionRow, 'The logged re-entry set must be exported.')
  assert.equal(
    sessionRows.every((row) => row.length === sessionHeaders.length),
    true,
    'Every workout-session CSV row must match the header width.',
  )
  assert.deepEqual(
    {
      canonicalId:
        firstLoggedSessionRow[sessionColumn['Resolved Canonical ID']],
      programId: firstLoggedSessionRow[sessionColumn['Program ID']],
      programVersion:
        firstLoggedSessionRow[sessionColumn['Program Version']],
      programWeek: firstLoggedSessionRow[sessionColumn['Program Week']],
      rir: firstLoggedSessionRow[sessionColumn.RIR],
      sessionType: firstLoggedSessionRow[sessionColumn['Session Type']],
      standaloneWorkoutId:
        firstLoggedSessionRow[sessionColumn['Standalone Workout ID']],
    },
    {
      canonicalId: finishedReentry.exercises[0].exerciseId,
      programId: PROGRAM_ID,
      programVersion: PROGRAM_VERSION,
      programWeek: 1,
      rir: 3,
      sessionType: 'Standalone workout',
      standaloneWorkoutId: 'full-body-reentry',
    },
    'CSV export must retain canonical identity, provenance, standalone identity, and RIR.',
  )
  const sessionCsv = exports.downloadCSV('v2.1-verification.csv', sessionRows)
  assert.match(sessionCsv, /Program ID,Program Version,Program Week/)
  assert.match(sessionCsv, /full-body-reentry/)
  assert.match(sessionCsv, /research-recomp-boxing-v2/)

  // The printable-session render used to be asserted here too. That component
  // went away with the Export/Print page; the CSV assertions directly above
  // still cover the same provenance fields (program id/version/week,
  // standalone identity, canonical id, RIR).

  const progressionExercise = {
    equipment: 'Cable machine',
    name: 'Progression Probe',
    repRange: '8-12',
    sets: 3,
    targetRir: '2',
  }
  const oneTopSet = {
    sets: [{ reps: 12, rir: 2, weightKg: 25 }],
    targetReps: '8-12',
    targetSets: 3,
  }
  const oneSetBelowTop = {
    sets: [
      { reps: 12, rir: 2, weightKg: 25 },
      { reps: 12, rir: 2, weightKg: 25 },
      { reps: 11, rir: 2, weightKg: 25 },
    ],
    targetReps: '8-12',
    targetSets: 3,
  }
  const insufficientRir = {
    sets: [
      { reps: 12, rir: 2, weightKg: 25 },
      { reps: 12, rir: 1, weightKg: 25 },
      { reps: 12, rir: 2, weightKg: 25 },
    ],
    targetReps: '8-12',
    targetSets: 3,
  }
  const earnedIncrease = {
    sets: [
      { reps: 12, rir: 2, weightKg: 25 },
      { reps: 12, rir: 3, weightKg: 25 },
      { reps: 12, rir: 2, weightKg: 25 },
    ],
    targetReps: '8-12',
    targetSets: 3,
  }
  assert.equal(
    progression.shouldIncreaseLoad(progressionExercise, oneTopSet),
    false,
  )
  assert.equal(
    progression.shouldIncreaseLoad(progressionExercise, oneSetBelowTop),
    false,
  )
  assert.equal(
    progression.shouldIncreaseLoad(progressionExercise, insufficientRir),
    false,
  )
  assert.equal(
    progression.shouldIncreaseLoad(progressionExercise, earnedIncrease),
    true,
  )

  const makeProgressionSession = ({
    date,
    id,
    progressionMode,
    reps,
    rir,
  }) => ({
    completed: true,
    date,
    exercises: [
      {
        exerciseId: resolvedPushUp.id,
        exerciseName: resolvedPushUp.name,
        sets: Array.from({ length: 3 }, (_, index) => ({
          notes: '',
          reps,
          rir,
          rpe: 8,
          setNumber: index + 1,
          weightKg: 20,
        })),
        targetReps: resolvedPushUp.repRange,
        targetRir: resolvedPushUp.targetRir,
        targetSets: 3,
      },
    ],
    finishedAt: `${date}T10:30:00.000Z`,
    id,
    progressionMode,
    sessionType: 'scheduled',
    standaloneWorkoutId: null,
    startedAt: `${date}T10:00:00.000Z`,
    workoutDayId: 4,
    workoutName: version21.days[3].name,
  })
  const standardProgressionSession = makeProgressionSession({
    date: '2026-07-10',
    id: 'standard-progression-baseline',
    progressionMode: 'standard',
    reps: 15,
    rir: 3,
  })
  const recoveryProgressionSession = makeProgressionSession({
    date: '2026-07-17',
    id: 'recovery-progression-probe',
    progressionMode: 'recovery',
    reps: 8,
    rir: 4,
  })
  const progressionWithRecovery = progression.getProgressionSuggestion(
    resolvedPushUp,
    [standardProgressionSession, recoveryProgressionSession],
    { library: libraryModule.exerciseLibrary },
  )
  const recoveryOnlyProgression = progression.getProgressionSuggestion(
    resolvedPushUp,
    [recoveryProgressionSession],
    { library: libraryModule.exerciseLibrary },
  )
  assert.equal(
    progressionWithRecovery.type,
    'increase',
    'The newer recovery-week result must not replace the standard progression baseline.',
  )
  assert.match(progressionWithRecovery.latestSummary, /15, 15, 15 reps/)
  assert.equal(
    recoveryOnlyProgression.type,
    'no-data',
    'Recovery-only history must not create a standard load-progression baseline.',
  )

  const existingBackup = manager.createWorkoutPlanBackup(
    priorPlanDays,
    'Existing backup sentinel',
  )
  assert.equal(existingBackup.success, true, existingBackup.message)
  assert.ok(existingBackup.data)

  const customPlanBeforeInstall = settings.normalizeCustomWorkoutPlan(
    priorPlanDays,
  )
  customPlanBeforeInstall[0].name = 'Custom plan sentinel before V2.1'
  assert.equal(
    settings.saveCustomWorkoutPlanSafely(customPlanBeforeInstall).success,
    true,
  )
  const historyBeforeInstall = storage.getItem('workoutSessions')

  const install = manager.installWorkoutProgramLocally({
    id: PROGRAM_ID,
    version: PROGRAM_VERSION,
  })
  assert.equal(install.success, true, install.message)
  assert.equal(install.data.validation?.valid, true)
  assert.equal(
    install.data.backup?.plan[0].name,
    'Custom plan sentinel before V2.1',
  )
  assert.equal(storage.getItem('workoutSessions'), historyBeforeInstall)

  const backupsAfterInstall = manager.getWorkoutPlanBackups()
  assert.equal(backupsAfterInstall.success, true, backupsAfterInstall.message)
  assert.equal(
    backupsAfterInstall.data.some(
      (backup) => backup.id === existingBackup.data.id,
    ),
    true,
    'Installing V2.1 must preserve pre-existing plan backups.',
  )

  const installed = manager.getInstalledWorkoutProgram()
  assert.equal(installed.success, true, installed.message)
  assert.deepEqual(
    {
      id: installed.data?.id,
      version: installed.data?.version,
    },
    { id: PROGRAM_ID, version: PROGRAM_VERSION },
  )
  assert.deepEqual(
    settings.getCustomWorkoutPlan(),
    settings.normalizeCustomWorkoutPlan(version21.days),
  )

  const activeAfterInstall = activePrograms.getActiveWorkoutProgram()
  assert.equal(activeAfterInstall.programId, PROGRAM_ID)
  assert.equal(activeAfterInstall.programVersion, PROGRAM_VERSION)
  assert.equal(activeAfterInstall.installed, true)
  assert.equal(activeAfterInstall.durationWeeks, 12)
  assert.equal(activeAfterInstall.standaloneWorkouts.length, 1)
  assert.equal(activeAfterInstall.standaloneWorkouts[0].id, 'full-body-reentry')

  const planExport = exports.buildWorkoutPlanExportData(
    activeAfterInstall,
    '2026-08-07T00:00:00.000Z',
  )
  assert.deepEqual(
    {
      dayCount: planExport.days.length,
      exportedAt: planExport.exportedAt,
      id: planExport.program.id,
      standaloneIds: planExport.standaloneWorkouts.map((workout) => workout.id),
      version: planExport.program.version,
    },
    {
      dayCount: 7,
      exportedAt: '2026-08-07T00:00:00.000Z',
      id: PROGRAM_ID,
      standaloneIds: ['full-body-reentry'],
      version: PROGRAM_VERSION,
    },
  )
  assert.equal(
    planExport.days[3].exercises[1].alternatives.home.find(
      (variant) => variant.id === 'weighted-push-up',
    )?.repRange,
    '8-15',
    'Workout-plan export must preserve variation-specific prescriptions.',
  )

  const fullDataExport = exports.exportAllDataJSON()
  const exportedReentry = fullDataExport.workoutSessions.find(
    (session) => session.id === finishedReentry.id,
  )
  assert.deepEqual(
    {
      installedId: fullDataExport.installedWorkoutProgram?.id,
      installedVersion: fullDataExport.installedWorkoutProgram?.version,
      reentryProgramId: exportedReentry?.programId,
      reentryRir: exportedReentry?.exercises?.[0]?.sets?.[0]?.rir,
      reentryStandaloneId: exportedReentry?.standaloneWorkoutId,
    },
    {
      installedId: PROGRAM_ID,
      installedVersion: PROGRAM_VERSION,
      reentryProgramId: PROGRAM_ID,
      reentryRir: 3,
      reentryStandaloneId: 'full-body-reentry',
    },
    'Full-data export must retain installed-program metadata and logged re-entry provenance/RIR.',
  )
  assert.equal(
    fullDataExport.workoutPlanBackups.some(
      (backup) => backup.id === existingBackup.data.id,
    ),
    true,
    'Full-data export must include pre-existing plan backups.',
  )

  const priorCloudBackup = {
    createdAt: '2026-07-01T00:00:00.000Z',
    id: 'prior-cloud-backup',
    plan: settings.normalizeCustomWorkoutPlan(priorPlanDays),
    previousProgram: null,
    reason: 'Cloud backup sentinel',
  }
  let cloudSettingsExists = true
  let cloudPlanExists = true
  let cloudSettingsState = {
    customPreference: { preserved: true },
    workoutProgramManager: {
      backups: [priorCloudBackup],
      customManagerField: 'preserve-manager-field',
      dismissedPrograms: [
        {
          dismissedAt: '2026-07-02T00:00:00.000Z',
          id: 'dismissed-program-sentinel',
          version: '9.9.9',
        },
      ],
      installedProgram: null,
    },
  }
  let cloudPlanState = structuredClone(customPlanBeforeInstall)
  const cloudStore = {
    async deletePlan() {
      cloudPlanExists = false
      cloudPlanState = null
      return { exists: false, value: null }
    },
    async deleteSettings() {
      cloudSettingsExists = false
      cloudSettingsState = null
      return { exists: false, value: null }
    },
    async fetchPlan() {
      return {
        exists: cloudPlanExists,
        value: cloudPlanExists ? structuredClone(cloudPlanState) : null,
      }
    },
    async fetchSettings() {
      return {
        exists: cloudSettingsExists,
        value: cloudSettingsExists
          ? structuredClone(cloudSettingsState)
          : null,
      }
    },
    async writePlan(_user, plan) {
      cloudPlanExists = true
      cloudPlanState = structuredClone(plan)
      return { exists: true, value: structuredClone(cloudPlanState) }
    },
    async writeSettings(_user, nextSettings) {
      cloudSettingsExists = true
      cloudSettingsState = structuredClone(nextSettings)
      return { exists: true, value: structuredClone(cloudSettingsState) }
    },
  }
  const cloudStatuses = []
  const historyBeforeCloudInstall = storage.getItem('workoutSessions')
  const cloudInstall = await cloudPrograms.installWorkoutProgramInCloud(
    { id: PROGRAM_ID, version: PROGRAM_VERSION },
    { id: 'cloud-verification-user' },
    {
      createId: () => 'v21-cloud-install-backup',
      now: () => '2026-08-08T00:00:00.000Z',
      onStatus: (status) => cloudStatuses.push(status),
      store: cloudStore,
    },
  )
  assert.equal(cloudInstall.success, true, cloudInstall.message)
  assert.deepEqual(
    {
      firstStatus: cloudStatuses[0],
      includesVerification: cloudStatuses.includes('Verifying cloud plan…'),
      lastStatus: cloudStatuses.at(-1),
    },
    {
      firstStatus: 'Saving cloud plan…',
      includesVerification: true,
      lastStatus: 'Installation complete',
    },
  )
  assert.deepEqual(
    cloudPlanState,
    settings.normalizeCustomWorkoutPlan(version21.days),
  )
  assert.deepEqual(cloudSettingsState.customPreference, { preserved: true })
  assert.equal(
    cloudSettingsState.workoutProgramManager.customManagerField,
    'preserve-manager-field',
  )
  assert.deepEqual(
    {
      id: cloudSettingsState.workoutProgramManager.installedProgram.id,
      version:
        cloudSettingsState.workoutProgramManager.installedProgram.version,
    },
    { id: PROGRAM_ID, version: PROGRAM_VERSION },
  )
  assert.equal(
    cloudSettingsState.workoutProgramManager.dismissedPrograms.some(
      (entry) => entry.id === 'dismissed-program-sentinel',
    ),
    true,
  )
  assert.equal(
    cloudSettingsState.workoutProgramManager.backups.some(
      (backup) => backup.id === 'prior-cloud-backup',
    ),
    true,
  )
  const cloudInstallBackup =
    cloudSettingsState.workoutProgramManager.backups.find(
      (backup) => backup.id === 'v21-cloud-install-backup',
    )
  assert.equal(
    cloudInstallBackup?.plan[0].name,
    'Custom plan sentinel before V2.1',
    'The cloud transaction must back up the exact prior custom plan.',
  )
  assert.equal(storage.getItem('workoutSessions'), historyBeforeCloudInstall)

  const historyBeforeReload = storage.getItem('workoutSessions')
  const backupsBeforeReload = storage.getItem('workoutPlanBackups')
  server.moduleGraph.invalidateAll()
  const reloadedManager = await server.ssrLoadModule(
    '/src/utils/workoutProgramManager.ts',
  )
  const reloadedActivePrograms = await server.ssrLoadModule(
    '/src/utils/activeWorkoutProgram.ts',
  )
  const reloadedSettings = await server.ssrLoadModule(
    '/src/utils/settingsUtils.js',
  )
  const reloadedInstalled = reloadedManager.getInstalledWorkoutProgram()
  const reloadedActive = reloadedActivePrograms.getActiveWorkoutProgram()
  assert.equal(reloadedInstalled.success, true, reloadedInstalled.message)
  assert.deepEqual(
    {
      id: reloadedInstalled.data?.id,
      version: reloadedInstalled.data?.version,
    },
    { id: PROGRAM_ID, version: PROGRAM_VERSION },
  )
  assert.deepEqual(
    reloadedSettings.getCustomWorkoutPlan(),
    settings.normalizeCustomWorkoutPlan(version21.days),
    'A fresh module load must recover the exact installed V2.1 plan.',
  )
  assert.equal(reloadedActive.programId, PROGRAM_ID)
  assert.equal(reloadedActive.programVersion, PROGRAM_VERSION)
  assert.equal(reloadedActive.installed, true)
  assert.equal(reloadedActive.standaloneWorkouts[0].id, 'full-body-reentry')
  assert.equal(storage.getItem('workoutSessions'), historyBeforeReload)
  assert.equal(storage.getItem('workoutPlanBackups'), backupsBeforeReload)

  console.log(
    JSON.stringify(
      {
        activeProgram: `${PROGRAM_ID}@${PROGRAM_VERSION}`,
        assertionsPassed: assertionCount,
        canonicalNestedVariants: nestedVariantCount,
        cloudInstallPreservedState: true,
        daysResolved: 7,
        historyPreservedOnInstall: true,
        phasesCovered: 12,
        csvProvenanceVerified: true,
        recoveryDayScheduledTarget: 6,
        scheduledCompletionsFromReentry: 0,
        status: 'passed',
      },
      null,
      2,
    ),
  )
} finally {
  await server.close()
}
