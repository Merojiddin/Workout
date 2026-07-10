export function CoachAdviceSection({ title, items, emptyMessage }) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : []

  return (
    <article className="dashboard-card coach-advice-section">
      <div>
        <p className="eyebrow">Coach Advice</p>
        <h2>{title}</h2>
      </div>
      {safeItems.length > 0 ? (
        <ul className="coach-advice-list">
          {safeItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="card-copy">
          {emptyMessage || 'Complete workouts and logs to unlock better coaching.'}
        </p>
      )}
    </article>
  )
}
