import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  detail?: string
  icon: LucideIcon
  label: string
  value: string
}

export function StatCard({ detail, icon: Icon, label, value }: StatCardProps) {
  return (
    <article className="stat-card">
      <span className="stat-card__icon" aria-hidden="true">
        <Icon size={20} strokeWidth={2.4} />
      </span>
      <div>
        <p className="eyebrow">{label}</p>
        <strong>{value}</strong>
        {detail ? <span>{detail}</span> : null}
      </div>
    </article>
  )
}
