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
  // Matches the chime: three pulses and a long final buzz.
  vibratePattern([180, 90, 180, 90, 180, 120, 500])
}

/** One buzz pattern, in milliseconds of on/off. Ignored where unsupported. */
export function vibratePattern(pattern: number | number[]): void {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern)
    }
  } catch {
    // Vibration is best-effort.
  }
}

/**
 * The guided player's phase change: work starting, rest starting, or the whole
 * session finishing. Each one sounds different on purpose - the point is to
 * know what just happened without looking at the screen.
 */
export type TimerCueKind = 'work' | 'rest' | 'finish'

const cueTones: Record<TimerCueKind, ToneSpec[]> = {
  // Rising pair: go.
  work: [
    { frequency: 987.77, at: 0, duration: 0.16 },
    { frequency: 1567.98, at: 0.14, duration: 0.34 },
  ],
  // Falling pair, softer: stop and breathe.
  rest: [
    { frequency: 1174.66, at: 0, duration: 0.16 },
    { frequency: 783.99, at: 0.15, duration: 0.4 },
  ],
  // Three rising notes that resolve: that was the last one.
  finish: [
    { frequency: 783.99, at: 0, duration: 0.18 },
    { frequency: 1046.5, at: 0.17, duration: 0.18 },
    { frequency: 1567.98, at: 0.34, duration: 0.9 },
  ],
}

const cueVibrations: Record<TimerCueKind, number[]> = {
  work: [90, 60, 220],
  rest: [220],
  finish: [180, 90, 180, 90, 400],
}

/** The tone only - sound and vibration are separate switches in the player. */
export function playPhaseCue(kind: TimerCueKind): void {
  playTones(cueTones[kind], 1.1)
}

/** The buzz only, for a phone face-down on a mat. */
export function vibratePhaseCue(kind: TimerCueKind): void {
  vibratePattern(cueVibrations[kind])
}

/**
 * One short blip per second over the last few seconds of a step. Quiet and
 * brief so a run of them reads as a countdown rather than as an alarm.
 */
export function playCountdownTick(): void {
  playTones([{ frequency: 1318.51, at: 0, duration: 0.09 }], 0.7)
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

/**
 * Three sharp pulses and a held tone, ~1.6s in all. A single short sine was
 * easy to miss across a gym: small phone speakers reproduce almost nothing
 * below ~500Hz, and the ear is most sensitive around 2-4kHz, so the chime
 * sits high and uses a triangle wave plus an octave partial to carry. A
 * limiter on the master bus lets the level run hot without the crackle that
 * clipping the destination would give.
 */
function beep() {
  // Three D6 pulses, then a G6 that rings out: an alarm shape rather than a
  // single blip, so a missed pulse still leaves two more to notice.
  playTones(
    [
      { frequency: 1174.66, at: 0, duration: 0.2 },
      { frequency: 1174.66, at: 0.24, duration: 0.2 },
      { frequency: 1174.66, at: 0.48, duration: 0.2 },
      { frequency: 1567.98, at: 0.74, duration: 0.85 },
    ],
    1.4,
  )
}

/** One note in a cue: its pitch, when it starts, and how long it rings. */
interface ToneSpec {
  frequency: number
  /** Seconds after the cue begins. */
  at: number
  duration: number
}

/**
 * Plays a short sequence of notes through one limited bus.
 *
 * `level` drives the limiter on purpose: the ceiling below, not that number,
 * sets the peak, so a cue sits near full scale throughout instead of only at
 * each attack.
 */
function playTones(notes: ToneSpec[], level: number) {
  try {
    const context = getAudioContext()
    if (!context || notes.length === 0) {
      return
    }

    if (context.state === 'suspended') {
      context.resume().catch(() => undefined)
    }

    const master = context.createGain()
    master.gain.setValueAtTime(level, context.currentTime)

    const limiter = context.createDynamicsCompressor()
    limiter.threshold.setValueAtTime(-1, context.currentTime)
    limiter.knee.setValueAtTime(0, context.currentTime)
    limiter.ratio.setValueAtTime(20, context.currentTime)
    limiter.attack.setValueAtTime(0.002, context.currentTime)
    limiter.release.setValueAtTime(0.15, context.currentTime)

    master.connect(limiter)
    limiter.connect(context.destination)

    const start = context.currentTime + 0.02
    let pending = notes.length

    for (const note of notes) {
      playNote(context, master, note.frequency, start + note.at, note.duration, () => {
        pending -= 1
        if (pending === 0) {
          master.disconnect()
          limiter.disconnect()
        }
      })
    }
  } catch {
    // Audio is best-effort (autoplay policies, unsupported browsers).
  }
}

/** One struck note: a triangle fundamental plus a quieter sine octave. */
function playNote(
  context: AudioContext,
  destination: AudioNode,
  frequency: number,
  startTime: number,
  duration: number,
  onEnded: () => void,
) {
  const gain = context.createGain()
  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(1, startTime + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
  gain.connect(destination)

  const voices: Array<{ oscillator: OscillatorNode; gain: GainNode }> = [
    { type: 'triangle' as OscillatorType, frequency, level: 0.55 },
    { type: 'sine' as OscillatorType, frequency: frequency * 2, level: 0.2 },
  ].map((voice) => {
    const oscillator = context.createOscillator()
    const voiceGain = context.createGain()
    oscillator.type = voice.type
    oscillator.frequency.setValueAtTime(voice.frequency, startTime)
    voiceGain.gain.setValueAtTime(voice.level, startTime)
    oscillator.connect(voiceGain)
    voiceGain.connect(gain)
    oscillator.start(startTime)
    oscillator.stop(startTime + duration + 0.02)
    return { oscillator, gain: voiceGain }
  })

  // Keep the shared context open: closing it would put the next beep back
  // behind the autoplay gate.
  voices[voices.length - 1].oscillator.onended = () => {
    for (const voice of voices) {
      voice.oscillator.disconnect()
      voice.gain.disconnect()
    }
    gain.disconnect()
    onEnded()
  }
}
