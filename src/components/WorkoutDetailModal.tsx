import { X } from 'lucide-react'
import type { LibraryExercise } from '../data/exerciseLibrary'
import {
  normalizeExerciseName,
  resolveExerciseIdentity,
  type ExerciseContainer,
} from '../data/exerciseIdentity'
import type { WorkoutSession } from '../data/workoutSessions'
import {
  formatSessionDate,
  getAverageRpe,
  getSessionDuration,
} from '../utils/progressUtils'
import {
  formatDuration,
  isTimedExercise,
} from '../utils/exerciseLoggingUtils'

interface WorkoutDetailModalProps {
  activePlan?: readonly ExerciseContainer[]
  exerciseLibrary?: readonly LibraryExercise[]
  onClose: () => void
  session: WorkoutSession
}

export function WorkoutDetailModal({
  activePlan,
  exerciseLibrary,
  onClose,
  session,
}: WorkoutDetailModalProps) {
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
            {isStandaloneWorkoutSession(session) ? (
              <p>Standalone workout</p>
            ) : null}
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
          {session.exercises.map((exercise, exerciseIndex) => {
            const averageRpe = getAverageRpe(exercise.sets)
            const identity = resolveExerciseIdentity(exercise, {
              ...(activePlan ? { activePlan } : {}),
              ...(exerciseLibrary ? { library: exerciseLibrary } : {}),
            })
            const timed =
              isTimedExercise(exercise) ||
              exercise.sets.some(
                (set) => nonNegativeNumber(set.timeSeconds) !== null,
              )
            const target = timed
              ? exercise.targetDuration || exercise.targetReps || 'Duration not recorded'
              : exercise.targetReps || 'Rep target not recorded'
            const showLibraryMatch = Boolean(
              identity.canonicalId &&
                normalizeExerciseName(identity.originalName) !==
                  normalizeExerciseName(identity.canonicalName),
            )

            return (
              <article
                className="detail-exercise"
                key={`${exercise.exerciseId ?? exercise.exerciseName}-${exerciseIndex}`}
              >
                <div className="detail-exercise__heading">
                  <div>
                    <h3>{exercise.exerciseName}</h3>
                    {identity.archived || identity.source === 'unknown' ? (
                      <div className="tag-row">
                        {identity.archived ? (
                          <span className="tag tag--category">
                            Archived exercise
                          </span>
                        ) : null}
                        {identity.source === 'unknown' ? (
                          <span className="tag tag--secondary-muscle">
                            Unknown exercise
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                    {showLibraryMatch ? (
                      <p>Current library match: {identity.canonicalName}</p>
                    ) : null}
                    <p>
                      Target: {exercise.targetSets} sets x {target}
                    </p>
                  </div>
                  <span>Avg RPE {averageRpe ?? '-'}</span>
                </div>

                <div className="detail-set-grid">
                  {exercise.sets.map((set) => (
                    <div className="detail-set" key={set.setNumber}>
                      <strong>Set {set.setNumber}</strong>
                      <span>Reps: {set.reps ?? '-'}</span>
                      <span>Duration: {formatLoggedDuration(set.timeSeconds)}</span>
                      <span>Weight: {set.weightKg ?? '-'} kg</span>
                      <span>RPE: {set.rpe ?? '-'}</span>
                      {set.painLevel !== null && set.painLevel !== undefined ? (
                        <span>Pain: {set.painLevel}</span>
                      ) : null}
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

function formatLoggedDuration(value: number | null | undefined): string {
  const seconds = nonNegativeNumber(value)
  return seconds === null ? '-' : formatDuration(seconds)
}

function nonNegativeNumber(value: number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

function isStandaloneWorkoutSession(session: WorkoutSession): boolean {
  return (
    session as WorkoutSession & { sessionType?: 'scheduled' | 'standalone' }
  ).sessionType === 'standalone'
}
