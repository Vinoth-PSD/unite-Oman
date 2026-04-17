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
      '/api': { target: 'https://api.uniteoman.com/', changeOrigin: true },
      '/uploads': { target: 'https://api.uniteoman.com/', changeOrigin: true }
    }
  }

})
