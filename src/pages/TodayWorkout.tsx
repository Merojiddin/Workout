import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  Clock3,
  Flag,
  Home,
  ListChecks,
  Play,
  ShieldAlert,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ExerciseDetailModal } from '../components/ExerciseDetailModal'
import { LiveWorkoutHeader } from '../components/LiveWorkoutHeader'
import { OptionalSetLog, type OptionalSetLogValues } from '../components/OptionalSetLog'
import { RemainingExercises } from '../components/RemainingExercises'
import { RestTimer } from '../components/RestTimer'
import { UnfinishedWorkoutPrompt } from '../components/UnfinishedWorkoutPrompt'
import { WorkoutFinishSummary } from '../components/WorkoutFinishSummary'
import type { WorkoutSession } from '../data/workoutSessions'
import type { LibraryExercise } from '../data/exerciseLibrary'
import type { TrainingLocation, WorkoutDay } from '../data/workoutPlan'
import {
  clearActiveWorkoutSession,
  completeActiveWorkoutSession,
  createActiveWorkoutSession,
  getActiveWorkoutSession,
  getCurrentExercise,
  getDoneSetsCount,
  getTotalPlannedSets,
  getWorkoutDuration,
  isDoneSet,
  saveActiveWorkoutSession,
  updateActiveSet,
  type ActiveExercise,
  type ActiveWorkoutSession,
} from '../utils/liveWorkoutUtils'
import { getExerciseTarget } from '../utils/exerciseLoggingUtils'
import { getNutritionGuidance } from '../utils/postWorkoutNutrition'
import {
  findLibraryExerciseForWorkout,
  getEffectiveExerciseLibrary,
  getWorkoutForDate,
} from '../utils/settingsUtils'
import { useAuth } from '../context/AuthContext'
import * as workoutService from '../services/workoutService'
import type { PageId } from '../types/navigation'
import type { StandaloneWorkout } from '../types/workoutProgram'
import {
  getActiveWorkoutProgram,
  type ActiveWorkoutProgram,
} from '../utils/activeWorkoutProgram'
import {
  getDefaultVariantIds,
  getExerciseSlotKey,
  resolveWorkoutDefinition,
  type WorkoutExerciseSelections,
} from '../utils/workoutSelectionUtils'

interface TodayWorkoutProps {
  onNavigate: (page: PageId) => void
}

type Screen = 'prompt' | 'intro' | 'active' | 'finished'

export function TodayWorkout({ onNavigate }: TodayWorkoutProps) {
  const { user } = useAuth()
  const activeProgram = useMemo(() => getActiveWorkoutProgram(), [])
  const plan = activeProgram.days
  const todayWorkout = useMemo(
    () => getWorkoutForDate(new Date(), plan) as WorkoutDay,
    [plan],
  )
  const exerciseLibrary = useMemo(
    () => getEffectiveExerciseLibrary() as LibraryExercise[],
    [],
  )
  const nutrition = useMemo(
    () => getNutritionGuidance(activeProgram.coaching),
    [activeProgram],
  )
  // Auto-derived from the install date so no week picker is needed on screen.
  const programWeek = useMemo(() => getCurrentProgramWeek(activeProgram), [activeProgram])

  const [session, setSession] = useState<ActiveWorkoutSession | null>(() =>
    getActiveWorkoutSession(),
  )
  const [screen, setScreen] = useState<Screen>(() => {
    const existing = getActiveWorkoutSession()
    return existing && !existing.completed ? 'prompt' : 'intro'
  })
  const [selectedDay, setSelectedDay] = useState<WorkoutDay>(todayWorkout)
  const [finishedSession, setFinishedSession] = useState<WorkoutSession | null>(null)
  const [finishError, setFinishError] = useState<string | null>(null)
  const [restSignal, setRestSignal] = useState(0)
  const [nowTs, setNowTs] = useState(() => Date.now())

  // Keep the elapsed time ticking while training.
  useEffect(() => {
    if (screen !== 'active') {
      return undefined
    }

    const intervalId = window.setInterval(() => setNowTs(Date.now()), 15000)
    return () => window.clearInterval(intervalId)
  }, [screen])

  function commit(next: ActiveWorkoutSession) {
    setSession(next)
    saveActiveWorkoutSession(next)
  }

  function beginWorkout(fresh: ActiveWorkoutSession) {
    const existing = getActiveWorkoutSession()
    if (existing && !existing.completed) {
      setSession(existing)
      setScreen('prompt')
      return
    }

    saveActiveWorkoutSession(fresh)
    setSession(fresh)
    setRestSignal(0)
    setNowTs(Date.now())
    setScreen('active')
  }

  function startScheduledWorkout(day: WorkoutDay) {
    beginWorkout(
      createActiveWorkoutSession(day, {
        programId: activeProgram.programId,
        programVersion: activeProgram.programVersion,
        programWeek,
        progressionMode: getProgramWeekProgressionMode(activeProgram, programWeek),
        workoutGuidance: getProgramWeekGuidance(activeProgram, programWeek),
      }),
    )
  }

  function startStandaloneWorkout(workout: StandaloneWorkout) {
    beginWorkout(
      createActiveWorkoutSession(workout, {
        sessionType: 'standalone',
        standaloneWorkoutId: workout.id,
        programId: activeProgram.programId,
        programVersion: activeProgram.programVersion,
        programWeek,
        progressionMode: workout.progressionMode ?? 'standard',
        workoutGuidance: workout.rules ?? [],
      }),
    )
  }

  /**
   * Marks the current set as done and moves on. `log` may be all-nulls: the set
   * still counts as done, because logging numbers is optional.
   */
  function advance(log: OptionalSetLogValues) {
    if (!session) {
      return
    }

    const exerciseIndex = session.currentExerciseIndex
    const setIndex = session.currentSetIndex
    const exercise = session.exercises[exerciseIndex]
    if (!exercise) {
      return
    }

    const updated = updateActiveSet(session, exerciseIndex, setIndex, {
      reps: log.reps,
      timeSeconds: log.timeSeconds,
      weightKg: log.weightKg,
      completedAt: new Date().toISOString(),
    })

    const isLastSet = setIndex >= exercise.sets.length - 1
    const isLastExercise = exerciseIndex >= session.exercises.length - 1

    if (isLastSet && isLastExercise) {
      finishWorkout(updated)
      return
    }

    commit(
      isLastSet
        ? {
            ...updated,
            currentExerciseIndex: exerciseIndex + 1,
            currentSetIndex: 0,
          }
        : { ...updated, currentSetIndex: setIndex + 1 },
    )
    setRestSignal((signal) => signal + 1)
  }

  /** Jump to an exercise without marking anything done. */
  function goToExercise(index: number) {
    if (!session) {
      return
    }

    const bounded = Math.min(Math.max(index, 0), session.exercises.length - 1)
    commit({
      ...session,
      currentExerciseIndex: bounded,
      currentSetIndex: resumeSetIndex(session.exercises[bounded]),
    })
  }

  /** One step backwards, across the exercise boundary when needed. */
  function goBack() {
    if (!session) {
      return
    }

    if (session.currentSetIndex > 0) {
      commit({ ...session, currentSetIndex: session.currentSetIndex - 1 })
      return
    }

    const previousIndex = session.currentExerciseIndex - 1
    const previous = session.exercises[previousIndex]
    if (!previous) {
      return
    }

    commit({
      ...session,
      currentExerciseIndex: previousIndex,
      currentSetIndex: Math.max(0, previous.sets.length - 1),
    })
  }

  function finishWorkout(target: ActiveWorkoutSession | null = session) {
    if (!target) {
      return
    }

    const { saved, session: finished } = completeActiveWorkoutSession(target)

    if (!saved) {
      // History could not be written, so the active workout is deliberately
      // still on screen and still saved. Losing it silently would be worse.
      commit(target)
      setFinishError(
        'Could not save this workout - device storage is full. Free up space (More > Settings > Backup) and press Finish again. Your workout is still here.',
      )
      return
    }

    setFinishError(null)
    // Local save already happened above; push to the cloud in the background.
    void workoutService.saveWorkoutSession(user, finished).catch(() => undefined)
    setFinishedSession(finished)
    setSession(null)
    setScreen('finished')
  }

  if (screen === 'finished' && finishedSession) {
    return (
      <section className="workout-page">
        <WorkoutFinishSummary
          nutrition={nutrition}
          onDone={() => {
            setFinishedSession(null)
            setSelectedDay(todayWorkout)
            setScreen('intro')
          }}
          session={finishedSession}
        />
      </section>
    )
  }

  if (screen === 'prompt' && session) {
    return (
      <section className="workout-page">
        <UnfinishedWorkoutPrompt
          onContinue={() => {
            setNowTs(Date.now())
            setScreen('active')
          }}
          onDiscard={() => {
            clearActiveWorkoutSession()
            setSession(null)
            setScreen('intro')
          }}
          session={session}
        />
      </section>
    )
  }

  if (screen === 'active' && session) {
    return (
      <LiveWorkoutScreen
        exerciseLibrary={exerciseLibrary}
        finishError={finishError}
        nowTs={nowTs}
        onAdvance={advance}
        onBack={goBack}
        onFinish={() => finishWorkout()}
        onGoToExercise={goToExercise}
        restSignal={restSignal}
        session={session}
      />
    )
  }

  return (
    <PreWorkoutScreen
      activeProgram={activeProgram}
      onNavigate={onNavigate}
      onSelectDay={setSelectedDay}
      onStart={startScheduledWorkout}
      onStartStandalone={startStandaloneWorkout}
      programWeek={programWeek}
      selectedDay={selectedDay}
    />
  )
}

// ---------------------------------------------------------------------------
// Pre-workout screen
// ---------------------------------------------------------------------------

interface PreWorkoutScreenProps {
  activeProgram: ActiveWorkoutProgram
  onNavigate: (page: PageId) => void
  onSelectDay: (day: WorkoutDay) => void
  onStart: (workout: WorkoutDay) => void
  onStartStandalone: (workout: StandaloneWorkout) => void
  programWeek: number | null
  selectedDay: WorkoutDay
}

function PreWorkoutScreen({
  activeProgram,
  onNavigate,
  onSelectDay,
  onStart,
  onStartStandalone,
  programWeek,
  selectedDay,
}: PreWorkoutScreenProps) {
  const [location, setLocation] = useState<TrainingLocation>('home')
  const [showPicker, setShowPicker] = useState(false)

  // Per-slot variant picking is gone: the program's own defaults are applied
  // for the chosen location. Swapping an exercise is a Weekly Plan concern.
  const resolvedDay = resolveWorkoutDefinition(selectedDay, {
    location,
    programWeek,
    progressionPhases: activeProgram.progressionPhases,
    selections: createDefaultSelections(selectedDay, location),
  })
  const exercises = resolvedDay.exercises
  const hasExercises = exercises.length > 0
  const hasLocationChoice = selectedDay.exercises.some((exercise) =>
    Boolean(exercise.alternatives),
  )
  const phase = activeProgram.progressionPhases.find((item) =>
    programWeek ? item.weeks.includes(programWeek) : false,
  )
  const easyWeek = Boolean(phase?.setVolumeMultiplier)

  return (
    <section className="workout-page workout-page--intro">
      <header className="today-intro">
        <p className="eyebrow">Today</p>
        <h1>{selectedDay.name}</h1>
        <p className="today-intro__meta">
          <span>
            <Clock3 size={15} strokeWidth={2.4} aria-hidden="true" />
            {selectedDay.estimatedTime}
          </span>
          <span>
            <ListChecks size={15} strokeWidth={2.4} aria-hidden="true" />
            {exercises.length} exercises
          </span>
        </p>

        {easyWeek && phase ? (
          <p className="today-intro__notice">
            <ShieldAlert size={15} strokeWidth={2.4} aria-hidden="true" />
            {phase.name}: keep it easy and do not chase a heavier load this week.
          </p>
        ) : null}

        {hasLocationChoice ? (
          <div className="location-toggle" role="group" aria-label="Training location">
            <button
              aria-pressed={location === 'home'}
              className={location === 'home' ? 'is-active' : ''}
              onClick={() => setLocation('home')}
              type="button"
            >
              <Home size={16} strokeWidth={2.4} aria-hidden="true" />
              Home
            </button>
            <button
              aria-pressed={location === 'gym'}
              className={location === 'gym' ? 'is-active' : ''}
              onClick={() => setLocation('gym')}
              type="button"
            >
              <Building2 size={16} strokeWidth={2.4} aria-hidden="true" />
              Gym
            </button>
          </div>
        ) : null}
      </header>

      {hasExercises ? (
        <>
          <ol className="today-exercise-list">
            {exercises.map((exercise, index) => (
              <li key={`${exercise.id}-${index}`}>
                <span aria-hidden="true">{index + 1}</span>
                <span>
                  <strong>{exercise.name}</strong>
                  <small>
                    {Math.max(1, Number(exercise.sets) || 1)} ×{' '}
                    {getExerciseTarget(exercise)}
                  </small>
                </span>
              </li>
            ))}
          </ol>

          <button
            className="workout-primary-button workout-primary-button--large"
            onClick={() => onStart(resolvedDay)}
            type="button"
          >
            <Play size={21} strokeWidth={2.4} aria-hidden="true" />
            Start workout
          </button>
        </>
      ) : (
        <article className="today-empty">
          <p>This day has no exercises yet.</p>
          <button
            className="workout-secondary-button"
            onClick={() => onNavigate('weekly-plan')}
            type="button"
          >
            View weekly plan
          </button>
        </article>
      )}

      <button
        aria-expanded={showPicker}
        className="today-picker__toggle"
        onClick={() => setShowPicker((open) => !open)}
        type="button"
      >
        {showPicker ? 'Hide other workouts' : 'Train a different day'}
      </button>

      {showPicker ? (
        <div className="today-picker" role="group" aria-label="Choose a workout">
          {activeProgram.days.map((day) => (
            <button
              aria-pressed={day.day === selectedDay.day}
              className={`today-picker__day${
                day.day === selectedDay.day ? ' today-picker__day--active' : ''
              }`}
              key={day.day}
              onClick={() => {
                onSelectDay(day)
                setShowPicker(false)
              }}
              type="button"
            >
              <strong>{day.name}</strong>
              <small>{day.estimatedTime}</small>
            </button>
          ))}

          {activeProgram.standaloneWorkouts.map((workout) => (
            <button
              className="today-picker__day today-picker__day--extra"
              key={workout.id}
              onClick={() => onStartStandalone(resolveStandalone(workout, location))}
              type="button"
            >
              <strong>{workout.name}</strong>
              <small>Extra · starts now</small>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Live workout screen
// ---------------------------------------------------------------------------

interface LiveWorkoutScreenProps {
  exerciseLibrary: LibraryExercise[]
  finishError: string | null
  nowTs: number
  onAdvance: (log: OptionalSetLogValues) => void
  onBack: () => void
  onFinish: () => void
  onGoToExercise: (index: number) => void
  restSignal: number
  session: ActiveWorkoutSession
}

const EMPTY_LOG: OptionalSetLogValues = {
  reps: null,
  timeSeconds: null,
  weightKg: null,
}

function LiveWorkoutScreen({
  exerciseLibrary,
  finishError,
  nowTs,
  onAdvance,
  onBack,
  onFinish,
  onGoToExercise,
  restSignal,
  session,
}: LiveWorkoutScreenProps) {
  // Once opened, the log stays open for the rest of the workout.
  const [logOpen, setLogOpen] = useState(false)
  const [listOpen, setListOpen] = useState(false)
  const [showFormGuide, setShowFormGuide] = useState(false)
  const [pendingLog, setPendingLog] = useState<OptionalSetLogValues>(EMPTY_LOG)

  const exercise = getCurrentExercise(session)
  const exerciseIndex = session.currentExerciseIndex
  const setIndex = session.currentSetIndex
  const setKey = `${exerciseIndex}-${setIndex}`

  // The pending values belong to one set only.
  useEffect(() => {
    setPendingLog(EMPTY_LOG)
  }, [setKey])

  if (!exercise) {
    return (
      <section className="workout-page workout-page--live">
        <article className="today-empty">
          <p>This workout has no exercises to work through.</p>
          <button className="workout-primary-button" onClick={onFinish} type="button">
            <Flag size={19} strokeWidth={2.4} aria-hidden="true" />
            Finish
          </button>
        </article>
      </section>
    )
  }

  const totalSets = exercise.sets.length
  const isLastSet = setIndex >= totalSets - 1
  const isLastExercise = exerciseIndex >= session.exercises.length - 1
  const atStart = setIndex === 0 && exerciseIndex === 0
  const formGuideExercise = findLibraryExerciseForWorkout(
    {
      id: exercise.exerciseId,
      name: exercise.exerciseName,
      equipment: exercise.equipment,
      muscleGroup: exercise.muscleGroup,
    },
    exerciseLibrary,
  )

  return (
    <section className="workout-page workout-page--live">
      {finishError ? (
        <div className="live-finish-error" role="alert">
          <ShieldAlert size={18} strokeWidth={2.4} aria-hidden="true" />
          <span>{finishError}</span>
        </div>
      ) : null}

      <LiveWorkoutHeader
        currentExerciseIndex={exerciseIndex}
        doneSets={getDoneSetsCount(session)}
        duration={getWorkoutDuration(session, new Date(nowTs))}
        totalExercises={session.exercises.length}
        totalSets={getTotalPlannedSets(session)}
        workoutName={session.workoutName}
      />

      <article className="live-exercise">
        <p className="eyebrow">{exercise.muscleGroup || 'Exercise'}</p>
        <h1>{exercise.exerciseName}</h1>
        <p className="live-exercise__target">
          Set {Math.min(setIndex + 1, totalSets)} of {totalSets} ·{' '}
          {getExerciseTarget(exercise)}
        </p>

        {formGuideExercise ? (
          <button
            className="live-exercise__guide"
            onClick={() => setShowFormGuide(true)}
            type="button"
          >
            <BookOpen size={15} strokeWidth={2.4} aria-hidden="true" />
            Form guide
          </button>
        ) : null}
      </article>

      {exercise.restSeconds > 0 ? (
        <RestTimer autoStartSignal={restSignal} restSeconds={exercise.restSeconds} />
      ) : null}

      <OptionalSetLog
        initialData={exercise.sets[setIndex]}
        isOpen={logOpen}
        loggingMode={exercise.loggingMode}
        onChange={setPendingLog}
        onOpenChange={setLogOpen}
        setKey={setKey}
      />

      <div className="live-actions">
        <button
          aria-label="Go back one set"
          className="live-actions__back"
          disabled={atStart}
          onClick={onBack}
          type="button"
        >
          <ArrowLeft size={19} strokeWidth={2.4} aria-hidden="true" />
        </button>

        <button
          className="workout-primary-button workout-primary-button--large"
          onClick={() => onAdvance(pendingLog)}
          type="button"
        >
          {isLastSet && isLastExercise ? (
            <>
              <Flag size={20} strokeWidth={2.4} aria-hidden="true" />
              Finish workout
            </>
          ) : isLastSet ? (
            <>
              <Check size={20} strokeWidth={2.4} aria-hidden="true" />
              Next exercise
            </>
          ) : (
            <>
              <Check size={20} strokeWidth={2.4} aria-hidden="true" />
              Next set
            </>
          )}
        </button>
      </div>

      {!isLastExercise ? (
        <button
          className="live-skip"
          onClick={() => onGoToExercise(exerciseIndex + 1)}
          type="button"
        >
          Skip to next exercise
          <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
        </button>
      ) : null}

      <RemainingExercises
        currentIndex={exerciseIndex}
        exercises={session.exercises}
        isOpen={listOpen}
        onSelect={(index) => {
          onGoToExercise(index)
          setListOpen(false)
        }}
        onToggle={() => setListOpen((open) => !open)}
      />

      <button className="live-end" onClick={onFinish} type="button">
        End workout here
      </button>

      {showFormGuide && formGuideExercise ? (
        <ExerciseDetailModal
          exercise={formGuideExercise}
          onClose={() => setShowFormGuide(false)}
        />
      ) : null}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Week number derived from the install date, so nothing has to be selected. */
function getCurrentProgramWeek(activeProgram: ActiveWorkoutProgram): number | null {
  const durationWeeks = Number(activeProgram.durationWeeks)
  if (!Number.isInteger(durationWeeks) || durationWeeks < 1) {
    return null
  }

  const installedAt = activeProgram.installedAt
    ? new Date(activeProgram.installedAt).getTime()
    : Number.NaN
  if (!Number.isFinite(installedAt)) {
    return 1
  }

  const elapsedWeeks = Math.floor(
    Math.max(0, Date.now() - installedAt) / (7 * 24 * 60 * 60 * 1000),
  )
  return Math.min(durationWeeks, elapsedWeeks + 1)
}

function getProgramWeekGuidance(
  activeProgram: ActiveWorkoutProgram,
  programWeek: number | null,
): string[] {
  if (!programWeek) {
    return []
  }

  const phase = activeProgram.progressionPhases.find((item) =>
    item.weeks.includes(programWeek),
  )
  if (!phase) {
    return [`Program week ${programWeek}. Follow the prescribed sets and effort.`]
  }

  return [
    `Week ${programWeek} — ${phase.name}: ${phase.volumeGuidance}`,
    phase.rirGuidance,
    ...phase.priorities.map((priority) => `Priority: ${priority}`),
    ...(phase.restrictions ?? []).map((restriction) => `Restriction: ${restriction}`),
  ].filter((item) => item.trim().length > 0)
}

function getProgramWeekProgressionMode(
  activeProgram: ActiveWorkoutProgram,
  programWeek: number | null,
): 'standard' | 'recovery' {
  if (!programWeek) {
    return 'standard'
  }

  const phase = activeProgram.progressionPhases.find((item) =>
    item.weeks.includes(programWeek),
  )
  return phase?.setVolumeMultiplier ? 'recovery' : 'standard'
}

interface SelectableWorkout {
  exercises: Parameters<typeof getExerciseSlotKey>[0][]
}

function createDefaultSelections(
  workout: SelectableWorkout,
  location: TrainingLocation,
): WorkoutExerciseSelections {
  return workout.exercises.reduce<WorkoutExerciseSelections>(
    (result, exercise, index) => {
      if (!exercise.alternatives && !exercise.optional) {
        return result
      }

      result[getExerciseSlotKey(exercise, index)] = {
        included: !exercise.optional,
        variantIds: exercise.alternatives
          ? getDefaultVariantIds(exercise, location)
          : [],
      }
      return result
    },
    {},
  )
}

function resolveStandalone(
  workout: StandaloneWorkout,
  location: TrainingLocation,
): StandaloneWorkout {
  return {
    ...workout,
    exercises: resolveWorkoutDefinition(workout, {
      location,
      programWeek: null,
      selections: createDefaultSelections(workout, location),
    }).exercises,
  }
}

/** First set that has not been worked through yet. */
function resumeSetIndex(exercise: ActiveExercise | undefined): number {
  if (!exercise || !Array.isArray(exercise.sets)) {
    return 0
  }

  const firstOpen = exercise.sets.findIndex((set) => !isDoneSet(set))
  return firstOpen === -1 ? Math.max(0, exercise.sets.length - 1) : firstOpen
}
