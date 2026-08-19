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
          {
            // Exercise animations get their own bucket ahead of the generic
            // image rule: there are 136 of them, so they would otherwise
            // evict (and be evicted by) everything else in "static-assets".
            // They are deliberately NOT precached - that would push ~47MB
            // onto every install - so they cache on first view instead.
            //
            // The clips are Planfit MP4s on CloudFront, which sends no
            // Access-Control-Allow-Origin, so these come back *opaque* and
            // only cache with statuses [0, 200]. Browsers pad opaque entries
            // for quota accounting, which is why maxEntries is well under the
            // full 136: a program is typically 20-40 distinct exercises, so
            // 50 covers a whole routine at ~18MB of real bytes and lets LRU
            // drop the rest. Opaque bodies also cannot be sliced, so
            // rangeRequests is not usable here (iOS re-fetches on a Range
            // miss rather than breaking).
            //
            // The cache name is carried over from the retired bundled-GIF
            // rule on purpose: existing installs still hold up to 140 dead
            // /exercise-gifs/ entries, and reusing the name lets this lower
            // maxEntries trim them as LRU instead of orphaning ~13MB.
            urlPattern: ({ url }) =>
              url.href.startsWith(
                'https://d2m0n84d5tgmh1.cloudfront.net/training-videos-watermarked/',
              ),
            handler: 'CacheFirst',
            options: {
              cacheName: 'exercise-animations',
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 90,
              },
            },
          },
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
