import { useEffect, useState } from 'react'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => getNavigatorOnline())

  useEffect(() => {
    function updateOnlineStatus() {
      setIsOnline(getNavigatorOnline())
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    updateOnlineStatus()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  return { isOnline }
}

function getNavigatorOnline() {
  if (typeof window === 'undefined' || typeof window.navigator === 'undefined') {
    return true
  }
  return window.navigator.onLine
}
