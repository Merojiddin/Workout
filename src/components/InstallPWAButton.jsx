import { Download, Share2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useT } from '../i18n'

export function InstallPWAButton({ compact = false }) {
  const t = useT()
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installed, setInstalled] = useState(() => isStandaloneMode())
  const isIosSafari = useMemo(() => detectIosSafari(), [])

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault()
      setInstallPrompt(event)
    }

    function handleInstalled() {
      setInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  async function handleInstall() {
    if (!installPrompt) {
      return
    }

    try {
      await installPrompt.prompt()
      await installPrompt.userChoice
    } catch {
      // Browsers may reject if the prompt is dismissed or unsupported.
    } finally {
      setInstallPrompt(null)
    }
  }

  if (installed) {
    return null
  }

  if (installPrompt) {
    return (
      <button
        className={`install-pwa-button${compact ? ' install-pwa-button--compact' : ''}`}
        onClick={handleInstall}
        type="button"
      >
        <Download size={18} strokeWidth={2.5} aria-hidden="true" />
        {t('pwa.install')}
      </button>
    )
  }

  if (isIosSafari) {
    return (
      <div
        className={`install-pwa-hint${compact ? ' install-pwa-hint--compact' : ''}`}
        role="note"
      >
        <Share2 size={17} strokeWidth={2.5} aria-hidden="true" />
        {t('pwa.iosHint')}
      </div>
    )
  }

  return null
}

function isStandaloneMode() {
  if (typeof window === 'undefined') {
    return false
  }
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function detectIosSafari() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false
  }
  const userAgent = navigator.userAgent || ''
  const isIos = /iphone|ipad|ipod/i.test(userAgent)
  const isSafari = /safari/i.test(userAgent) && !/crios|fxios|edgios/i.test(userAgent)
  return isIos && isSafari && !isStandaloneMode()
}
