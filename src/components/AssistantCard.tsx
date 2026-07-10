import { Lightbulb, ShieldAlert, TriangleAlert } from 'lucide-react'
import type { AssistantMessage } from '../utils/liveWorkoutUtils'

interface AssistantCardProps {
  assistant: AssistantMessage
}

const icons = {
  info: Lightbulb,
  warn: TriangleAlert,
  danger: ShieldAlert,
}

export function AssistantCard({ assistant }: AssistantCardProps) {
  const Icon = icons[assistant.tone] ?? Lightbulb

  return (
    <article className={`assistant-card assistant-card--${assistant.tone}`}>
      <span className="assistant-card__icon" aria-hidden="true">
        <Icon size={18} strokeWidth={2.4} />
      </span>
      <div>
        <p className="eyebrow">What to do next</p>
        <p className="assistant-card__message">{assistant.message}</p>
      </div>
    </article>
  )
}
