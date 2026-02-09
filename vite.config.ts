import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-static-web-app-config',
      closeBundle() {
        try {
          copyFileSync(
            resolve(__dirname, 'staticwebapp.config.json'),
            resolve(__dirname, 'dist/staticwebapp.config.json')
          )
          console.log('✅ Copied staticwebapp.config.json to dist/')
        } catch (err) {
          console.warn('⚠️ Could not copy staticwebapp.config.json:', err)
        }
      }
    }
  ],
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://edutalks-backend.lemonfield-c795bfef.centralindia.azurecontainerapps.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
      },
      '/hubs': {
        target: 'https://edutalks-backend.lemonfield-c795bfef.centralindia.azurecontainerapps.io',
        changeOrigin: true,
        ws: true
      }
    }
  }
})
