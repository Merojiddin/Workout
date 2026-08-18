import { formatMessage } from './interpolate'
import { catalogs } from './locales'
import { en } from './locales/en'
import { DEFAULT_LANGUAGE, type LanguageCode } from './languages'
import type { MessageParams } from './types'

/**
 * Every key the app can translate, derived from the English catalog.
 *
 * English is the source of truth: a key exists because it exists in `en`, and
 * every other locale is typed against it. Referring to a key that was never
 * written -- or misspelling one -- is a compile error, not a string that reads
 * `settings.tilte` in production.
 */
export type MessageKey = keyof typeof en

/** Languages that only English is a plural-inflected source for. */
const PLURAL_LANGUAGES = new Set<LanguageCode>(['en'])

/**
 * Resolves one key in one language.
 *
 * Falls back to English when a locale has not translated a key yet, which is
 * what lets a newly added language ship progressively instead of all at once.
 * A key missing everywhere returns the key itself: visible in the UI, obvious
 * in a screenshot, and impossible to mistake for finished copy.
 */
export function translate(
  language: LanguageCode,
  key: MessageKey,
  params?: MessageParams,
): string {
  const message = catalogs[language]?.[key] ?? catalogs[DEFAULT_LANGUAGE][key]

  if (message === undefined) {
    return key
  }

  return formatMessage(message, params, PLURAL_LANGUAGES.has(language))
}

/** True when this language has its own wording for the key. */
export function hasTranslation(
  language: LanguageCode,
  key: MessageKey,
): boolean {
  return catalogs[language]?.[key] !== undefined
}
