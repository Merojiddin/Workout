import { Loader2 } from 'lucide-react'
import { useT } from '../i18n'

/** Suspense fallback shown while a lazy-loaded page chunk downloads. */
export function LoadingState({ label = '' }) {
  const t = useT()

  return (
    <div className="page-loading-state" role="status" aria-live="polite">
      <Loader2 size={26} strokeWidth={2.4} aria-hidden="true" />
      <span>{label || t('loading.page')}</span>
    </div>
  )
}
