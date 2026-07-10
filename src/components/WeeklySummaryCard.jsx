export function WeeklySummaryCard({ title, value, subtitle, status = 'neutral' }) {
  return (
    <article className={`weekly-summary-card weekly-summary-card--${status}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      {subtitle ? <p>{subtitle}</p> : null}
    </article>
  )
}
