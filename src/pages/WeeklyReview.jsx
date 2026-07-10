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
import { getSuggestionForExerciseName } from '../utils/progressionUtils'
import { getWeeklyCoachConclusion } from '../utils/coachUtils'
import { printElement } from '../utils/printUtils'
import { addDemoCheckIns, getBodyCheckIns } from '../utils/bodyCheckInUtils'
import { addDemoNutritionLogs, getNutritionLogs } from '../utils/nutritionUtils'
import { addDemoSessions, getWorkoutSessions } from '../utils/progressUtils'
import { getCustomWorkoutPlan } from '../utils/settingsUtils'
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
  weeklyReviewExerciseNames,
} from '../utils/weeklyReviewUtils'

export function WeeklyReview() {
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [sessions, setSessions] = useState(() => getWorkoutSessions())
  const [checkIns, setCheckIns] = useState(() => getBodyCheckIns())
  const [nutritionLogs, setNutritionLogs] = useState(() => getNutritionLogs())
  const activePlan = useMemo(() => getCustomWorkoutPlan(), [])

  const review = useMemo(
    () => buildReview(selectedDate, sessions, checkIns, nutritionLogs, activePlan),
    [activePlan, selectedDate, sessions, checkIns, nutritionLogs],
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
          <p>Review training, body changes, nutrition, and next-week focus.</p>
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
          status={review.workoutSummary.completedWorkouts >= 5 ? 'good' : 'warn'}
          subtitle={`Target workouts: ${review.workoutSummary.targetWorkouts}`}
          title="Workouts completed"
          value={`${review.workoutSummary.completedWorkouts}/${review.workoutSummary.targetWorkouts}`}
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

function buildReview(selectedDate, sessions, checkIns, nutritionLogs, activePlan) {
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
  const workoutSummary = getWorkoutCompletionSummary(weekSessions, activePlan)
  const muscleVolume = getMuscleVolumeSummary(weekSessions, activePlan)
  const strengthComparison = getStrengthComparison(
    weekSessions,
    previousWeekSessions,
    weeklyReviewExerciseNames,
  )
  const bodySummary = getBodyProgressSummary(weekCheckIns, checkIns)
  const nutritionSummary = getNutritionSummary(weekNutrition)
  const progressionSuggestions = weeklyReviewExerciseNames.map((exerciseName) =>
    getSuggestionForExerciseName(exerciseName, sessions, activePlan),
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
  })
  const warnings = generateWarnings({
    workoutSummary,
    nutritionSummary,
    bodySummary,
    muscleVolume,
    strengthComparison,
    weekSessions,
  })

  return {
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
