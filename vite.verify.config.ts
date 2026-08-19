import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  envDir: '/private/tmp/claude-501/-Users-merojiddin-Desktop-Workout-/e25805c2-98a6-4bb5-b5e0-cbfcd25b373a/scratchpad/emptyenv',
  plugins: [react()],
  server: { port: 5199, strictPort: true },
})
