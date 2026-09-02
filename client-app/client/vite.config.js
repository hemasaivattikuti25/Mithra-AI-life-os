import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isCapacitor = process.env.CAPACITOR_BUILD === 'true'
const isProd = process.env.NODE_ENV === 'production'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative paths for Capacitor Android, absolute for web (Vercel)
  base: isCapacitor ? './' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
    esbuild: {
      // Only strip console/debugger in production builds
      drop: isProd ? ['console', 'debugger'] : [],
    },
    rollupOptions: {
      // @sentry/react is optional — if not installed, skip gracefully
      external: (id) => id === '@sentry/react',
      output: {
        // Externalized modules resolve to undefined at runtime
        globals: { '@sentry/react': 'Sentry' },
        manualChunks: {
          // Vendor chunks (stable, long cache TTL)
          'react-vendor':  ['react', 'react-dom', 'react-router-dom'],
          'framer-motion': ['framer-motion'],
          'lucide':        ['lucide-react'],
          // Heavy page chunks
          'dost':          ['./src/pages/DostMode.jsx'],
          'calendar':      ['./src/pages/Calendar.jsx'],
          'habits':        ['./src/pages/HabitFocusHub.jsx'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'lucide-react'],
  },
})
