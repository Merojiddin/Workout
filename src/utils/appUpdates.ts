import { registerSW } from 'virtual:pwa-register'
import { ACTIVE_WORKOUT_SESSION_KEY, safeHasStorageKey } from './storageUtils'

/**
 * Getting a new deploy onto a device that already has the app.
 *
 * The service worker is built with skipWaiting and clientsClaim, so a new
 * build takes control as soon as it installs. On its own that changes nothing
 * a person can see: the page keeps running the JavaScript it booted with, and
 * an installed PWA is *resumed* rather than navigated, so the old build can
 * stay on screen for days - long enough that reinstalling the app or opening
 * the site in a private window looks like the only way to get an update.
 *
 * Two things are needed, and both live here:
 *
 * - ask the browser to look for a new service worker whenever the app comes
 *   back to the foreground. A resume is not a navigation, so nothing else
 *   triggers that check inside an installed PWA.
 * - reload the page once the new worker has actually activated, because that
 *   is the only moment the new HTML, JS and CSS can reach the screen.
 */

/** Foreground checks are throttled to this, so app-switching stays cheap. */
const UPDATE_CHECK_THROTTLE_MS = 60 * 1000
/** A session left open for hours still picks up a deploy without a resume. */
const UPDATE_CHECK_INTERVAL_MS = 15 * 60 * 1000
/**
 * A build that cannot finish precaching could install, activate, and be
 * replaced again on the next load - a reload loop that shows nothing but a
 * white screen. Allowing one update reload per window is plenty for a real
 * deploy and turns that loop back into a merely stale page.
 */
const RELOAD_GUARD_KEY = 'appUpdateReloadedAt'
const RELOAD_GUARD_WINDOW_MS = 30 * 1000

let updateReady = false
let lastCheckedAt = 0

/** Registers the service worker and keeps this device on the latest deploy. */
export function registerAppUpdates(): void {
  registerSW({
    immediate: true,
    // Replaces the plugin's own unconditional reload, which would fire in the
    // middle of a logged set.
    onNeedReload: () => {
      updateReady = true
      applyUpdateWhenSafe()
    },
    onRegisteredSW: (_swScriptUrl, registration) => {
      if (!registration) {
        return
      }

      window.setInterval(() => {
        void checkForUpdate(registration)
      }, UPDATE_CHECK_INTERVAL_MS)

      // Coming back from the background is the moment that matters: it is how
      // an installed PWA is opened, and the only chance to notice a deploy
      // that happened while the app was closed.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          void checkForUpdate(registration)
        }
      })
      window.addEventListener('online', () => {
        void checkForUpdate(registration)
      })
    },
  })

  document.addEventListener('visibilitychange', applyUpdateWhenSafe)
}

async function checkForUpdate(
  registration: ServiceWorkerRegistration,
): Promise<void> {
  const now = Date.now()
  if (now - lastCheckedAt < UPDATE_CHECK_THROTTLE_MS) {
    return
  }
  lastCheckedAt = now

  try {
    await registration.update()
  } catch {
    // Offline, or the check was rate-limited by the browser. The next resume
    // tries again, and an app running its previous build is not an error
    // worth surfacing.
  }
}

/**
 * Reloads into the new build at a moment that costs nothing.
 *
 * Mid-workout is the one time a reload is worse than staying a version
 * behind: the set being typed is on screen. The live session is written to
 * storage as it goes, so nothing is lost either way, but the update waits for
 * the app to be put down rather than interrupting a lift.
 */
function applyUpdateWhenSafe(): void {
  if (!updateReady) {
    return
  }
  if (document.visibilityState === 'visible' && isWorkoutInProgress()) {
    return
  }

  updateReady = false
  reloadForUpdate()
}

function isWorkoutInProgress(): boolean {
  return safeHasStorageKey(ACTIVE_WORKOUT_SESSION_KEY)
}

function reloadForUpdate(): void {
  try {
    const previous = Number(
      window.sessionStorage.getItem(RELOAD_GUARD_KEY) ?? '0',
    )
    if (
      Number.isFinite(previous) &&
      Date.now() - previous < RELOAD_GUARD_WINDOW_MS
    ) {
      return
    }
    window.sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()))
  } catch {
    // Session storage can be unavailable (private mode, denied quota). The
    // guard is a safety net; the reload is the point.
  }

  window.location.reload()
}

/**
 * The Reload button in the top bar.
 *
 * Everything above happens on its own schedule; this is the escape hatch for
 * when someone knows a new version exists and does not want to wait for a
 * resume, a 15-minute tick, or the end of their workout. A plain
 * `location.reload()` is not enough on its own: it re-runs the page against
 * whatever service worker is currently in control, so a device holding the
 * previous build would reload straight back into it. So this asks for the
 * check first, gives the new worker a moment to install and take over, and
 * only then reloads - at which point the fresh HTML, JS and CSS are what the
 * page is served.
 *
 * The reload happens whether or not a new build was found. Someone pressing
 * Reload expects the app to reload; "you are already up to date" is not worth
 * a dialog, and a reload with no update is harmless.
 */

/**
 * How long to wait for a newly found worker to take control. Past this the
 * page reloads anyway - a slow install is not a reason to leave someone
 * looking at a button that did nothing, and the next check will finish the
 * job.
 */
const ACTIVATION_TIMEOUT_MS = 8 * 1000

export async function reloadWithLatestBuild(): Promise<void> {
  try {
    await pullLatestServiceWorker()
  } catch {
    // Offline, no service worker, or a check the browser rate-limited. The
    // reload still runs: it is what was asked for, and without a new worker
    // it simply restarts the build already installed.
  }

  // The automatic path throttles itself against reload loops. This one is a
  // deliberate press, so it clears that guard rather than being blocked by a
  // reload that happened seconds ago.
  try {
    window.sessionStorage.removeItem(RELOAD_GUARD_KEY)
  } catch {
    // Session storage can be unavailable; the reload does not depend on it.
  }

  window.location.reload()
}

/** Checks for a new service worker and waits for it to take control. */
async function pullLatestServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return
  }

  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) {
    return
  }

  // Bypasses the throttle the background checks use: a press means now.
  lastCheckedAt = Date.now()
  await registration.update()

  const pending = registration.installing ?? registration.waiting
  if (!pending) {
    return
  }

  await waitForControl(pending)
}

/**
 * Resolves once the given worker is running the page, or once the timeout
 * passes. `controllerchange` is the event that matters: skipWaiting and
 * clientsClaim mean an installed worker claims this page, and only then does
 * a reload get the new build.
 */
function waitForControl(worker: ServiceWorker): Promise<void> {
  return new Promise((resolve) => {
    let settled = false

    const finish = () => {
      if (settled) {
        return
      }
      settled = true
      window.clearTimeout(timer)
      worker.removeEventListener('statechange', onStateChange)
      navigator.serviceWorker.removeEventListener('controllerchange', finish)
      resolve()
    }

    const onStateChange = () => {
      // "redundant" means the install failed - waiting longer will not help.
      if (worker.state === 'activated' || worker.state === 'redundant') {
        finish()
      }
    }

    const timer = window.setTimeout(finish, ACTIVATION_TIMEOUT_MS)
    worker.addEventListener('statechange', onStateChange)
    navigator.serviceWorker.addEventListener('controllerchange', finish)
    onStateChange()
  })
}
