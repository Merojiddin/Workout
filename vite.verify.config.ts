import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  envDir: '/private/tmp/claude-501/-Users-merojiddin-Desktop-Workout-/782b4d02-0d87-46fa-9509-e10061775e91/scratchpad/emptyenv',
  plugins: [react()],
  server: { port: 5199, strictPort: true },
})
