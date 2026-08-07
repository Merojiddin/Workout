export function PrintableTodayWorkout({ generatedAt, program, workout }) {
  const exercises = safeArray(workout?.exercises)

  return (
    <article className="print-page">
      <h1>Today's Workout</h1>
      {workout ? (
        <>
          <div className="print-meta-grid">
            <div className="print-meta">
              <span className="print-label">Program</span>
              <strong>{program?.programName ?? 'Custom Workout Plan'}</strong>
            </div>
            <div className="print-meta">
              <span className="print-label">Program ID</span>
              <strong>{program?.programId ?? '-'}</strong>
            </div>
            <div className="print-meta">
              <span className="print-label">Version</span>
              <strong>{program?.programVersion ?? '-'}</strong>
            </div>
            <div className="print-meta">
              <span className="print-label">Plan status</span>
              <strong>{getPlanStatus(program)}</strong>
            </div>
            <div className="print-meta">
              <span className="print-label">Printed</span>
              <strong>{formatDate(generatedAt)}</strong>
            </div>
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
              <strong>
                {program?.rules?.postureCue ??
                  'Keep every repetition controlled and stop if form deteriorates.'}
              </strong>
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

function formatDate(value) {
  const date = new Date(value ?? '')
  return Number.isNaN(date.getTime())
    ? '-'
    : new Intl.DateTimeFormat('en', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date)
}

function getPlanStatus(program) {
  if (program?.modifiedAfterInstallation) return 'Modified after installation'
  if (program?.installed) return 'Installed plan unchanged'
  return program?.source === 'custom' ? 'Custom plan' : 'Default plan'
}
