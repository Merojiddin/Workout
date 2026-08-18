import {
  DEFAULT_LANGUAGE,
  detectBrowserLanguage,
  getLanguageDefinition,
  isLanguageCode,
  type LanguageCode,
} from './languages'

/**
 * The active language, kept outside React.
 *
 * Two reasons it lives here rather than only in a context: plenty of
 * user-facing copy is produced in plain modules (the coach suggestions, the
 * weekly review, program validation messages) that cannot call a hook, and the
 * choice has to be readable during the very first render, before any provider
 * has mounted.
 *
 * Stored under a bare localStorage key on purpose. Every other key in the app
 * is namespaced per signed-in user (see storageUtils), but the language is a
 * property of this device and this browser: it has to work on the login screen,
 * before anyone is signed in, and it should not change when accounts do.
 */
export const LANGUAGE_STORAGE_KEY = 'appLanguage'

/** Fired on `window` whenever the language changes. */
export const LANGUAGE_CHANGED_EVENT = 'fitness-language-changed'

type Listener = (language: LanguageCode) => void

const listeners = new Set<Listener>()

let activeLanguage: LanguageCode = resolveInitialLanguage()

function readStoredLanguage(): LanguageCode | null {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return isLanguageCode(stored) ? stored : null
  } catch {
    // Private browsing and disabled storage both throw here. The app still
    // works, it just cannot remember the choice between visits.
    return null
  }
}

function resolveInitialLanguage(): LanguageCode {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE
  }

  const stored = readStoredLanguage()
  if (stored) {
    return stored
  }

  const detected = detectBrowserLanguage(
    window.navigator?.languages ?? [window.navigator?.language ?? ''],
  )
  return detected ?? DEFAULT_LANGUAGE
}

export function getLanguage(): LanguageCode {
  return activeLanguage
}

/** True until someone picks a language, i.e. the current one was guessed. */
export function hasStoredLanguagePreference(): boolean {
  return readStoredLanguage() !== null
}

export function setLanguage(next: LanguageCode): void {
  if (!isLanguageCode(next) || next === activeLanguage) {
    return
  }

  activeLanguage = next

  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next)
  } catch {
    // Not persisting is survivable; the session still switches.
  }

  applyDocumentLanguage(next)

  for (const listener of listeners) {
    listener(next)
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGED_EVENT, { detail: next }))
  }
}

export function subscribeToLanguage(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Keeps `<html lang>` in step with the choice. Screen readers pick their
 * pronunciation from it, and it is what tells a browser not to offer to
 * translate a page that is already in the reader's language.
 */
export function applyDocumentLanguage(language: LanguageCode): void {
  if (typeof document === 'undefined') {
    return
  }
  document.documentElement.lang = getLanguageDefinition(language).intlLocale
}
