import { useEffect } from 'react'

/**
 * Holds the screen awake while a guided workout is running.
 *
 * A follow-along session is watched rather than touched: without this the
 * phone dims and locks part-way through a plank, and you lose both the
 * demonstration and the countdown. The lock is dropped as soon as the workout
 * is paused, finished or left.
 *
 * Entirely best-effort. Where the Screen Wake Lock API is missing (older
 * WebKit, Firefox) this does nothing at all, and the timer still runs off the
 * wall clock, so a screen that sleeps anyway comes back at the right second.
 */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || typeof navigator === 'undefined') {
      return undefined
    }

    const lockApi = (
      navigator as Navigator & {
        wakeLock?: {
          request: (type: 'screen') => Promise<WakeLockSentinel>
        }
      }
    ).wakeLock

    if (!lockApi) {
      return undefined
    }

    let released = false
    let sentinel: WakeLockSentinel | null = null

    const request = () => {
      if (released || document.hidden) {
        return
      }

      lockApi
        .request('screen')
        .then((lock) => {
          if (released) {
            void lock.release().catch(() => undefined)
            return
          }
          sentinel = lock
        })
        .catch(() => {
          // Denied (battery saver, an unfocused tab) - nothing to recover.
        })
    }

    // The browser drops the lock whenever the page is hidden, so it has to be
    // taken again on the way back rather than assumed to have survived.
    const reacquire = () => {
      if (!document.hidden && !sentinel) {
        request()
      }
    }

    request()
    document.addEventListener('visibilitychange', reacquire)

    return () => {
      released = true
      document.removeEventListener('visibilitychange', reacquire)
      if (sentinel) {
        void sentinel.release().catch(() => undefined)
        sentinel = null
      }
    }
  }, [active])
}
