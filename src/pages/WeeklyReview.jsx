import { ArrowLeft, ArrowRight, PlusCircle, Printer } from 'lucide-react'
import { useMemo, useState } from 'react'
import { BodyProgressSummary } from '../components/BodyProgressSummary'
import { MuscleVolumeChart } from '../components/MuscleVolumeChart'
import { NextWeekFocusCard } from '../components/NextWeekFocusCard'
import { NutritionWeeklySummary } from '../components/NutritionWeeklySummary'
import { StrengthComparisonTable } from '../components/StrengthComparisonTable'
import { WarningsCard } from '../components/WarningsCard'
import { WeeklyScoreCard } from '../components/WeeklyScoreCard'
import { WeeklySummaryCard } from '../components/WeeklySummaryCard'
import { PrintableWeeklyReview } from '../print/PrintableWeeklyReview'
import { getProgressionSuggestion } from '../utils/progressionUtils'
import { getWeeklyCoachConclusion } from '../utils/coachUtils'
import { printElement } from '../utils/printUtils'
import { addDemoCheckIns, getBodyCheckIns } from '../utils/bodyCheckInUtils'
import { addDemoNutritionLogs, getNutritionLogs } from '../utils/nutritionUtils'
import { addDemoSessions, getWorkoutSessions } from '../utils/progressUtils'
import { getEffectiveExerciseLibrary } from '../utils/settingsUtils'
import {
  getActiveWorkoutProgram,
  getProgramBenchmarkExercises,
  getProgramBenchmarkExercisesWithFallback,
  getProgramNutritionTargets,
} from '../utils/activeWorkoutProgram'
import {
  calculateWeeklyScore,
  formatWeekRange,
  generateNextWeekFocus,
  generateWarnings,
  getBodyProgressSummary,
  getCheckInsForWeek,
  getMuscleVolumeSummary,
  getNutritionForWeek,
  getNutritionSummary,
  getSessionsForWeek,
  getStrengthComparison,
  getWeekRange,
  getWorkoutCompletionSummary,
} from '../utils/weeklyReviewUtils'

export function WeeklyReview() {
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [sessions, setSessions] = useState(() => getWorkoutSessions())
  const [checkIns, setCheckIns] = useState(() => getBodyCheckIns())
  const [nutritionLogs, setNutritionLogs] = useState(() => getNutritionLogs())
  const activeProgram = useMemo(() => getActiveWorkoutProgram(), [])
  const activePlan = activeProgram.days
  const effectiveExerciseLibrary = useMemo(
    () => getEffectiveExerciseLibrary(),
    [],
  )
  const benchmarkExercises = useMemo(
    () => {
      const explicit = getProgramBenchmarkExercises(
        activeProgram,
        effectiveExerciseLibrary,
      )
      return explicit.length > 0 || activeProgram.benchmarkExerciseIds.length > 0
        ? explicit
        : getProgramBenchmarkExercisesWithFallback(
            activeProgram,
            effectiveExerciseLibrary,
          )
    },
    [activeProgram, effectiveExerciseLibrary],
  )

  const review = useMemo(
    () =>
      buildReview(
        selectedDate,
        sessions,
        checkIns,
        nutritionLogs,
        activeProgram,
        benchmarkExercises,
        effectiveExerciseLibrary,
      ),
    [
      activeProgram,
      benchmarkExercises,
      checkIns,
      effectiveExerciseLibrary,
      nutritionLogs,
      selectedDate,
      sessions,
    ],
  )
  const hasAllReviewData =
    sessions.length > 0 && checkIns.length > 0 && nutritionLogs.length > 0

  function moveWeek(offset) {
    setSelectedDate((current) => {
      const next = new Date(current)
      next.setDate(current.getDate() + offset * 7)
      return next
    })
  }

  function handleAddDemoWorkouts() {
    setSessions(addDemoSessions(activePlan))
  }

  function handleAddDemoCheckIns() {
    setCheckIns(addDemoCheckIns())
  }

  function handleAddDemoNutrition() {
    setNutritionLogs(addDemoNutritionLogs())
  }

  return (
    <section className="weekly-review-page">
      <header className="progress-hero weekly-review-hero">
        <div>
          <p className="eyebrow">Weekly Review</p>
          <h1>Weekly Review</h1>
          <p>
            Review training, body changes, nutrition, and next-week focus for{' '}
            {activeProgram.programName}
            {activeProgram.programVersion
              ? ` ${activeProgram.programVersion}`
              : ''}
            .
          </p>
        </div>
        <div className="weekly-review-hero-controls">
          <button
            className="demo-data-button demo-data-button--secondary"
            onClick={() => printElement('weekly-review-print-source')}
            type="button"
          >
            <Printer size={19} strokeWidth={2.4} aria-hidden="true" />
            Print Weekly Review
          </button>
          <div className="week-selector" aria-label="Week selector">
            <button
              className="week-nav-button"
              onClick={() => moveWeek(-1)}
              type="button"
            >
              <ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />
              Previous
            </button>
            <strong className="week-range-pill">
              {formatWeekRange(review.week.start, review.week.end)}
            </strong>
            <button
              className="week-nav-button"
              onClick={() => moveWeek(1)}
              type="button"
            >
              Next
              <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {!hasAllReviewData ? (
        <article className="progress-empty-card weekly-review-empty">
          <PlusCircle size={26} strokeWidth={2.4} aria-hidden="true" />
          <div>
            <h2>Missing local data</h2>
            <p>Complete workouts and logs to improve this review, or load demos.</p>
          </div>
          <div className="weekly-review-demo-actions">
            {sessions.length === 0 ? (
              <button
                className="workout-primary-button"
                onClick={handleAddDemoWorkouts}
                type="button"
              >
                Add Demo Workouts
              </button>
            ) : null}
            {checkIns.length === 0 ? (
              <button
                className="workout-secondary-button"
                onClick={handleAddDemoCheckIns}
                type="button"
              >
                Add Demo Body Check-ins
              </button>
            ) : null}
            {nutritionLogs.length === 0 ? (
              <button
                className="workout-secondary-button"
                onClick={handleAddDemoNutrition}
                type="button"
              >
                Add Demo Nutrition Logs
              </button>
            ) : null}
          </div>
        </article>
      ) : null}

      <WeeklyScoreCard
        breakdown={review.weeklyScore.breakdown}
        label={review.weeklyScore.label}
        message={review.weeklyScore.message}
        score={review.weeklyScore.score}
      />

      <section className="weekly-summary-grid" aria-label="Workout completion summary">
        <WeeklySummaryCard
          status={
            review.workoutSummary.scheduledCompletedWorkouts >=
            review.workoutSummary.targetWorkouts
              ? 'good'
              : 'warn'
          }
          subtitle={`Target workouts: ${review.workoutSummary.targetWorkouts} · ${formatStandaloneWorkoutCount(
            review.workoutSummary.standaloneWorkoutsCompleted,
          )}`}
          title="Scheduled workouts"
          value={`${review.workoutSummary.scheduledCompletedWorkouts}/${review.workoutSummary.targetWorkouts}`}
        />
        <WeeklySummaryCard
          status={review.workoutSummary.totalSets > 0 ? 'good' : 'neutral'}
          subtitle={`${review.workoutSummary.totalExercises} exercises completed`}
          title="Total sets"
          value={String(review.workoutSummary.totalSets)}
        />
        <WeeklySummaryCard
          status={
            review.workoutSummary.missedWorkoutDays.length === 0 ? 'good' : 'warn'
          }
          subtitle={
            review.workoutSummary.missedWorkoutDays[0] ?? 'No target days missed'
          }
          title="Missed"
          value={String(review.workoutSummary.missedWorkoutDays.length)}
        />
        <WeeklySummaryCard
          subtitle="From started and finished times"
          title="Workout time"
          value={review.workoutSummary.totalDurationLabel}
        />
      </section>

      <section className="weekly-review-two-column">
        <MuscleVolumeChart data={review.muscleVolume} />
        <NutritionWeeklySummary summary={review.nutritionSummary} />
      </section>

      <StrengthComparisonTable comparisons={review.strengthComparison} />

      <section className="weekly-review-two-column">
        <BodyProgressSummary summary={review.bodySummary} />
        <NextWeekFocusCard items={review.focusItems} />
      </section>

      <WarningsCard warnings={review.warnings} />

      <article className="dashboard-card weekly-coach-conclusion-card">
        <div>
          <p className="eyebrow">Coach Conclusion</p>
          <h2>Next week direction</h2>
        </div>
        <p>
          {getWeeklyCoachConclusion({
            workoutSummary: review.workoutSummary,
            nutritionSummary: review.nutritionSummary,
            bodySummary: review.bodySummary,
            focusItems: review.focusItems,
            muscleVolume: review.muscleVolume,
          })}
        </p>
      </article>

      <div className="print-source" id="weekly-review-print-source" aria-hidden="true">
        <PrintableWeeklyReview
          review={{
            ...review,
            weekLabel: formatWeekRange(review.week.start, review.week.end),
          }}
        />
      </div>
    </section>
  )
}

function buildReview(
  selectedDate,
  sessions,
  checkIns,
  nutritionLogs,
  activeProgram,
  benchmarkExercises,
  effectiveExerciseLibrary,
) {
  const activePlan = activeProgram.days
  const week = getWeekRange(selectedDate)
  const previousAnchor = new Date(week.start)
  previousAnchor.setDate(week.start.getDate() - 7)
  const previousWeek = getWeekRange(previousAnchor)
  const weekSessions = getSessionsForWeek(sessions, week.start, week.end)
  const previousWeekSessions = getSessionsForWeek(
    sessions,
    previousWeek.start,
    previousWeek.end,
  )
  const weekNutrition = getNutritionForWeek(nutritionLogs, week.start, week.end)
  const weekCheckIns = getCheckInsForWeek(checkIns, week.start, week.end)
  const workoutSummary = getWorkoutCompletionSummary(weekSessions, activeProgram)
  const muscleVolume = getMuscleVolumeSummary(weekSessions, activeProgram, {
    library: effectiveExerciseLibrary,
  })
  const strengthComparison = getStrengthComparison(
    weekSessions,
    previousWeekSessions,
    benchmarkExercises,
    { library: effectiveExerciseLibrary },
  )
  const bodySummary = getBodyProgressSummary(weekCheckIns, checkIns)
  const nutritionSummary = getNutritionSummary(
    weekNutrition,
    getProgramNutritionTargets(activeProgram),
  )
  const progressionSuggestions = benchmarkExercises
    .map((benchmark) =>
      activePlan
        .flatMap((day) => day.exercises)
        .find((exercise) => exercise.id === benchmark.id),
    )
    .filter(Boolean)
    .map((exercise) =>
      getProgressionSuggestion(exercise, sessions, {
        library: effectiveExerciseLibrary,
      }),
    )
  const weeklyScore = calculateWeeklyScore({
    workoutSummary,
    nutritionSummary,
    bodySummary,
    muscleVolume,
    strengthComparison,
  })
  const focusItems = generateNextWeekFocus({
    workoutSummary,
    nutritionSummary,
    bodySummary,
    muscleVolume,
    strengthComparison,
    progressionSuggestions,
    activeProgram,
  })
  const warnings = generateWarnings({
    workoutSummary,
    nutritionSummary,
    bodySummary,
    muscleVolume,
    strengthComparison,
    weekSessions,
    activeProgram,
  })

  return {
    program: activeProgram,
    generatedAt: new Date().toISOString(),
    week,
    workoutSummary,
    muscleVolume,
    strengthComparison,
    bodySummary,
    nutritionSummary,
    weeklyScore,
    focusItems,
    warnings,
  }
}

function formatStandaloneWorkoutCount(count) {
  const total = Number.isFinite(Number(count)) ? Math.max(0, Number(count)) : 0
  return `${total} standalone workout${total === 1 ? '' : 's'} completed`
}
