import {
  formatDuration,
} from '../utils/exerciseLoggingUtils'
import { resolveExerciseIdentity } from '../data/exerciseIdentity'

export function PrintableWorkoutSession({
  exerciseLibrary,
  session,
  workoutPlan = [],
}) {
  if (!session) {
    return (
      <article className="print-page">
        <h1>Completed Workout Session</h1>
        <p className="print-empty">No completed workout session yet.</p>
      </article>
    )
  }

  return (
    <article className="print-page">
      <h1>Completed Workout Session</h1>
      <div className="print-meta-grid">
        <div className="print-meta">
          <span className="print-label">Date</span>
          <strong>{session.date}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">Workout</span>
          <strong>{session.workoutName}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">Type</span>
          <strong>{getWorkoutSessionTypeLabel(session)}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">Duration</span>
          <strong>{formatSessionDuration(session.startedAt, session.finishedAt)}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">Completed</span>
          <strong>{session.completed ? 'Yes' : 'No'}</strong>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Exercise</th>
            <th>Set</th>
            <th>Reps</th>
            <th>Duration</th>
            <th>Weight kg</th>
            <th>RPE</th>
            <th>Pain</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {safeArray(session.exercises).flatMap((exercise) => {
            const identity = resolveExerciseIdentity(exercise, {
              activePlan: workoutPlan,
              ...(exerciseLibrary ? { library: exerciseLibrary } : {}),
            })
            const sets = safeArray(exercise.sets)
            const printableSets = sets.length > 0 ? sets : [null]

            return printableSets.map((set, index) => {
              const seconds = nonNegativeNumber(set?.timeSeconds)

              return (
                <tr key={`${exercise.exerciseId ?? exercise.exerciseName}-${index}`}>
                  <td>
                    {exercise.exerciseName}
                    {identity.archived ? (
                      <div className="print-exercise-status">Archived exercise</div>
                    ) : null}
                    {identity.source === 'unknown' ? (
                      <div className="print-exercise-status">Unknown exercise</div>
                    ) : null}
                  </td>
                  <td>{set?.setNumber ?? (sets.length > 0 ? index + 1 : '-')}</td>
                  <td>{set?.reps ?? '-'}</td>
                  <td>{seconds !== null ? formatDuration(seconds) : '-'}</td>
                  <td>{set?.weightKg ?? '-'}</td>
                  <td>{set?.rpe ?? '-'}</td>
                  <td>{set?.painLevel ?? '-'}</td>
                  <td>{set?.notes ?? ''}</td>
                </tr>
              )
            })
          })}
        </tbody>
      </table>
    </article>
  )
}

function formatSessionDuration(startedAt, finishedAt) {
  const milliseconds = new Date(finishedAt).getTime() - new Date(startedAt).getTime()
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
    return '-'
  }

  const totalMinutes = Math.max(Math.round(milliseconds / 60000), 1)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`
}

function nonNegativeNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

function safeArray(value) {
  return Array.isArray(value) ? value : []
}

function getWorkoutSessionTypeLabel(session) {
  return session?.sessionType === 'standalone'
    ? 'Standalone workout'
    : 'Scheduled workout'
}
