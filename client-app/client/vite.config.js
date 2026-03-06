import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isCapacitor = process.env.CAPACITOR_BUILD === 'true'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative paths for Capacitor Android, absolute for web (Vercel)
  base: isCapacitor ? './' : '/',
  build: {
    outDir: 'dist',
    // Produce relative asset paths for Android WebView
    assetsDir: 'assets',
    // Performance optimizations
    minify: 'esbuild', // Use default esbuild (faster, no extra dependency)
    esbuild: {
      drop: ['console', 'debugger'],
    },
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'framer-motion': ['framer-motion'],
          'lucide': ['lucide-react'],
          // Large pages
          'dost': ['./src/pages/DostMode.jsx'],
          'blend': ['./src/pages/MithraBlend.jsx'],
          'calendar': ['./src/pages/Calendar.jsx'],
        },
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'lucide-react'],
  },
})
