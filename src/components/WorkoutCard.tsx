import { ClipboardList, Clock3, Play, Target } from 'lucide-react'
import type { WorkoutDay } from '../data/workoutPlan'
import { getExerciseTargetLabel } from '../utils/settingsUtils'
import { QuickActionButton } from './QuickActionButton'
import type { PageId } from '../types/navigation'

interface WorkoutCardProps {
  onNavigate: (page: PageId) => void
  workout: WorkoutDay
}

export function WorkoutCard({ onNavigate, workout }: WorkoutCardProps) {
  return (
    <article className="dashboard-card today-workout-card">
      <div className="card-heading">
        <div>
          <p className="eyebrow">Today's Workout</p>
          <h2>
            Day {workout.day} - {workout.name}
          </h2>
        </div>
        <span className="status-pill">Ready</span>
      </div>

      <div className="workout-meta">
        <div>
          <Clock3 size={20} strokeWidth={2.4} aria-hidden="true" />
          <span>Workout Time</span>
          <strong>{workout.estimatedTime}</strong>
        </div>
        <div>
          <ClipboardList size={20} strokeWidth={2.4} aria-hidden="true" />
          <span>Exercises</span>
          <strong>{workout.exercises.length}</strong>
        </div>
        <div>
          <Target size={20} strokeWidth={2.4} aria-hidden="true" />
          <span>Main Focus</span>
          <strong>{workout.focus.join(', ')}</strong>
        </div>
      </div>

      <div className="exercise-preview" aria-label="Today's exercises">
        {workout.exercises.length > 0 ? (
          workout.exercises.slice(0, 5).map((exercise) => (
            <div className="exercise-preview__row" key={exercise.name}>
              <span>{exercise.name}</span>
              <strong>{getExerciseTargetLabel(exercise)}</strong>
            </div>
          ))
        ) : (
          <div className="exercise-preview__row">
            <span>No exercises planned</span>
            <strong>Open Plan Editor</strong>
          </div>
        )}
      </div>

      <QuickActionButton
        icon={Play}
        label="Start Today's Workout"
        onClick={() => onNavigate('today-workout')}
        variant="primary"
      />
    </article>
  )
}
