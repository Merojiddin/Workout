import { Pause, Play } from 'lucide-react'

import type { LiveTimerView } from '../hooks/useLiveTimer'
import { getExerciseTarget } from '../utils/exerciseLoggingUtils'
import type { ActiveExercise } from '../utils/liveWorkoutUtils'
import { isDoneSet } from '../utils/liveWorkoutUtils'

interface LiveRoundStatsProps {
  exercise: ActiveExercise
  /** What the middle ring is counting, and how far along it is. */
  timer: LiveTimerView
  /** Runs or holds that clock - the ring is the only control for it. */
  onToggleTimer: () => void
}

/**
 * The three numbers you actually glance at between sets: what to hit, the
 * clock, and how much of this exercise is behind you.
 *
 * Each is a ring rather than a line of text because they are read at arm's
 * length, mid-set, without your reading glasses on.
 */
export function LiveRoundStats({
  exercise,
  onToggleTimer,
  timer,
}: LiveRoundStatsProps) {
  const doneSets = exercise.sets.filter(isDoneSet).length
  const totalSets = exercise.sets.length
  const timing = timer.mode === 'work'
  // A clock that has been touched but is not moving is paused; one sitting at
  // its starting value has simply not been run yet.
  const held =
    !timer.running && (timing ? timer.seconds > 0 : timer.seconds < exercise.restSeconds)

  return (
    <div className="round-stats">
      <div className="round-stat">
        <div className="round-meter round-meter--target">
          <span>{shortTarget(exercise)}</span>
        </div>
        <small>{exercise.loggingMode === 'duration' ? 'Time' : 'Reps'} target</small>
      </div>

      <div className="round-stat">
        {/* The ring is the timer's only control: the clock you read between
            sets is the thing you tap to run or hold it. */}
        <button
          aria-label={timerLabel(timing, timer.running)}
          className={meterClass(timer)}
          onClick={onToggleTimer}
          type="button"
        >
          <span aria-live="polite">{formatClock(timer.seconds)}</span>
          {timer.running ? (
            <Pause size={13} strokeWidth={2.6} aria-hidden="true" />
          ) : (
            <Play size={13} strokeWidth={2.6} aria-hidden="true" />
          )}
        </button>
        <small>{timerCaption(timer, held)}</small>
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

function meterClass(timer: LiveTimerView): string {
  const classes = ['round-meter', 'round-meter--timer']
  if (timer.running) {
    classes.push('round-meter--timer-running')
  }
  if (timer.pastGoal) {
    classes.push('round-meter--timer-goal')
  }

  return classes.join(' ')
}

function timerLabel(timing: boolean, running: boolean): string {
  if (timing) {
    return running ? 'Pause the set timer' : 'Start the set timer'
  }

  return running ? 'Pause the rest countdown' : 'Start the rest countdown'
}

/** One word under the ring for what the clock is doing. */
function timerCaption(timer: LiveTimerView, held: boolean): string {
  if (timer.mode === 'rest') {
    return timer.running ? 'Resting' : held ? 'Paused' : 'Rest'
  }

  if (timer.pastGoal) {
    return timer.running ? 'Time hit' : 'Done'
  }

  return timer.running ? 'Timing' : held ? 'Paused' : 'Time'
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
