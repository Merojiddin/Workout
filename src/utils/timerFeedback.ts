import { sendReminder } from '../services/reminderService'
import { getReminderSettings } from './reminderUtils'

/**
 * Sound and vibration for the live workout ring: a countdown that reaches
 * zero, or a timed set that reaches the time it asked for.
 *
 * Everything here is best-effort. A browser that refuses the audio, blocks
 * the vibration or has notifications turned off must not break the timer.
 */

/** Beep + vibrate: the set is over, or the rest is. */
export function playTimerChime(): void {
  vibrate()
  beep()
}

/** The rest is over, and the phone may be in a pocket rather than in hand. */
export function notifyRestComplete(): void {
  playTimerChime()

  try {
    const settings = getReminderSettings()
    if (settings.restTimerNotificationEnabled) {
      sendReminder('rest-timer', 'Rest complete', 'Time for your next set.')
    }
  } catch {
    // Reminder notifications are best-effort.
  }
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

/**
 * Shared context, unlocked during a user gesture. An AudioContext created in
 * the tick where the timer hits its mark starts "suspended" under browser
 * autoplay policies and plays nothing, so the beep must reuse a context that
 * was resumed while a click was still fresh.
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
export function unlockAudio(): void {
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
