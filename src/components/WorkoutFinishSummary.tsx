import {
  BarChart3,
  ClipboardCheck,
  Home,
  ShieldAlert,
  Trophy,
} from 'lucide-react'
import type { LoggedSet, WorkoutSession } from '../data/workoutSessions'

interface WorkoutFinishSummaryProps {
  session: WorkoutSession
  onDashboard: () => void
  onProgress: () => void
  onWeeklyReview: () => void
}

export function WorkoutFinishSummary({
  session,
  onDashboard,
  onProgress,
  onWeeklyReview,
}: WorkoutFinishSummaryProps) {
  const standalone = session?.sessionType === 'standalone'
  const exercises = Array.isArray(session?.exercises) ? session.exercises : []
  const allSets: LoggedSet[] = exercises.flatMap((exercise) =>
    Array.isArray(exercise?.sets) ? exercise.sets : [],
  )
  const loggedSets = allSets.filter(isCompletedSet)
  const completedExercises = exercises.filter((exercise) =>
    (Array.isArray(exercise?.sets) ? exercise.sets : []).some(isCompletedSet),
  ).length

  const totalVolume = loggedSets.reduce((sum, set) => {
    const reps = num(set?.reps)
    const weight = num(set?.weightKg)
    return weight > 0 && reps > 0 ? sum + weight * reps : sum
  }, 0)

  const rpes = loggedSets.map((set) => num(set?.rpe)).filter((value) => value > 0)
  const averageRpe =
    rpes.length > 0
      ? Math.round((rpes.reduce((sum, value) => sum + value, 0) / rpes.length) * 10) /
        10
      : null

  const painWarnings = exercises.flatMap((exercise) =>
    (Array.isArray(exercise?.sets) ? exercise.sets : [])
      .filter((set) => num(set?.painLevel) >= 4)
      .map((set) => ({
        name: exercise?.exerciseName ?? 'Exercise',
        setNumber: num(set?.setNumber),
        painLevel: num(set?.painLevel),
      })),
  )

  return (
    <section className="finish-screen dashboard-card">
      <div className="finish-screen__badge" aria-hidden="true">
        <Trophy size={34} strokeWidth={2.4} />
      </div>
      <p className="eyebrow">Workout completed</p>
      <h1>{session?.workoutName ?? 'Workout'}</h1>
      {standalone ? <p className="card-copy">Standalone workout</p> : null}
      <p>Saved safely to your workout history.</p>

      <div className="finish-summary-grid">
        <div>
          <span>Exercises completed</span>
          <strong>{completedExercises}</strong>
        </div>
        <div>
          <span>Sets completed</span>
          <strong>{loggedSets.length}</strong>
        </div>
        <div>
          <span>Total volume</span>
          <strong>
            {totalVolume > 0 ? `${roundHalf(totalVolume)} kg` : '-'}
          </strong>
        </div>
        <div>
          <span>Average RPE</span>
          <strong>{averageRpe ?? '-'}</strong>
        </div>
        <div>
          <span>Duration</span>
          <strong>{formatDuration(session?.startedAt, session?.finishedAt)}</strong>
        </div>
        <div>
          <span>Save confirmation</span>
          <strong>Saved</strong>
        </div>
      </div>

      {painWarnings.length > 0 ? (
        <div className="finish-pain-warning">
          <p>
            <ShieldAlert size={17} strokeWidth={2.4} aria-hidden="true" />
            Pain warnings
          </p>
          <ul>
            {painWarnings.map((warning) => (
              <li key={`${warning.name}-${warning.setNumber}`}>
                {warning.name} - set {warning.setNumber} logged pain{' '}
                {warning.painLevel}. Keep the load light next time.
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="finish-actions">
        <button
          className="workout-secondary-button"
          onClick={onDashboard}
          type="button"
        >
          <Home size={19} strokeWidth={2.4} aria-hidden="true" />
          Back to Dashboard
        </button>
        <button
          className="workout-secondary-button"
          onClick={onProgress}
          type="button"
        >
          <BarChart3 size={19} strokeWidth={2.4} aria-hidden="true" />
          View Progress
        </button>
        <button
          className="workout-primary-button"
          onClick={onWeeklyReview}
          type="button"
        >
          <ClipboardCheck size={19} strokeWidth={2.4} aria-hidden="true" />
          View Weekly Review
        </button>
      </div>
    </section>
  )
}

function num(value: number | null | undefined): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function isCompletedSet(set: LoggedSet | null | undefined): boolean {
  return num(set?.reps) > 0 || num(set?.timeSeconds) > 0
}

function roundHalf(value: number): number {
  return Math.round(value * 2) / 2
}

function formatDuration(startedAt?: string, finishedAt?: string): string {
  if (!startedAt || !finishedAt) {
    return '-'
  }

  const milliseconds =
    new Date(finishedAt).getTime() - new Date(startedAt).getTime()
  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    return '-'
  }

  const totalMinutes = Math.max(Math.round(milliseconds / 60000), 1)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return hours === 0 ? `${minutes} min` : `${hours}h ${minutes}m`
}
