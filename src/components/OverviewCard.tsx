interface OverviewCardProps {
  subtitle: string
  title: string
  value: string
}

export function OverviewCard({ subtitle, title, value }: OverviewCardProps) {
  return (
    <article className="overview-card">
      <p className="eyebrow">{title}</p>
      <strong>{value}</strong>
      <span>{subtitle}</span>
    </article>
  )
}
