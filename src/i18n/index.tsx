import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type PropsWithChildren,
} from 'react'
import { translate, type MessageKey } from './catalog'
import {
  getLanguageDefinition,
  LANGUAGES,
  type LanguageCode,
  type LanguageDefinition,
} from './languages'
import {
  applyDocumentLanguage,
  getLanguage,
  setLanguage,
  subscribeToLanguage,
} from './store'
import type { MessageParams } from './types'

export type TranslateFn = (key: MessageKey, params?: MessageParams) => string

interface LanguageContextValue {
  language: LanguageCode
  definition: LanguageDefinition
  languages: LanguageDefinition[]
  setLanguage: (language: LanguageCode) => void
  t: TranslateFn
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

/**
 * Subscribes to the module-level language store rather than holding the state
 * itself. Plain modules change the language too (and read it without a hook),
 * so the store stays the single source of truth and React just follows it.
 */
export function LanguageProvider({ children }: PropsWithChildren) {
  const language = useSyncExternalStore(
    subscribeToLanguage,
    getLanguage,
    getLanguage,
  )

  // The stored preference is read before React mounts, so the very first paint
  // is already in the right language; this only mirrors it onto <html lang>.
  useEffect(() => {
    applyDocumentLanguage(language)
  }, [language])

  const t = useCallback<TranslateFn>(
    (key, params) => translate(language, key, params),
    [language],
  )

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      definition: getLanguageDefinition(language),
      languages: LANGUAGES,
      setLanguage,
      t,
    }),
    [language, t],
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

function useLanguageContext(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used inside a LanguageProvider')
  }
  return context
}

/** The whole language API: current code, the picker list, and the setter. */
export function useLanguage(): LanguageContextValue {
  return useLanguageContext()
}

/**
 * The translate function on its own, which is what nearly every component
 * wants: `const t = useT()`, then `t('nav.workout')`.
 */
export function useT(): TranslateFn {
  return useLanguageContext().t
}

export type { MessageKey } from './catalog'
export type { LanguageCode, LanguageDefinition } from './languages'
export {
  DEFAULT_LANGUAGE,
  getIntlLocale,
  isLanguageCode,
  LANGUAGES,
} from './languages'
export { getLanguage, hasStoredLanguagePreference, setLanguage } from './store'
export { translate } from './catalog'
export { compareText, formatDate, formatNumber } from './format'
