import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/tourism-guide-app/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  optimizeDeps: {
    include: ['leaflet', 'leaflet.locatecontrol'],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
      external: [
        'leaflet.locatecontrol/dist/L.Control.Locate.min.css'
      ]
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
}) 