import {
  Activity,
  BarChart3,
  BellRing,
  BookOpen,
  Brain,
  CalendarCheck2,
  ClipboardCheck,
  ClipboardPenLine,
  Cloud,
  HardDrive,
  Library,
  PlayCircle,
  Ruler,
  Scale,
  Settings,
  ShieldCheck,
  Target,
  Trophy,
  Utensils,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { InstallPWAButton } from '../components/InstallPWAButton'
import { ProgressBar } from '../components/ProgressBar'
import { ProgressionSuggestionCard } from '../components/ProgressionSuggestionCard'
import { QuickActionButton } from '../components/QuickActionButton'
import { StatCard } from '../components/StatCard'
import { WorkoutCard } from '../components/WorkoutCard'
import {
  getLatestWorkoutSession,
  getThisWeekSessions,
  getWorkoutSessions,
  isWorkoutCompleted,
} from '../utils/progressUtils'
import { getTodayProgressionFocus } from '../utils/progressionUtils'
import {
  getActiveWorkoutSession,
  getCompletedSetsCount,
  getTotalPlannedSets,
} from '../utils/liveWorkoutUtils'
import {
  calculateReadinessScore,
  generateTodayActionPlan,
  getAbsPostureAdvice,
  getBodyRecompositionAdvice,
  getCoachWarnings,
  getNutritionCoachAdvice,
  getTodayWorkoutAdvice,
} from '../utils/coachUtils'
import {
  formatCheckInDate,
  getBodyCheckIns,
  getLatestCheckIn,
} from '../utils/bodyCheckInUtils'
import {
  getNutritionLogs,
  getTodayNutritionLog,
} from '../utils/nutritionUtils'
import { userProfile } from '../data/userProfile'
import { useAuth } from '../context/AuthContext'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { useReminders } from '../hooks/useReminders'
import {
  getCustomWorkoutPlan,
  getUserProfileSettings,
  getWorkoutForDate,
} from '../utils/settingsUtils'
import { getPendingSyncCount } from '../utils/offlineSyncQueue'
import type { PageId } from '../types/navigation'
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

interface DashboardProps {
  onNavigate: (page: PageId) => void
}

interface DashboardReminder {
  id: string
  message: string
  type: string
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { isSupabaseConfigured, user } = useAuth()
  const { isOnline } = useOnlineStatus()
  const {
    notificationPermission,
    reminderCount,
    reminders,
    settings: reminderSettings,
  } = useReminders()
  const cloudActive = isSupabaseConfigured && Boolean(user)
  const pendingSyncCount = getPendingSyncCount()
  const settings = getUserProfileSettings()
  const activePlan = getCustomWorkoutPlan()
  const todayWorkout = getWorkoutForDate(new Date(), activePlan)
  const sessions = getWorkoutSessions()
  const latestSession = getLatestWorkoutSession(sessions)
  const activeWorkout = getActiveWorkoutSession()
  const activeWorkoutHasSession = Boolean(activeWorkout && !activeWorkout.completed)
  const weeklyTarget = userProfile.weeklyCompletion.target
  const weeklyCompleted = getThisWeekSessions(sessions).filter(
    isWorkoutCompleted,
  ).length
  const bodyCheckIns = getBodyCheckIns()
  const latestCheckIn = getLatestCheckIn(bodyCheckIns)
  const bodyStatItems = latestCheckIn
    ? [
        { label: 'Weight', value: formatBodyStat(latestCheckIn.bodyWeightKg, 'kg') },
        { label: 'Waist', value: formatBodyStat(latestCheckIn.waistCm, 'cm') },
        { label: 'Chest', value: formatBodyStat(latestCheckIn.chestCm, 'cm') },
        {
          label: 'Shoulders',
          value: formatBodyStat(latestCheckIn.shouldersCm, 'cm'),
        },
      ]
    : []
  const currentWeight =
    latestCheckIn?.bodyWeightKg != null
      ? `${latestCheckIn.bodyWeightKg} kg`
      : `${settings.profile.currentWeightKg} kg`
  const goalWeight = `${settings.profile.goalWeightMinKg}-${settings.profile.goalWeightMaxKg} kg`
  const equipmentSummary = summarizeList(settings.equipment)
  const goalSummary = `${settings.goals.primaryGoal} · ${settings.goals.secondaryGoal}`
  const nutritionLogs = getNutritionLogs()
  const todayNutrition = getTodayNutritionLog(nutritionLogs)
  const weekRange = getWeekRange(new Date())
  const previousWeekAnchor = new Date(weekRange.start)
  previousWeekAnchor.setDate(weekRange.start.getDate() - 7)
  const previousWeekRange = getWeekRange(previousWeekAnchor)
  const reviewWeekSessions = getSessionsForWeek(
    sessions,
    weekRange.start,
    weekRange.end,
  )
  const previousWeekSessions = getSessionsForWeek(
    sessions,
    previousWeekRange.start,
    previousWeekRange.end,
  )
  const reviewWorkoutSummary = getWorkoutCompletionSummary(
    reviewWeekSessions,
    activePlan,
  )
  const reviewNutritionSummary = getNutritionSummary(
    getNutritionForWeek(nutritionLogs, weekRange.start, weekRange.end),
  )
  const reviewBodySummary = getBodyProgressSummary(
    getCheckInsForWeek(bodyCheckIns, weekRange.start, weekRange.end),
    bodyCheckIns,
  )
  const reviewMuscleVolume = getMuscleVolumeSummary(reviewWeekSessions, activePlan)
  const reviewStrengthComparison = getStrengthComparison(
    reviewWeekSessions,
    previousWeekSessions,
    weeklyReviewExerciseNames,
  )
  const weeklyReviewScore = calculateWeeklyScore({
    workoutSummary: reviewWorkoutSummary,
    nutritionSummary: reviewNutritionSummary,
    bodySummary: reviewBodySummary,
    muscleVolume: reviewMuscleVolume,
    strengthComparison: reviewStrengthComparison,
  })
  const hasWeeklyReviewData =
    sessions.length > 0 || bodyCheckIns.length > 0 || nutritionLogs.length > 0
  const progressionFocus = getTodayProgressionFocus(
    sessions,
    todayWorkout.exercises,
  )
  const hasProgressionData = progressionFocus.some(
    (suggestion) => suggestion.type !== 'no-data',
  )
  const todayCoachAdvice = getTodayWorkoutAdvice({
    todayWorkout,
    sessions,
    progressionSuggestions: progressionFocus,
  })
  const readiness = calculateReadinessScore({
    sessions,
    nutritionLogs,
    bodyCheckIns,
  })
  const nutritionAdvice = getNutritionCoachAdvice(nutritionLogs)
  const bodyAdvice = getBodyRecompositionAdvice(bodyCheckIns, sessions)
  const absPostureAdvice = getAbsPostureAdvice(sessions, activePlan)
  const coachWarnings = getCoachWarnings({
    sessions,
    nutritionLogs,
    bodyCheckIns,
    muscleVolume: reviewMuscleVolume,
    warningSensitivity: settings.coach.warningSensitivity,
  })
  const coachActionPlan = generateTodayActionPlan({
    todayWorkout,
    readiness,
    nutritionAdvice,
    bodyAdvice,
    absPostureAdvice,
    warnings: coachWarnings,
  })
  const reminderStatus = getDashboardReminderStatus(
    reminderSettings,
    notificationPermission,
  )
  const importantReminders: DashboardReminder[] = []
  for (const reminder of reminders) {
    if (
      importantReminders.length < 2 &&
      isDashboardReminder(reminder) &&
      reminder.type !== 'rest-timer'
    ) {
      importantReminders.push(reminder)
    }
  }

  function openReminderSettings() {
    try {
      window.sessionStorage.setItem('settingsActiveTab', 'reminders')
    } catch {
      // Settings can still open on its default tab.
    }
    onNavigate('settings')
  }

  return (
    <section className="dashboard">
      <header className="dashboard-hero">
        <div>
          <p className="eyebrow">Training Dashboard</p>
          <h1>
            Today: Day {todayWorkout.day} - {todayWorkout.name}
          </h1>
          <p>
            Track training, last lifts, body changes, and posture without
            turning the app into a messy workout list.
          </p>
        </div>
        <div className="dashboard-hero__aside">
          <div className="hero-target">
            <Target size={22} strokeWidth={2.4} aria-hidden="true" />
            <span>Main Target</span>
            <strong>{settings.profile.trainingGoal}</strong>
          </div>
          <InstallPWAButton compact />
        </div>
      </header>

      {activeWorkoutHasSession && activeWorkout ? (
        <article className="active-workout-banner">
          <div className="active-workout-banner__text">
            <p className="eyebrow">
              <PlayCircle size={16} strokeWidth={2.4} aria-hidden="true" />
              Unfinished workout
            </p>
            <h2>
              You have an unfinished workout: {activeWorkout.workoutName}
            </h2>
            <p>
              {getCompletedSetsCount(activeWorkout)} of{' '}
              {getTotalPlannedSets(activeWorkout)} sets logged. Pick up right
              where you left off. Unfinished workout saved locally.
            </p>
          </div>
          <button
            className="workout-primary-button active-workout-banner__button"
            onClick={() => onNavigate('today-workout')}
            type="button"
          >
            <PlayCircle size={19} strokeWidth={2.4} aria-hidden="true" />
            Continue
          </button>
        </article>
      ) : null}

      {importantReminders.length > 0 ? (
        <section className="dashboard-reminder-strip" aria-label="Active reminders">
          {importantReminders.map((reminder) => (
            <article className="dashboard-reminder-strip__item" key={reminder.id}>
              <span>{getDashboardReminderBadge(reminder.type)}</span>
              <p>{reminder.message}</p>
            </article>
          ))}
        </section>
      ) : null}

      <article className="dashboard-card sync-status-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Sync Status</p>
            <h2>{isOnline ? 'Online' : 'Offline'}</h2>
          </div>
          {isOnline ? (
            <Wifi size={22} strokeWidth={2.4} aria-hidden="true" />
          ) : (
            <WifiOff size={22} strokeWidth={2.4} aria-hidden="true" />
          )}
        </div>
        <div className="mini-stat-grid">
          <div className="mini-stat">
            <span>Connection</span>
            <strong>{isOnline ? 'Online' : 'Offline'}</strong>
          </div>
          <div className="mini-stat">
            <span>Data mode</span>
            <strong>{cloudActive ? 'Cloud Sync On' : 'Local Mode'}</strong>
          </div>
          <div className="mini-stat">
            <span>Pending sync items</span>
            <strong>{pendingSyncCount}</strong>
          </div>
        </div>
        <p className="card-copy">
          {cloudActive
            ? 'Workout, body, and nutrition changes stay local first, then sync when possible.'
            : 'Local browser storage is active; training stays usable without internet.'}
        </p>
        {cloudActive ? (
          <Cloud className="sync-status-card__mode-icon" size={18} strokeWidth={2.4} aria-hidden="true" />
        ) : (
          <HardDrive className="sync-status-card__mode-icon" size={18} strokeWidth={2.4} aria-hidden="true" />
        )}
      </article>

      <div className="stat-grid" aria-label="Current training stats">
        <StatCard
          detail={latestCheckIn ? 'From latest check-in' : 'Current body weight'}
          icon={Scale}
          label="Weight"
          value={currentWeight}
        />
        <StatCard
          detail="From profile settings"
          icon={ShieldCheck}
          label="Goal Weight"
          value={goalWeight}
        />
        <StatCard
          detail={settings.profile.trainingTimePerDay}
          icon={Target}
          label="Main Focus"
          value={settings.profile.mainFocus}
        />
        <StatCard
          detail="Available equipment"
          icon={Settings}
          label="Equipment"
          value={equipmentSummary}
        />
        <StatCard
          detail={latestSession ? formatSessionDate(latestSession.date) : 'No saved workouts'}
          icon={CalendarCheck2}
          label="Latest Workout"
          value={latestSession?.workoutName ?? 'None yet'}
        />
        <StatCard
          detail={`${weeklyCompleted}/${weeklyTarget} completed this week`}
          icon={Trophy}
          label="Weekly Progress"
          value={`${Math.round((weeklyCompleted / weeklyTarget) * 100)}%`}
        />
      </div>

      <div className="dashboard-grid">
        <WorkoutCard onNavigate={onNavigate} workout={todayWorkout} />

        <article className="dashboard-card reminders-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Reminders</p>
              <h2>Notification status</h2>
            </div>
            <BellRing size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>
          <div className="mini-stat-grid">
            <div className="mini-stat">
              <span>Notification status</span>
              <strong>{reminderStatus}</strong>
            </div>
            <div className="mini-stat">
              <span>Workout reminder</span>
              <strong>
                {reminderSettings.workoutReminderEnabled
                  ? reminderSettings.workoutReminderTime
                  : 'Off'}
              </strong>
            </div>
            <div className="mini-stat">
              <span>Creatine reminder</span>
              <strong>
                {reminderSettings.creatineReminderEnabled
                  ? reminderSettings.creatineReminderTime
                  : 'Off'}
              </strong>
            </div>
            <div className="mini-stat">
              <span>Pending reminders</span>
              <strong>{reminderCount}</strong>
            </div>
          </div>
          <p className="card-copy">
            Browser alerts stay opt-in. In-app reminders keep working even when
            notifications are unavailable.
          </p>
          <QuickActionButton
            icon={BellRing}
            label="Open Reminder Settings"
            onClick={openReminderSettings}
            variant="primary"
          />
        </article>

        <article className="dashboard-card smart-coach-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Smart Coach</p>
              <h2>Daily advice</h2>
            </div>
            <Brain size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>
          <div className="mini-stat-grid">
            <div className="mini-stat">
              <span>Readiness</span>
              <strong>{readiness.score}/100</strong>
            </div>
            <div className="mini-stat">
              <span>Status</span>
              <strong>{readiness.label}</strong>
            </div>
          </div>
          <p className="card-copy">{todayCoachAdvice.message}</p>
          <div className="coach-mini-actions">
            {coachActionPlan.slice(0, 2).map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
          <QuickActionButton
            icon={Brain}
            label="Open Coach"
            onClick={() => onNavigate('coach')}
            variant="primary"
          />
        </article>

        <article className="dashboard-card progression-focus-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Today's Progression Focus</p>
              <h2>What to push</h2>
            </div>
            <Target size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>
          {hasProgressionData ? (
            <div className="progression-focus-list">
              {progressionFocus.map((suggestion) => (
                <ProgressionSuggestionCard
                  compact
                  key={suggestion.exerciseName}
                  suggestion={suggestion}
                />
              ))}
            </div>
          ) : (
            <p className="card-copy">
              No data yet. Complete workouts to unlock suggestions.
            </p>
          )}
          <QuickActionButton
            icon={BarChart3}
            label="See All Suggestions"
            onClick={() => onNavigate('progress')}
          />
        </article>

        <article className="dashboard-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Weekly Progress</p>
              <h2>
                {weeklyCompleted}/{weeklyTarget} workouts
              </h2>
            </div>
            <BarChart3 size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>
          <ProgressBar
            label="Workouts completed"
            max={weeklyTarget}
            value={weeklyCompleted}
          />
          <p className="card-copy">
            {weeklyCompleted > 0
              ? `Latest: ${latestSession?.workoutName ?? 'Workout'} on ${
                  latestSession ? formatSessionDate(latestSession.date) : 'today'
                }.`
              : 'No saved workouts yet this week.'}{' '}
            Keep shin-friendly conditioning low impact until running feels
            better.
          </p>
        </article>

        <article className="dashboard-card weekly-review-teaser-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Coach Summary</p>
              <h2>Weekly Review</h2>
            </div>
            <ClipboardCheck size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>
          {hasWeeklyReviewData ? (
            <>
              <div className="mini-stat-grid">
                <div className="mini-stat">
                  <span>This week score</span>
                  <strong>{weeklyReviewScore.score}/100</strong>
                </div>
                <div className="mini-stat">
                  <span>Workouts</span>
                  <strong>
                    {reviewWorkoutSummary.completedWorkouts}/
                    {reviewWorkoutSummary.targetWorkouts}
                  </strong>
                </div>
                <div className="mini-stat">
                  <span>Protein target days</span>
                  <strong>{reviewNutritionSummary.proteinTargetDays}</strong>
                </div>
                <div className="mini-stat">
                  <span>Check-in</span>
                  <strong>{reviewBodySummary.hasCurrent ? 'Done' : 'Missing'}</strong>
                </div>
              </div>
              <p className="card-copy">{weeklyReviewScore.message}</p>
            </>
          ) : (
            <p className="card-copy">
              Complete workouts and logs to unlock weekly review.
            </p>
          )}
          <QuickActionButton
            icon={ClipboardCheck}
            label="View Weekly Review"
            onClick={() => onNavigate('weekly-review')}
            variant={hasWeeklyReviewData ? 'primary' : undefined}
          />
        </article>

        <article className="dashboard-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Body Stats</p>
              <h2>Body Check-in</h2>
            </div>
            <Activity size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>
          {latestCheckIn ? (
            <>
              <div className="mini-stat-grid">
                {bodyStatItems.map((stat) => (
                  <div className="mini-stat" key={stat.label}>
                    <span>{stat.label}</span>
                    <strong>{stat.value}</strong>
                  </div>
                ))}
              </div>
              <p className="card-copy">
                Latest check-in: {formatCheckInDate(latestCheckIn.date)}
              </p>
            </>
          ) : (
            <div className="mini-stat-empty">
              <p>No body check-in yet.</p>
              <QuickActionButton
                icon={Ruler}
                label="Log Body Measurements"
                onClick={() => onNavigate('body-check-in')}
              />
            </div>
          )}
        </article>

        <article className="dashboard-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Nutrition</p>
              <h2>Today's fuel</h2>
            </div>
            <Utensils size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>
          {todayNutrition ? (
            <>
              <div className="mini-stat-grid">
                <div className="mini-stat">
                  <span>Protein</span>
                  <strong>
                    {todayNutrition.proteinGrams != null
                      ? `${todayNutrition.proteinGrams} g`
                      : '—'}
                  </strong>
                </div>
                <div className="mini-stat">
                  <span>Water</span>
                  <strong>
                    {todayNutrition.waterLiters != null
                      ? `${todayNutrition.waterLiters} L`
                      : '—'}
                  </strong>
                </div>
                <div className="mini-stat">
                  <span>Creatine</span>
                  <strong>{todayNutrition.creatineTaken ? 'Yes' : 'No'}</strong>
                </div>
                <div className="mini-stat">
                  <span>Whey</span>
                  <strong>{todayNutrition.wheyTaken ? 'Yes' : 'No'}</strong>
                </div>
              </div>
              <QuickActionButton
                icon={Utensils}
                label="Log Nutrition"
                onClick={() => onNavigate('nutrition')}
              />
            </>
          ) : (
            <div className="mini-stat-empty">
              <p>No nutrition log today.</p>
              <QuickActionButton
                icon={Utensils}
                label="Log Nutrition"
                onClick={() => onNavigate('nutrition')}
              />
            </div>
          )}
        </article>

        <article className="dashboard-card goal-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Goal</p>
              <h2>{goalWeight}</h2>
            </div>
            <ShieldCheck size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>
          <p>
            {goalSummary}. Body goal: {settings.goals.bodyGoal}. Weak point:{' '}
            {settings.goals.weakPoint}.
          </p>
        </article>

        <article className="dashboard-card quick-actions-card">
          <div>
            <p className="eyebrow">Quick Actions</p>
            <h2>Move fast</h2>
          </div>
          <div className="quick-actions">
            <QuickActionButton
              icon={ClipboardPenLine}
              label="Start Today's Workout"
              onClick={() => onNavigate('today-workout')}
              variant="primary"
            />
            <QuickActionButton
              icon={Ruler}
              label="Log Body Measurements"
              onClick={() => onNavigate('body-check-in')}
            />
            <QuickActionButton
              icon={Utensils}
              label="Log Nutrition"
              onClick={() => onNavigate('nutrition')}
            />
            <QuickActionButton
              icon={BarChart3}
              label="View Progress"
              onClick={() => onNavigate('progress')}
            />
            <QuickActionButton
              icon={Settings}
              label="Edit Plan"
              onClick={() => onNavigate('plan-editor')}
            />
          </div>
        </article>

        <article className="dashboard-card posture-card">
          <div>
            <p className="eyebrow">Posture Reminder</p>
            <h2>Arched-back correction</h2>
          </div>
          <p>{userProfile.postureReminder}</p>
        </article>

        <article className="dashboard-card form-reminder-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Form Reminder</p>
              <h2>Before heavy sets</h2>
            </div>
            <BookOpen size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>
          <p className="card-copy">
            Before heavy sets: ribs down, abs tight, glutes slightly squeezed.
            Do not over-arch your lower back.
          </p>
          <QuickActionButton
            icon={Library}
            label="Open Exercise Library"
            onClick={() => onNavigate('exercise-library')}
            variant="primary"
          />
        </article>
      </div>

      <div className="lower-grid">
        <article className="dashboard-card">
          <div>
            <p className="eyebrow">Last Time</p>
            <h2>Lift / Ability Targets</h2>
          </div>
          <div className="performance-list">
            {userProfile.lastPerformance.map((item) => (
              <div className="performance-row" key={item.movement}>
                <div>
                  <strong>{item.movement}</strong>
                  <span>Last: {item.result}</span>
                </div>
                <p>{item.target}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card">
          <div>
            <p className="eyebrow">Body Change</p>
            <h2>Measurements to watch</h2>
          </div>
          <div className="measurement-grid">
            {userProfile.measurements.map((measurement) => (
              <div className="measurement-tile" key={measurement.label}>
                <span>{measurement.label}</span>
                <strong>{measurement.value}</strong>
                <p>{measurement.note}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

function formatSessionDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function formatBodyStat(value: number | null, unit: string) {
  return value === null ? '—' : `${value} ${unit}`
}

function summarizeList(items: string[]) {
  if (!Array.isArray(items) || items.length === 0) {
    return 'None set'
  }

  if (items.length <= 2) {
    return items.join(', ')
  }

  return `${items.slice(0, 2).join(', ')} +${items.length - 2}`
}

function getDashboardReminderStatus(
  reminderSettings: any,
  notificationPermission: string,
) {
  if (notificationPermission === 'unsupported') {
    return 'In-app only'
  }

  if (
    notificationPermission === 'granted' &&
    reminderSettings.notificationsEnabled
  ) {
    return 'Browser on'
  }

  if (notificationPermission === 'denied') {
    return 'Blocked'
  }

  return 'In-app only'
}

function getDashboardReminderBadge(type: string) {
  switch (type) {
    case 'workout':
    case 'weekly-review':
      return 'Workout'
    case 'creatine':
      return 'Supplement'
    case 'protein':
    case 'water':
      return 'Nutrition'
    case 'body-check-in':
      return 'Body'
    case 'unfinished-workout':
    case 'rest-timer':
      return 'Safety'
    default:
      return 'System'
  }
}

function isDashboardReminder(reminder: unknown): reminder is DashboardReminder {
  return Boolean(
    reminder &&
      typeof reminder === 'object' &&
      'id' in reminder &&
      'message' in reminder &&
      'type' in reminder,
  )
}
