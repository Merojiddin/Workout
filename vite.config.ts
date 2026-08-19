import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      injectRegister: 'auto',
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
          // the browser loads the clip itself, with normal Range support. The
          // clips still cache in the HTTP cache (no Cache-Control, but a 2023
          // Last-Modified gives them long heuristic freshness). The cost is
          // that animations no longer replay fully offline; the still
          // thumbnails below do, and they are what offline falls back to.
          //
          // Caching these properly again needs same-origin bytes: bundled
          // files under /exercise-gifs/, or a proxy that adds CORS.
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
