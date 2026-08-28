import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Three.js lives in a lazy-loaded viewer chunk; the initial UI stays small.
    chunkSizeWarningLimit: 600,
  },
})
