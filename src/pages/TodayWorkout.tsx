import {
  ArrowLeft,
  BookOpen,
  Building2,
  Check,
  Clock3,
  Dumbbell,
  Flag,
  Home,
  Info,
  Layers,
  ListChecks,
  Play,
  Repeat,
  ShieldAlert,
  SkipForward,
  Square,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ExerciseDetailModal } from '../components/ExerciseDetailModal'
import { LiveExerciseImage } from '../components/LiveExerciseImage'
import { LiveWorkoutHeader } from '../components/LiveWorkoutHeader'
import { OptionalSetLog, type OptionalSetLogValues } from '../components/OptionalSetLog'
import { ExerciseSwapSheet } from '../components/ExerciseSwapSheet'
import { useLiveTimer } from '../hooks/useLiveTimer'
import { LiveRoundStats } from '../components/LiveRoundStats'
import { LiveSetTable } from '../components/LiveSetTable'
import { RemainingExercises } from '../components/RemainingExercises'
import { UnfinishedWorkoutPrompt } from '../components/UnfinishedWorkoutPrompt'
import { WorkoutFinishSummary } from '../components/WorkoutFinishSummary'
import type { WorkoutSession } from '../data/workoutSessions'
import type { LibraryExercise } from '../data/exerciseLibrary'
import type { TrainingLocation, WorkoutDay } from '../data/workoutPlan'
import {
  addSetToActiveExercise,
  clearActiveWorkoutSession,
  completeActiveWorkoutSession,
  countRemainingExercises,
  createActiveWorkoutSession,
  getActiveWorkoutSession,
  getCurrentExercise,
  getDoneSetsCount,
  getTotalPlannedSets,
  getWorkoutElapsedSeconds,
  isDoneSet,
  saveActiveWorkoutSession,
  swapActiveExercise,
  updateActiveSet,
  type ActiveExercise,
  type ActiveSet,
  type ActiveWorkoutSession,
} from '../utils/liveWorkoutUtils'
import {
  getExerciseTarget,
  parseDurationTarget,
} from '../utils/exerciseLoggingUtils'
import { getNutritionGuidance } from '../utils/postWorkoutNutrition'
import {
  findLibraryExerciseForWorkout,
  getEffectiveExerciseLibrary,
  getWorkoutDisplaySettings,
  getWorkoutForDate,
} from '../utils/settingsUtils'
import type { WorkoutDisplaySettings } from '../utils/mediaUtils'
import { useAuth } from '../context/AuthContext'
import { t as translateText, useLanguage, useT } from '../i18n'
import { useProfileIdentity } from '../hooks/useProfileIdentity'
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
  const { language, t } = useLanguage()
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
  const displaySettings = useMemo(
    () => getWorkoutDisplaySettings() as WorkoutDisplaySettings,
    [],
  )
  // Keyed on the language too: the guidance text is built in whichever one
  // is active, so a switch mid-session has to rebuild it.
  const nutrition = useMemo(
    () => getNutritionGuidance(activeProgram.coaching),
    // The language is a real dependency: these helpers read it from the
    // i18n store rather than taking it as an argument, so the linter
    // cannot see it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeProgram, language],
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

    // Once a second, because the header clock counts seconds.
    const intervalId = window.setInterval(() => setNowTs(Date.now()), 1000)
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

  /** Add one unplanned set to the exercise on screen. */
  function addSet() {
    if (!session) {
      return
    }

    commit(addSetToActiveExercise(session, session.currentExerciseIndex))
  }

  /** Jump to any set of the current exercise, without marking anything done. */
  function goToSet(setIndex: number) {
    if (!session) {
      return
    }

    const exercise = session.exercises[session.currentExerciseIndex]
    if (!exercise) {
      return
    }

    commit({
      ...session,
      currentSetIndex: Math.min(Math.max(setIndex, 0), exercise.sets.length - 1),
    })
  }

  /** Swap the movement in the current slot for one of its alternatives. */
  function swapExercise(variantId: string) {
    if (!session) {
      return
    }

    commit(swapActiveExercise(session, session.currentExerciseIndex, variantId))
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
      setFinishError(t('workout.saveFailed'))
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
            // Sits next to "Continue" and cannot be undone, so name what is
            // about to be thrown away before doing it.
            const doneSets = getDoneSetsCount(session)
            const confirmed = window.confirm(
              doneSets > 0
                ? t('workout.discardConfirm', { count: doneSets })
                : t('workout.discardConfirmEmpty'),
            )
            if (!confirmed) {
              return
            }

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
        displaySettings={displaySettings}
        exerciseLibrary={exerciseLibrary}
        finishError={finishError}
        nowTs={nowTs}
        onAddSet={addSet}
        onAdvance={advance}
        onBack={goBack}
        // Leaving the training screen is not the same as ending the workout:
        // the session stays saved and the prompt screen offers it straight
        // back, with the app's own nav visible again behind it.
        onExit={() => setScreen('prompt')}
        onFinish={() => finishWorkout()}
        onGoToExercise={goToExercise}
        onGoToSet={goToSet}
        onSwapExercise={swapExercise}
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
  const { firstName } = useProfileIdentity()
  const t = useT()
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

  const totalSets = exercises.reduce(
    (total, exercise) => total + Math.max(1, Number(exercise.sets) || 1),
    0,
  )

  return (
    <section className="workout-page workout-page--intro">
      <header className="home-greeting">
        <div>
          <h1>
            {firstName
              ? t('workout.greeting', { name: firstName })
              : t('workout.greetingAnonymous')}
          </h1>
          <p>{t('workout.greetingSub')}</p>
        </div>
      </header>

      {/* The plan card: which program is running and how far into it you are. */}
      <article className="plan-card">
        <div className="plan-card__top">
          <div>
            <p className="eyebrow">{t('workout.currentPlan')}</p>
            <h2>{activeProgram.programName}</h2>
          </div>
          <Dumbbell
            aria-hidden="true"
            className="plan-card__glyph"
            size={26}
            strokeWidth={2.1}
          />
        </div>
        {programWeek && activeProgram.durationWeeks ? (
          <>
            <div className="plan-card__rail">
              <span
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((programWeek / activeProgram.durationWeeks) * 100),
                  )}%`,
                }}
              />
            </div>
            <div className="plan-card__foot">
              <span>
                {t('workout.weekOf', {
                  week: programWeek,
                  total: activeProgram.durationWeeks,
                })}
              </span>
              <span>
                {Math.min(
                  100,
                  Math.round((programWeek / activeProgram.durationWeeks) * 100),
                )}
                %
              </span>
            </div>
          </>
        ) : null}
      </article>

      <div className="section-title">
        <h2>{t('workout.todaysWorkout')}</h2>
        <span>{t('workout.dayNumber', { day: selectedDay.day })}</span>
      </div>

      <article className="today-card">
        <div className="today-card__head">
          <div>
            <h3>{selectedDay.name}</h3>
            <p className="today-card__pills">
              <span>
                <ListChecks size={13} strokeWidth={2.4} aria-hidden="true" />
                {t('workout.exerciseCount', { count: exercises.length })}
              </span>
              <span>
                <Clock3 size={13} strokeWidth={2.4} aria-hidden="true" />
                {selectedDay.estimatedTime}
              </span>
            </p>
          </div>
        </div>

        {easyWeek && phase ? (
          <p className="today-intro__notice">
            <ShieldAlert size={15} strokeWidth={2.4} aria-hidden="true" />
            {t('workout.easyWeekNotice', { phase: phase.name })}
          </p>
        ) : null}

        {hasLocationChoice ? (
          <div
            className="location-toggle"
            role="group"
            aria-label={t('workout.trainingLocation')}
          >
            <button
              aria-pressed={location === 'home'}
              className={location === 'home' ? 'is-active' : ''}
              onClick={() => setLocation('home')}
              type="button"
            >
              <Home size={16} strokeWidth={2.4} aria-hidden="true" />
              {t('workout.locationHome')}
            </button>
            <button
              aria-pressed={location === 'gym'}
              className={location === 'gym' ? 'is-active' : ''}
              onClick={() => setLocation('gym')}
              type="button"
            >
              <Building2 size={16} strokeWidth={2.4} aria-hidden="true" />
              {t('workout.locationGym')}
            </button>
          </div>
        ) : null}

        {hasExercises ? (
          <button
            className="workout-primary-button workout-primary-button--large"
            onClick={() => onStart(resolvedDay)}
            type="button"
          >
            <Play size={21} strokeWidth={2.4} aria-hidden="true" />
            {t('workout.start')}
          </button>
        ) : null}
      </article>

      {hasExercises ? (
        <>
          {/* Three numbers about the session ahead, the mockup's summary row. */}
          <div className="summary-grid">
            <div className="summary-stat">
              <ListChecks
                aria-hidden="true"
                className="summary-stat__icon summary-stat__icon--accent"
                size={19}
                strokeWidth={2.2}
              />
              <strong>{exercises.length}</strong>
              <span>{t('workout.statExercises')}</span>
            </div>
            <div className="summary-stat">
              <Layers
                aria-hidden="true"
                className="summary-stat__icon summary-stat__icon--warm"
                size={19}
                strokeWidth={2.2}
              />
              <strong>{totalSets}</strong>
              <span>{t('workout.statWorkingSets')}</span>
            </div>
            <div className="summary-stat">
              <Clock3
                aria-hidden="true"
                className="summary-stat__icon summary-stat__icon--cool"
                size={19}
                strokeWidth={2.2}
              />
              <strong>{selectedDay.estimatedTime.replace(/\s*min\s*$/i, '')}</strong>
              <span>{t('workout.statMinutes')}</span>
            </div>
          </div>

          <div className="section-title">
            <h2>{t('workout.exercisesHeading')}</h2>
            <span>{exercises.length}</span>
          </div>

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
        </>
      ) : (
        <article className="today-empty">
          <p>{t('workout.emptyDay')}</p>
          <button
            className="workout-secondary-button"
            onClick={() => onNavigate('weekly-plan')}
            type="button"
          >
            {t('workout.viewWeeklyPlan')}
          </button>
        </article>
      )}

      <button
        aria-expanded={showPicker}
        className="today-picker__toggle"
        onClick={() => setShowPicker((open) => !open)}
        type="button"
      >
        {showPicker ? t('workout.hideOtherDays') : t('workout.showOtherDays')}
      </button>

      {showPicker ? (
        <div
          className="today-picker"
          role="group"
          aria-label={t('workout.chooseWorkout')}
        >
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
              <small>{t('workout.extraStartsNow')}</small>
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
  displaySettings: WorkoutDisplaySettings
  exerciseLibrary: LibraryExercise[]
  finishError: string | null
  nowTs: number
  onAddSet: () => void
  onAdvance: (log: OptionalSetLogValues) => void
  onBack: () => void
  onExit: () => void
  onFinish: () => void
  onGoToExercise: (index: number) => void
  onGoToSet: (setIndex: number) => void
  onSwapExercise: (variantId: string) => void
  restSignal: number
  session: ActiveWorkoutSession
}

const EMPTY_LOG: OptionalSetLogValues = {
  reps: null,
  timeSeconds: null,
  weightKg: null,
}

function LiveWorkoutScreen({
  displaySettings,
  exerciseLibrary,
  finishError,
  nowTs,
  onAddSet,
  onAdvance,
  onBack,
  onExit,
  onFinish,
  onGoToExercise,
  onGoToSet,
  onSwapExercise,
  restSignal,
  session,
}: LiveWorkoutScreenProps) {
  const t = useT()
  const [listOpen, setListOpen] = useState(false)
  const [swapOpen, setSwapOpen] = useState(false)
  const [showFormGuide, setShowFormGuide] = useState(false)
  const [pendingLog, setPendingLog] = useState<OptionalSetLogValues>(EMPTY_LOG)
  // What the stopwatch counted for this set, offered to the log's Sec field.
  const [timedSeconds, setTimedSeconds] = useState<number | null>(null)

  const exercise = getCurrentExercise(session)
  const exerciseIndex = session.currentExerciseIndex
  const setIndex = session.currentSetIndex
  const setKey = `${exerciseIndex}-${setIndex}`

  // A timed exercise names how long the work lasts ("2 min", "20-40 sec"):
  // the low end of that is the mark the stopwatch chimes on.
  const timed = exercise?.loggingMode === 'duration'
  const goalSeconds = useMemo(() => {
    if (!timed) {
      return null
    }

    return parseDurationTarget(exercise?.targetDuration || exercise?.targetReps)
      .minSeconds
  }, [exercise?.targetDuration, exercise?.targetReps, timed])

  const timer = useLiveTimer({
    exerciseKey: `${exerciseIndex}-${exercise?.exerciseId ?? ''}`,
    goalSeconds,
    restSeconds: exercise?.restSeconds ?? 0,
    timed,
  })

  // The pending values belong to one set only.
  useEffect(() => {
    setPendingLog(EMPTY_LOG)
    setTimedSeconds(null)
  }, [setKey])

  // Holding the stopwatch is how a timed set ends, so what it counted is
  // handed to the log rather than typed in again.
  useEffect(() => {
    if (timer.mode === 'work' && !timer.running && timer.seconds > 0) {
      setTimedSeconds(timer.seconds)
    }
  }, [timer.mode, timer.running, timer.seconds])

  // A saved set sends the ring into its rest, or back to a fresh 0:00.
  const firstRestSignal = useRef(restSignal)
  useEffect(() => {
    if (restSignal === firstRestSignal.current) {
      return
    }

    timer.startRest()
    // Only the signal should retrigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restSignal])

  if (!exercise) {
    // Not the training layout: there is nothing to train, so the app's own
    // nav should stay on screen rather than be covered by a full-screen dock.
    return (
      <section className="workout-page workout-page--intro">
        <article className="today-empty">
          <p>{t('workout.emptySession')}</p>
          <button className="workout-primary-button" onClick={onFinish} type="button">
            <Flag size={19} strokeWidth={2.4} aria-hidden="true" />
            {t('live.finish')}
          </button>
        </article>
      </section>
    )
  }

  const totalSets = exercise.sets.length
  const canSwap = exercise.variants.length > 1
  const isLastSet = setIndex >= totalSets - 1
  const isLastExercise = exerciseIndex >= session.exercises.length - 1
  const atStart = setIndex === 0 && exerciseIndex === 0
  const remainingCount = countRemainingExercises(session.exercises, exerciseIndex)
  const formGuideExercise = findLibraryExerciseForWorkout(
    {
      id: exercise.exerciseId,
      name: exercise.exerciseName,
      equipment: exercise.equipment,
      muscleGroup: exercise.muscleGroup,
    },
    exerciseLibrary,
  )

  /**
   * "End" is one small button in a row of four now, so a stray tap must not
   * silently cut the session short. Only asks when there is something left:
   * ending on the last set is the normal way to finish.
   */
  function endWorkout() {
    const left = getTotalPlannedSets(session) - getDoneSetsCount(session)
    if (left > 0) {
      const confirmed = window.confirm(t('workout.endConfirm', { count: left }))
      if (!confirmed) {
        return
      }
    }

    onFinish()
  }

  return (
    <section className="workout-page workout-page--live">
      <LiveWorkoutHeader
        currentExerciseIndex={exerciseIndex}
        doneSets={getDoneSetsCount(session)}
        elapsedSeconds={getWorkoutElapsedSeconds(session, new Date(nowTs))}
        onExit={onExit}
        totalExercises={session.exercises.length}
        totalSets={getTotalPlannedSets(session)}
        workoutName={session.workoutName}
      />

      {/* The only part of the screen that scrolls. Everything needed between
          sets is in the dock below, which never moves. */}
      <div className="live-body">
        {finishError ? (
          <div className="live-finish-error" role="alert">
            <ShieldAlert size={18} strokeWidth={2.4} aria-hidden="true" />
            <span>{finishError}</span>
          </div>
        ) : null}

        <article className="live-exercise">
          <p className="eyebrow">
            {exercise.muscleGroup || t('live.exerciseFallback')}
          </p>
          <h1>{exercise.exerciseName}</h1>
          <p className="live-exercise__target">
            {t('live.setOf', {
              current: Math.min(setIndex + 1, totalSets),
              total: totalSets,
              target: getExerciseTarget(exercise),
            })}
          </p>

          {formGuideExercise && displaySettings.showExerciseImages !== false ? (
            <div className="live-exercise__media">
              <LiveExerciseImage
                exercise={formGuideExercise}
                onOpenFormGuide={() => setShowFormGuide(true)}
              />

              {/* The two things you reach for while looking at the movement:
                  swap it, or read how to do it. Swap lives here rather than in
                  the dock so the movement and its alternatives sit together,
                  stacked in the mockup's order. */}
              <div className="live-side-actions">
                {canSwap ? (
                  <button
                    aria-label={t('live.swapAria')}
                    className="live-side-action"
                    onClick={() => setSwapOpen(true)}
                    type="button"
                  >
                    <Repeat size={19} strokeWidth={2.2} aria-hidden="true" />
                  </button>
                ) : null}
                {formGuideExercise ? (
                  <button
                    aria-label={t('live.formGuideAria')}
                    className="live-side-action"
                    onClick={() => setShowFormGuide(true)}
                    type="button"
                  >
                    <Info size={19} strokeWidth={2.2} aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Same two actions as text, for when the illustration is off. */}
          {!formGuideExercise || displaySettings.showExerciseImages === false ? (
            <div className="live-exercise__links">
              {canSwap ? (
                <button
                  className="live-exercise__guide"
                  onClick={() => setSwapOpen(true)}
                  type="button"
                >
                  <Repeat size={15} strokeWidth={2.4} aria-hidden="true" />
                  {t('live.swapWithCount', { count: exercise.variants.length })}
                </button>
              ) : null}
              {formGuideExercise ? (
                <button
                  className="live-exercise__guide"
                  onClick={() => setShowFormGuide(true)}
                  type="button"
                >
                  <BookOpen size={15} strokeWidth={2.4} aria-hidden="true" />
                  {t('live.formGuide')}
                </button>
              ) : null}
            </div>
          ) : null}
        </article>

        <LiveRoundStats
          exercise={exercise}
          onToggleTimer={timer.toggle}
          timer={timer}
        />

        {/* Every set of this exercise, so what you lifted two sets ago is one
            glance away rather than a trip into history. */}
        <LiveSetTable
          currentSetIndex={setIndex}
          exercise={exercise}
          onSelectSet={onGoToSet}
        />

        {/* Ending the workout is deliberate, not something to fumble into
            next to Next set, so it sits down here past the sets. */}
        <button
          aria-label={t('live.endAria')}
          className="live-end-workout"
          onClick={endWorkout}
          type="button"
        >
          <Square size={15} strokeWidth={2.6} aria-hidden="true" />
          {t('live.end')}
        </button>
      </div>

      {/* One dock for every control pressed between sets: the set entry, then
          a single row of back, next, skip and the exercise list. Rest is not
          here - its ring above is its own button. */}
      <div className="live-dock">
        <OptionalSetLog
          initialData={seedSetFromPrevious(exercise.sets, setIndex)}
          loggingMode={exercise.loggingMode}
          onAddSet={onAddSet}
          onChange={setPendingLog}
          setKey={setKey}
          timeSecondsHint={timedSeconds}
        />

        <div className="live-dock__row">
          <button
            aria-label={t('live.backOneSet')}
            className="live-dock__back"
            disabled={atStart}
            onClick={onBack}
            type="button"
          >
            <ArrowLeft size={19} strokeWidth={2.4} aria-hidden="true" />
          </button>

          <button
            className="workout-primary-button"
            onClick={() => onAdvance(pendingLog)}
            type="button"
          >
            {isLastSet && isLastExercise ? (
              <>
                <Flag size={20} strokeWidth={2.4} aria-hidden="true" />
                {t('live.finishWorkout')}
              </>
            ) : isLastSet ? (
              <>
                <Check size={20} strokeWidth={2.4} aria-hidden="true" />
                {t('live.nextExercise')}
              </>
            ) : (
              <>
                <Check size={20} strokeWidth={2.4} aria-hidden="true" />
                {t('live.nextSet')}
              </>
            )}
          </button>

          <button
            aria-label={t('live.skipAria')}
            className="live-tool"
            disabled={isLastExercise}
            onClick={() => onGoToExercise(exerciseIndex + 1)}
            type="button"
          >
            <SkipForward size={17} strokeWidth={2.4} aria-hidden="true" />
            <span>{t('live.skip')}</span>
          </button>

          <button
            aria-label={t('live.listAria', { count: remainingCount })}
            aria-pressed={listOpen}
            className={`live-tool${listOpen ? ' live-tool--on' : ''}`}
            onClick={() => setListOpen((open) => !open)}
            type="button"
          >
            <ListChecks size={17} strokeWidth={2.4} aria-hidden="true" />
            <span>{t('live.list', { count: remainingCount })}</span>
          </button>
        </div>
      </div>

      {listOpen ? (
        <RemainingExercises
          currentIndex={exerciseIndex}
          exercises={session.exercises}
          onClose={() => setListOpen(false)}
          onSelect={(index) => {
            onGoToExercise(index)
            setListOpen(false)
          }}
        />
      ) : null}

      {swapOpen && canSwap ? (
        <ExerciseSwapSheet
          currentExerciseId={exercise.exerciseId}
          doneSets={exercise.sets.filter(isDoneSet).length}
          muscleGroup={exercise.muscleGroup}
          onClose={() => setSwapOpen(false)}
          onSelect={(variantId) => {
            onSwapExercise(variantId)
            setSwapOpen(false)
          }}
          variants={exercise.variants}
        />
      ) : null}

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
    return [translateText('guidance.programWeek', { week: programWeek })]
  }

  // The phase's own wording comes from the installed program's JSON, so it
  // stays in whatever language that program was written in; only the labels
  // around it are translated.
  return [
    translateText('guidance.weekPhase', {
      week: programWeek,
      phase: phase.name,
      guidance: phase.volumeGuidance,
    }),
    phase.rirGuidance,
    ...phase.priorities.map((priority) =>
      translateText('guidance.priority', { value: priority }),
    ),
    ...(phase.restrictions ?? []).map((restriction) =>
      translateText('guidance.restriction', { value: restriction }),
    ),
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

/**
 * Seeds the log inputs for the set about to be worked.
 *
 * Reps are left blank because they genuinely change set to set, but the weight
 * on the bar usually does not: carrying the last one forward within the same
 * exercise saves retyping it for every set. An untouched seed is never written
 * back on its own -- `advance` only stores what the inputs report.
 */
function seedSetFromPrevious(
  sets: ActiveSet[],
  setIndex: number,
): ActiveSet | undefined {
  const current = sets[setIndex]
  if (!current || current.weightKg !== null) {
    return current
  }

  for (let index = setIndex - 1; index >= 0; index -= 1) {
    const previous = sets[index]
    if (previous && previous.weightKg !== null) {
      return { ...current, weightKg: previous.weightKg }
    }
  }

  return current
}
