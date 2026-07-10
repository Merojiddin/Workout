const postureReminder =
  'Ribs down. Abs tight. Glutes slightly squeezed. Do not over-arch lower back.'

export function PrintableTodayWorkout({ workout }) {
  const exercises = safeArray(workout?.exercises)

  return (
    <article className="print-page">
      <h1>Today's Workout</h1>
      {workout ? (
        <>
          <div className="print-meta-grid">
            <div className="print-meta">
              <span className="print-label">Workout</span>
              <strong>
                Day {workout.day} - {workout.name}
              </strong>
            </div>
            <div className="print-meta">
              <span className="print-label">Estimated time</span>
              <strong>{workout.estimatedTime}</strong>
            </div>
            <div className="print-meta">
              <span className="print-label">Focus</span>
              <strong>{safeArray(workout.focus).join(', ') || '-'}</strong>
            </div>
            <div className="print-meta">
              <span className="print-label">Posture reminder</span>
              <strong>{postureReminder}</strong>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Exercise</th>
                <th>Sets / reps</th>
                <th>Rest</th>
                <th>Form tips</th>
              </tr>
            </thead>
            <tbody>
              {exercises.map((exercise) => (
                <tr key={exercise.id}>
                  <td>{exercise.name}</td>
                  <td>{targetLabel(exercise)}</td>
                  <td>{exercise.restSeconds ?? '-'} sec</td>
                  <td>
                    <ul>
                      {safeArray(exercise.formTips).map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p className="print-empty">No workout found for today.</p>
      )}
    </article>
  )
}

function targetLabel(exercise) {
  return `${exercise?.sets ?? '-'} sets x ${
    exercise?.repRange ?? exercise?.duration ?? 'rep range unknown'
  }`
}

function safeArray(value) {
  return Array.isArray(value) ? value : []
}
