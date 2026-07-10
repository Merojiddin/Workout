import { TriangleAlert } from 'lucide-react'

export function CoachWarnings({ warnings }) {
  const safeWarnings = Array.isArray(warnings) ? warnings.filter(Boolean) : []

  if (safeWarnings.length === 0) {
    return null
  }

  return (
    <article className="dashboard-card coach-warnings-card">
      <div className="card-heading">
        <div>
          <p className="eyebrow">Warnings</p>
          <h2>Fix these first</h2>
        </div>
        <TriangleAlert size={22} strokeWidth={2.4} aria-hidden="true" />
      </div>
      <div className="coach-warning-list">
        {safeWarnings.map((warning) => (
          <p key={warning}>{warning}</p>
        ))}
      </div>
    </article>
  )
}
