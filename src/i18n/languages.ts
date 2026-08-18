/**
 * The registry of languages the app ships.
 *
 * Adding a language is meant to be a three-line change: add its code here,
 * add a catalog under `locales/`, and register that catalog in
 * `locales/index.ts`. Nothing else in the app names a language directly --
 * the toggle, the persisted preference, the `<html lang>` attribute and every
 * date/number format all read from this list.
 */

export type LanguageCode = 'en' | 'vi'

export interface LanguageDefinition {
  code: LanguageCode
  /** Name of the language in that language, used in the picker. */
  nativeLabel: string
  /** Name of the language in English, for accessibility labels and logs. */
  englishLabel: string
  /** Two-letter code shown in the compact header toggle. */
  shortLabel: string
  /** BCP 47 tag handed to Intl for dates, numbers and collation. */
  intlLocale: string
  /**
   * Prefixes matched against `navigator.languages` on a first visit. A visitor
   * arriving with `vi-VN` gets Vietnamese without touching Settings.
   */
  browserPrefixes: string[]
}

/** Falls back to this when nothing is stored and the browser offers no match. */
export const DEFAULT_LANGUAGE: LanguageCode = 'en'

/**
 * Order matters: this is the order the picker renders, and the order browser
 * languages are matched in when a visitor accepts several.
 */
export const LANGUAGES: LanguageDefinition[] = [
  {
    code: 'en',
    nativeLabel: 'English',
    englishLabel: 'English',
    shortLabel: 'EN',
    intlLocale: 'en-GB',
    browserPrefixes: ['en'],
  },
  {
    code: 'vi',
    nativeLabel: 'Tiếng Việt',
    englishLabel: 'Vietnamese',
    shortLabel: 'VI',
    intlLocale: 'vi-VN',
    browserPrefixes: ['vi'],
  },
]

const languagesByCode = new Map<string, LanguageDefinition>(
  LANGUAGES.map((language) => [language.code, language]),
)

export const LANGUAGE_CODES: LanguageCode[] = LANGUAGES.map(
  (language) => language.code,
)

export function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === 'string' && languagesByCode.has(value)
}

export function getLanguageDefinition(code: LanguageCode): LanguageDefinition {
  return languagesByCode.get(code) ?? LANGUAGES[0]
}

/** The Intl tag for a language, e.g. 'vi' -> 'vi-VN'. */
export function getIntlLocale(code: LanguageCode): string {
  return getLanguageDefinition(code).intlLocale
}

/**
 * Best match for the languages the browser reports, or null when it offers
 * nothing the app ships. Checked only on a first visit -- once someone picks a
 * language explicitly, their choice wins on every later visit.
 */
export function detectBrowserLanguage(
  preferred: readonly string[] | undefined,
): LanguageCode | null {
  if (!preferred?.length) {
    return null
  }

  for (const tag of preferred) {
    const normalized = String(tag).toLowerCase()
    for (const language of LANGUAGES) {
      const matches = language.browserPrefixes.some(
        (prefix) => normalized === prefix || normalized.startsWith(`${prefix}-`),
      )
      if (matches) {
        return language.code
      }
    }
  }

  return null
}
