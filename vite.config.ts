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
            // image rule: there are ~111 of them, so they would otherwise
            // evict (and be evicted by) everything else in "static-assets".
            // They are deliberately NOT precached - that would push ~11MB
            // onto every install - so they cache on first view instead.
            urlPattern: ({ url }) => url.pathname.startsWith('/exercise-gifs/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'exercise-animations',
              expiration: {
                maxEntries: 140,
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
