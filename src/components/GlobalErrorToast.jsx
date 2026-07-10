import { TriangleAlert, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const TOAST_COOLDOWN_MS = 30_000
const TOAST_AUTO_HIDE_MS = 8_000

/**
 * Step 20 - global unhandled error toast.
 *
 * Listens for window "error" and "unhandledrejection" events (errors the
 * ErrorBoundary can't catch: async code, event handlers, service workers)
 * and shows one calm toast. Rate-limited so an error loop can't spam the UI.
 */
export function GlobalErrorToast() {
  const [visible, setVisible] = useState(false)
  const lastShownRef = useRef(0)
  const hideTimerRef = useRef(null)

  useEffect(() => {
    function showToast() {
      const now = Date.now()
      if (now - lastShownRef.current < TOAST_COOLDOWN_MS) {
        return
      }
      lastShownRef.current = now
      setVisible(true)

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
      }
      hideTimerRef.current = setTimeout(() => setVisible(false), TOAST_AUTO_HIDE_MS)
    }

    function handleError(event) {
      // Ignore resource load errors (images, scripts) bubbling up as
      // "error" events without an actual thrown error.
      if (event?.target && event.target !== window && !event.error) {
        return
      }
      showToast()
    }

    function handleRejection() {
      showToast()
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
      }
    }
  }, [])

  if (!visible) {
    return null
  }

  return (
    <div className="global-error-toast" role="status">
      <TriangleAlert size={18} strokeWidth={2.4} aria-hidden="true" />
      <span>Something went wrong. Your data should still be safe.</span>
      <button
        aria-label="Dismiss"
        className="global-error-toast__close"
        onClick={() => setVisible(false)}
        type="button"
      >
        <X size={16} strokeWidth={2.6} aria-hidden="true" />
      </button>
    </div>
  )
}
