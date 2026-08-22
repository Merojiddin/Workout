import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Registered by src/utils/appUpdates.ts instead of the script this
      // plugin would otherwise inject. That script only calls register(): it
      // never reloads the page, so a new build would take control in the
      // background while the screen kept showing the old one until the app
      // happened to be launched again - which an installed PWA, being
      // resumed rather than navigated, may not do for days.
      injectRegister: null,
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'icons.svg',
        'pwa-icon.svg',
        'pwa-icon-192.png',
        'pwa-icon-512.png',
        'pwa-maskable-512.png',
      ],
      manifest: {
        name: 'Fitness Tracker',
        short_name: 'Fitness Tracker',
        description:
          'Personal workout, body progress, nutrition, and smart coach tracker.',
        theme_color: '#0f172a',
        background_color: '#020617',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'portrait',
        icons: [
          {
            src: '/pwa-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        // Stated rather than inferred from registerType, because the update
        // path in appUpdates.ts depends on both: skipWaiting so a new build
        // never sits in "waiting" behind a tab that is never closed, and
        // clientsClaim so the reload that follows is served by it.
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkOnly',
            options: {
              cacheName: 'supabase-network-only',
            },
          },
          // NOTE: the Planfit MP4s under
          // https://d2m0n84d5tgmh1.cloudfront.net/training-videos-watermarked/
          // deliberately have NO runtime caching rule, and must not get one.
          //
          // CloudFront sends no Access-Control-Allow-Origin for them, and a
          // <video> fetches media no-cors, so anything the service worker
          // returns for these is necessarily an *opaque* response. WebKit
          // (iOS Safari, and therefore the installed PWA) rejects an opaque
          // response for a media element outright: the video fires
          // MEDIA_ERR_SRC_NOT_SUPPORTED, LiveExerciseImage's onError falls
          // back to the still, and the movement shows as a frozen thumbnail.
          // That happens on the very first play, not just on a cache hit, so
          // no handler choice fixes it - NetworkOnly still respondWith()s an
          // opaque response. Chromium tolerates this; WebKit does not.
          //
          // Leaving the request unrouted means no fetch handler claims it and
          // the browser loads the clip itself, with normal Range support.
          //
          // This does NOT cost offline playback. The clips land in the plain
          // HTTP cache, and although CloudFront sends no Cache-Control, a
          // 2023 Last-Modified gives them years of heuristic freshness - so
          // an already-watched clip is served with no network request at all.
          // Verified offline in both WebKit and Chromium: the animation keeps
          // playing after the network is cut and the app is relaunched.
          //
          // The difference from Cache Storage is durability, not reach: the
          // HTTP cache is evictable under disk pressure and is not covered by
          // the expiration policy below. A clip that was never watched was
          // never cached either way - the retired rule was cache-on-first-view
          // too - so offline behaviour is best-effort in both designs.
          {
            // Planfit still thumbnails: ~19KB each, 2.5MB for all 136, so the
            // whole set fits. Kept out of "static-assets" so they cannot
            // evict the app's own JS/CSS through that rule's 80-entry cap.
            urlPattern: ({ url }) =>
              url.href.startsWith(
                'https://d2m0n84d5tgmh1.cloudfront.net/training-image/',
              ),
            handler: 'CacheFirst',
            options: {
              cacheName: 'exercise-thumbnails',
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxEntries: 180,
                maxAgeSeconds: 60 * 60 * 24 * 90,
              },
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'style' ||
              request.destination === 'script' ||
              request.destination === 'image' ||
              request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5174,
    strictPort: true,
  },
})
