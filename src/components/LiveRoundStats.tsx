import { Pause, Play } from 'lucide-react'

import { getExerciseTarget } from '../utils/exerciseLoggingUtils'
import type { ActiveExercise } from '../utils/liveWorkoutUtils'
import { isDoneSet } from '../utils/liveWorkoutUtils'

interface LiveRoundStatsProps {
  exercise: ActiveExercise
  /** Seconds left on the rest countdown, or null before it reports in. */
  restSecondsLeft: number | null
  /** Whether that countdown is ticking, as opposed to paused or untouched. */
  restRunning: boolean
  /** Runs or holds the rest countdown - the ring is the only control for it. */
  onToggleRest: () => void
}

/**
 * The three numbers you actually glance at between sets: what to hit, how long
 * is left of the rest, and how much of this exercise is behind you.
 *
 * Each is a ring rather than a line of text because they are read at arm's
 * length, mid-set, without your reading glasses on.
 */
export function LiveRoundStats({
  exercise,
  onToggleRest,
  restRunning,
  restSecondsLeft,
}: LiveRoundStatsProps) {
  const doneSets = exercise.sets.filter(isDoneSet).length
  const totalSets = exercise.sets.length
  // A finished or untouched countdown shows the rest this exercise asks for;
  // anything part-way through shows where it actually stands.
  const started =
    restSecondsLeft !== null &&
    restSecondsLeft > 0 &&
    restSecondsLeft < exercise.restSeconds
  const resting = restRunning && restSecondsLeft !== null && restSecondsLeft > 0
  const showClock = resting || started

  return (
    <div className="round-stats">
      <div className="round-stat">
        <div className="round-meter round-meter--target">
          <span>{shortTarget(exercise)}</span>
        </div>
        <small>{exercise.loggingMode === 'duration' ? 'Time' : 'Reps'} target</small>
      </div>

      <div className="round-stat">
        {/* The ring is the rest timer's only control: the clock you read
            between sets is the thing you tap to hold or restart it. */}
        <button
          aria-label={
            resting ? 'Pause the rest countdown' : 'Start the rest countdown'
          }
          className={`round-meter round-meter--rest${
            resting ? ' round-meter--rest-active' : ''
          }`}
          disabled={exercise.restSeconds <= 0}
          onClick={onToggleRest}
          type="button"
        >
          <span aria-live="polite">
            {formatClock(showClock ? (restSecondsLeft as number) : exercise.restSeconds)}
          </span>
          {resting ? (
            <Pause size={13} strokeWidth={2.6} aria-hidden="true" />
          ) : (
            <Play size={13} strokeWidth={2.6} aria-hidden="true" />
          )}
        </button>
        <small>{resting ? 'Resting' : started ? 'Paused' : 'Rest'}</small>
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
