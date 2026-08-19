import { ChevronDown, Clock3 } from 'lucide-react'

import { useT } from '../i18n'
import { formatDuration } from '../utils/exerciseLoggingUtils'

interface LiveWorkoutHeaderProps {
  workoutName: string
  currentExerciseIndex: number
  totalExercises: number
  doneSets: number
  totalSets: number
  /** Time on the workout so far, shown as a mm:ss clock. */
  elapsedSeconds: number
  /** Leaves the training screen without ending the workout. */
  onExit: () => void
}

/**
 * One bar, pinned to the top of the training screen: a way out, the workout
 * name, where you are in it, and the clock. Everything else (set counts,
 * session guidance) lives further down the screen or in the exercise sheet.
 *
 * The training screen covers the app's own top bar and bottom nav, so the
 * exit button here is the only route off it that keeps the session alive.
 */
export function LiveWorkoutHeader({
  workoutName,
  currentExerciseIndex,
  totalExercises,
  doneSets,
  totalSets,
  elapsedSeconds,
  onExit,
}: LiveWorkoutHeaderProps) {
  const t = useT()
  const progress = Math.min((doneSets / Math.max(totalSets, 1)) * 100, 100)
  const position = Math.min(currentExerciseIndex + 1, totalExercises)

  return (
    <header className="live-header">
      <div className="live-header__top">
        <button
          aria-label={t('live.header.exitAria')}
          className="live-header__exit"
          onClick={onExit}
          type="button"
        >
          <ChevronDown size={19} strokeWidth={2.6} aria-hidden="true" />
        </button>

        <span className="live-header__name">{workoutName}</span>

        <span
          aria-label={t('live.header.positionAria', {
            current: position,
            total: totalExercises,
          })}
          className="live-header__count"
        >
          {position}/{totalExercises}
        </span>

        <span className="live-header__timer">
          <Clock3 size={13} strokeWidth={2.4} aria-hidden="true" />
          {formatDuration(elapsedSeconds)}
        </span>
      </div>

      <div
        className="live-header__progress"
        role="progressbar"
        aria-label={t('live.header.progressAria')}
        aria-valuemin={0}
        aria-valuemax={totalSets}
        aria-valuenow={doneSets}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
    </header>
  )
}
