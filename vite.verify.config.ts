import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  envDir: '/private/tmp/claude-501/-Users-merojiddin-Desktop-Workout-/90267949-e91a-456f-a054-310dea4c3d8c/scratchpad/authenv',
  plugins: [react()],
  server: { port: 5199, strictPort: true },
})
