export function StrengthComparisonTable({ comparisons }) {
  return (
    <article className="history-card strength-comparison-card">
      <div>
        <p className="eyebrow">Strength Progress</p>
        <h2>Important exercises</h2>
      </div>
      <div className="history-table-wrap">
        <table className="history-table strength-table">
          <thead>
            <tr>
              <th>Exercise</th>
              <th>This week</th>
              <th>Previous week</th>
              <th>Change</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(comparisons ?? []).map((item) => (
              <tr key={item.exerciseName}>
                <td>{item.exerciseName}</td>
                <td>{item.currentBest}</td>
                <td>{item.previousBest}</td>
                <td>{item.change}</td>
                <td>
                  <span className={`review-status review-status--${slugStatus(item.status)}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}

function slugStatus(status) {
  return String(status ?? 'no data').replace(/\s+/g, '-')
}
