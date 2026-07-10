import { useEffect, useRef, useState } from 'react'
import { syncPendingQueue } from '../services/syncService'
import { getPendingSyncCount } from '../utils/offlineSyncQueue'
import { useOnlineStatus } from './useOnlineStatus'

export function useAutoSync(user, options = {}) {
  const { isOnline } = useOnlineStatus()
  const onSynced = options.onSynced
  const userId = user?.id ?? ''
  const wasOnline = useRef(isOnline)
  const attemptedInitialSync = useRef(false)
  const [syncMessage, setSyncMessage] = useState(null)
  const [syncTone, setSyncTone] = useState('info')
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    attemptedInitialSync.current = false
  }, [userId])

  useEffect(() => {
    const cameBackOnline = !wasOnline.current && isOnline
    const shouldTryInitialSync =
      !attemptedInitialSync.current &&
      isOnline &&
      user &&
      getPendingSyncCount() > 0

    if (shouldTryInitialSync) {
      attemptedInitialSync.current = true
    }

    wasOnline.current = isOnline

    if ((!cameBackOnline && !shouldTryInitialSync) || !user) {
      return
    }

    let active = true
    setIsSyncing(true)
    syncPendingQueue(user)
      .then((result) => {
        if (!active) {
          return
        }
        if (result.synced > 0 && result.failed === 0) {
          setSyncTone('success')
          setSyncMessage(`${result.synced} offline changes synced.`)
        } else if (result.failed > 0) {
          setSyncTone('warn')
          setSyncMessage('Some changes could not sync.')
        }
        if (result.synced > 0 && typeof onSynced === 'function') {
          onSynced(result)
        }
      })
      .catch(() => {
        if (active) {
          setSyncTone('warn')
          setSyncMessage('Some changes could not sync.')
        }
      })
      .finally(() => {
        if (active) {
          setIsSyncing(false)
        }
      })

    return () => {
      active = false
    }
  }, [isOnline, onSynced, user])

  useEffect(() => {
    if (!syncMessage) {
      return undefined
    }
    const timer = window.setTimeout(() => setSyncMessage(null), 4200)
    return () => window.clearTimeout(timer)
  }, [syncMessage])

  return {
    isOnline,
    isSyncing,
    pendingCount: getPendingSyncCount(),
    syncMessage,
    syncTone,
  }
}
