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
  /** Increment to run or hold the countdown - the rest ring is the button. */
  toggleSignal?: number
  /** Reports whether the countdown is actively running. */
  onRunningChange?: (isRunning: boolean) => void
  /** Reports the seconds left, so the round meter can show the same clock. */
  onTick?: (secondsLeft: number, isRunning: boolean) => void
  onComplete?: () => void
}

export function RestTimer({
  restSeconds = 90,
  autoStartSignal,
  skipSignal,
  extendSignal,
  toggleSignal,
  onRunningChange,
  onTick,
  onComplete,
}: RestTimerProps) {
  const safeRest = Math.max(1, Math.round(restSeconds || 90))
  const [duration, setDuration] = useState(safeRest)
  const [secondsLeft, setSecondsLeft] = useState(safeRest)
  const [isRunning, setIsRunning] = useState(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const onRunningChangeRef = useRef(onRunningChange)
  onRunningChangeRef.current = onRunningChange
  const onTickRef = useRef(onTick)
  onTickRef.current = onTick
  const toggleRef = useRef<() => void>(() => {})
  toggleRef.current = () => {
    if (isRunning) {
      setIsRunning(false)
      return
    }

    start()
  }

  useEffect(() => {
    onRunningChangeRef.current?.(isRunning)
  }, [isRunning])

  // Reported through a ref so a parent re-render cannot restart the countdown.
  useEffect(() => {
    onTickRef.current?.(secondsLeft, isRunning)
  }, [secondsLeft, isRunning])

  // External skip (sticky action bar).
  useEffect(() => {
    if (!skipSignal) {
      return
    }
    setIsRunning(false)
    setSecondsLeft(0)
  }, [skipSignal])

  // External +30 sec (sticky action bar).
  useEffect(() => {
    if (!extendSignal) {
      return
    }
    setSecondsLeft((current) => current + 30)
    setDuration((current) => current + 30)
  }, [extendSignal])

  // Tap on the rest ring. The click is still the live user gesture here, so
  // start() can unlock audio from inside this effect.
  useEffect(() => {
    if (!toggleSignal) {
      return
    }

    toggleRef.current()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleSignal])

  // Reset when the target rest changes (new exercise selected).
  useEffect(() => {
    setDuration(safeRest)
    setSecondsLeft(safeRest)
    setIsRunning(false)
  }, [safeRest])

  // Auto-start after a set is saved. The signal comes from the Save Set
  // click, so user activation is still fresh enough to unlock audio here.
  useEffect(() => {
    if (autoStartSignal === undefined || autoStartSignal === 0) {
      return
    }

    unlockAudio()
    setDuration(safeRest)
    setSecondsLeft(safeRest)
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
    unlockAudio()
    if (secondsLeft <= 0) {
      setSecondsLeft(duration)
    }
    setIsRunning(true)
  }

  // No UI of its own: the rest ring in the round stats is both the clock and
  // the run/hold button, and it drives this through onTick / toggleSignal.
  return null
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

/**
 * Shared context, unlocked during a user gesture. An AudioContext created in
 * the setInterval tick when the timer hits zero starts "suspended" under
 * browser autoplay policies and plays nothing, so the beep must reuse a
 * context that was resumed while a click was still fresh.
 */
let sharedAudioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  try {
    if (sharedAudioContext && sharedAudioContext.state !== 'closed') {
      return sharedAudioContext
    }

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AudioContextClass) {
      return null
    }

    sharedAudioContext = new AudioContextClass()
    return sharedAudioContext
  } catch {
    return null
  }
}

/** Call from a click handler so the completion beep is allowed to play later. */
function unlockAudio() {
  try {
    const context = getAudioContext()
    if (!context) {
      return
    }

    if (context.state === 'suspended') {
      context.resume().catch(() => undefined)
    }

    // iOS Safari also needs a buffer played inside the gesture itself.
    const buffer = context.createBuffer(1, 1, context.sampleRate)
    const source = context.createBufferSource()
    source.buffer = buffer
    source.connect(context.destination)
    source.start(0)
  } catch {
    // Audio is best-effort.
  }
}

function beep() {
  try {
    const context = getAudioContext()
    if (!context) {
      return
    }

    if (context.state === 'suspended') {
      context.resume().catch(() => undefined)
    }

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
    // Keep the shared context open: closing it would put the next beep back
    // behind the autoplay gate.
    oscillator.onended = () => {
      oscillator.disconnect()
      gain.disconnect()
    }
  } catch {
    // Audio is best-effort (autoplay policies, unsupported browsers).
  }
}
