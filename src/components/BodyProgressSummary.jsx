export function BodyProgressSummary({ summary }) {
  return (
    <article className="dashboard-card body-progress-summary-card">
      <div className="card-heading">
        <div>
          <p className="eyebrow">Body Progress</p>
          <h2>Latest check-in comparison</h2>
        </div>
      </div>
      {summary?.hasCurrent ? (
        <>
          <div className="body-progress-grid">
            {summary.metrics.map((metric) => (
              <div
                className={`body-progress-metric body-progress-metric--${metric.status}`}
                key={metric.label}
              >
                <span>{metric.label}</span>
                <strong>{formatMetric(metric.current, metric.unit)}</strong>
                <p>
                  {metric.change === null
                    ? 'No previous value'
                    : `${formatChange(metric.change, metric.unit)} vs previous`}
                </p>
              </div>
            ))}
          </div>
          <div className="coach-message-list">
            {summary.messages.map((message) => (
              <p className="coach-message coach-message--neutral" key={message}>
                {message}
              </p>
            ))}
          </div>
        </>
      ) : (
        <div className="chart-empty-state">{summary?.messages?.[0]}</div>
      )}
    </article>
  )
}

function formatMetric(value, unit) {
  if (value === null || value === undefined) {
    return '-'
  }

  return `${value}${unit.startsWith('/') ? unit : ` ${unit}`}`
}

function formatChange(value, unit) {
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value}${unit.startsWith('/') ? unit : ` ${unit}`}`
}
