import { useCallback, useEffect, useRef, useState } from 'react'
import { notifyRestComplete, playTimerChime, unlockAudio } from '../utils/timerFeedback'

/**
 * What the ring is counting right now.
 *
 * - `work` counts up from 0:00: the plank you are holding, the round you are
 *   boxing, the walk you are on. It never stops on its own.
 * - `rest` counts down the gap the program asks for between sets.
 */
export type LiveTimerMode = 'work' | 'rest'

export interface LiveTimerView {
  mode: LiveTimerMode
  /** Rest: seconds left. Work: seconds counted so far. */
  seconds: number
  running: boolean
  /** Work: the time the exercise asks for, when it names one. */
  goalSeconds: number | null
  /** Work: that time has been reached, and the clock is still running on. */
  pastGoal: boolean
}

export interface LiveTimer extends LiveTimerView {
  /** Run it or hold it - the ring's own tap. */
  toggle: () => void
  /** A set was just saved: rest if this exercise rests, otherwise start over. */
  startRest: () => void
}

interface UseLiveTimerOptions {
  /** Rest between sets for this exercise, 0 when it asks for none. */
  restSeconds: number
  /** Whether the exercise is logged in time rather than reps. */
  timed: boolean
  /** The time the exercise asks for, in seconds, when it can be read off. */
  goalSeconds: number | null
  /** Identity of the exercise on screen: the timer starts over when it changes. */
  exerciseKey: string
}

/**
 * The one timer on the training screen, and what it counts depends on the
 * exercise:
 *
 * - A timed exercise (running, planks, boxing rounds) opens as a stopwatch at
 *   0:00, so you can just start it and go; it chimes when the target time is
 *   reached and keeps counting past it.
 * - A reps exercise opens on its rest, ready to count the 1-3 minutes the
 *   program asks for between sets.
 * - Saving a set flips a resting exercise into its countdown, and an exercise
 *   with no rest straight back to a fresh 0:00.
 *
 * Time is measured from a wall-clock anchor rather than by counting ticks, so
 * a screen that sleeps mid-rest still comes back with the right number.
 */
export function useLiveTimer({
  exerciseKey,
  goalSeconds,
  restSeconds,
  timed,
}: UseLiveTimerOptions): LiveTimer {
  const opensOnRest = !timed && restSeconds > 0
  const [view, setView] = useState<LiveTimerView>(() => ({
    goalSeconds,
    mode: opensOnRest ? 'rest' : 'work',
    pastGoal: false,
    running: false,
    seconds: opensOnRest ? restSeconds : 0,
  }))

  // The moment the clock last changed direction or state, and the value it
  // held then. Every tick is derived from these two rather than accumulated.
  const anchor = useRef({ at: Date.now(), value: view.seconds })
  const viewRef = useRef(view)
  viewRef.current = view

  const place = useCallback(
    (mode: LiveTimerMode, seconds: number, running: boolean) => {
      anchor.current = { at: Date.now(), value: seconds }
      setView({
        goalSeconds,
        mode,
        pastGoal: mode === 'work' && goalSeconds !== null && seconds >= goalSeconds,
        running,
        seconds,
      })
    },
    [goalSeconds],
  )

  // A different exercise brings its own rest and its own target time.
  useEffect(() => {
    place(opensOnRest ? 'rest' : 'work', opensOnRest ? restSeconds : 0, false)
  }, [exerciseKey, opensOnRest, place, restSeconds])

  useEffect(() => {
    if (!view.running) {
      return undefined
    }

    // Twice a second: a poll on the wall clock, so the displayed second turns
    // over close to when it actually does.
    const intervalId = window.setInterval(() => {
      const passed = Math.floor((Date.now() - anchor.current.at) / 1000)
      const current = viewRef.current

      if (current.mode === 'rest') {
        const left = Math.max(0, anchor.current.value - passed)
        if (left > 0) {
          setView({ ...current, seconds: left })
          return
        }

        notifyRestComplete()
        // A timed exercise goes back to its own clock for the next round;
        // a reps exercise sits on a full rest again, ready to run once more.
        place(timed ? 'work' : 'rest', timed ? 0 : restSeconds, false)
        return
      }

      const counted = anchor.current.value + passed
      const reached =
        current.goalSeconds !== null && counted >= current.goalSeconds
      if (reached && !current.pastGoal) {
        playTimerChime()
      }

      setView({ ...current, pastGoal: reached, seconds: counted })
    }, 500)

    return () => window.clearInterval(intervalId)
  }, [place, restSeconds, timed, view.running])

  const toggle = useCallback(() => {
    // The tap is the user gesture that lets the chime play later.
    unlockAudio()
    const current = viewRef.current

    if (current.running) {
      place(current.mode, current.seconds, false)
      return
    }

    if (current.mode === 'rest' && current.seconds <= 0) {
      place('rest', restSeconds, true)
      return
    }

    place(current.mode, current.seconds, true)
  }, [place, restSeconds])

  const startRest = useCallback(() => {
    unlockAudio()
    if (restSeconds > 0) {
      place('rest', restSeconds, true)
      return
    }

    place('work', 0, false)
  }, [place, restSeconds])

  return { ...view, startRest, toggle }
}
