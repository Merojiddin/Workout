import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CalendarCheck2,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flag,
  Layers,
  ListChecks,
  Play,
  Plus,
  Printer,
  Save,
  SkipForward,
  Target,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ActiveExerciseCard } from '../components/ActiveExerciseCard'
import { AssistantCard } from '../components/AssistantCard'
import { ExerciseDetailModal } from '../components/ExerciseDetailModal'
import { ExerciseSummaryCard } from '../components/ExerciseSummaryCard'
import { LiveWorkoutHeader } from '../components/LiveWorkoutHeader'
import { RestTimer } from '../components/RestTimer'
import { SetLogger, type SetLoggerData } from '../components/SetLogger'
import { UnfinishedWorkoutPrompt } from '../components/UnfinishedWorkoutPrompt'
import { WorkoutFinishSummary } from '../components/WorkoutFinishSummary'
import { PrintableTodayWorkout } from '../print/PrintableTodayWorkout'
import {
  findPreviousExercisePerformance,
  getWorkoutSessions,
  type WorkoutSession,
} from '../data/workoutSessions'
import type { LibraryExercise } from '../data/exerciseLibrary'
import type { WorkoutDay } from '../data/workoutPlan'
import {
  clearActiveWorkoutSession,
  completeActiveWorkoutSession,
  createActiveWorkoutSession,
  createEmptySet,
  getActiveWorkoutSession,
  getBestPerformanceSummary,
  getCompletedSetsCount,
  getCurrentExercise,
  getSuggestedSetTarget,
  getTotalPlannedSets,
  getWhatToDoNext,
  getWorkoutDuration,
  isLoggedSet,
  saveActiveWorkoutSession,
  updateActiveSet,
  type ActiveExercise,
  type ActiveWorkoutSession,
} from '../utils/liveWorkoutUtils'
import { getProgressionSuggestion } from '../utils/progressionUtils'
import { getTodayProgressionFocus } from '../utils/progressionUtils'
import {
  getLiveWorkoutCoachMessage,
  getTodayWorkoutAdvice,
} from '../utils/coachUtils'
import {
  findLibraryExerciseForWorkout,
  getEffectiveExerciseLibrary,
  getWorkoutDisplaySettings,
  getWorkoutForDate,
} from '../utils/settingsUtils'
import type { WorkoutDisplaySettings } from '../utils/mediaUtils'
import { printElement } from '../utils/printUtils'
import { useAuth } from '../context/AuthContext'
import * as workoutService from '../services/workoutService'
import type { PageId } from '../types/navigation'
import type { StandaloneWorkout } from '../types/workoutProgram'
import {
  getActiveWorkoutProgram,
  type ActiveWorkoutProgram,
} from '../utils/activeWorkoutProgram'

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
  const previousSessions = useMemo(() => getWorkoutSessions(), [])
  const effectiveExerciseLibrary = useMemo(
    () => getEffectiveExerciseLibrary() as LibraryExercise[],
    [],
  )
  const displaySettings = useMemo(
    () => getWorkoutDisplaySettings() as WorkoutDisplaySettings,
    [],
  )

  const [session, setSession] = useState<ActiveWorkoutSession | null>(() =>
    getActiveWorkoutSession(),
  )
  const [screen, setScreen] = useState<Screen>(() => {
    const existing = getActiveWorkoutSession()
    return existing && !existing.completed ? 'prompt' : 'intro'
  })
  const [selectedDay, setSelectedDay] = useState<WorkoutDay>(todayWorkout)
  const [showDayPicker, setShowDayPicker] = useState(false)
  const [finishedSession, setFinishedSession] = useState<WorkoutSession | null>(
    null,
  )
  const [showFormGuide, setShowFormGuide] = useState(false)
  const [restSignal, setRestSignal] = useState(0)
  const [nowTs, setNowTs] = useState(() => Date.now())

  // Keep the live duration ticking while training.
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
    setShowFormGuide(false)
    setScreen('active')
  }

  function startScheduledWorkout(day: WorkoutDay) {
    beginWorkout(createActiveWorkoutSession(day))
  }

  function startStandaloneWorkout(workout: StandaloneWorkout) {
    beginWorkout(
      createActiveWorkoutSession(workout, {
        sessionType: 'standalone',
        standaloneWorkoutId: workout.id,
      }),
    )
  }

  function continueWorkout() {
    setNowTs(Date.now())
    setScreen('active')
  }

  function discardWorkout() {
    clearActiveWorkoutSession()
    setSession(null)
    setScreen('intro')
  }

  function saveSet(data: SetLoggerData) {
    if (!session) {
      return
    }

    const exerciseIndex = session.currentExerciseIndex
    const setIndex = session.currentSetIndex
    const completed =
      (data.reps !== null && data.reps > 0) ||
      (data.timeSeconds !== null && data.timeSeconds > 0)
    const updated = updateActiveSet(session, exerciseIndex, setIndex, {
      reps: data.reps,
      timeSeconds: data.timeSeconds,
      weightKg: data.weightKg,
      rpe: data.rpe,
      painLevel: data.painLevel,
      notes: data.notes,
      completedAt: completed ? new Date().toISOString() : null,
    })

    commit({ ...updated, currentSetIndex: setIndex + 1 })
    setRestSignal((signal) => signal + 1)
  }

  function skipSet() {
    if (!session) {
      return
    }
    commit({ ...session, currentSetIndex: session.currentSetIndex + 1 })
  }

  function moveSet(direction: -1 | 1) {
    if (!session) {
      return
    }

    const exercise = getCurrentExercise(session)
    const maxIndex = exercise ? exercise.sets.length : 0
    const nextIndex = Math.min(
      Math.max(session.currentSetIndex + direction, 0),
      maxIndex,
    )
    commit({ ...session, currentSetIndex: nextIndex })
  }

  function moveExercise(direction: -1 | 1) {
    if (!session) {
      return
    }

    const nextIndex = Math.min(
      Math.max(session.currentExerciseIndex + direction, 0),
      session.exercises.length - 1,
    )
    const target = session.exercises[nextIndex]
    commit({
      ...session,
      currentExerciseIndex: nextIndex,
      currentSetIndex: resumeSetIndex(target),
    })
  }

  function addExtraSet() {
    if (!session) {
      return
    }

    const exerciseIndex = session.currentExerciseIndex
    const exercise = session.exercises[exerciseIndex]
    if (!exercise) {
      return
    }

    const newIndex = exercise.sets.length
    const next: ActiveWorkoutSession = {
      ...session,
      currentSetIndex: newIndex,
      exercises: session.exercises.map((item, index) =>
        index === exerciseIndex
          ? { ...item, sets: [...item.sets, createEmptySet(newIndex + 1)] }
          : item,
      ),
    }
    commit(next)
  }

  function repeatExercise() {
    if (!session) {
      return
    }
    commit({ ...session, currentSetIndex: 0 })
  }

  function finishWorkout() {
    if (!session) {
      return
    }

    const finished = completeActiveWorkoutSession(session)
    // Local save already happened above; push to the cloud in the background.
    void workoutService.saveWorkoutSession(user, finished).catch(() => undefined)
    setFinishedSession(finished)
    setSession(null)
    setScreen('finished')
  }

  // -- Finished screen -------------------------------------------------------
  if (screen === 'finished' && finishedSession) {
    return (
      <section className="workout-page">
        <WorkoutFinishSummary
          onDashboard={() => onNavigate('dashboard')}
          onProgress={() => onNavigate('progress')}
          onWeeklyReview={() => onNavigate('weekly-review')}
          session={finishedSession}
        />
      </section>
    )
  }

  // -- Unfinished workout recovery ------------------------------------------
  if (screen === 'prompt' && session) {
    return (
      <section className="workout-page">
        <UnfinishedWorkoutPrompt
          onContinue={continueWorkout}
          onDiscard={discardWorkout}
          session={session}
        />
      </section>
    )
  }

  // -- Live workout ----------------------------------------------------------
  if (screen === 'active' && session) {
    return (
      <LiveWorkoutScreen
        exerciseLibrary={effectiveExerciseLibrary}
        onAddExtraSet={addExtraSet}
        onFinish={finishWorkout}
        onMoveExercise={moveExercise}
        onMoveSet={moveSet}
        onRepeatExercise={repeatExercise}
        onSaveSet={saveSet}
        onSkipSet={skipSet}
        onViewFormGuide={() => setShowFormGuide(true)}
        previousSessions={previousSessions}
        restSignal={restSignal}
        session={session}
        showFormGuide={showFormGuide}
        onCloseFormGuide={() => setShowFormGuide(false)}
        nowTs={nowTs}
        displaySettings={displaySettings}
      />
    )
  }

  // -- Pre-workout intro -----------------------------------------------------
  return (
    <PreWorkoutScreen
      activeProgram={activeProgram}
      exerciseLibrary={effectiveExerciseLibrary}
      onNavigate={onNavigate}
      onSelectDay={(day) => {
        setSelectedDay(day)
        setShowDayPicker(false)
      }}
      onStart={() => startScheduledWorkout(selectedDay)}
      onStartStandalone={startStandaloneWorkout}
      onToggleDayPicker={() => setShowDayPicker((open) => !open)}
      plan={plan}
      previousSessions={previousSessions}
      selectedDay={selectedDay}
      showDayPicker={showDayPicker}
    />
  )
}

// ---------------------------------------------------------------------------
// Pre-workout intro screen
// ---------------------------------------------------------------------------

interface PreWorkoutScreenProps {
  activeProgram: ActiveWorkoutProgram
  exerciseLibrary: readonly LibraryExercise[]
  onNavigate: (page: PageId) => void
  onSelectDay: (day: WorkoutDay) => void
  onStart: () => void
  onStartStandalone: (workout: StandaloneWorkout) => void
  onToggleDayPicker: () => void
  plan: WorkoutDay[]
  previousSessions: WorkoutSession[]
  selectedDay: WorkoutDay
  showDayPicker: boolean
}

function PreWorkoutScreen({
  activeProgram,
  exerciseLibrary,
  onNavigate,
  onSelectDay,
  onStart,
  onStartStandalone,
  onToggleDayPicker,
  plan,
  previousSessions,
  selectedDay,
  showDayPicker,
}: PreWorkoutScreenProps) {
  const exercises = Array.isArray(selectedDay?.exercises)
    ? selectedDay.exercises
    : []
  const totalSets = exercises.reduce(
    (total, exercise) => total + Math.max(1, Number(exercise?.sets) || 1),
    0,
  )
  const lastCompleted = previousSessions.find(
    (item) => item.workoutDayId === selectedDay.day,
  )
  const hasExercises = exercises.length > 0
  const coachAdvice = getTodayWorkoutAdvice({
    activeProgram,
    library: exerciseLibrary,
    todayWorkout: selectedDay,
    sessions: previousSessions,
    progressionSuggestions: getTodayProgressionFocus(
      previousSessions,
      selectedDay.exercises,
      4,
      { library: exerciseLibrary },
    ),
  })

  return (
    <section className="workout-page">
      <header className="workout-intro dashboard-card">
        <p className="eyebrow">Today's Workout</p>
        <h1>
          Day {selectedDay.day} - {selectedDay.name}
        </h1>
        <p>
          A guided, set-by-set session. Log each set, follow the rest timer, and
          keep your posture safe.
        </p>

        <div className="workout-intro__stats">
          <div>
            <Clock3 size={20} strokeWidth={2.4} aria-hidden="true" />
            <span>Estimated time</span>
            <strong>{selectedDay.estimatedTime}</strong>
          </div>
          <div>
            <ListChecks size={20} strokeWidth={2.4} aria-hidden="true" />
            <span>Exercises</span>
            <strong>{exercises.length}</strong>
          </div>
          <div>
            <Layers size={20} strokeWidth={2.4} aria-hidden="true" />
            <span>Planned sets</span>
            <strong>{totalSets}</strong>
          </div>
          <div>
            <Target size={20} strokeWidth={2.4} aria-hidden="true" />
            <span>Main muscles</span>
            <strong>{(selectedDay.focus ?? []).join(', ') || 'General'}</strong>
          </div>
          <div>
            <CalendarCheck2 size={20} strokeWidth={2.4} aria-hidden="true" />
            <span>Previous time completed</span>
            <strong>
              {lastCompleted ? formatDate(lastCompleted.date) : 'Not logged yet'}
            </strong>
          </div>
        </div>

        <article className="preworkout-coach-card">
          <p className="eyebrow">Coach says</p>
          <p>{buildPreWorkoutCoachMessage(coachAdvice)}</p>
        </article>

        {hasExercises ? (
          <button
            className="workout-primary-button"
            onClick={onStart}
            type="button"
          >
            <Play size={21} strokeWidth={2.4} aria-hidden="true" />
            Start Workout
          </button>
        ) : (
          <button
            className="workout-primary-button"
            onClick={() => onNavigate('plan-editor')}
            type="button"
          >
            <Dumbbell size={21} strokeWidth={2.4} aria-hidden="true" />
            Edit Plan
          </button>
        )}

        <div className="workout-intro__secondary">
          <button
            className="workout-secondary-button"
            onClick={() => onNavigate('dashboard')}
            type="button"
          >
            <SkipForward size={19} strokeWidth={2.4} aria-hidden="true" />
            Skip this workout
          </button>
          <button
            className="workout-secondary-button"
            onClick={onToggleDayPicker}
            type="button"
          >
            <CalendarRange size={19} strokeWidth={2.4} aria-hidden="true" />
            Choose different workout day
          </button>
        </div>

        {showDayPicker ? (
          <div className="day-picker" role="group" aria-label="Choose a workout day">
            {plan.map((day) => (
              <button
                aria-pressed={day.day === selectedDay.day}
                className={`day-picker__button${
                  day.day === selectedDay.day ? ' day-picker__button--active' : ''
                }`}
                key={day.day}
                onClick={() => onSelectDay(day)}
                type="button"
              >
                <strong>Day {day.day}</strong>
                <span>{day.name}</span>
              </button>
            ))}
          </div>
        ) : null}

        <button
          className="workout-secondary-button"
          onClick={() => printElement('today-workout-print-source')}
          type="button"
        >
          <Printer size={19} strokeWidth={2.4} aria-hidden="true" />
          Print Today's Workout
        </button>
      </header>

      {activeProgram.standaloneWorkouts.length > 0 ? (
        <section
          aria-labelledby="extra-workouts-title"
          className="extra-workouts dashboard-card"
        >
          <div className="extra-workouts__heading">
            <div>
              <p className="eyebrow">Optional sessions</p>
              <h2 id="extra-workouts-title">Extra Workouts</h2>
              <p>
                Use these when their recommendation fits. They stay separate
                from the Monday-Sunday schedule.
              </p>
            </div>
            <Dumbbell size={25} strokeWidth={2.3} aria-hidden="true" />
          </div>

          <div className="extra-workouts__grid">
            {activeProgram.standaloneWorkouts.map((workout) => (
              <article className="extra-workout-card" key={workout.id}>
                <div>
                  <p className="eyebrow">Standalone workout</p>
                  <h3>{workout.name}</h3>
                  <p className="extra-workout-card__description">
                    {workout.description}
                  </p>
                </div>

                <div className="extra-workout-card__meta">
                  <div>
                    <span>Estimated time</span>
                    <strong>{workout.estimatedTime}</strong>
                  </div>
                  <div>
                    <span>Exercises</span>
                    <strong>{workout.exercises.length}</strong>
                  </div>
                </div>

                <div className="extra-workout-card__recommendation">
                  <strong>Recommended use</strong>
                  <p>{workout.recommendedUse}</p>
                </div>

                <div>
                  <strong className="extra-workout-card__label">Focus</strong>
                  <div className="tag-row">
                    {workout.focus.map((focus) => (
                      <span className="tag tag--category" key={focus}>
                        {focus}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  className="workout-primary-button"
                  onClick={() => onStartStandalone(workout)}
                  type="button"
                >
                  <Play size={21} strokeWidth={2.4} aria-hidden="true" />
                  Start {workout.name}
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className="print-source" id="today-workout-print-source" aria-hidden="true">
        <PrintableTodayWorkout
          generatedAt={new Date().toISOString()}
          program={activeProgram}
          workout={selectedDay}
        />
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Live workout screen
// ---------------------------------------------------------------------------

interface LiveWorkoutScreenProps {
  exerciseLibrary: readonly LibraryExercise[]
  onAddExtraSet: () => void
  onCloseFormGuide: () => void
  onFinish: () => void
  onMoveExercise: (direction: -1 | 1) => void
  onMoveSet: (direction: -1 | 1) => void
  onRepeatExercise: () => void
  onSaveSet: (data: SetLoggerData) => void
  onSkipSet: () => void
  onViewFormGuide: () => void
  previousSessions: WorkoutSession[]
  restSignal: number
  session: ActiveWorkoutSession
  showFormGuide: boolean
  nowTs: number
  displaySettings: WorkoutDisplaySettings
}

function LiveWorkoutScreen({
  exerciseLibrary,
  onAddExtraSet,
  onCloseFormGuide,
  onFinish,
  onMoveExercise,
  onMoveSet,
  onRepeatExercise,
  onSaveSet,
  onSkipSet,
  onViewFormGuide,
  previousSessions,
  restSignal,
  session,
  showFormGuide,
  nowTs,
  displaySettings,
}: LiveWorkoutScreenProps) {
  // Sticky action bar <-> RestTimer / SetLogger communication.
  const [isResting, setIsResting] = useState(false)
  const [restSkipSignal, setRestSkipSignal] = useState(0)
  const [restExtendSignal, setRestExtendSignal] = useState(0)
  const [saveSignal, setSaveSignal] = useState(0)

  const exercise = getCurrentExercise(session)

  if (!exercise) {
    return (
      <section className="workout-page">
        <article className="dashboard-card">
          <p className="eyebrow">Live Workout</p>
          <h1>No active exercise</h1>
          <p className="card-copy">
            This workout has no exercises to log. Finish to save what you have.
          </p>
          <button
            className="workout-primary-button"
            onClick={onFinish}
            type="button"
          >
            <Flag size={19} strokeWidth={2.4} aria-hidden="true" />
            Finish Workout
          </button>
        </article>
      </section>
    )
  }

  const totalExercises = session.exercises.length
  const currentSetIndex = session.currentSetIndex
  const inSummary = currentSetIndex >= exercise.sets.length
  const isLastExercise = session.currentExerciseIndex >= totalExercises - 1

  const previousPerformance = findPreviousExercisePerformance(
    {
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
    },
    previousSessions,
    { library: exerciseLibrary },
  )
  const bestSummary = getBestPerformanceSummary(
    {
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
    },
    previousSessions,
    { library: exerciseLibrary },
  )
  const progressionSuggestion = getProgressionSuggestion(
    {
      id: exercise.exerciseId,
      name: exercise.exerciseName,
      repRange: exercise.targetReps || undefined,
      duration: exercise.targetDuration || undefined,
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment,
      sets: exercise.targetSets,
    },
    previousSessions,
    { library: exerciseLibrary },
  )
  const suggestedTarget = getSuggestedSetTarget(
    exercise,
    previousPerformance,
    progressionSuggestion,
    Math.min(currentSetIndex, Math.max(exercise.sets.length - 1, 0)),
  )
  const assistant = getWhatToDoNext(exercise)
  const formGuideExercise = findLibraryExerciseForWorkout({
    id: exercise.exerciseId,
    name: exercise.exerciseName,
    equipment: exercise.equipment,
    muscleGroup: exercise.muscleGroup,
  })

  const activeSet = exercise.sets[currentSetIndex]
  const liveCoach = getLiveWorkoutCoachMessage(activeSet)

  return (
    <section className="workout-page workout-page--live">
      <LiveWorkoutHeader
        completedSets={getCompletedSetsCount(session)}
        currentExerciseIndex={session.currentExerciseIndex}
        duration={getWorkoutDuration(session, new Date(nowTs))}
        nextExerciseName={
          session.exercises[session.currentExerciseIndex + 1]?.exerciseName ?? null
        }
        totalExercises={totalExercises}
        totalSets={getTotalPlannedSets(session)}
        sessionType={session.sessionType}
        workoutName={session.workoutName}
      />

      <div className="live-coach-row">
        <AssistantCard assistant={assistant} />

        <article className={`assistant-card assistant-card--${liveCoach.tone}`}>
          <span className="assistant-card__icon" aria-hidden="true">
            <Brain size={18} strokeWidth={2.4} />
          </span>
          <div>
            <p className="eyebrow">Coach says</p>
            <p className="assistant-card__message">{liveCoach.message}</p>
          </div>
        </article>
      </div>

      <div className="workout-mode-grid">
        <div className="live-primary-column">
          <ActiveExerciseCard
            bestSummary={bestSummary}
            currentSetIndex={inSummary ? exercise.sets.length - 1 : currentSetIndex}
            displaySettings={displaySettings}
            exercise={exercise}
            exerciseNumber={session.currentExerciseIndex + 1}
            hasFormGuide={Boolean(formGuideExercise)}
            libraryExercise={formGuideExercise}
            onViewFormGuide={onViewFormGuide}
            previousPerformance={previousPerformance}
            suggestedTarget={suggestedTarget}
            totalExercises={totalExercises}
          />

          {inSummary ? (
            <ExerciseSummaryCard
              exerciseResult={exercise}
              isLastExercise={isLastExercise}
              onAddExtraSet={onAddExtraSet}
              onNextExercise={isLastExercise ? onFinish : () => onMoveExercise(1)}
              onRepeatExercise={onRepeatExercise}
            />
          ) : (
            <SetLogger
              initialData={activeSet}
              key={`${exercise.exerciseId}-${currentSetIndex}`}
              loggingMode={exercise.loggingMode}
              onSave={onSaveSet}
              onSkip={onSkipSet}
              saveSignal={saveSignal}
              setNumber={currentSetIndex + 1}
              targetDuration={exercise.targetDuration}
            />
          )}
        </div>

        <aside className="workout-side-stack">
          <RestTimer
            autoStartSignal={restSignal}
            extendSignal={restExtendSignal}
            onRunningChange={setIsResting}
            restSeconds={exercise.restSeconds || 90}
            skipSignal={restSkipSignal}
          />

          <div className="workout-control-panel dashboard-card">
            <div className="control-grid">
              <button
                className="workout-secondary-button"
                disabled={currentSetIndex <= 0}
                onClick={() => onMoveSet(-1)}
                type="button"
              >
                <ChevronLeft size={18} strokeWidth={2.4} aria-hidden="true" />
                Previous Set
              </button>
              <button
                className="workout-secondary-button"
                disabled={inSummary}
                onClick={() => onMoveSet(1)}
                type="button"
              >
                <ChevronRight size={18} strokeWidth={2.4} aria-hidden="true" />
                Next Set
              </button>
              <button
                className="workout-secondary-button"
                disabled={session.currentExerciseIndex <= 0}
                onClick={() => onMoveExercise(-1)}
                type="button"
              >
                <ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />
                Previous Exercise
              </button>
              <button
                className="workout-secondary-button"
                disabled={isLastExercise}
                onClick={() => onMoveExercise(1)}
                type="button"
              >
                <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
                Next Exercise
              </button>
            </div>
            <button
              className="workout-primary-button"
              onClick={onFinish}
              type="button"
            >
              <Flag size={19} strokeWidth={2.4} aria-hidden="true" />
              Finish Workout
            </button>
          </div>
        </aside>
      </div>

      <div
        aria-label="Workout quick actions"
        className="live-sticky-bar"
        role="toolbar"
      >
        {isResting ? (
          <>
            <button
              className="live-sticky-bar__button"
              onClick={() => setRestSkipSignal((signal) => signal + 1)}
              type="button"
            >
              <SkipForward size={19} strokeWidth={2.4} aria-hidden="true" />
              Skip Rest
            </button>
            <button
              className="live-sticky-bar__button"
              onClick={() => setRestExtendSignal((signal) => signal + 1)}
              type="button"
            >
              <Plus size={19} strokeWidth={2.4} aria-hidden="true" />
              Add 30 sec
            </button>
            <button
              className="live-sticky-bar__button live-sticky-bar__button--primary"
              onClick={() => setRestSkipSignal((signal) => signal + 1)}
              type="button"
            >
              Next Set
              <ChevronRight size={19} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </>
        ) : inSummary ? (
          <>
            <button
              className="live-sticky-bar__button"
              disabled={currentSetIndex <= 0}
              onClick={() => onMoveSet(-1)}
              type="button"
            >
              <ChevronLeft size={19} strokeWidth={2.4} aria-hidden="true" />
              Previous
            </button>
            <button
              className="live-sticky-bar__button live-sticky-bar__button--primary"
              onClick={isLastExercise ? onFinish : () => onMoveExercise(1)}
              type="button"
            >
              {isLastExercise ? (
                <>
                  <Flag size={19} strokeWidth={2.4} aria-hidden="true" />
                  Finish Workout
                </>
              ) : (
                <>
                  Next Exercise
                  <ArrowRight size={19} strokeWidth={2.4} aria-hidden="true" />
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <button
              className="live-sticky-bar__button"
              disabled={currentSetIndex <= 0}
              onClick={() => onMoveSet(-1)}
              type="button"
            >
              <ChevronLeft size={19} strokeWidth={2.4} aria-hidden="true" />
              Previous
            </button>
            <button
              className="live-sticky-bar__button live-sticky-bar__button--primary"
              onClick={() => setSaveSignal((signal) => signal + 1)}
              type="button"
            >
              <Save size={19} strokeWidth={2.4} aria-hidden="true" />
              Save Set
            </button>
            <button
              className="live-sticky-bar__button"
              onClick={() => onMoveSet(1)}
              type="button"
            >
              Next
              <ChevronRight size={19} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {showFormGuide && formGuideExercise ? (
        <ExerciseDetailModal
          exercise={formGuideExercise}
          onClose={onCloseFormGuide}
        />
      ) : null}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resumeSetIndex(exercise: ActiveExercise | undefined): number {
  if (!exercise || !Array.isArray(exercise.sets)) {
    return 0
  }

  const firstUnlogged = exercise.sets.findIndex((set) => !isLoggedSet(set))
  return firstUnlogged === -1 ? exercise.sets.length : firstUnlogged
}

function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return 'Not logged yet'
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

function buildPreWorkoutCoachMessage(advice: ReturnType<typeof getTodayWorkoutAdvice>) {
  const parts = []
  if (advice.pushExercises.length > 0) {
    parts.push(`Push ${advice.pushExercises.slice(0, 2).join(' and ')} today`)
  }
  if (advice.controlExercises.length > 0) {
    parts.push(`Keep ${advice.controlExercises.slice(0, 2).join(' and ')} controlled`)
  }
  if (advice.postureCautionExercises.length > 0) {
    parts.push('Watch lower-back arch')
  }

  return parts.length > 0 ? `${parts.join('. ')}.` : advice.message
}
