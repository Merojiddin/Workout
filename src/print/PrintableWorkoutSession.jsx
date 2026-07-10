export function PrintableWorkoutSession({ session }) {
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
          <span className="print-label">Duration</span>
          <strong>{formatDuration(session.startedAt, session.finishedAt)}</strong>
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
            <th>Weight kg</th>
            <th>RPE</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {safeArray(session.exercises).flatMap((exercise) =>
            safeArray(exercise.sets).map((set, index) => (
              <tr key={`${exercise.exerciseName}-${index}`}>
                <td>{exercise.exerciseName}</td>
                <td>{set.setNumber ?? index + 1}</td>
                <td>{set.reps ?? '-'}</td>
                <td>{set.weightKg ?? '-'}</td>
                <td>{set.rpe ?? '-'}</td>
                <td>{set.notes ?? ''}</td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </article>
  )
}

function formatDuration(startedAt, finishedAt) {
  const milliseconds = new Date(finishedAt).getTime() - new Date(startedAt).getTime()
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
    return '-'
  }

  const totalMinutes = Math.max(Math.round(milliseconds / 60000), 1)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`
}

function safeArray(value) {
  return Array.isArray(value) ? value : []
}
