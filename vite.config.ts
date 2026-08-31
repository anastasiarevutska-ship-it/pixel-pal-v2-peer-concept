import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Vite doesn't read process.env.PORT on its own — honor it explicitly
    // so the dev-server harness's assigned port (autoPort) actually gets
    // used instead of Vite silently falling back to its own 5173→5174→…
    // conflict scan.
    port: Number(process.env.PORT) || 5173,
  },
})
