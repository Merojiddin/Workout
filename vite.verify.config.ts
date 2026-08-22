import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
// Local-mode verification server. The PWA plugin is present but disabled: no
// service worker is wanted here, and src/main.tsx imports virtual:pwa-register,
// which only exists while this plugin is loaded.
export default defineConfig({
  envDir: '/private/tmp/claude-501/-Users-merojiddin-Desktop-Workout-/21e7450a-9d3d-4a07-a54d-e79a230b6978/scratchpad/emptyenv',
  plugins: [react(), VitePWA({ disable: true })],
  server: { port: 5199, strictPort: true },
})
