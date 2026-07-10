import { Brain } from 'lucide-react'
import { CoachBadge } from './CoachBadge'

export function CoachSummaryCard({ title, message, priorityItems }) {
  const items = Array.isArray(priorityItems) ? priorityItems : []

  return (
    <article className="dashboard-card coach-summary-card">
      <div className="card-heading">
        <div>
          <p className="eyebrow">Today's Coach Summary</p>
          <h2>Today's Focus</h2>
        </div>
        <Brain size={22} strokeWidth={2.4} aria-hidden="true" />
      </div>

      <div className="coach-focus-block">
        <CoachBadge type="good">{title || 'Today workout'}</CoachBadge>
        <p>{message || 'Complete workouts and logs to unlock better coaching.'}</p>
      </div>

      {items.length > 0 ? (
        <div className="coach-priority-list" aria-label="Coach priorities">
          {items.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      ) : null}
    </article>
  )
}
