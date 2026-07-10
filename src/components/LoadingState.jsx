import { Loader2 } from 'lucide-react'

/** Suspense fallback shown while a lazy-loaded page chunk downloads. */
export function LoadingState({ label = 'Loading page...' }) {
  return (
    <div className="page-loading-state" role="status" aria-live="polite">
      <Loader2 size={26} strokeWidth={2.4} aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
