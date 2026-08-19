import { Play, RotateCcw, Trash2 } from 'lucide-react'
import { formatDate, useT } from '../i18n'
import {
  getDoneSetsCount,
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
  const t = useT()
  const doneSets = getDoneSetsCount(session)
  const totalSets = getTotalPlannedSets(session)
  const startedLabel = formatStarted(session?.startedAt)

  return (
    <section className="unfinished-prompt dashboard-card">
      <span className="unfinished-prompt__icon" aria-hidden="true">
        <RotateCcw size={26} strokeWidth={2.4} />
      </span>
      <p className="eyebrow">{t('unfinished.eyebrow')}</p>
      <h1>{t('unfinished.title')}</h1>
      {session?.sessionType === 'standalone' ? (
        <p className="card-copy">{t('unfinished.standalone')}</p>
      ) : null}
      <p>
        {startedLabel
          ? t('unfinished.summaryWithStart', {
              name: session?.workoutName ?? t('unfinished.workoutFallback'),
              done: doneSets,
              total: totalSets,
              started: startedLabel,
            })
          : t('unfinished.summary', {
              name: session?.workoutName ?? t('unfinished.workoutFallback'),
              done: doneSets,
              total: totalSets,
            })}
      </p>

      <div className="unfinished-prompt__actions">
        <button
          className="workout-primary-button"
          onClick={onContinue}
          type="button"
        >
          <Play size={19} strokeWidth={2.4} aria-hidden="true" />
          {t('unfinished.continue')}
        </button>
        <button
          className="workout-secondary-button workout-secondary-button--danger"
          onClick={onDiscard}
          type="button"
        >
          <Trash2 size={19} strokeWidth={2.4} aria-hidden="true" />
          {t('unfinished.discard')}
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

  return formatDate(date, {
    hour: 'numeric',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
  })
}
