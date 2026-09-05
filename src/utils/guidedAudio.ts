import { getLanguage } from '../i18n/store'
import type { LanguageCode } from '../i18n/languages'

/**
 * The spoken guide.
 *
 * Every line the player says - the name of the movement starting, its coaching
 * cue, "switch sides", "rest", the last three seconds - comes through here.
 * The device's own speech voice reads it, so nothing has to be recorded or
 * downloaded and it works in whichever language the app is set to. An exercise
 * that carries an `audioUrl` is played from that file instead, which is how a
 * recorded voiceover is attached to a movement without changing any code.
 *
 * Everything is best-effort. A browser with no speech engine, a device with
 * the ringer off, or a rejected autoplay must leave the timer running.
 */

const speechLanguageTags: Record<LanguageCode, string> = {
  en: 'en-GB',
  vi: 'vi-VN',
}

function getSynthesis(): SpeechSynthesis | null {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return null
    }
    return window.speechSynthesis
  } catch {
    return null
  }
}

export function isSpeechSupported(): boolean {
  return getSynthesis() !== null && typeof window.SpeechSynthesisUtterance === 'function'
}

/**
 * The best installed voice for a language, or null to let the engine choose.
 *
 * Recomputed rather than cached across calls because `getVoices()` is empty
 * until the engine has loaded its list, which on Chrome happens after the
 * first call rather than before it.
 */
function pickVoice(tag: string): SpeechSynthesisVoice | null {
  const synthesis = getSynthesis()
  if (!synthesis) {
    return null
  }

  try {
    const voices = synthesis.getVoices()
    if (!voices.length) {
      return null
    }

    const prefix = tag.slice(0, 2).toLowerCase()
    const exact = voices.find((voice) => voice.lang?.toLowerCase() === tag.toLowerCase())
    if (exact) {
      return exact
    }

    return (
      voices.find((voice) => voice.lang?.toLowerCase().startsWith(prefix)) ?? null
    )
  } catch {
    return null
  }
}

/**
 * Unlock the speech engine from inside a click.
 *
 * iOS refuses to speak anything unless the very first utterance was started by
 * a user gesture, and the player's later cues fire on a timer. Speaking a
 * single silent space during the tap that starts the workout is what buys
 * every cue after it.
 */
export function primeSpeech(): void {
  const synthesis = getSynthesis()
  if (!synthesis) {
    return
  }

  try {
    synthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(' ')
    utterance.volume = 0
    synthesis.speak(utterance)
    // Chrome parks a synthesis that was paused by a previous page in a
    // suspended state; resume is a no-op when it is already running.
    synthesis.resume()
  } catch {
    // Speech is best-effort.
  }
}

export interface SpeakOptions {
  language?: LanguageCode
  /** Cut off whatever is being said. On by default: cues replace each other. */
  interrupt?: boolean
  /** 0.1-10. The countdown is read faster than a coaching line. */
  rate?: number
}

/** Read one line aloud. Silently does nothing where speech is unavailable. */
export function speak(text: string, options: SpeakOptions = {}): void {
  const synthesis = getSynthesis()
  const line = text.trim()
  if (!synthesis || !line || typeof window.SpeechSynthesisUtterance !== 'function') {
    return
  }

  try {
    if (options.interrupt !== false) {
      synthesis.cancel()
    }

    const language = options.language ?? getLanguage()
    const tag = speechLanguageTags[language] ?? speechLanguageTags.en
    const utterance = new SpeechSynthesisUtterance(line)
    utterance.lang = tag
    utterance.rate = options.rate ?? 1.05
    utterance.pitch = 1
    utterance.volume = 1

    const voice = pickVoice(tag)
    if (voice) {
      utterance.voice = voice
    }

    synthesis.speak(utterance)
  } catch {
    // Speech is best-effort.
  }
}

/** Stop mid-sentence: pausing the workout, leaving it, or skipping a step. */
export function stopSpeaking(): void {
  const synthesis = getSynthesis()
  if (!synthesis) {
    return
  }

  try {
    synthesis.cancel()
  } catch {
    // Speech is best-effort.
  }
}

/**
 * A recorded voiceover attached to an exercise, played instead of the device
 * voice. One clip plays at a time, so a skipped step does not leave the
 * previous exercise still talking over the next one.
 */
let cueAudio: HTMLAudioElement | null = null

export function playCueAudio(url: string): void {
  const source = url.trim()
  if (!source || typeof Audio !== 'function') {
    return
  }

  try {
    stopCueAudio()
    cueAudio = new Audio(source)
    cueAudio.preload = 'auto'
    void cueAudio.play().catch(() => undefined)
  } catch {
    // A missing or unplayable file must not interrupt the workout.
  }
}

export function stopCueAudio(): void {
  if (!cueAudio) {
    return
  }

  try {
    cueAudio.pause()
    cueAudio.currentTime = 0
  } catch {
    // Nothing to do - the element is being discarded anyway.
  }
  cueAudio = null
}

/** Everything the guide might be saying or playing, stopped at once. */
export function stopAllGuidedAudio(): void {
  stopSpeaking()
  stopCueAudio()
}
