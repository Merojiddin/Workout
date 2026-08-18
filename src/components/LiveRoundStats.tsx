import { getExerciseTarget } from '../utils/exerciseLoggingUtils'
import type { ActiveExercise } from '../utils/liveWorkoutUtils'
import { isDoneSet } from '../utils/liveWorkoutUtils'

interface LiveRoundStatsProps {
  exercise: ActiveExercise
  /** Seconds left on the rest countdown, or null when it is not running. */
  restSecondsLeft: number | null
}

/**
 * The three numbers you actually glance at between sets: what to hit, how long
 * is left of the rest, and how much of this exercise is behind you.
 *
 * Each is a ring rather than a line of text because they are read at arm's
 * length, mid-set, without your reading glasses on.
 */
export function LiveRoundStats({ exercise, restSecondsLeft }: LiveRoundStatsProps) {
  const doneSets = exercise.sets.filter(isDoneSet).length
  const totalSets = exercise.sets.length
  const resting = restSecondsLeft !== null && restSecondsLeft > 0

  return (
    <div className="round-stats">
      <div className="round-stat">
        <div className="round-meter round-meter--target">
          <span>{shortTarget(exercise)}</span>
        </div>
        <small>{exercise.loggingMode === 'duration' ? 'Time' : 'Reps'} target</small>
      </div>

      <div className="round-stat">
        <div
          className={`round-meter round-meter--rest${
            resting ? ' round-meter--rest-active' : ''
          }`}
        >
          <span aria-live="polite">
            {resting ? formatClock(restSecondsLeft) : formatClock(exercise.restSeconds)}
          </span>
        </div>
        <small>{resting ? 'Resting' : 'Rest'}</small>
      </div>

      <div className="round-stat">
        <div className="round-meter round-meter--sets">
          <span>
            {doneSets}/{totalSets}
          </span>
        </div>
        <small>Sets done</small>
      </div>
    </div>
  )
}

/**
 * A ring is about four characters wide. "8-12 reps" does not fit, but the
 * range that matters does.
 */
function shortTarget(exercise: ActiveExercise): string {
  const full = getExerciseTarget(exercise)
  const numbers = full.match(/\d+(?:\s*[-–]\s*\d+)?/)
  if (!numbers) {
    return '—'
  }

  return numbers[0].replace(/\s+/g, '')
}

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds))
  const minutes = Math.floor(safe / 60)
  return `${minutes}:${String(safe % 60).padStart(2, '0')}`
}
