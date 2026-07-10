import {
  ClipboardCheck,
  Database,
  FileSpreadsheet,
  PlusCircle,
  Sparkles,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { MeasurementChart } from '../components/MeasurementChart'
import { OverviewCard } from '../components/OverviewCard'
import { ProgressChart } from '../components/ProgressChart'
import { ProgressPhotosCard } from '../components/ProgressPhotosCard'
import { ProgressionSuggestionCard } from '../components/ProgressionSuggestionCard'
import { WorkoutDetailModal } from '../components/WorkoutDetailModal'
import { WorkoutHistoryTable } from '../components/WorkoutHistoryTable'
import type { WorkoutSession } from '../data/workoutSessions'
import { exportWorkoutSessionsCSV } from '../utils/exportUtils'
import {
  addDemoSessions,
  formatSessionDate,
  getExerciseProgress,
  getLatestWorkoutSession,
  getMostTrainedMuscle,
  getThisWeekSessions,
  getTotalSets,
  getTotalWorkouts,
  getWeeklyCompletion,
  getWeeklyMuscleVolume,
  getWorkoutSessions,
  isWorkoutCompleted,
} from '../utils/progressUtils'
import {
  getCustomWorkoutPlan,
  getUserProfileSettings,
} from '../utils/settingsUtils'
import {
  checkInHasPhotos,
  getBodyCheckIns,
  getLatestCheckIn,
  getMeasurementProgress,
  type MeasurementKey,
} from '../utils/bodyCheckInUtils'
import {
  getNutritionChartData,
  getNutritionLogs,
  getWeeklyNutritionSummary,
} from '../utils/nutritionUtils'
import { getSuggestionForExerciseName } from '../utils/progressionUtils'
import { NutritionChart } from '../components/NutritionChart'
import type { PageId } from '../types/navigation'

const bodyCharts: { key: MeasurementKey; title: string; unit: string }[] = [
  { key: 'bodyWeightKg', title: 'Weight', unit: 'kg' },
  { key: 'waistCm', title: 'Waist', unit: 'cm' },
  { key: 'chestCm', title: 'Chest', unit: 'cm' },
  { key: 'shouldersCm', title: 'Shoulders', unit: 'cm' },
]

interface ProgressProps {
  onNavigate: (page: PageId) => void
}

export function Progress({ onNavigate }: ProgressProps) {
  const [sessions, setSessions] = useState(() => getWorkoutSessions())
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(
    null,
  )
  const activePlan = useMemo(() => getCustomWorkoutPlan(), [])
  const settings = useMemo(() => getUserProfileSettings(), [])
  const trackedExercises = useMemo(
    () =>
      Array.from(
        new Set(
          activePlan.flatMap((day: any) =>
            day.exercises.map((exercise: any) => exercise.name),
          ),
        ),
      ),
    [activePlan],
  )

  const completedSessions = useMemo(
    () => sessions.filter(isWorkoutCompleted),
    [sessions],
  )
  const sortedSessions = useMemo(
    () =>
      [...sessions].sort(
        (a, b) =>
          new Date(b.finishedAt || b.date).getTime() -
          new Date(a.finishedAt || a.date).getTime(),
      ),
    [sessions],
  )
  const thisWeekSessions = useMemo(
    () => getThisWeekSessions(sessions).filter(isWorkoutCompleted),
    [sessions],
  )
  const weeklyCompletion = useMemo(
    () => getWeeklyCompletion(sessions),
    [sessions],
  )
  const muscleVolume = useMemo(
    () => getWeeklyMuscleVolume(sessions, activePlan),
    [activePlan, sessions],
  )
  const latestWorkout = getLatestWorkoutSession(sessions)
  const hasWorkoutData = completedSessions.length > 0
  const bodyCheckIns = useMemo(() => getBodyCheckIns(), [])
  const hasBodyData = bodyCheckIns.length > 0
  const latestBodyCheckIn = useMemo(
    () => getLatestCheckIn(bodyCheckIns),
    [bodyCheckIns],
  )
  const hasBodyPhotos = Boolean(
    latestBodyCheckIn && checkInHasPhotos(latestBodyCheckIn),
  )
  const nutritionLogs = useMemo(() => getNutritionLogs(), [])
  const hasNutritionData = nutritionLogs.length > 0
  const nutritionWeekly = useMemo(
    () => getWeeklyNutritionSummary(nutritionLogs),
    [nutritionLogs],
  )
  const proteinTrend = useMemo(
    () => getNutritionChartData(nutritionLogs, 'proteinGrams'),
    [nutritionLogs],
  )
  const weightTrend = useMemo(
    () => getNutritionChartData(nutritionLogs, 'bodyWeightKg'),
    [nutritionLogs],
  )
  const progressionSuggestions = useMemo(
    () =>
      trackedExercises.map((exerciseName) =>
        getSuggestionForExerciseName(exerciseName, sessions, activePlan),
      ),
    [activePlan, sessions, trackedExercises],
  )

  function handleAddDemoData() {
    setSessions(addDemoSessions(activePlan))
  }

  return (
    <section className="progress-page">
      <header className="progress-hero">
        <div>
          <p className="eyebrow">Progress</p>
          <h1>Track strength, volume, and consistency</h1>
          <p>
            Charts use the workoutSessions saved locally from Workout Mode.
          </p>
        </div>
        <div className="progress-hero-actions">
          <button
            className="demo-data-button demo-data-button--secondary"
            onClick={() => exportWorkoutSessionsCSV(sessions)}
            type="button"
          >
            <FileSpreadsheet size={19} strokeWidth={2.4} aria-hidden="true" />
            Export Workout CSV
          </button>
          <button
            className="demo-data-button demo-data-button--secondary"
            onClick={() => onNavigate('weekly-review')}
            type="button"
          >
            <ClipboardCheck size={19} strokeWidth={2.4} aria-hidden="true" />
            Open Weekly Review
          </button>
          <button
            className="demo-data-button"
            onClick={handleAddDemoData}
            type="button"
          >
            <PlusCircle size={19} strokeWidth={2.4} aria-hidden="true" />
            Add Demo Data
          </button>
        </div>
      </header>

      {!hasWorkoutData ? (
        <article className="progress-empty-card">
          <Database size={26} strokeWidth={2.4} aria-hidden="true" />
          <div>
            <h2>No workout data yet</h2>
            <p>Complete your first workout to see progress, or add demo data.</p>
          </div>
          <button
            className="workout-primary-button"
            onClick={handleAddDemoData}
            type="button"
          >
            Add Demo Data
          </button>
        </article>
      ) : null}

      <section className="overview-grid" aria-label="Progress overview">
        <OverviewCard
          subtitle="Completed sessions"
          title="Total workouts"
          value={String(getTotalWorkouts(sessions))}
        />
        <OverviewCard
          subtitle="Monday to Sunday"
          title="This week"
          value={String(thisWeekSessions.length)}
        />
        <OverviewCard
          subtitle="Logged working sets"
          title="Total sets"
          value={String(getTotalSets(sessions))}
        />
        <OverviewCard
          subtitle="By completed sets this week"
          title="Most trained"
          value={getMostTrainedMuscle(muscleVolume)}
        />
        <OverviewCard
          subtitle={latestWorkout ? latestWorkout.workoutName : 'No workouts completed yet'}
          title="Latest workout"
          value={latestWorkout ? formatSessionDate(latestWorkout.date) : '-'}
        />
        <OverviewCard
          subtitle="From settings"
          title="Current weight"
          value={`${settings.profile.currentWeightKg} kg`}
        />
      </section>

      <section className="progress-section">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Next Workout Suggestions</p>
            <h2>What to do next</h2>
          </div>
          <Sparkles size={22} strokeWidth={2.4} aria-hidden="true" />
        </div>
        {hasWorkoutData ? (
          <div className="progression-grid">
            {progressionSuggestions.map((suggestion) => (
              <ProgressionSuggestionCard
                key={suggestion.exerciseName}
                suggestion={suggestion}
              />
            ))}
          </div>
        ) : (
          <div className="chart-empty-state">
            No data yet. Complete workouts to unlock suggestions.
          </div>
        )}
      </section>

      <section className="progress-section">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Strength Progress</p>
            <h2>Important exercises</h2>
          </div>
        </div>
        <div className="chart-grid">
          {trackedExercises.map((exerciseName) => (
            <ProgressChart
              data={getExerciseProgress(sessions, exerciseName)}
              dataKey="value"
              emptyMessage={`No ${exerciseName} data yet.`}
              key={exerciseName}
              title={exerciseName}
              valueLabel="Best result"
            />
          ))}
        </div>
      </section>

      <section className="progress-section progress-two-column">
        <ProgressChart
          data={weeklyCompletion}
          dataKey="completed"
          emptyMessage="No workouts completed this week yet."
          title="Weekly Workout Completion"
          valueLabel="Completed"
          maxValue={1}
          variant="bar"
          xKey="day"
        />
        <ProgressChart
          data={muscleVolume}
          dataKey="sets"
          emptyMessage="No weekly muscle volume yet."
          title="Weekly Muscle Volume"
          valueLabel="Completed sets"
          variant="bar"
          xKey="muscle"
        />
      </section>

      {hasBodyPhotos && latestBodyCheckIn ? (
        <section className="progress-section">
          <ProgressPhotosCard
            checkIn={latestBodyCheckIn}
            onViewCheckIns={() => onNavigate('body-check-in')}
          />
        </section>
      ) : null}

      <section className="progress-section">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Body Progress</p>
            <h2>Body measurement changes</h2>
          </div>
        </div>
        {hasBodyData ? (
          <div className="chart-grid">
            {bodyCharts.map((chart) => (
              <MeasurementChart
                data={getMeasurementProgress(bodyCheckIns, chart.key)}
                dataKey="value"
                emptyMessage={`No ${chart.title.toLowerCase()} data yet.`}
                key={chart.key}
                title={chart.title}
                unit={chart.unit}
              />
            ))}
          </div>
        ) : (
          <div className="chart-empty-state">
            Add your first body check-in to track body changes.
          </div>
        )}
      </section>

      {hasNutritionData ? (
        <section className="progress-section">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Nutrition Progress</p>
              <h2>This week's nutrition</h2>
            </div>
          </div>
          <div className="overview-grid">
            <OverviewCard
              subtitle="Per logged day"
              title="Avg protein"
              value={`${nutritionWeekly.averageProtein} g`}
            />
            <OverviewCard
              subtitle={`${nutritionWeekly.creatineDays}/${nutritionWeekly.logCount} logged days`}
              title="Creatine consistency"
              value={
                nutritionWeekly.logCount > 0
                  ? `${Math.round(
                      (nutritionWeekly.creatineDays / nutritionWeekly.logCount) * 100,
                    )}%`
                  : '0%'
              }
            />
            <OverviewCard
              subtitle="Per logged day"
              title="Avg water"
              value={`${nutritionWeekly.averageWater} L`}
            />
          </div>
          <div className="chart-grid">
            <NutritionChart
              data={proteinTrend}
              emptyMessage="No protein data yet."
              title="Protein over time"
              unit="g"
            />
            <NutritionChart
              data={weightTrend}
              emptyMessage="No body weight data yet."
              title="Body weight over time"
              unit="kg"
            />
          </div>
        </section>
      ) : null}

      <WorkoutHistoryTable
        onSelectSession={setSelectedSession}
        sessions={sortedSessions}
      />

      {selectedSession ? (
        <WorkoutDetailModal
          onClose={() => setSelectedSession(null)}
          session={selectedSession}
        />
      ) : null}
    </section>
  )
}
