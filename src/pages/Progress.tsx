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
import { getHistoricalExerciseCatalog } from '../data/exerciseIdentity'
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
  getEffectiveExerciseLibrary,
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
import { getProgressionSuggestion } from '../utils/progressionUtils'
import { getExerciseLoggingMode } from '../utils/exerciseLoggingUtils'
import {
  getActiveWorkoutProgram,
  getProgramNutritionTargets,
} from '../utils/activeWorkoutProgram'
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
  const [selectedExerciseKey, setSelectedExerciseKey] = useState('')
  const activeProgram = useMemo(() => getActiveWorkoutProgram(), [])
  const activePlan = activeProgram.days
  const identityExerciseContainers = useMemo(
    () => [...activePlan, ...activeProgram.standaloneWorkouts],
    [activePlan, activeProgram.standaloneWorkouts],
  )
  const effectiveExerciseLibrary = useMemo(
    () => getEffectiveExerciseLibrary(),
    [],
  )
  const settings = useMemo(() => getUserProfileSettings(), [])
  const exerciseCatalog = useMemo(
    () =>
      getHistoricalExerciseCatalog(sessions, identityExerciseContainers, {
        library: effectiveExerciseLibrary,
      }),
    [effectiveExerciseLibrary, identityExerciseContainers, sessions],
  )
  const activeExerciseCatalog = useMemo(
    () => exerciseCatalog.filter((exercise) => exercise.active),
    [exerciseCatalog],
  )
  const selectedExercise = useMemo(() => {
    const selected = exerciseCatalog.find(
      (exercise) => exercise.key === selectedExerciseKey,
    )
    if (selected) {
      return selected
    }

    return (
      exerciseCatalog.find(
        (exercise) =>
          exercise.active &&
          getExerciseLoggingMode({
            targetDuration: exercise.targetDuration,
            targetReps: exercise.targetReps,
          }) === 'reps',
      ) ?? exerciseCatalog[0] ?? null
    )
  }, [exerciseCatalog, selectedExerciseKey])

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
    () =>
      getThisWeekSessions(sessions)
        .filter(isWorkoutCompleted)
        .filter((session) => session.sessionType !== 'standalone'),
    [sessions],
  )
  const weeklyCompletion = useMemo(
    () => getWeeklyCompletion(sessions),
    [sessions],
  )
  const muscleVolume = useMemo(
    () =>
      getWeeklyMuscleVolume(
        sessions,
        activePlan,
        new Date(),
        effectiveExerciseLibrary,
      ),
    [activePlan, effectiveExerciseLibrary, sessions],
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
  const proteinTargets = useMemo(
    () => getProgramNutritionTargets(activeProgram),
    [activeProgram],
  )
  const nutritionWeekly = useMemo(
    () => getWeeklyNutritionSummary(nutritionLogs, proteinTargets.proteinMin),
    [nutritionLogs, proteinTargets.proteinMin],
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
      activeExerciseCatalog.map((catalogExercise) => {
        return {
          key: catalogExercise.key,
          suggestion: getProgressionSuggestion(
            {
              duration: catalogExercise.targetDuration,
              equipment: catalogExercise.equipment,
              id:
                catalogExercise.exerciseId ??
                catalogExercise.canonicalId ??
                undefined,
              muscleGroup: catalogExercise.muscleGroup,
              name: catalogExercise.displayName,
              repRange: catalogExercise.targetReps,
              sets: catalogExercise.targetSets,
              targetRir: catalogExercise.targetRir,
            },
            sessions,
            { library: effectiveExerciseLibrary },
          ),
        }
      }),
    [activeExerciseCatalog, effectiveExerciseLibrary, sessions],
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
          subtitle="Scheduled Monday-Sunday sessions"
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
            {progressionSuggestions.map(({ key, suggestion }) => (
              <ProgressionSuggestionCard
                key={key}
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
            <h2>Exercise history</h2>
          </div>
        </div>
        {selectedExercise ? (
          <>
            <label className="settings-field settings-field--wide">
              Exercise
              <select
                className="settings-input"
                onChange={(event) => setSelectedExerciseKey(event.target.value)}
                value={selectedExercise.key}
              >
                {exerciseCatalog.map((exercise) => (
                  <option key={exercise.key} value={exercise.key}>
                    {exercise.displayName}
                    {exercise.archived ? ' — Archived' : ''}
                    {exercise.unknown ? ' — Unknown exercise' : ''}
                  </option>
                ))}
              </select>
            </label>
            <div className="chart-grid">
              <ProgressChart
                badges={[
                  ...(selectedExercise.archived ? ['Archived'] : []),
                  ...(selectedExercise.unknown ? ['Unknown exercise'] : []),
                ]}
                data={getExerciseProgress(
                  sessions,
                  selectedExercise,
                  effectiveExerciseLibrary,
                )}
                dataKey="value"
                description={
                  selectedExercise.archived
                    ? 'Not in the current program. Historical data remains available.'
                    : selectedExercise.unknown
                      ? 'No shared Exercise Library or explicit alias match was found.'
                      : undefined
                }
                emptyMessage={`No repetition-based ${selectedExercise.displayName} data yet.`}
                key={selectedExercise.key}
                title={selectedExercise.displayName}
                valueLabel="Best result"
              />
            </div>
          </>
        ) : (
          <div className="chart-empty-state">
            No active or historical exercises found yet.
          </div>
        )}
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
              subtitle={`Target ${proteinTargets.proteinMin}–${proteinTargets.proteinMax} g/day`}
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
        activePlan={identityExerciseContainers}
        exerciseLibrary={effectiveExerciseLibrary}
        onSelectSession={setSelectedSession}
        sessions={sortedSessions}
      />

      {selectedSession ? (
        <WorkoutDetailModal
          activePlan={identityExerciseContainers}
          exerciseLibrary={effectiveExerciseLibrary}
          onClose={() => setSelectedSession(null)}
          session={selectedSession}
        />
      ) : null}
    </section>
  )
}
