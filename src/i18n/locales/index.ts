import type { MessageKey } from '../catalog'
import type { CatalogRegistry } from '../types'
import { en } from './en'
import { vi } from './vi'

/**
 * Every catalog the app ships, keyed by language code.
 *
 * A third language is added here and in `languages.ts`, and nowhere else. It
 * may start as a partial catalog -- anything it has not translated falls back
 * to English until it does.
 */
export const catalogs: CatalogRegistry<MessageKey> = {
  en,
  vi,
}

export { en } from './en'
