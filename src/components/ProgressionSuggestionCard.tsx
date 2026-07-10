import {
  HelpCircle,
  Minus,
  ShieldAlert,
  Target,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import type {
  ProgressionSuggestion,
  SuggestionType,
} from '../utils/progressionUtils'

interface ProgressionSuggestionCardProps {
  suggestion: ProgressionSuggestion
  compact?: boolean
}

interface SuggestionVisual {
  badge: string
  icon: LucideIcon
}

const visuals: Record<SuggestionType, SuggestionVisual> = {
  increase: { badge: 'Increase Load', icon: TrendingUp },
  keep: { badge: 'Keep Same', icon: Minus },
  reduce: { badge: 'Reduce', icon: TrendingDown },
  'form-warning': { badge: 'Form Warning', icon: ShieldAlert },
  'no-data': { badge: 'No Data', icon: HelpCircle },
}

export function ProgressionSuggestionCard({
  suggestion,
  compact = false,
}: ProgressionSuggestionCardProps) {
  const visual = visuals[suggestion.type]
  const Icon = visual.icon

  return (
    <article
      className={`progression-card progression-card--${suggestion.type}${
        compact ? ' progression-card--compact' : ''
      }`}
    >
      <header className="progression-card__head">
        <span className="progression-card__icon" aria-hidden="true">
          <Icon size={compact ? 16 : 18} strokeWidth={2.4} />
        </span>
        <div className="progression-card__titles">
          {suggestion.exerciseName ? (
            <p className="progression-card__exercise">
              {suggestion.exerciseName}
            </p>
          ) : null}
          <h4 className="progression-card__title">{suggestion.title}</h4>
        </div>
        <span className="progression-card__badge">{visual.badge}</span>
      </header>

      <p className="progression-card__message">{suggestion.message}</p>

      {suggestion.latestSummary ? (
        <p className="progression-card__latest">
          <span>Last</span>
          {suggestion.latestSummary}
        </p>
      ) : null}

      <div className="progression-card__target">
        <Target size={compact ? 14 : 15} strokeWidth={2.4} aria-hidden="true" />
        <span>{suggestion.nextTarget}</span>
      </div>

      {!compact ? (
        <p className="progression-card__reason">{suggestion.reason}</p>
      ) : null}
    </article>
  )
}
