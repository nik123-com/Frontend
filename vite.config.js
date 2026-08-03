import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'vendor-charts';
            }
            if (id.includes('sweetalert2') || id.includes('react-toastify') || id.includes('react-spinners')) {
              return 'vendor-ui';
            }
            if (id.includes('react') || id.includes('redux')) {
              return 'vendor-framework';
            }
          }
        }
      }
    }
  }
})


