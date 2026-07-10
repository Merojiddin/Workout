import type { LucideIcon } from 'lucide-react'

export type NutritionTargetStatus = 'protein' | 'water' | 'creatine' | 'neutral' | 'goal'

interface NutritionTargetCardProps {
  title: string
  value: string
  subtitle: string
  status?: NutritionTargetStatus
  icon?: LucideIcon
}

export function NutritionTargetCard({
  title,
  value,
  subtitle,
  status = 'neutral',
  icon: Icon,
}: NutritionTargetCardProps) {
  return (
    <article className={`nutrition-target-card nutrition-target-card--${status}`}>
      <div className="nutrition-target-card__head">
        <p className="eyebrow">{title}</p>
        {Icon ? <Icon size={20} strokeWidth={2.4} aria-hidden="true" /> : null}
      </div>
      <strong>{value}</strong>
      <span>{subtitle}</span>
    </article>
  )
}
