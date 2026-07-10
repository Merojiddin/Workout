import { X } from 'lucide-react'
import type { WorkoutSession } from '../data/workoutSessions'
import {
  formatSessionDate,
  getAverageRpe,
  getSessionDuration,
} from '../utils/progressUtils'

interface WorkoutDetailModalProps {
  onClose: () => void
  session: WorkoutSession
}

export function WorkoutDetailModal({ onClose, session }: WorkoutDetailModalProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="workout-detail-title"
        aria-modal="true"
        className="workout-detail-modal"
        role="dialog"
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">{formatSessionDate(session.date)}</p>
            <h2 id="workout-detail-title">{session.workoutName}</h2>
            <p>Duration: {getSessionDuration(session)}</p>
          </div>
          <button
            aria-label="Close workout details"
            className="modal-close-button"
            onClick={onClose}
            type="button"
          >
            <X size={20} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </header>

        <div className="detail-exercise-list">
          {session.exercises.map((exercise) => {
            const averageRpe = getAverageRpe(exercise.sets)

            return (
              <article className="detail-exercise" key={exercise.exerciseName}>
                <div className="detail-exercise__heading">
                  <div>
                    <h3>{exercise.exerciseName}</h3>
                    <p>
                      Target: {exercise.targetSets} sets x {exercise.targetReps}
                    </p>
                  </div>
                  <span>Avg RPE {averageRpe ?? '-'}</span>
                </div>

                <div className="detail-set-grid">
                  {exercise.sets.map((set) => (
                    <div className="detail-set" key={set.setNumber}>
                      <strong>Set {set.setNumber}</strong>
                      <span>Reps: {set.reps ?? '-'}</span>
                      <span>Weight: {set.weightKg ?? '-'} kg</span>
                      <span>RPE: {set.rpe ?? '-'}</span>
                      {set.notes ? <p>{set.notes}</p> : null}
                    </div>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
