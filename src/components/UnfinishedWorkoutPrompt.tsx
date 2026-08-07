import { Play, RotateCcw, Trash2 } from 'lucide-react'
import {
  getCompletedSetsCount,
  getTotalPlannedSets,
  type ActiveWorkoutSession,
} from '../utils/liveWorkoutUtils'

interface UnfinishedWorkoutPromptProps {
  session: ActiveWorkoutSession
  onContinue: () => void
  onDiscard: () => void
}

export function UnfinishedWorkoutPrompt({
  session,
  onContinue,
  onDiscard,
}: UnfinishedWorkoutPromptProps) {
  const completedSets = getCompletedSetsCount(session)
  const totalSets = getTotalPlannedSets(session)
  const startedLabel = formatStarted(session?.startedAt)

  return (
    <section className="unfinished-prompt dashboard-card">
      <span className="unfinished-prompt__icon" aria-hidden="true">
        <RotateCcw size={26} strokeWidth={2.4} />
      </span>
      <p className="eyebrow">Unfinished workout</p>
      <h1>You have an unfinished workout.</h1>
      {session?.sessionType === 'standalone' ? (
        <p className="card-copy">Standalone workout</p>
      ) : null}
      <p>
        {session?.workoutName ?? 'Workout'} - {completedSets} of {totalSets} sets
        logged{startedLabel ? ` , started ${startedLabel}` : ''}.
      </p>

      <div className="unfinished-prompt__actions">
        <button
          className="workout-primary-button"
          onClick={onContinue}
          type="button"
        >
          <Play size={19} strokeWidth={2.4} aria-hidden="true" />
          Continue Workout
        </button>
        <button
          className="workout-secondary-button workout-secondary-button--danger"
          onClick={onDiscard}
          type="button"
        >
          <Trash2 size={19} strokeWidth={2.4} aria-hidden="true" />
          Discard Workout
        </button>
      </div>
    </section>
  )
}

function formatStarted(startedAt?: string): string | null {
  if (!startedAt) {
    return null
  }

  const date = new Date(startedAt)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
  }).format(date)
}
