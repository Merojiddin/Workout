import type { LanguageCode } from './languages'

/**
 * A message is either a plain string or, where English needs to agree with a
 * count, a small plural form. Vietnamese has no plural inflection, so its
 * catalogs may still use the object form when the English does -- the `other`
 * branch simply carries the whole phrase.
 */
export interface PluralMessage {
  /** Optional dedicated wording for zero, e.g. "No sets logged". */
  zero?: string
  one: string
  other: string
}

export type Message = string | PluralMessage

/** Values interpolated into `{placeholders}` inside a message. */
export type MessageParams = Record<string, string | number>

/**
 * A catalog that has been fully translated. Declaring a locale file as this
 * type turns a forgotten key into a compile error rather than an English
 * string appearing mid-sentence in another language.
 */
export type Catalog<Key extends string> = Record<Key, Message>

/**
 * A catalog still being filled in. A newly added third language can start as
 * this and grow; anything missing falls back to English at runtime.
 */
export type PartialCatalog<Key extends string> = Partial<Record<Key, Message>>

export type CatalogRegistry<Key extends string> = Record<
  LanguageCode,
  PartialCatalog<Key>
>
