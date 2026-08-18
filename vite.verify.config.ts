import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  envDir: '/private/tmp/claude-501/-Users-merojiddin-Desktop-Workout-/645ecb62-cb40-4946-8f44-5455b07a0e73/scratchpad/emptyenv',
  plugins: [react()],
  server: { port: 5199, strictPort: true },
})
