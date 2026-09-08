import { Pause, Play, Trash2 } from 'lucide-react'
import { useT } from '../i18n'
import {
  getDoneSetsCount,
  getTotalPlannedSets,
  type ActiveWorkoutSession,
} from '../utils/liveWorkoutUtils'

interface ActiveWorkoutBannerProps {
  session: ActiveWorkoutSession
  onResume: () => void
  onDiscard: () => void
}

/**
 * The paused workout, kept in sight while the rest of the tab is browsed.
 *
 * Leaving the unfinished-workout screen without ending the session would
 * otherwise hide it completely: the app would be holding a half-finished
 * workout with nothing on screen to say so, and pressing Start on something
 * else would be a surprise rather than a choice. This is what makes the
 * paused state visible - and the way back to it one press.
 */
export function ActiveWorkoutBanner({
  session,
  onResume,
  onDiscard,
}: ActiveWorkoutBannerProps) {
  const t = useT()

  return (
    <article className="active-workout-banner">
      <p className="eyebrow">
        <Pause size={13} strokeWidth={2.6} aria-hidden="true" />
        {t('paused.eyebrow')}
      </p>
      <p className="active-workout-banner__summary">
        {t('unfinished.summary', {
          name: session?.workoutName ?? t('unfinished.workoutFallback'),
          done: getDoneSetsCount(session),
          total: getTotalPlannedSets(session),
        })}
      </p>
      <div className="active-workout-banner__actions">
        <button
          className="workout-primary-button workout-primary-button--small"
          onClick={onResume}
          type="button"
        >
          <Play size={16} strokeWidth={2.4} aria-hidden="true" />
          {t('paused.resume')}
        </button>
        <button
          className="active-workout-banner__discard"
          onClick={onDiscard}
          type="button"
        >
          <Trash2 size={15} strokeWidth={2.4} aria-hidden="true" />
          {t('paused.discard')}
        </button>
      </div>
    </article>
  )
}
