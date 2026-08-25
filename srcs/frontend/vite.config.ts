import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],

  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/auth': { target: process.env.BACKEND_URL ?? 'http://localhost:3001' },
      '/games': { target: process.env.BACKEND_URL ?? 'http://localhost:3001', ws: true },
      '/socket.io': { target: process.env.BACKEND_URL ?? 'http://localhost:3001', ws: true },
      '/users': { target: process.env.BACKEND_URL ?? 'http://localhost:3001' },
    },
  }
})