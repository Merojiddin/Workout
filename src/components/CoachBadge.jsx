export function CoachBadge({ type = 'info', children }) {
  return <span className={`coach-badge coach-badge--${type}`}>{children}</span>
}
