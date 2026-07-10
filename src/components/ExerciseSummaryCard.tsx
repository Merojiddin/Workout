import { ArrowRight, CheckCircle2, Flag, Plus, RotateCcw } from 'lucide-react'
import {
  isArchedBackRisk,
  isLoggedSet,
  type ActiveExercise,
} from '../utils/liveWorkoutUtils'

interface ExerciseSummaryCardProps {
  exerciseResult: ActiveExercise
  isLastExercise?: boolean
  onNextExercise: () => void
  onAddExtraSet: () => void
  onRepeatExercise: () => void
}

export function ExerciseSummaryCard({
  exerciseResult,
  isLastExercise = false,
  onNextExercise,
  onAddExtraSet,
  onRepeatExercise,
}: ExerciseSummaryCardProps) {
  const loggedSets = exerciseResult.sets.filter(isLoggedSet)
  const rpes = loggedSets
    .map((set) => (set.rpe === null ? 0 : set.rpe))
    .filter((value) => value > 0)
  const averageRpe =
    rpes.length > 0
      ? Math.round((rpes.reduce((sum, value) => sum + value, 0) / rpes.length) * 10) /
        10
      : null
  const maxPain = loggedSets.reduce(
    (max, set) => Math.max(max, set.painLevel ?? 0),
    0,
  )
  const mentionsBackPain =
    isArchedBackRisk(exerciseResult.exerciseName) &&
    loggedSets.some((set) => /back pain/i.test(set.notes))

  return (
    <article className="exercise-summary-card dashboard-card">
      <div className="exercise-summary-card__head">
        <span className="exercise-summary-card__badge" aria-hidden="true">
          <CheckCircle2 size={22} strokeWidth={2.4} />
        </span>
        <div>
          <p className="eyebrow">Exercise complete</p>
          <h2>{exerciseResult.exerciseName}</h2>
        </div>
      </div>

      {loggedSets.length > 0 ? (
        <ul className="exercise-summary-card__sets">
          {loggedSets.map((set) => (
            <li key={set.setNumber}>
              <strong>Set {set.setNumber}</strong>
              <span>
                {formatValue(set.reps, 'reps')}
                {set.weightKg !== null && set.weightKg > 0
                  ? ` , ${set.weightKg} kg`
                  : ''}
                {set.rpe !== null ? ` , RPE ${set.rpe}` : ''}
                {set.painLevel !== null && set.painLevel > 0
                  ? ` , pain ${set.painLevel}`
                  : ''}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="card-copy">No sets were logged for this exercise.</p>
      )}

      {maxPain >= 4 ? (
        <p className="safety-warning safety-warning--danger">
          Pain detected. Do not increase load. Reduce intensity or stop this
          exercise.
        </p>
      ) : null}

      {averageRpe === 10 ? (
        <p className="safety-warning safety-warning--warn">
          Too close to max effort. Keep 1-2 reps in reserve for muscle growth.
        </p>
      ) : null}

      {mentionsBackPain ? (
        <p className="safety-warning safety-warning--warn">
          Check posture. Keep ribs down and avoid over-arching.
        </p>
      ) : null}

      <div className="exercise-summary-card__actions">
        <button
          className="workout-primary-button"
          onClick={onNextExercise}
          type="button"
        >
          {isLastExercise ? (
            <>
              <Flag size={19} strokeWidth={2.4} aria-hidden="true" />
              Finish Workout
            </>
          ) : (
            <>
              <ArrowRight size={19} strokeWidth={2.4} aria-hidden="true" />
              Next Exercise
            </>
          )}
        </button>
        <button
          className="workout-secondary-button"
          onClick={onAddExtraSet}
          type="button"
        >
          <Plus size={19} strokeWidth={2.4} aria-hidden="true" />
          Add Extra Set
        </button>
        <button
          className="workout-secondary-button"
          onClick={onRepeatExercise}
          type="button"
        >
          <RotateCcw size={19} strokeWidth={2.4} aria-hidden="true" />
          Repeat Exercise
        </button>
      </div>
    </article>
  )
}

function formatValue(value: number | null, suffix: string) {
  return value === null ? `- ${suffix}` : `${value} ${suffix}`
}
