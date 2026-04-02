import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Animation library
          'vendor-framer': ['framer-motion'],
          // State management
          'vendor-state': ['zustand'],
          // Admin panel (rarely visited by regular users)
          'chunk-admin': [
            './src/components/Admin/ArmyManager.jsx',
            './src/components/Admin/GuideManager.jsx',
            './src/components/Admin/ReportManager.jsx',
            './src/components/Admin/LoreManager.jsx',
            './src/components/Admin/NewsManager.jsx',
            './src/components/Admin/UserManager.jsx',
            './src/components/Admin/MarketplaceManager.jsx',
            './src/components/Admin/PaintManager.jsx',
            './src/components/Admin/NewRecruitManager.jsx',
            './src/pages/admin/AdminDashboard.jsx',
          ],
          // Army builder (heavy, lazy-loaded)
          'chunk-builder': [
            './src/pages/ArmyBuilderPage.jsx',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
