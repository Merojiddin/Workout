import { Pause, Play, Plus, RotateCcw, SkipForward } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { sendReminder } from '../services/reminderService'
import { getReminderSettings } from '../utils/reminderUtils'

interface RestTimerProps {
  restSeconds?: number
  /** Change this number to reset the timer and auto-start a fresh countdown. */
  autoStartSignal?: number
  /** Increment to skip the current rest from outside (sticky action bar). */
  skipSignal?: number
  /** Increment to add 30 seconds from outside (sticky action bar). */
  extendSignal?: number
  /** Reports whether the countdown is actively running. */
  onRunningChange?: (isRunning: boolean) => void
  onComplete?: () => void
  onSkip?: () => void
}

export function RestTimer({
  restSeconds = 90,
  autoStartSignal,
  skipSignal,
  extendSignal,
  onRunningChange,
  onComplete,
  onSkip,
}: RestTimerProps) {
  const safeRest = Math.max(1, Math.round(restSeconds || 90))
  const [duration, setDuration] = useState(safeRest)
  const [secondsLeft, setSecondsLeft] = useState(safeRest)
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const onRunningChangeRef = useRef(onRunningChange)
  onRunningChangeRef.current = onRunningChange

  useEffect(() => {
    onRunningChangeRef.current?.(isRunning)
  }, [isRunning])

  // External skip (sticky action bar).
  useEffect(() => {
    if (!skipSignal) {
      return
    }
    setIsRunning(false)
    setSecondsLeft(0)
    setIsComplete(true)
  }, [skipSignal])

  // External +30 sec (sticky action bar).
  useEffect(() => {
    if (!extendSignal) {
      return
    }
    setSecondsLeft((current) => current + 30)
    setDuration((current) => current + 30)
    setIsComplete(false)
  }, [extendSignal])

  // Reset when the target rest changes (new exercise selected).
  useEffect(() => {
    setDuration(safeRest)
    setSecondsLeft(safeRest)
    setIsRunning(false)
    setIsComplete(false)
  }, [safeRest])

  // Auto-start after a set is saved.
  useEffect(() => {
    if (autoStartSignal === undefined || autoStartSignal === 0) {
      return
    }

    setDuration(safeRest)
    setSecondsLeft(safeRest)
    setIsComplete(false)
    setIsRunning(true)
    // safeRest is intentionally excluded: only the signal should retrigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStartSignal])

  useEffect(() => {
    if (!isRunning) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId)
          setIsRunning(false)
          setIsComplete(true)
          notifyRestComplete()
          onCompleteRef.current?.()
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [isRunning])

  function start() {
    if (secondsLeft <= 0) {
      setSecondsLeft(duration)
    }
    setIsComplete(false)
    setIsRunning(true)
  }

  function reset() {
    setSecondsLeft(duration)
    setIsRunning(false)
    setIsComplete(false)
  }

  function addThirty() {
    setSecondsLeft((current) => current + 30)
    setDuration((current) => current + 30)
    setIsComplete(false)
  }

  function skip() {
    setIsRunning(false)
    setSecondsLeft(0)
    setIsComplete(true)
    onSkip?.()
  }

  const progress = duration > 0 ? Math.min(secondsLeft / duration, 1) : 0

  return (
    <section
      className={`rest-timer${isComplete ? ' rest-timer--done' : ''}`}
      aria-label="Rest timer"
    >
      <div className="rest-timer__display">
        <p className="eyebrow">Rest Timer</p>
        <strong aria-live="polite">{formatSeconds(secondsLeft)}</strong>
        <span>
          {isComplete
            ? 'Rest complete. Start next set.'
            : isRunning
              ? 'Resting...'
              : `Target rest: ${duration} sec`}
        </span>
        <div
          className="rest-timer__bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={secondsLeft}
        >
          <span style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      <div className="timer-actions">
        {isRunning ? (
          <button
            className="timer-button"
            onClick={() => setIsRunning(false)}
            type="button"
          >
            <Pause size={18} strokeWidth={2.4} aria-hidden="true" />
            Pause
          </button>
        ) : (
          <button
            className="timer-button timer-button--primary"
            onClick={start}
            type="button"
          >
            <Play size={18} strokeWidth={2.4} aria-hidden="true" />
            {isComplete ? 'Restart' : 'Start Rest'}
          </button>
        )}
        <button className="timer-button" onClick={addThirty} type="button">
          <Plus size={18} strokeWidth={2.4} aria-hidden="true" />
          +30 sec
        </button>
        <button className="timer-button" onClick={reset} type="button">
          <RotateCcw size={18} strokeWidth={2.4} aria-hidden="true" />
          Reset
        </button>
        <button className="timer-button" onClick={skip} type="button">
          <SkipForward size={18} strokeWidth={2.4} aria-hidden="true" />
          Skip Rest
        </button>
      </div>
    </section>
  )
}

/** Beep (Web Audio) + vibrate on mobile - no audio files required. */
function notifyRestComplete() {
  vibrate()
  beep()
  notifyRestReminder()
}

function vibrate() {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate([200, 100, 200])
    }
  } catch {
    // Vibration is best-effort.
  }
}

function notifyRestReminder() {
  try {
    const settings = getReminderSettings()
    if (settings.restTimerNotificationEnabled) {
      sendReminder('rest-timer', 'Rest complete', 'Time for your next set.')
    }
  } catch {
    // Reminder notifications are best-effort.
  }
}

function beep() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AudioContextClass) {
      return
    }

    const context = new AudioContextClass()
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, context.currentTime)
    gain.gain.setValueAtTime(0.0001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.25, context.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.6)

    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.62)
    oscillator.onended = () => context.close().catch(() => undefined)
  } catch {
    // Audio is best-effort (autoplay policies, unsupported browsers).
  }
}

function formatSeconds(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds)
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
