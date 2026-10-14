import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3-') || id.includes('react-is')) return 'vendor-recharts';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('react-dom') || id.includes('react-router')) return 'vendor-react';
            if (id.includes('react-redux') || id.includes('@reduxjs')) return 'vendor-redux';
            if (id.includes('@tanstack') || id.includes('axios')) return 'vendor-query';
            if (id.includes('react-hook-form')) return 'vendor-forms';
            if (id.includes('react-icons')) return 'vendor-icons';
            if (id.includes('leaflet') || id.includes('react-leaflet')) return 'vendor-maps';
            if (id.includes('socket.io-client')) return 'vendor-socket';
            if (id.includes('date-fns')) return 'vendor-date';
            return 'vendor';
          }
        },
      },
    },
  },
});
