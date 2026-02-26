import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Para Electron
  server: {
    port: 5173,
    host: true,
    proxy: {  // ← AGREGAR ESTO
      '/api': {
        target: 'http://localhost:4000',  // Tu backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
