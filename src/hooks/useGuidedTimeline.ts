import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  GuidedTimeline,
  GuidedTimelineStep,
} from '../utils/guidedWorkoutUtils'

/**
 * The clock behind a guided workout.
 *
 * It walks one flat list of timed steps - get ready, work, rest, the longer
 * break between rounds - and does not care which is which. Time is measured
 * against a wall-clock deadline rather than by counting ticks, so a screen
 * that sleeps or a tab that is backgrounded comes back at the second the
 * session is actually on rather than where it was suspended.
 */

export interface GuidedTimelineController {
  step: GuidedTimelineStep | null
  stepIndex: number
  /** Whole seconds left on the current step, counting down to zero. */
  remaining: number
  running: boolean
  finished: boolean
  /** Seconds from the start of the session to now, by timeline position. */
  elapsedSeconds: number
  remainingSeconds: number
  /** 0-1 across the whole session, for the header's progress bar. */
  progress: number
  /** Work steps that ran all the way down, in order. */
  completedWorkSteps: GuidedTimelineStep[]
  toggle: () => void
  pause: () => void
  resume: () => void
  /** Skip to the next step without completing this one. */
  next: () => void
  /** Back to the start of this step, or to the previous one if barely begun. */
  previous: () => void
  /** Straight to a step, from the timeline list. */
  jumpTo: (index: number) => void
  /** Lengthen the step on screen - the rest screen's "+20s". */
  addSeconds: (amount: number) => void
  restart: () => void
  /** End here: nothing after the current step runs. */
  finishNow: () => void
}

interface UseGuidedTimelineOptions {
  timeline: GuidedTimeline
  /** Runs as soon as the player mounts - the workout was started by a tap. */
  autoStart?: boolean
  /**
   * A step has just come on screen. `previous` is what it replaced, so a cue
   * can say what has finished as well as what is starting.
   */
  onStepStart?: (
    step: GuidedTimelineStep,
    previous: GuidedTimelineStep | null,
  ) => void
  /** Every whole second, with the seconds left on the current step. */
  onSecond?: (remaining: number, step: GuidedTimelineStep) => void
  /** The last step ran out, or the session was ended early. */
  onComplete?: (completedWorkSteps: GuidedTimelineStep[]) => void
}

export function useGuidedTimeline({
  autoStart = true,
  onComplete,
  onSecond,
  onStepStart,
  timeline,
}: UseGuidedTimelineOptions): GuidedTimelineController {
  const steps = timeline.steps
  const [stepIndex, setStepIndex] = useState(0)
  const [remaining, setRemaining] = useState(() => steps[0]?.seconds ?? 0)
  const [running, setRunning] = useState(autoStart && steps.length > 0)
  const [finished, setFinished] = useState(steps.length === 0)
  const [completedKeys, setCompletedKeys] = useState<string[]>([])

  // The moment the current step is due to end, while it is running.
  const deadlineRef = useRef(Date.now() + (steps[0]?.seconds ?? 0) * 1000)
  // Mirrors of the state the ticking interval reads. It is deliberately built
  // once and left alone: rebuilding it on every step change would restart its
  // 250ms period each time and let the clock drift.
  const stepIndexRef = useRef(stepIndex)
  const remainingRef = useRef(remaining)
  const completedKeysRef = useRef<string[]>([])
  // Callbacks through refs so new closures from a parent re-render do not tear
  // the interval down either.
  const onStepStartRef = useRef(onStepStart)
  const onSecondRef = useRef(onSecond)
  const onCompleteRef = useRef(onComplete)
  // Ending early and running out both land in `complete`, and the summary must
  // be built exactly once.
  const completedRef = useRef(false)

  stepIndexRef.current = stepIndex
  remainingRef.current = remaining
  onStepStartRef.current = onStepStart
  onSecondRef.current = onSecond
  onCompleteRef.current = onComplete

  const stepsByKey = useMemo(() => {
    const map = new Map<string, GuidedTimelineStep>()
    for (const step of steps) {
      map.set(step.key, step)
    }
    return map
  }, [steps])

  const completedWorkSteps = useMemo(
    () =>
      completedKeys
        .map((key) => stepsByKey.get(key))
        .filter((step): step is GuidedTimelineStep => Boolean(step)),
    [completedKeys, stepsByKey],
  )

  const complete = useCallback(() => {
    if (completedRef.current) {
      return
    }
    completedRef.current = true
    setRunning(false)
    setFinished(true)

    const done = completedKeysRef.current
      .map((key) => stepsByKey.get(key))
      .filter((step): step is GuidedTimelineStep => Boolean(step))
    onCompleteRef.current?.(done)
  }, [stepsByKey])

  /** Put the clock on a step, announcing it unless told not to. */
  const place = useCallback(
    (index: number, options: { run?: boolean; announce?: boolean } = {}) => {
      const target = steps[index]
      if (!target) {
        complete()
        return
      }

      const previous = steps[stepIndexRef.current] ?? null
      stepIndexRef.current = index
      remainingRef.current = target.seconds
      deadlineRef.current = Date.now() + target.seconds * 1000
      setStepIndex(index)
      setRemaining(target.seconds)

      if (options.run !== undefined) {
        setRunning(options.run)
      }
      if (options.announce !== false) {
        onStepStartRef.current?.(target, previous)
      }
    },
    [complete, steps],
  )

  // The opening step is announced like any other, so the get-ready countdown
  // reads its own cue rather than the session starting in silence.
  const announcedFirst = useRef(false)
  useEffect(() => {
    if (announcedFirst.current || !steps[0]) {
      return
    }
    announcedFirst.current = true
    onStepStartRef.current?.(steps[0], null)
  }, [steps])

  useEffect(() => {
    if (!running || finished) {
      return undefined
    }

    // Four times a second: fast enough that the number on screen turns over
    // close to when it really does, cheap enough to leave running for an hour.
    const intervalId = window.setInterval(() => {
      const now = Date.now()
      const left = Math.ceil((deadlineRef.current - now) / 1000)

      if (left > 0) {
        if (left !== remainingRef.current) {
          remainingRef.current = left
          setRemaining(left)
          const current = steps[stepIndexRef.current]
          if (current) {
            onSecondRef.current?.(left, current)
          }
        }
        return
      }

      // Time is up. A device that slept through several steps gets walked
      // through all of them - they really did elapse - and only the step it
      // lands on is announced.
      let index = stepIndexRef.current
      let overflow = now - deadlineRef.current
      const previous = steps[index] ?? null
      const done = [...completedKeysRef.current]

      while (index < steps.length) {
        const current = steps[index]
        if (current.kind === 'work') {
          done.push(current.key)
        }

        index += 1
        const upcoming = steps[index]
        if (!upcoming) {
          break
        }

        const length = upcoming.seconds * 1000
        if (overflow < length) {
          completedKeysRef.current = done
          stepIndexRef.current = index
          remainingRef.current = Math.ceil((length - overflow) / 1000)
          deadlineRef.current = now + (length - overflow)
          setCompletedKeys(done)
          setStepIndex(index)
          setRemaining(remainingRef.current)
          onStepStartRef.current?.(upcoming, previous)
          return
        }

        overflow -= length
      }

      completedKeysRef.current = done
      setCompletedKeys(done)
      complete()
    }, 250)

    return () => window.clearInterval(intervalId)
  }, [complete, finished, running, steps])

  const pause = useCallback(() => {
    if (!running) {
      return
    }
    const left = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000))
    remainingRef.current = left
    setRemaining(left)
    setRunning(false)
  }, [running])

  const resume = useCallback(() => {
    if (finished || running) {
      return
    }
    deadlineRef.current = Date.now() + remainingRef.current * 1000
    setRunning(true)
  }, [finished, running])

  const toggle = useCallback(() => {
    if (running) {
      pause()
    } else {
      resume()
    }
  }, [pause, resume, running])

  const next = useCallback(() => {
    if (stepIndex >= steps.length - 1) {
      complete()
      return
    }
    place(stepIndex + 1)
  }, [complete, place, stepIndex, steps.length])

  /**
   * What "previous" does on any player: a few seconds in it restarts the step
   * you are on, and it only takes you back a step if you press it right away.
   */
  const previous = useCallback(() => {
    const step = steps[stepIndex]
    const barelyStarted = step ? step.seconds - remaining <= 2 : true

    if (barelyStarted && stepIndex > 0) {
      place(stepIndex - 1)
      return
    }

    place(stepIndex, { announce: false })
  }, [place, remaining, stepIndex, steps])

  const jumpTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= steps.length) {
        return
      }
      place(index)
    },
    [place, steps.length],
  )

  const addSeconds = useCallback(
    (amount: number) => {
      if (finished) {
        return
      }
      const next = Math.max(0, remainingRef.current + amount)
      remainingRef.current = next
      setRemaining(next)
      if (running) {
        deadlineRef.current = Date.now() + next * 1000
      }
    },
    [finished, running],
  )

  const restart = useCallback(() => {
    completedRef.current = false
    completedKeysRef.current = []
    setCompletedKeys([])
    setFinished(false)
    place(0, { run: true })
  }, [place])

  const step = steps[stepIndex] ?? null
  // Clamped at the bottom as well as the top: adding seconds to a rest can
  // leave more on the clock than the step started with, and the progress bar
  // must not run backwards past where this step began.
  const elapsedSeconds = step
    ? Math.min(
        timeline.totalSeconds,
        Math.max(step.startsAt, step.startsAt + (step.seconds - remaining)),
      )
    : timeline.totalSeconds

  return {
    addSeconds,
    completedWorkSteps,
    elapsedSeconds,
    finished,
    finishNow: complete,
    jumpTo,
    next,
    pause,
    previous,
    progress:
      timeline.totalSeconds > 0
        ? Math.min(1, elapsedSeconds / timeline.totalSeconds)
        : 0,
    remaining,
    remainingSeconds: Math.max(0, timeline.totalSeconds - elapsedSeconds),
    restart,
    resume,
    running,
    step,
    stepIndex,
    toggle,
  }
}
