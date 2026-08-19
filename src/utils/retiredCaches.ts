/**
 * Runtime caches that older service workers filled and the current one no
 * longer reads. Nothing removes these automatically: workbox's
 * cleanupOutdatedCaches only prunes old *precaches*, and a runtime cache whose
 * route is gone is simply orphaned.
 *
 * "exercise-animations" held the bundled /exercise-gifs/ GIFs, and later the
 * Planfit MP4s. The MP4 rule was removed because CloudFront serves those
 * without CORS, so the cached copies are opaque and WebKit refuses to play
 * them (see the note in vite.config.ts). The entries are dead weight now, and
 * opaque responses are padded for quota accounting, so they can cost far more
 * storage than their real byte size.
 */
const retiredCacheNames = ['exercise-animations']

/** Drop retired runtime caches. Safe to call on every startup. */
export function deleteRetiredCaches(): void {
  if (typeof caches === 'undefined') {
    return
  }

  for (const name of retiredCacheNames) {
    void caches.delete(name).catch(() => {
      // Storage may be unavailable (private mode, denied quota). The stale
      // entries are inert either way, so a failure needs no handling.
    })
  }
}
