export function PrintableWeeklyPlan({ data }) {
  const plan = Array.isArray(data?.plan) ? data.plan : []
  const settings = data?.profile ?? {}
  const profile = settings.profile ?? {}
  const goals = settings.goals ?? {}
  const program = data?.program ?? {}

  return (
    <article className="print-page">
      <h1>Weekly Workout Plan</h1>
      <div className="print-meta-grid">
        <div className="print-meta">
          <span className="print-label">Program</span>
          <strong>{program.programName ?? 'Custom Workout Plan'}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">Program ID</span>
          <strong>{program.programId ?? '-'}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">Version</span>
          <strong>{program.programVersion ?? '-'}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">Plan status</span>
          <strong>{getPlanStatus(program)}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">Printed</span>
          <strong>{formatDate(data?.generatedAt)}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">Name</span>
          <strong>{profile.name ?? 'Mike'}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">Goal</span>
          <strong>{profile.trainingGoal ?? goals.primaryGoal ?? '-'}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">Main focus</span>
          <strong>{profile.mainFocus ?? '-'}</strong>
        </div>
        <div className="print-meta">
          <span className="print-label">Training time</span>
          <strong>{profile.trainingTimePerDay ?? '-'}</strong>
        </div>
      </div>

      {plan.length > 0 ? (
        <table className="print-wide-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Workout</th>
              <th>Exercise</th>
              <th>Sets</th>
              <th>Reps / Duration</th>
              <th>Rest</th>
              <th>Muscle</th>
              <th>Equipment</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {plan.flatMap((day) =>
              safeArray(day?.exercises).map((exercise, index) => (
                <tr key={`${day?.day}-${exercise?.id ?? index}`}>
                  {index === 0 ? (
                    <>
                      <td rowSpan={Math.max(safeArray(day?.exercises).length, 1)}>
                        Day {day?.day ?? '-'}
                      </td>
                      <td rowSpan={Math.max(safeArray(day?.exercises).length, 1)}>
                        <strong>{day?.name ?? '-'}</strong>
                        <br />
                        <span className="print-small">
                          {safeArray(day?.focus).join(', ') || '-'}
                          <br />
                          {day?.estimatedTime ?? ''}
                        </span>
                      </td>
                    </>
                  ) : null}
                  <td>{exercise?.name ?? '-'}</td>
                  <td>{exercise?.sets ?? '-'}</td>
                  <td>{exercise?.repRange ?? exercise?.duration ?? '-'}</td>
                  <td>{exercise?.restSeconds ?? '-'} sec</td>
                  <td>{exercise?.muscleGroup ?? 'Other'}</td>
                  <td>{exercise?.equipment ?? '-'}</td>
                  <td>{exercise?.notes ?? day?.notes ?? ''}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      ) : (
        <p className="print-empty">No workout plan found.</p>
      )}
    </article>
  )
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
