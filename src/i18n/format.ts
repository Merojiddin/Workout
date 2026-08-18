import { getIntlLocale, type LanguageCode } from './languages'
import { getLanguage } from './store'

/**
 * Locale-aware wrappers around Intl.
 *
 * Before the language toggle these call sites passed a hardcoded `'en'`, which
 * meant a Vietnamese reader still saw "Mon 3 Feb". Everything routes through
 * here now so a new language gets correct dates for free from its `intlLocale`.
 *
 * Formatters are cached because building an Intl formatter is expensive and
 * these run inside chart tick callbacks and long history tables.
 */
const dateFormatterCache = new Map<string, Intl.DateTimeFormat>()
const numberFormatterCache = new Map<string, Intl.NumberFormat>()

function cacheKey(locale: string, options: object): string {
  return `${locale}|${JSON.stringify(options)}`
}

export function getDateFormatter(
  options: Intl.DateTimeFormatOptions,
  language: LanguageCode = getLanguage(),
): Intl.DateTimeFormat {
  const locale = getIntlLocale(language)
  const key = cacheKey(locale, options)
  let formatter = dateFormatterCache.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options)
    dateFormatterCache.set(key, formatter)
  }
  return formatter
}

export function getNumberFormatter(
  options: Intl.NumberFormatOptions = {},
  language: LanguageCode = getLanguage(),
): Intl.NumberFormat {
  const locale = getIntlLocale(language)
  const key = cacheKey(locale, options)
  let formatter = numberFormatterCache.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options)
    numberFormatterCache.set(key, formatter)
  }
  return formatter
}

export function formatDate(
  value: Date | string | number,
  options: Intl.DateTimeFormatOptions,
  language?: LanguageCode,
): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return getDateFormatter(options, language).format(date)
}

export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
  language?: LanguageCode,
): string {
  if (!Number.isFinite(value)) {
    return ''
  }
  return getNumberFormatter(options, language).format(value)
}

/** Locale-aware A-Z sorting, used for exercise and program lists. */
export function compareText(
  left: string,
  right: string,
  language: LanguageCode = getLanguage(),
): number {
  return left.localeCompare(right, getIntlLocale(language), {
    sensitivity: 'base',
    numeric: true,
  })
}
