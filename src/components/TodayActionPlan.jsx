import { ListChecks } from 'lucide-react'

export function TodayActionPlan({ items }) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : []

  return (
    <article className="dashboard-card today-action-plan">
      <div className="card-heading">
        <div>
          <p className="eyebrow">Action Plan</p>
          <h2>Today</h2>
        </div>
        <ListChecks size={22} strokeWidth={2.4} aria-hidden="true" />
      </div>
      <ol className="today-action-list">
        {safeItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </article>
  )
}
