import { Check, Home } from 'lucide-react'
import { PostWorkoutNutritionCard } from './PostWorkoutNutritionCard'
import type { LoggedSet, WorkoutSession } from '../data/workoutSessions'
import type { NutritionGuidance } from '../utils/postWorkoutNutrition'

interface WorkoutFinishSummaryProps {
  session: WorkoutSession
  nutrition: NutritionGuidance
  onDone: () => void
}

/**
 * Three facts about the session, then what to eat. The old version showed six
 * stats and three navigation buttons; volume and RPE are meaningless when
 * logging is optional, so they are gone.
 */
export function WorkoutFinishSummary({
  session,
  nutrition,
  onDone,
}: WorkoutFinishSummaryProps) {
  const exercises = Array.isArray(session?.exercises) ? session.exercises : []
  const allSets: LoggedSet[] = exercises.flatMap((exercise) =>
    Array.isArray(exercise?.sets) ? exercise.sets : [],
  )
  const doneSets = allSets.filter(isDoneSet).length
  const doneExercises = exercises.filter((exercise) =>
    (Array.isArray(exercise?.sets) ? exercise.sets : []).some(isDoneSet),
  ).length

  return (
    <div className="finish-screen">
      <header className="finish-screen__head">
        <span className="finish-screen__badge" aria-hidden="true">
          <Check size={26} strokeWidth={3} />
        </span>
        <h1>Workout done</h1>
        <p>{session?.workoutName ?? 'Workout'} · saved</p>
      </header>

      <div className="finish-screen__stats">
        <div>
          <strong>{doneExercises}</strong>
          <span>exercises</span>
        </div>
        <div>
          <strong>{doneSets}</strong>
          <span>sets</span>
        </div>
        <div>
          <strong>{formatDuration(session?.startedAt, session?.finishedAt)}</strong>
          <span>time</span>
        </div>
      </div>

      <PostWorkoutNutritionCard guidance={nutrition} variant="after-workout" />

      <button className="workout-primary-button" onClick={onDone} type="button">
        <Home size={19} strokeWidth={2.4} aria-hidden="true" />
        Done
      </button>
    </div>
  )
}

/** Worked through, whether or not reps/kg were typed in. */
function isDoneSet(set: LoggedSet | null | undefined): boolean {
  return Boolean(set?.completedAt) || num(set?.reps) > 0 || num(set?.timeSeconds) > 0
}

function num(value: number | null | undefined): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
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
