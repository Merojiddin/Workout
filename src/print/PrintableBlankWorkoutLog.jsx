export function PrintableBlankWorkoutLog({ workout }) {
  const exercises = safeArray(workout?.exercises)
  const rows =
    exercises.length > 0
      ? exercises
      : Array.from({ length: 8 }, (_, index) => ({
          id: `blank-${index + 1}`,
          name: '',
          sets: '',
          repRange: '',
          duration: '',
        }))

  return (
    <article className="print-page">
      <h1>Blank Daily Workout Log</h1>

      <div className="print-line-grid">
        <div className="print-line">
          <span className="print-label">Date</span>
          ____________________
        </div>
        <div className="print-line">
          <span className="print-label">Body weight</span>
          ____________________
        </div>
        <div className="print-line">
          <span className="print-label">Workout day</span>
          {workout ? `Day ${workout.day} - ${workout.name}` : '____________________'}
        </div>
        <div className="print-line">
          <span className="print-label">Sleep</span>
          ____________________
        </div>
        <div className="print-line">
          <span className="print-label">Energy</span>
          ____________________
        </div>
      </div>

      <table className="print-wide-table">
        <thead>
          <tr>
            <th>Exercise</th>
            <th>Target sets/reps</th>
            <th>Set 1</th>
            <th>Set 2</th>
            <th>Set 3</th>
            <th>Set 4</th>
            <th>Set 5</th>
            <th>Weight</th>
            <th>RPE</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((exercise, index) => (
            <tr key={exercise.id ?? index}>
              <td>{exercise.name}</td>
              <td>{targetLabel(exercise)}</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="print-line-grid">
        <div className="print-line">
          <span className="print-label">Workout duration</span>
          ____________________
        </div>
        <div className="print-line">
          <span className="print-label">Pain?</span>
          Yes / No
        </div>
      </div>
      <div className="print-note-box">
        <span className="print-label">Notes</span>
        <br />
        <br />
        <br />
      </div>
      <p className="print-signature">Signature / check mark: ____________________</p>
    </article>
  )
}

function targetLabel(exercise) {
  const target = exercise.repRange ?? exercise.duration ?? ''
  return [exercise.sets ? `${exercise.sets} sets` : '', target]
    .filter(Boolean)
    .join(' x ')
}

function safeArray(value) {
  return Array.isArray(value) ? value : []
}
