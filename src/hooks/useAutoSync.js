import { t } from '../i18n/t'
import { useEffect, useState } from 'react'
import { syncPendingQueue } from '../services/syncService'
import { getPendingSyncCount } from '../utils/offlineSyncQueue'
import { useOnlineStatus } from './useOnlineStatus'

export function useAutoSync(user, options = {}) {
  const { isOnline } = useOnlineStatus()
  const onSynced = options.onSynced
  const userId = user?.id ?? ''
  const [syncMessage, setSyncMessage] = useState(null)
  const [syncTone, setSyncTone] = useState('info')
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingCount, setPendingCount] = useState(() => getPendingSyncCount())

  useEffect(() => {
    let active = true
    let running = false
    let timer
    setPendingCount(getPendingSyncCount())
    setIsSyncing(false)

    async function run() {
      if (!active || running || !isOnline || !user || getPendingSyncCount() === 0) return
      running = true
      setIsSyncing(true)
      try {
        const result = await syncPendingQueue(user)
        if (!active) return
        const ordinaryChanges = result.synced - (result.selectionSynced ?? 0)
        if (ordinaryChanges > 0 && result.failed === 0) {
          setSyncTone('success')
          setSyncMessage(`${ordinaryChanges} offline changes synced.`)
        } else if (result.failed > 0) {
          setSyncTone('warn')
          setSyncMessage(t('sync.someFailed'))
        }
        // Selecting a plan already refreshed its preview locally. Remounting
        // pages after its upload could interrupt a workout started meanwhile.
        if (ordinaryChanges > 0 && typeof onSynced === 'function') onSynced(result)
      } catch {
        if (active) {
          setSyncTone('warn')
          setSyncMessage(t('sync.someFailed'))
        }
      } finally {
        running = false
        if (active) {
          setIsSyncing(false)
          setPendingCount(getPendingSyncCount())
        }
      }
    }

    function schedule() {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => void run(), 120)
    }

    function onQueueChanged(event) {
      setPendingCount(getPendingSyncCount())
      // Retry only on a new change or reconnect, not on the worker's own
      // failure updates/removals, which would create a retry loop.
      if (event.detail?.enqueue) schedule()
    }

    window.addEventListener('offline-sync-queue-changed', onQueueChanged)
    schedule()
    return () => {
      active = false
      window.clearTimeout(timer)
      window.removeEventListener('offline-sync-queue-changed', onQueueChanged)
    }
  }, [isOnline, onSynced, user, userId])

  useEffect(() => {
    if (!syncMessage) return undefined
    const timer = window.setTimeout(() => setSyncMessage(null), 4200)
    return () => window.clearTimeout(timer)
  }, [syncMessage])

  return { isOnline, isSyncing, pendingCount, syncMessage, syncTone }
}
