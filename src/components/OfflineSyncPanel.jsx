import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  CloudOff,
  RefreshCw,
  Trash2,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { syncPendingQueue } from '../services/syncService'
import {
  clearFailedSyncItems,
  getFailedSyncCount,
  getLastOfflineSyncAt,
  getPendingSyncCount,
} from '../utils/offlineSyncQueue'
import { InstallPWAButton } from './InstallPWAButton'

export function OfflineSyncPanel() {
  const { isSupabaseConfigured, user } = useAuth()
  const { isOnline } = useOnlineStatus()
  const [pendingCount, setPendingCount] = useState(() => getPendingSyncCount())
  const [failedCount, setFailedCount] = useState(() => getFailedSyncCount())
  const [lastSyncAt, setLastSyncAt] = useState(() => getLastOfflineSyncAt())
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)
  const cloudActive = isSupabaseConfigured && Boolean(user)

  useEffect(() => {
    function refreshCounts() {
      setPendingCount(getPendingSyncCount())
      setFailedCount(getFailedSyncCount())
      setLastSyncAt(getLastOfflineSyncAt())
    }

    window.addEventListener('offline-sync-queue-changed', refreshCounts)
    window.addEventListener('online', refreshCounts)
    window.addEventListener('offline', refreshCounts)
    refreshCounts()

    return () => {
      window.removeEventListener('offline-sync-queue-changed', refreshCounts)
      window.removeEventListener('online', refreshCounts)
      window.removeEventListener('offline', refreshCounts)
    }
  }, [])

  async function handleSyncNow() {
    setBusy(true)
    setStatus(null)
    try {
      const result = await syncPendingQueue(user)
      setPendingCount(getPendingSyncCount())
      setFailedCount(getFailedSyncCount())
      setLastSyncAt(getLastOfflineSyncAt())
      if (result.skippedReason) {
        setStatus({ tone: 'info', text: result.skippedReason })
      } else if (result.failed > 0) {
        setStatus({ tone: 'warn', text: 'Some changes could not sync.' })
      } else {
        setStatus({
          tone: 'success',
          text: `${result.synced} offline changes synced.`,
        })
      }
    } catch {
      setStatus({ tone: 'warn', text: 'Some changes could not sync.' })
    } finally {
      setBusy(false)
    }
  }

  function handleClearFailed() {
    const ok = window.confirm(
      'Clearing failed sync items may lose unsynced cloud changes. Export backup first.',
    )
    if (!ok) {
      return
    }
    clearFailedSyncItems()
    setPendingCount(getPendingSyncCount())
    setFailedCount(getFailedSyncCount())
    setStatus({ tone: 'info', text: 'Failed sync items cleared.' })
  }

  return (
    <article className="dashboard-card settings-panel offline-sync-panel">
      <div className="card-heading">
        <div>
          <p className="eyebrow">Offline &amp; Sync</p>
          <h2>Offline storage and pending changes</h2>
        </div>
        {isOnline ? (
          <Wifi size={22} strokeWidth={2.4} aria-hidden="true" />
        ) : (
          <WifiOff size={22} strokeWidth={2.4} aria-hidden="true" />
        )}
      </div>

      <div className="cloud-status-grid">
        <div>
          <span>Status</span>
          <strong>{isOnline ? 'Online' : 'Offline'}</strong>
        </div>
        <div>
          <span>Mode</span>
          <strong>{cloudActive ? 'Cloud Sync On' : 'Local Mode'}</strong>
        </div>
        <div>
          <span>Pending sync items</span>
          <strong>{pendingCount}</strong>
        </div>
        <div>
          <span>Failed sync items</span>
          <strong>{failedCount}</strong>
        </div>
        <div>
          <span>Last sync</span>
          <strong>{formatSyncTime(lastSyncAt)}</strong>
        </div>
      </div>

      <div className="cloud-warning" role="status">
        {cloudActive ? (
          <Cloud size={18} strokeWidth={2.4} aria-hidden="true" />
        ) : (
          <CloudOff size={18} strokeWidth={2.4} aria-hidden="true" />
        )}
        {cloudActive
          ? 'Offline changes are stored here first, then synced to Supabase when possible.'
          : 'Cloud sync is inactive. The app will keep using local browser storage.'}
      </div>

      {status ? (
        <div className={`cloud-message cloud-message--${status.tone}`} role="status">
          {status.tone === 'success' ? (
            <CheckCircle2 size={17} strokeWidth={2.4} aria-hidden="true" />
          ) : (
            <AlertTriangle size={17} strokeWidth={2.4} aria-hidden="true" />
          )}
          {status.text}
        </div>
      ) : null}

      <div className="cloud-actions">
        <button
          className="workout-primary-button"
          disabled={busy || !isOnline || !cloudActive || pendingCount === 0}
          onClick={handleSyncNow}
          type="button"
        >
          <RefreshCw size={18} strokeWidth={2.4} aria-hidden="true" />
          {busy ? 'Syncing...' : 'Sync Now'}
        </button>
        <button
          className="workout-secondary-button workout-secondary-button--danger"
          disabled={busy || failedCount === 0}
          onClick={handleClearFailed}
          type="button"
        >
          <Trash2 size={18} strokeWidth={2.4} aria-hidden="true" />
          Clear Failed Sync Items
        </button>
        <InstallPWAButton />
      </div>
    </article>
  )
}
