export function MuscleVolumeChart({ data }) {
  const maxSets = Math.max(...(data ?? []).map((item) => item.sets), 1)
  const highlighted = (data ?? []).filter((item) =>
    ['Chest', 'Abs', 'Posture', 'Legs'].includes(item.muscle),
  )

  return (
    <article className="dashboard-card muscle-volume-card">
      <div className="card-heading">
        <div>
          <p className="eyebrow">Muscle Volume</p>
          <h2>Completed sets by muscle</h2>
        </div>
      </div>
      {(data ?? []).length === 0 ? (
        <div className="chart-empty-state">
          No completed sets yet. Finish a workout to see muscle volume.
        </div>
      ) : null}
      <div className="muscle-volume-list">
        {(data ?? []).map((item) => (
          <div className="muscle-volume-row" key={item.muscle}>
            <div>
              <strong>{item.muscle}</strong>
              <span>
                {item.sets} sets
                {item.sessions ? ` / ${item.sessions} ${pluralizeSession(item.sessions)}` : ''}
              </span>
            </div>
            <div className="muscle-volume-track" aria-hidden="true">
              <span style={{ width: `${Math.max((item.sets / maxSets) * 100, 4)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="coach-message-list">
        {highlighted
          .filter((item) => item.message)
          .map((item) => (
            <p className={`coach-message coach-message--${item.status}`} key={item.muscle}>
              {item.message}
            </p>
          ))}
      </div>
    </article>
  )
}

function pluralizeSession(count) {
  return count === 1 ? 'session' : 'sessions'
}
