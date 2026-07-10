import { Gauge } from 'lucide-react'
import { CoachBadge } from './CoachBadge'

export function ReadinessScoreCard({ score, label, message, reasons }) {
  const safeScore = Number.isFinite(score) ? Math.max(0, Math.min(score, 100)) : 0
  const tone = safeScore >= 85 ? 'good' : safeScore >= 70 ? 'info' : safeScore >= 50 ? 'warn' : 'danger'
  const reasonItems = Array.isArray(reasons) ? reasons : []

  return (
    <article className={`dashboard-card readiness-card readiness-card--${tone}`}>
      <div className="card-heading">
        <div>
          <p className="eyebrow">Readiness Score</p>
          <h2>{safeScore}/100</h2>
        </div>
        <Gauge size={22} strokeWidth={2.4} aria-hidden="true" />
      </div>

      <div className="readiness-meter" aria-hidden="true">
        <span style={{ width: `${safeScore}%` }} />
      </div>

      <div className="readiness-copy">
        <CoachBadge type={tone}>{label}</CoachBadge>
        <p>{message}</p>
      </div>

      {reasonItems.length > 0 ? (
        <ul className="coach-reason-list">
          {reasonItems.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}
