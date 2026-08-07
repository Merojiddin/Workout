import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Building2,
  CalendarCheck2,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flag,
  Home,
  Layers,
  ListChecks,
  Play,
  Plus,
  Printer,
  Save,
  ShieldCheck,
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
import type {
  Exercise,
  TrainingLocation,
  WorkoutDay,
} from '../data/workoutPlan'
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
  type SuggestedSetTarget,
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
import type {
  StandaloneWorkout,
  WorkoutProgramPhase,
} from '../types/workoutProgram'
import {
  getActiveWorkoutProgram,
  type ActiveWorkoutProgram,
} from '../utils/activeWorkoutProgram'
import {
  applyExercisePhaseTarget,
  getDefaultVariantIds,
  getExerciseSlotKey,
  getExerciseVariantsForLocation,
  resolveWorkoutDefinition,
  workoutHasChoices,
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
  const [programWeek, setProgramWeek] = useState<number | null>(() =>
    getInitialProgramWeek(activeProgram),
  )

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

  function startScheduledWorkout(day: WorkoutDay, selectedProgramWeek: number | null) {
    beginWorkout(
      createActiveWorkoutSession(day, {
        programId: activeProgram.programId,
        programVersion: activeProgram.programVersion,
        programWeek: selectedProgramWeek,
        progressionMode: getProgramWeekProgressionMode(
          activeProgram,
          selectedProgramWeek,
        ),
        workoutGuidance: getProgramWeekGuidance(
          activeProgram,
          selectedProgramWeek,
        ),
      }),
    )
  }

  function startStandaloneWorkout(
    workout: StandaloneWorkout,
    selectedProgramWeek: number | null,
  ) {
    beginWorkout(
      createActiveWorkoutSession(workout, {
        sessionType: 'standalone',
        standaloneWorkoutId: workout.id,
        programId: activeProgram.programId,
        programVersion: activeProgram.programVersion,
        programWeek: selectedProgramWeek,
        progressionMode: workout.progressionMode ?? 'standard',
        workoutGuidance: workout.rules ?? [],
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
      rir: data.rir,
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
      onProgramWeekChange={setProgramWeek}
      onStart={startScheduledWorkout}
      onStartStandalone={startStandaloneWorkout}
      onToggleDayPicker={() => setShowDayPicker((open) => !open)}
      plan={plan}
      previousSessions={previousSessions}
      programWeek={programWeek}
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
  onProgramWeekChange: (week: number | null) => void
  onSelectDay: (day: WorkoutDay) => void
  onStart: (workout: WorkoutDay, programWeek: number | null) => void
  onStartStandalone: (
    workout: StandaloneWorkout,
    programWeek: number | null,
  ) => void
  onToggleDayPicker: () => void
  plan: WorkoutDay[]
  previousSessions: WorkoutSession[]
  programWeek: number | null
  selectedDay: WorkoutDay
  showDayPicker: boolean
}

function PreWorkoutScreen({
  activeProgram,
  exerciseLibrary,
  onNavigate,
  onProgramWeekChange,
  onSelectDay,
  onStart,
  onStartStandalone,
  onToggleDayPicker,
  plan,
  previousSessions,
  programWeek,
  selectedDay,
  showDayPicker,
}: PreWorkoutScreenProps) {
  const [scheduledLocation, setScheduledLocation] =
    useState<TrainingLocation>('home')
  const [scheduledSelections, setScheduledSelections] = useState<
    Record<string, WorkoutExerciseSelections>
  >({})
  const scheduledSelectionKey = `${selectedDay.day}:${scheduledLocation}`
  const selectedWorkoutSelections =
    scheduledSelections[scheduledSelectionKey] ??
    createDefaultWorkoutSelections(selectedDay, scheduledLocation)
  const resolvedSelectedDay = resolveWorkoutDefinition(selectedDay, {
    location: scheduledLocation,
    programWeek,
    progressionPhases: activeProgram.progressionPhases,
    selections: selectedWorkoutSelections,
  })
  const exercises = resolvedSelectedDay.exercises
  const totalSets = exercises.reduce(
    (total, exercise) => total + Math.max(1, Number(exercise?.sets) || 1),
    0,
  )
  const lastCompleted = previousSessions.find(
    (item) => item.workoutDayId === selectedDay.day,
  )
  const hasExercises = exercises.length > 0
  const currentPhase = activeProgram.progressionPhases.find((phase) =>
    programWeek ? phase.weeks.includes(programWeek) : false,
  )
  const reducedVolumePhase = Boolean(currentPhase?.setVolumeMultiplier)
  const coachAdvice = getTodayWorkoutAdvice({
    activeProgram,
    library: exerciseLibrary,
    todayWorkout: resolvedSelectedDay,
    sessions: previousSessions,
    progressionSuggestions: reducedVolumePhase
      ? []
      : getTodayProgressionFocus(
          previousSessions,
          resolvedSelectedDay.exercises,
          4,
          { library: exerciseLibrary },
        ),
  })

  function updateScheduledSelections(next: WorkoutExerciseSelections) {
    setScheduledSelections((current) => ({
      ...current,
      [scheduledSelectionKey]: next,
    }))
  }

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

        {activeProgram.durationWeeks && programWeek ? (
          <div className="program-week-selector">
            <label htmlFor="today-program-week">
              <span>Program week</span>
              <select
                id="today-program-week"
                onChange={(event) =>
                  onProgramWeekChange(Number(event.target.value))
                }
                value={programWeek}
              >
                {Array.from(
                  { length: activeProgram.durationWeeks },
                  (_, index) => index + 1,
                ).map((week) => (
                  <option key={week} value={week}>
                    Week {week}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <strong>{currentPhase?.name ?? `Week ${programWeek}`}</strong>
              <span>
                {currentPhase
                  ? `${currentPhase.volumeGuidance} ${currentPhase.rirGuidance}`
                  : 'The selected week is saved with this workout.'}
              </span>
            </div>
          </div>
        ) : null}

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
          <p>
            {reducedVolumePhase && currentPhase
              ? `${currentPhase.name}: ${currentPhase.volumeGuidance} ${currentPhase.rirGuidance} Do not chase load or rep records this week.`
              : buildPreWorkoutCoachMessage(coachAdvice)}
          </p>
        </article>

        <WorkoutChoiceEditor
          idPrefix={`scheduled-${selectedDay.day}`}
          location={scheduledLocation}
          onLocationChange={setScheduledLocation}
          onSelectionsChange={updateScheduledSelections}
          programWeek={programWeek}
          progressionPhases={activeProgram.progressionPhases}
          selections={selectedWorkoutSelections}
          workout={selectedDay}
        />

        {hasExercises ? (
          <button
            className="workout-primary-button"
            disabled={
              !isWorkoutSelectionValid(
                selectedDay,
                scheduledLocation,
                selectedWorkoutSelections,
              )
            }
            onClick={() => onStart(resolvedSelectedDay, programWeek)}
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
              <StandaloneWorkoutCard
                key={workout.id}
                onStart={onStartStandalone}
                programWeek={programWeek}
                workout={workout}
              />
            ))}
          </div>
        </section>
      ) : null}

      <div className="print-source" id="today-workout-print-source" aria-hidden="true">
        <PrintableTodayWorkout
          generatedAt={new Date().toISOString()}
          program={activeProgram}
          workout={resolvedSelectedDay}
        />
      </div>
    </section>
  )
}

interface WorkoutChoiceDefinition {
  exercises: Exercise[]
  name: string
}

interface WorkoutChoiceEditorProps {
  idPrefix: string
  location: TrainingLocation
  onLocationChange: (location: TrainingLocation) => void
  onSelectionsChange: (selections: WorkoutExerciseSelections) => void
  programWeek: number | null
  progressionPhases?: readonly WorkoutProgramPhase[]
  selections: WorkoutExerciseSelections
  workout: WorkoutChoiceDefinition
}

function WorkoutChoiceEditor({
  idPrefix,
  location,
  onLocationChange,
  onSelectionsChange,
  programWeek,
  progressionPhases = [],
  selections,
  workout,
}: WorkoutChoiceEditorProps) {
  if (!workoutHasChoices(workout)) {
    return null
  }

  const hasLocationChoices = workout.exercises.some((exercise) =>
    Boolean(exercise.alternatives),
  )
  const configurableExercises = workout.exercises
    .map((exercise, index) => ({ exercise, index }))
    .filter(({ exercise }) => Boolean(exercise.alternatives) || exercise.optional)

  function updateSlot(
    exercise: Exercise,
    index: number,
    update: Partial<WorkoutExerciseSelections[string]>,
  ) {
    const key = getExerciseSlotKey(exercise, index)
    onSelectionsChange({
      ...selections,
      [key]: {
        ...selections[key],
        ...update,
      },
    })
  }

  function selectVariant(
    exercise: Exercise,
    index: number,
    variantId: string,
    checked: boolean,
  ) {
    const key = getExerciseSlotKey(exercise, index)
    const currentIds = selections[key]?.variantIds ?? []
    if (exercise.selectionMode !== 'multiple') {
      updateSlot(exercise, index, { variantIds: [variantId] })
      return
    }

    const maximum = getMaximumSelections(exercise, location)
    const nextIds = checked
      ? [...new Set([...currentIds, variantId])].slice(0, maximum)
      : currentIds.filter((id) => id !== variantId)
    updateSlot(exercise, index, { variantIds: nextIds })
  }

  return (
    <section className="workout-choice-editor" aria-label={`${workout.name} setup`}>
      <div className="workout-choice-editor__head">
        <div>
          <p className="eyebrow">Session setup</p>
          <h2>Choose your exercises</h2>
          <p>
            Pick one variation per slot. Both location lists stay visible, but
            only your selected location is included in the workout.
          </p>
        </div>

        {hasLocationChoices ? (
          <fieldset className="workout-location-toggle">
            <legend>Training location</legend>
            <button
              aria-pressed={location === 'home'}
              className={location === 'home' ? 'is-active' : ''}
              onClick={() => onLocationChange('home')}
              type="button"
            >
              <Home size={17} strokeWidth={2.4} aria-hidden="true" />
              Home
            </button>
            <button
              aria-pressed={location === 'gym'}
              className={location === 'gym' ? 'is-active' : ''}
              onClick={() => onLocationChange('gym')}
              type="button"
            >
              <Building2 size={17} strokeWidth={2.4} aria-hidden="true" />
              Gym
            </button>
          </fieldset>
        ) : null}
      </div>

      <div className="workout-choice-editor__slots">
        {configurableExercises.map(({ exercise, index }) => {
          const key = getExerciseSlotKey(exercise, index)
          const selection = selections[key] ?? {}
          const availableAtLocation =
            !exercise.alternatives ||
            getExerciseVariantsForLocation(exercise, location).length > 0
          const included =
            availableAtLocation &&
            (!exercise.optional || selection.included === true)
          const selectedIds = selection.variantIds ?? []
          const prescribedExercise = applyExercisePhaseTarget(
            exercise,
            programWeek,
            progressionPhases,
          )
          const minimum = getMinimumSelections(exercise, location)
          const maximum = getMaximumSelections(exercise, location)

          return (
            <article
              className={`workout-choice-slot${
                included ? '' : ' workout-choice-slot--excluded'
              }`}
              key={key}
            >
              <div className="workout-choice-slot__head">
                <div>
                  <span>Slot {index + 1}</span>
                  <h3>{exercise.name}</h3>
                  <p>
                    {formatExercisePrescription(prescribedExercise)} ·{' '}
                    {exercise.muscleGroup}
                  </p>
                </div>
                {exercise.optional ? (
                  <label className="workout-optional-toggle">
                    <input
                      checked={included}
                      disabled={!availableAtLocation}
                      onChange={(event) =>
                        updateSlot(exercise, index, {
                          included: event.target.checked,
                        })
                      }
                      type="checkbox"
                    />
                    <span>
                      {!availableAtLocation
                        ? `Unavailable for ${location === 'home' ? 'Home' : 'Gym'}`
                        : included
                          ? 'Included'
                          : 'Optional — excluded'}
                    </span>
                  </label>
                ) : null}
              </div>

              {exercise.alternatives ? (
                <>
                  {exercise.selectionMode === 'multiple' ? (
                    <p className="workout-choice-slot__instruction">
                      Choose {minimum === maximum ? minimum : `${minimum}–${maximum}`}{' '}
                      options for this recovery slot.
                    </p>
                  ) : null}
                  <div className="workout-choice-slot__locations">
                    {(['home', 'gym'] as const).map((choiceLocation) => {
                      const variants = getExerciseVariantsForLocation(
                        exercise,
                        choiceLocation,
                      )
                      const activeLocation = choiceLocation === location

                      return (
                        <fieldset
                          className={`workout-choice-location${
                            activeLocation ? ' workout-choice-location--active' : ''
                          }`}
                          key={choiceLocation}
                        >
                          <legend>
                            {choiceLocation === 'home' ? (
                              <Home size={15} strokeWidth={2.4} aria-hidden="true" />
                            ) : (
                              <Building2
                                size={15}
                                strokeWidth={2.4}
                                aria-hidden="true"
                              />
                            )}
                            {choiceLocation === 'home' ? 'Home' : 'Gym'} alternatives
                            {activeLocation ? <span>Selected location</span> : null}
                          </legend>

                          {variants.length > 0 ? (
                            <div className="workout-choice-location__options">
                              {variants.map((variant) => {
                                const checked =
                                  activeLocation && selectedIds.includes(variant.id)
                                const atMinimum =
                                  exercise.selectionMode === 'multiple' &&
                                  checked &&
                                  selectedIds.length <= minimum
                                const atMaximum =
                                  exercise.selectionMode === 'multiple' &&
                                  !checked &&
                                  selectedIds.length >= maximum
                                const inputId = toDomId(
                                  `${idPrefix}-${key}-${choiceLocation}-${variant.id}`,
                                )

                                return (
                                  <label
                                    className={`workout-variant-option${
                                      checked ? ' workout-variant-option--selected' : ''
                                    }`}
                                    htmlFor={inputId}
                                    key={`${choiceLocation}:${variant.id}`}
                                  >
                                    <input
                                      checked={checked}
                                      disabled={
                                        !activeLocation ||
                                        !included ||
                                        atMinimum ||
                                        atMaximum
                                      }
                                      id={inputId}
                                      name={toDomId(`${idPrefix}-${key}`)}
                                      onChange={(event) =>
                                        selectVariant(
                                          exercise,
                                          index,
                                          variant.id,
                                          event.target.checked,
                                        )
                                      }
                                      type={
                                        exercise.selectionMode === 'multiple'
                                          ? 'checkbox'
                                          : 'radio'
                                      }
                                    />
                                    <span>
                                      <strong>{variant.name}</strong>
                                      <small>
                                        {variant.equipment}
                                        {variant.repRange
                                          ? ` · ${variant.repRange}`
                                          : variant.duration
                                            ? ` · ${variant.duration}`
                                            : ''}
                                      </small>
                                    </span>
                                  </label>
                                )
                              })}
                            </div>
                          ) : (
                            <p className="workout-choice-location__empty">
                              No {choiceLocation} alternative is defined.
                            </p>
                          )}
                        </fieldset>
                      )
                    })}
                  </div>
                </>
              ) : (
                <p className="workout-choice-slot__base">
                  {exercise.name} is included as prescribed when this optional
                  slot is enabled.
                </p>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

interface StandaloneWorkoutCardProps {
  onStart: (workout: StandaloneWorkout, programWeek: number | null) => void
  programWeek: number | null
  workout: StandaloneWorkout
}

function StandaloneWorkoutCard({
  onStart,
  programWeek,
  workout,
}: StandaloneWorkoutCardProps) {
  const [location, setLocation] = useState<TrainingLocation>('home')
  const [selectionsByLocation, setSelectionsByLocation] = useState<
    Partial<Record<TrainingLocation, WorkoutExerciseSelections>>
  >({})
  const selections =
    selectionsByLocation[location] ??
    createDefaultWorkoutSelections(workout, location)
  const resolvedWorkout = resolveWorkoutDefinition(workout, {
    location,
    programWeek,
    selections,
  })
  const totalSets = resolvedWorkout.exercises.reduce(
    (sum, exercise) => sum + Math.max(1, Number(exercise.sets) || 1),
    0,
  )
  const isReentry = workout.progressionMode === 'reentry'

  function updateSelections(next: WorkoutExerciseSelections) {
    setSelectionsByLocation((current) => ({
      ...current,
      [location]: next,
    }))
  }

  return (
    <article className="extra-workout-card">
      <div>
        <p className="eyebrow">
          {isReentry ? 'Restart after a training break' : 'Standalone workout'}
        </p>
        <h3>{workout.name}</h3>
        <p className="extra-workout-card__description">{workout.description}</p>
      </div>

      <div className="extra-workout-card__meta">
        <div>
          <span>Estimated time</span>
          <strong>{workout.estimatedTime}</strong>
        </div>
        <div>
          <span>Selected exercises</span>
          <strong>{resolvedWorkout.exercises.length}</strong>
        </div>
        <div>
          <span>Planned sets</span>
          <strong>{totalSets}</strong>
        </div>
        <div>
          <span>Program week</span>
          <strong>{programWeek ? `Week ${programWeek}` : 'Not phased'}</strong>
        </div>
      </div>

      <div className="extra-workout-card__recommendation">
        <strong>Recommended use</strong>
        <p>{workout.recommendedUse}</p>
      </div>

      {workout.rules && workout.rules.length > 0 ? (
        <div
          className={`extra-workout-card__rules${
            isReentry ? ' extra-workout-card__rules--safety' : ''
          }`}
        >
          <strong>
            {isReentry ? (
              <>
                <ShieldCheck size={17} strokeWidth={2.4} aria-hidden="true" />
                Re-entry safety rules
              </>
            ) : (
              'Session rules'
            )}
          </strong>
          <ul>
            {workout.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
      ) : null}

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

      <WorkoutChoiceEditor
        idPrefix={`standalone-${workout.id}`}
        location={location}
        onLocationChange={setLocation}
        onSelectionsChange={updateSelections}
        programWeek={programWeek}
        selections={selections}
        workout={workout}
      />

      <button
        className="workout-primary-button"
        disabled={!isWorkoutSelectionValid(workout, location, selections)}
        onClick={() => onStart(resolvedWorkout, programWeek)}
        type="button"
      >
        <Play size={21} strokeWidth={2.4} aria-hidden="true" />
        Start {workout.name}
      </button>
    </article>
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

  useEffect(() => {
    if (!exercise || exercise.restSeconds <= 0) {
      setIsResting(false)
    }
  }, [exercise])

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
  const isReentry = session.progressionMode === 'reentry'
  const isRecoveryPhase = session.progressionMode === 'recovery'
  const usesConservativeProgression = isReentry || isRecoveryPhase

  const previousPerformance = isReentry
    ? null
    : findPreviousExercisePerformance(
        {
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
        },
        previousSessions,
        { library: exerciseLibrary },
      )
  const bestSummary = isReentry
    ? null
    : getBestPerformanceSummary(
        {
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
        },
        previousSessions,
        { library: exerciseLibrary },
      )
  const progressionSuggestion = usesConservativeProgression
    ? null
    : getProgressionSuggestion(
        {
          id: exercise.exerciseId,
          name: exercise.exerciseName,
          repRange: exercise.targetReps || undefined,
          duration: exercise.targetDuration || undefined,
          muscleGroup: exercise.muscleGroup,
          equipment: exercise.equipment,
          sets: exercise.targetSets,
          targetRir: exercise.targetRir || undefined,
        },
        previousSessions,
        { library: exerciseLibrary },
      )
  const suggestedTarget = isReentry
    ? getReentrySuggestedTarget(exercise)
    : isRecoveryPhase
      ? getRecoveryPhaseSuggestedTarget(exercise)
    : getSuggestedSetTarget(
        exercise,
        previousPerformance,
        progressionSuggestion,
        Math.min(currentSetIndex, Math.max(exercise.sets.length - 1, 0)),
      )
  const ordinaryAssistant = getWhatToDoNext(exercise)
  const assistant = usesConservativeProgression && ordinaryAssistant.tone !== 'danger'
    ? {
        tone: ordinaryAssistant.tone,
        message:
          ordinaryAssistant.tone === 'warn'
            ? `Back off until the next set feels clearly manageable with ${exercise.targetRir || '3-4'} clean reps in reserve.`
            : isReentry
              ? 'Use a clearly manageable load and keep about 3 clean reps in reserve. No PR attempts or grinder reps.'
              : `Recovery-week work only: keep ${exercise.targetRir || '3-4'} RIR and do not chase a PR or load increase.`,
      }
    : ordinaryAssistant
  const formGuideExercise = findLibraryExerciseForWorkout({
    id: exercise.exerciseId,
    name: exercise.exerciseName,
    equipment: exercise.equipment,
    muscleGroup: exercise.muscleGroup,
  })

  const activeSet = exercise.sets[currentSetIndex]
  const ordinaryLiveCoach = getLiveWorkoutCoachMessage(activeSet)
  const liveCoach = usesConservativeProgression && ordinaryLiveCoach.tone === 'info'
    ? {
        tone: 'info' as const,
        message:
          isReentry
            ? 'Technical re-exposure only: move cleanly, keep about 3 RIR, and stop well before failure.'
            : `Recovery-week technique only: keep ${exercise.targetRir || '3-4'} RIR, avoid grinding, and do not increase load.`,
      }
    : ordinaryLiveCoach

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

      {session.workoutGuidance && session.workoutGuidance.length > 0 ? (
        <section
          className={`live-workout-guidance dashboard-card${
            isReentry ? ' live-workout-guidance--safety' : ''
          }`}
          aria-label={isReentry ? 'Re-entry safety rules' : 'Session guidance'}
        >
          <div>
            <ShieldCheck size={20} strokeWidth={2.4} aria-hidden="true" />
            <div>
              <p className="eyebrow">
                {isReentry ? 'Re-entry safety rules' : 'Session guidance'}
              </p>
              <strong>
                {session.programWeek ? `Program week ${session.programWeek}` : session.workoutName}
              </strong>
            </div>
          </div>
          <ul>
            {session.workoutGuidance.map((guidance) => (
              <li key={guidance}>{guidance}</li>
            ))}
          </ul>
        </section>
      ) : null}

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
          {exercise.restSeconds > 0 ? (
            <RestTimer
              autoStartSignal={restSignal}
              extendSignal={restExtendSignal}
              onRunningChange={setIsResting}
              restSeconds={exercise.restSeconds}
              skipSignal={restSkipSignal}
            />
          ) : (
            <section className="rest-timer" aria-label="Rest guidance">
              <strong>00:00</strong>
              <p>No separate rest is prescribed for this interval.</p>
            </section>
          )}

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

function getInitialProgramWeek(activeProgram: ActiveWorkoutProgram): number | null {
  const durationWeeks = Number(activeProgram.durationWeeks)
  if (!Number.isInteger(durationWeeks) || durationWeeks < 1) {
    return null
  }

  if (!activeProgram.installedAt) {
    return 1
  }

  const installedAt = new Date(activeProgram.installedAt).getTime()
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
    ...(phase.restrictions ?? []).map((restriction) =>
      `Restriction: ${restriction}`,
    ),
  ].filter((item) => item.trim().length > 0)
}

function getProgramWeekProgressionMode(
  activeProgram: ActiveWorkoutProgram,
  programWeek: number | null,
): 'standard' | 'recovery' {
  if (!programWeek) return 'standard'
  const phase = activeProgram.progressionPhases.find((item) =>
    item.weeks.includes(programWeek),
  )
  return phase?.setVolumeMultiplier ? 'recovery' : 'standard'
}

function createDefaultWorkoutSelections(
  workout: WorkoutChoiceDefinition,
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

function getMinimumSelections(
  exercise: Exercise,
  location: TrainingLocation,
): number {
  const availableCount = getExerciseVariantsForLocation(exercise, location).length
  if (availableCount === 0) {
    return 0
  }
  if (exercise.selectionMode !== 'multiple') {
    return 1
  }
  return Math.min(availableCount, Math.max(1, exercise.minSelections ?? 1))
}

function getMaximumSelections(
  exercise: Exercise,
  location: TrainingLocation,
): number {
  const availableCount = getExerciseVariantsForLocation(exercise, location).length
  if (availableCount === 0) {
    return 0
  }
  if (exercise.selectionMode !== 'multiple') {
    return 1
  }
  const minimum = getMinimumSelections(exercise, location)
  return Math.min(
    availableCount,
    Math.max(minimum, exercise.maxSelections ?? minimum),
  )
}

function isWorkoutSelectionValid(
  workout: WorkoutChoiceDefinition,
  location: TrainingLocation,
  selections: WorkoutExerciseSelections,
): boolean {
  return workout.exercises.every((exercise, index) => {
    const selection = selections[getExerciseSlotKey(exercise, index)]
    if (exercise.optional && selection?.included !== true) {
      return true
    }
    if (!exercise.alternatives) {
      return true
    }

    const availableVariants = getExerciseVariantsForLocation(exercise, location)
    if (availableVariants.length === 0) {
      return false
    }
    const availableIds = new Set(availableVariants.map((variant) => variant.id))
    const requestedIds = [...new Set(selection?.variantIds ?? [])]
    const validIds = requestedIds.filter((id) => availableIds.has(id))
    if (validIds.length !== requestedIds.length) {
      return false
    }

    const minimum = getMinimumSelections(exercise, location)
    const maximum = getMaximumSelections(exercise, location)
    return validIds.length >= minimum && validIds.length <= maximum
  })
}

function formatExercisePrescription(exercise: Exercise): string {
  const target = exercise.repRange ?? exercise.duration ?? 'controlled work'
  return `${Math.max(1, Number(exercise.sets) || 1)} × ${target}`
}

function getReentrySuggestedTarget(
  exercise: ActiveExercise,
): SuggestedSetTarget {
  const target =
    exercise.targetDuration || exercise.targetReps || 'controlled reps'
  return {
    repsTarget: `${target} at about 3 RIR`,
    weightTarget: 'Choose a clearly manageable load',
    message:
      'Use this as a technical re-exposure. Do not chase an old load, PR, or failure.',
  }
}

function getRecoveryPhaseSuggestedTarget(
  exercise: ActiveExercise,
): SuggestedSetTarget {
  const target =
    exercise.targetDuration || exercise.targetReps || 'controlled reps'
  return {
    repsTarget: `${target} at ${exercise.targetRir || '3-4'} RIR`,
    weightTarget: 'Use a clearly submaximal recovery-week load',
    message:
      'Keep the reduced prescription easy and technical. Do not increase load or chase a record this week.',
  }
}

function toDomId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]+/g, '-')
}

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
