import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  envDir: '/private/tmp/claude-501/-Users-merojiddin-Desktop-Workout-/8f46c6ae-18ba-4706-adf6-a7699fc7825b/scratchpad/emptyenv',
  plugins: [react()],
  server: { port: 5199, strictPort: true },
})
