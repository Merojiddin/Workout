import { Component } from 'react'
import { Clipboard, Download, Home, RefreshCcw, TriangleAlert } from 'lucide-react'
import { getEnvConfig } from '../utils/envUtils'
import { downloadLocalStorageBackup } from '../utils/storageUtils'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      copied: false,
      error: null,
      errorInfo: null,
      hasError: false,
    }
  }

  static getDerivedStateFromError(error) {
    return { error, hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo })
    console.error('Workout OS render error', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleDashboard = () => {
    this.props.onGoDashboard?.()
    this.setState({
      copied: false,
      error: null,
      errorInfo: null,
      hasError: false,
    })
  }

  handleBackup = () => {
    downloadLocalStorageBackup()
  }

  handleCopyError = async () => {
    const text = this.getErrorText()
    if (!text || typeof navigator === 'undefined' || !navigator.clipboard) {
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      this.setState({ copied: true })
    } catch {
      this.setState({ copied: false })
    }
  }

  getErrorText() {
    const message = this.state.error?.message ?? ''
    const stack = this.state.error?.stack ?? ''
    const componentStack = this.state.errorInfo?.componentStack ?? ''
    return [message, stack, componentStack].filter(Boolean).join('\n\n')
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    const errorText = this.getErrorText()

    return (
      <main className="error-boundary-page">
        <section className="dashboard-card error-boundary-card" role="alert">
          <div className="error-boundary-icon" aria-hidden="true">
            <TriangleAlert size={30} strokeWidth={2.4} />
          </div>

          <div className="error-boundary-copy">
            <p className="eyebrow">App safety</p>
            <h1>Something went wrong</h1>
            <p>The app hit an error. Your saved data should still be safe.</p>
          </div>

          <div className="error-boundary-actions">
            <button
              className="workout-primary-button"
              onClick={this.handleReload}
              type="button"
            >
              <RefreshCcw size={19} strokeWidth={2.4} aria-hidden="true" />
              Reload App
            </button>
            <button
              className="workout-secondary-button"
              onClick={this.handleDashboard}
              type="button"
            >
              <Home size={19} strokeWidth={2.4} aria-hidden="true" />
              Go to Dashboard
            </button>
            <button
              className="workout-secondary-button"
              onClick={this.handleBackup}
              type="button"
            >
              <Download size={19} strokeWidth={2.4} aria-hidden="true" />
              Export Backup
            </button>
          </div>

          {errorText ? (
            <details className="error-boundary-details">
              <summary>Technical details</summary>
              {getEnvConfig().isProduction ? (
                // Production: no raw stack trace on screen. The full details
                // can still be copied manually for a bug report.
                <p className="error-boundary-hint">
                  Details are hidden in production. Use the button below to
                  copy the full error for a bug report.
                </p>
              ) : (
                <pre>{errorText}</pre>
              )}
              <button
                className="workout-secondary-button"
                onClick={this.handleCopyError}
                type="button"
              >
                <Clipboard size={18} strokeWidth={2.4} aria-hidden="true" />
                {this.state.copied ? 'Copied' : 'Copy error details'}
              </button>
            </details>
          ) : null}
        </section>
      </main>
    )
  }
}
