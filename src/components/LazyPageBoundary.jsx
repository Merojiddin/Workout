import { Component } from 'react'
import { RefreshCcw, WifiOff } from 'lucide-react'
import { t } from '../i18n/t'

/**
 * Step 20 - fallback for failed lazy page loads.
 *
 * If a code-split chunk fails to download (offline, or a stale deployment
 * where old chunk URLs 404 after a redeploy), show a reload prompt instead
 * of the generic crash screen. Resets when the user navigates elsewhere.
 */
export class LazyPageBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidUpdate(prevProps) {
    if (this.state.failed && prevProps.pageKey !== this.props.pageKey) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ failed: false })
    }
  }

  componentDidCatch(error) {
    // Only swallow chunk-load style failures; real render bugs should reach
    // the app-level ErrorBoundary with full details.
    if (!isChunkLoadError(error)) {
      throw error
    }
    console.warn('Lazy page chunk failed to load', error)
  }

  render() {
    if (!this.state.failed) {
      return this.props.children
    }

    return (
      <div className="page-loading-state page-loading-state--error" role="alert">
        <WifiOff size={26} strokeWidth={2.4} aria-hidden="true" />
        <span>{t('lazy.failed')}</span>
        <button
          className="workout-primary-button"
          onClick={() => window.location.reload()}
          type="button"
        >
          <RefreshCcw size={18} strokeWidth={2.4} aria-hidden="true" />
          {t('lazy.reload')}
        </button>
      </div>
    )
  }
}

function isChunkLoadError(error) {
  const message = String(error?.message ?? '')
  return (
    /failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /importing a module script failed/i.test(message) ||
    /chunk/i.test(message)
  )
}
