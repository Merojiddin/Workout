import { Clock3 } from 'lucide-react'

interface LiveWorkoutHeaderProps {
  workoutName: string
  currentExerciseIndex: number
  totalExercises: number
  doneSets: number
  totalSets: number
  duration: number
}

/**
 * One line of orientation and a progress bar. Anything more (next exercise,
 * set counts, session guidance) lives in the collapsible exercise list.
 */
export function LiveWorkoutHeader({
  workoutName,
  currentExerciseIndex,
  totalExercises,
  doneSets,
  totalSets,
  duration,
}: LiveWorkoutHeaderProps) {
  const progress = Math.min((doneSets / Math.max(totalSets, 1)) * 100, 100)

  return (
    <header className="live-header">
      <div className="live-header__top">
        <span className="live-header__name">{workoutName}</span>
        <span className="live-header__timer">
          <Clock3 size={14} strokeWidth={2.4} aria-hidden="true" />
          {duration} min
        </span>
      </div>

      <div
        className="live-header__progress"
        role="progressbar"
        aria-label="Sets completed"
        aria-valuemin={0}
        aria-valuemax={totalSets}
        aria-valuenow={doneSets}
      >
        <span style={{ width: `${progress}%` }} />
      </div>

      <p className="live-header__position">
        Exercise {Math.min(currentExerciseIndex + 1, totalExercises)} of{' '}
        {totalExercises}
      </p>
    </header>
  )
}
