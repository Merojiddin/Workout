import { CheckCircle2, Clock3, Dumbbell } from 'lucide-react'

interface LiveWorkoutHeaderProps {
  workoutName: string
  currentExerciseIndex: number
  totalExercises: number
  completedSets: number
  totalSets: number
  duration: number
}

export function LiveWorkoutHeader({
  workoutName,
  currentExerciseIndex,
  totalExercises,
  completedSets,
  totalSets,
  duration,
}: LiveWorkoutHeaderProps) {
  const safeTotalSets = Math.max(totalSets, 1)
  const progress = Math.min((completedSets / safeTotalSets) * 100, 100)

  return (
    <header className="live-header">
      <div className="live-header__top">
        <div className="live-header__title">
          <p className="eyebrow">Live Workout</p>
          <h1>{workoutName}</h1>
        </div>
        <span className="live-header__timer">
          <Clock3 size={16} strokeWidth={2.4} aria-hidden="true" />
          {duration} min
        </span>
      </div>

      <div className="live-header__meta">
        <span>
          <Dumbbell size={15} strokeWidth={2.4} aria-hidden="true" />
          Exercise {Math.min(currentExerciseIndex + 1, totalExercises)} of{' '}
          {totalExercises}
        </span>
        <span>
          <CheckCircle2 size={15} strokeWidth={2.4} aria-hidden="true" />
          {completedSets} / {totalSets} sets
        </span>
      </div>

      <div
        className="live-header__progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={totalSets}
        aria-valuenow={completedSets}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
    </header>
  )
}
