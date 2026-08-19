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
import { useLanguage } from '../i18n'
import { getProgressionSuggestion } from '../utils/progressionUtils'
import { getWeeklyCoachConclusion } from '../utils/coachUtils'
import { printElement } from '../utils/printUtils'
import { SHOW_DEMO_DATA } from '../utils/devFlags'
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
  const { language, t } = useLanguage()
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
    // The review is a set of written sentences, so it is rebuilt when the
    // language changes, not only when the underlying data does.
    [
      activeProgram,
      benchmarkExercises,
      checkIns,
      effectiveExerciseLibrary,
      language,
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
          <p className="eyebrow">{t('review.eyebrow')}</p>
          <h1>{t('review.title')}</h1>
          <p>
            {t('review.subtitle', {
              program: activeProgram.programVersion
                ? `${activeProgram.programName} ${activeProgram.programVersion}`
                : activeProgram.programName,
            })}
          </p>
        </div>
        <div className="weekly-review-hero-controls">
          <button
            className="demo-data-button demo-data-button--secondary"
            onClick={() => printElement('weekly-review-print-source')}
            type="button"
          >
            <Printer size={19} strokeWidth={2.4} aria-hidden="true" />
            {t('review.print')}
          </button>
          <div className="week-selector" aria-label={t('review.weekSelector')}>
            <button
              className="week-nav-button"
              onClick={() => moveWeek(-1)}
              type="button"
            >
              <ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />
              {t('review.previous')}
            </button>
            <strong className="week-range-pill">
              {formatWeekRange(review.week.start, review.week.end)}
            </strong>
            <button
              className="week-nav-button"
              onClick={() => moveWeek(1)}
              type="button"
            >
              {t('review.next')}
              <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {!hasAllReviewData ? (
        <article className="progress-empty-card weekly-review-empty">
          <PlusCircle size={26} strokeWidth={2.4} aria-hidden="true" />
          <div>
            <h2>{t('review.missingTitle')}</h2>
            <p>
              {SHOW_DEMO_DATA
                ? t('review.missingCopyDemo')
                : t('review.missingCopy')}
            </p>
          </div>
          <div className="weekly-review-demo-actions">
            {SHOW_DEMO_DATA && sessions.length === 0 ? (
              <button
                className="workout-primary-button"
                onClick={handleAddDemoWorkouts}
                type="button"
              >
                {t('review.demoWorkouts')}
              </button>
            ) : null}
            {SHOW_DEMO_DATA && checkIns.length === 0 ? (
              <button
                className="workout-secondary-button"
                onClick={handleAddDemoCheckIns}
                type="button"
              >
                {t('review.demoCheckIns')}
              </button>
            ) : null}
            {SHOW_DEMO_DATA && nutritionLogs.length === 0 ? (
              <button
                className="workout-secondary-button"
                onClick={handleAddDemoNutrition}
                type="button"
              >
                {t('review.demoNutrition')}
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

      <section className="weekly-summary-grid" aria-label={t('review.summaryAria')}>
        <WeeklySummaryCard
          status={
            review.workoutSummary.scheduledCompletedWorkouts >=
            review.workoutSummary.targetWorkouts
              ? 'good'
              : 'warn'
          }
          subtitle={t('review.targetWorkouts', {
            count: review.workoutSummary.targetWorkouts,
            standalone: t('review.standaloneCount', {
              count: Math.max(
                0,
                Number(review.workoutSummary.standaloneWorkoutsCompleted) || 0,
              ),
            }),
          })}
          title={t('review.scheduledWorkouts')}
          value={`${review.workoutSummary.scheduledCompletedWorkouts}/${review.workoutSummary.targetWorkouts}`}
        />
        <WeeklySummaryCard
          status={review.workoutSummary.totalSets > 0 ? 'good' : 'neutral'}
          subtitle={t('review.exercisesCompleted', {
            count: review.workoutSummary.totalExercises,
          })}
          title={t('review.totalSets')}
          value={String(review.workoutSummary.totalSets)}
        />
        <WeeklySummaryCard
          status={
            review.workoutSummary.missedWorkoutDays.length === 0 ? 'good' : 'warn'
          }
          subtitle={
            review.workoutSummary.missedWorkoutDays[0] ?? t('review.noMissedDays')
          }
          title={t('review.missed')}
          value={String(review.workoutSummary.missedWorkoutDays.length)}
        />
        <WeeklySummaryCard
          subtitle={t('review.workoutTimeSub')}
          title={t('review.workoutTime')}
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
          <p className="eyebrow">{t('review.conclusion.eyebrow')}</p>
          <h2>{t('review.conclusion.title')}</h2>
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

