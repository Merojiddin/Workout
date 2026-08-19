import { translate, type MessageKey } from './catalog'
import { getLanguage } from './store'
import type { MessageParams } from './types'

/**
 * The translate function for plain modules.
 *
 * A good deal of user-facing copy in this app is produced outside components:
 * the coach's suggestions, the weekly review's sentences, program validation
 * errors and the short target text on every exercise. Those cannot call
 * `useT()`, so they read the active language from the store instead.
 *
 * The tradeoff is that a string produced this way is captured at call time. It
 * is fine for text built during a render (which re-runs on a language change)
 * and for one-off messages like a confirm dialog, but a value memoised across
 * renders should be keyed on the language -- see `useLanguage().language`.
 */
export function t(key: MessageKey, params?: MessageParams): string {
  return translate(getLanguage(), key, params)
}
