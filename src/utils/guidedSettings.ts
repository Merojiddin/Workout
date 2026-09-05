import {
  GUIDED_SETTINGS_KEY,
  safeGetJSON,
  safeSetJSON,
} from './storageUtils'

/**
 * How the guided player signals: a chime, a spoken guide, a buzz, or none of
 * them. Kept per user (the storage layer namespaces it) because a phone in a
 * pocket at the gym and a laptop in an office want different things.
 */
export { GUIDED_SETTINGS_KEY }

export interface GuidedSettings {
  /** The countdown chime and the phase-change tones. */
  sound: boolean
  /** The spoken guide: exercise names, coaching lines and the countdown. */
  voice: boolean
  /** navigator.vibrate on every phase change. */
  vibration: boolean
  /** Keep the screen awake for the length of the session. */
  keepAwake: boolean
}

export const defaultGuidedSettings: GuidedSettings = {
  keepAwake: true,
  sound: true,
  vibration: true,
  voice: true,
}

function normalize(value: unknown): GuidedSettings {
  const stored = (value ?? {}) as Partial<Record<keyof GuidedSettings, unknown>>

  return {
    keepAwake:
      typeof stored.keepAwake === 'boolean'
        ? stored.keepAwake
        : defaultGuidedSettings.keepAwake,
    sound:
      typeof stored.sound === 'boolean' ? stored.sound : defaultGuidedSettings.sound,
    vibration:
      typeof stored.vibration === 'boolean'
        ? stored.vibration
        : defaultGuidedSettings.vibration,
    voice:
      typeof stored.voice === 'boolean' ? stored.voice : defaultGuidedSettings.voice,
  }
}

export function getGuidedSettings(): GuidedSettings {
  try {
    return normalize(safeGetJSON(GUIDED_SETTINGS_KEY, null))
  } catch {
    return { ...defaultGuidedSettings }
  }
}

/** Returns false when the write failed - the toggle still works this session. */
export function saveGuidedSettings(settings: GuidedSettings): boolean {
  try {
    return Boolean(safeSetJSON(GUIDED_SETTINGS_KEY, normalize(settings)))
  } catch {
    return false
  }
}
