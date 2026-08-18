import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  envDir: '/private/tmp/claude-501/-Users-merojiddin-Desktop-Workout-/6385450a-6eae-472a-b1cb-d16e4c5504a3/scratchpad/emptyenv',
  plugins: [react()],
  server: { port: 5199, strictPort: true },
})
