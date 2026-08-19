import { CheckCircle2, CloudOff, RefreshCw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { useT } from '../i18n'

export function OfflineBanner({ syncMessage, syncTone = 'info' }) {
  const { isOnline } = useOnlineStatus()
  const t = useT()
  const wasOffline = useRef(!isOnline)
  const [backOnline, setBackOnline] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true
      setBackOnline(false)
      return undefined
    }

    if (!wasOffline.current) {
      return undefined
    }

    setBackOnline(true)
    wasOffline.current = false
    const timer = window.setTimeout(() => setBackOnline(false), 3200)
    return () => window.clearTimeout(timer)
  }, [isOnline])

  if (!isOnline) {
    return (
      <div className="offline-banner offline-banner--offline" role="status">
        <CloudOff size={17} strokeWidth={2.5} aria-hidden="true" />
        {t('offline.banner')}
      </div>
    )
  }

  if (syncMessage) {
    return (
      <div
        className={`offline-banner offline-banner--${syncTone}`}
        role="status"
      >
        <RefreshCw size={17} strokeWidth={2.5} aria-hidden="true" />
        {syncMessage}
      </div>
    )
  }

  if (backOnline) {
    return (
      <div className="offline-banner offline-banner--online" role="status">
        <CheckCircle2 size={17} strokeWidth={2.5} aria-hidden="true" />
        {t('offline.backOnline')}
      </div>
    )
  }

  return null
}
