import { Brain, Target } from 'lucide-react'
import { CoachAdviceSection } from '../components/CoachAdviceSection'
import { CoachBadge } from '../components/CoachBadge'
import { CoachSummaryCard } from '../components/CoachSummaryCard'
import { CoachWarnings } from '../components/CoachWarnings'
import { ReadinessScoreCard } from '../components/ReadinessScoreCard'
import { TodayActionPlan } from '../components/TodayActionPlan'
import {
  calculateReadinessScore,
  generateTodayActionPlan,
  getAbsPostureAdvice,
  getBodyRecompositionAdvice,
  getCoachPriorityItems,
  getCoachWarnings,
  getMotivationalCoachMessage,
  getNutritionCoachAdvice,
  getTodayWorkoutAdvice,
} from '../utils/coachUtils'
import { getBodyCheckIns } from '../utils/bodyCheckInUtils'
import { getNutritionLogs } from '../utils/nutritionUtils'
import { getWorkoutSessions, isWorkoutCompleted } from '../utils/progressUtils'
import { getTodayProgressionFocus } from '../utils/progressionUtils'
import { getReminderSettings } from '../utils/reminderUtils'
import {
  getCustomWorkoutPlan,
  getUserProfileSettings,
  getWorkoutForDate,
} from '../utils/settingsUtils'
import {
  calculateWeeklyScore,
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

export function Coach() {
  const settings = getUserProfileSettings()
  const activePlan = getCustomWorkoutPlan()
  const reminderSettings = getReminderSettings()
  const todayWorkout = getWorkoutForDate(new Date(), activePlan)
  const sessions = getWorkoutSessions()
  const nutritionLogs = getNutritionLogs()
  const bodyCheckIns = getBodyCheckIns()
  const progressionSuggestions = getTodayProgressionFocus(
    sessions,
    todayWorkout.exercises,
  )
  const weekRange = getWeekRange(new Date())
  const previousWeekAnchor = new Date(weekRange.start)
  previousWeekAnchor.setDate(weekRange.start.getDate() - 7)
  const previousWeekRange = getWeekRange(previousWeekAnchor)
  const weekSessions = getSessionsForWeek(sessions, weekRange.start, weekRange.end)
  const previousWeekSessions = getSessionsForWeek(
    sessions,
    previousWeekRange.start,
    previousWeekRange.end,
  )
  const workoutSummary = getWorkoutCompletionSummary(weekSessions, activePlan)
  const muscleVolume = getMuscleVolumeSummary(weekSessions, activePlan)
  const nutritionSummary = getNutritionSummary(
    getNutritionForWeek(nutritionLogs, weekRange.start, weekRange.end),
  )
  const bodySummary = getBodyProgressSummary(
    getCheckInsForWeek(bodyCheckIns, weekRange.start, weekRange.end),
    bodyCheckIns,
  )
  const strengthComparison = getStrengthComparison(
    weekSessions,
    previousWeekSessions,
    weeklyReviewExerciseNames,
  )
  const weeklyScore = calculateWeeklyScore({
    workoutSummary,
    nutritionSummary,
    bodySummary,
    muscleVolume,
    strengthComparison,
  })
  const todayAdvice = getTodayWorkoutAdvice({
    todayWorkout,
    sessions,
    progressionSuggestions,
  })
  const readiness = calculateReadinessScore({
    sessions,
    nutritionLogs,
    bodyCheckIns,
  })
  const nutritionAdvice = getNutritionCoachAdvice(nutritionLogs)
  const bodyAdvice = getBodyRecompositionAdvice(bodyCheckIns, sessions)
  const absPostureAdvice = getAbsPostureAdvice(sessions, activePlan)
  const warnings = getCoachWarnings({
    sessions,
    nutritionLogs,
    bodyCheckIns,
    muscleVolume,
    warningSensitivity: settings.coach.warningSensitivity,
  })
  const actionPlan = generateTodayActionPlan({
    todayWorkout,
    readiness,
    nutritionAdvice,
    bodyAdvice,
    absPostureAdvice,
    warnings,
  })
  const motivationalMessage = getMotivationalCoachMessage(readiness, weeklyScore)
  const reminderAdvice = buildReminderAdvice({
    bodyCheckIns,
    nutritionLogs,
    reminderSettings,
    sessions,
  })

  return (
    <section className="coach-page">
      <header className="progress-hero coach-hero">
        <div>
          <p className="eyebrow">Smart Coach</p>
          <h1>Smart Coach</h1>
          <p>Daily training, nutrition, recovery, and body recomposition advice.</p>
        </div>
        <div className="hero-target coach-hero__target">
          <Brain size={22} strokeWidth={2.4} aria-hidden="true" />
          <span>Coach Priority</span>
          <strong>{settings.coach.mainPriority}</strong>
          <CoachBadge type="info">{settings.coach.coachingStyle}</CoachBadge>
        </div>
      </header>

      <section className="coach-top-grid" aria-label="Daily coach summary">
        <CoachSummaryCard
          message={todayAdvice.message}
          priorityItems={getCoachPriorityItems(todayAdvice)}
          title={todayAdvice.title}
        />
        <ReadinessScoreCard
          label={readiness.label}
          message={readiness.message}
          reasons={readiness.reasons}
          score={readiness.score}
        />
      </section>

      <article className="dashboard-card coach-motivation-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Coach Message</p>
            <h2>Today's focus</h2>
          </div>
          <Target size={22} strokeWidth={2.4} aria-hidden="true" />
        </div>
        <p>{motivationalMessage}</p>
      </article>

      <section className="coach-advice-grid" aria-label="Coach advice sections">
        <CoachAdviceSection
          emptyMessage="Complete workouts to unlock workout advice."
          items={buildWorkoutAdviceItems(todayAdvice)}
          title="Today's Workout Advice"
        />
        <CoachAdviceSection
          emptyMessage="Log nutrition to unlock nutrition advice."
          items={nutritionAdvice}
          title="Nutrition Advice"
        />
        <CoachAdviceSection
          emptyMessage="Reminder timing looks clear."
          items={reminderAdvice}
          title="Reminder Advice"
        />
        <CoachAdviceSection
          emptyMessage="Add body check-ins to unlock recomposition advice."
          items={bodyAdvice}
          title="Body Recomposition"
        />
        <CoachAdviceSection
          items={[
            `Abs sessions this week: ${absPostureAdvice.absSessionsThisWeek}/3`,
            `Posture sessions this week: ${absPostureAdvice.postureSessionsThisWeek}/4`,
            ...absPostureAdvice.advice,
            absPostureAdvice.recommendedExercises.length
              ? `Recommended: ${absPostureAdvice.recommendedExercises.join(', ')}`
              : '',
          ]}
          title="Abs + Posture"
        />
      </section>

      <CoachWarnings warnings={warnings} />
      <TodayActionPlan items={actionPlan} />
    </section>
  )
}

function buildWorkoutAdviceItems(advice) {
  return [
    `Today workout: ${advice.title}`,
    advice.pushExercises.length
      ? `Push: ${advice.pushExercises.join(', ')}`
      : '',
    advice.controlExercises.length
      ? `Keep controlled: ${advice.controlExercises.join(', ')}`
      : '',
    advice.postureCautionExercises.length
      ? `Posture caution: ${advice.postureCautionExercises.join(', ')}`
      : '',
    `Suggested intensity: ${advice.intensityRecommendation}`,
  ].filter(Boolean)
}

function buildReminderAdvice({
  bodyCheckIns,
  nutritionLogs,
  reminderSettings,
  sessions,
}) {
  const today = toDateKey(new Date())
  const items = []

  if (
    reminderSettings.workoutReminderEnabled &&
    !sessions.some((session) => session.date === today && isWorkoutCompleted(session))
  ) {
    items.push(
      `Workout reminder is active at ${reminderSettings.workoutReminderTime}.`,
    )
  }

  const todayNutrition = nutritionLogs.find((log) => log.date === today)
  if (
    reminderSettings.creatineReminderEnabled &&
    !todayNutrition?.creatineTaken
  ) {
    items.push(
      `Creatine reminder is active at ${reminderSettings.creatineReminderTime}.`,
    )
  }

  if (
    reminderSettings.bodyCheckInReminderEnabled &&
    !hasBodyCheckInWithinDays(bodyCheckIns, 7)
  ) {
    items.push(
      `Body check-in reminder is active for ${reminderSettings.bodyCheckInDay}.`,
    )
  }

  return items
}

function hasBodyCheckInWithinDays(checkIns, days) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  cutoff.setHours(0, 0, 0, 0)

  return checkIns.some((checkIn) => {
    const parsed = new Date(`${checkIn.date}T00:00:00`)
    return !Number.isNaN(parsed.getTime()) && parsed >= cutoff
  })
}

function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
