import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  server: {
    host: true,
    allowedHosts: ['uniteoman.com'],
    proxy: {
      '/api': { target: 'http://72.61.229.172:8090', changeOrigin: true },
      '/uploads': { target: 'http://72.61.229.172:8090', changeOrigin: true }
    }
  }

})
