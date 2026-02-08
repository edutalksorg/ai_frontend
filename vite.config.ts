import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_BASE_URL || 'https://edutalks-backend.lemonfield-c795bfef.centralindia.azurecontainerapps.io';

  return {
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
      port: parseInt(env.VITE_PORT || '3000'),
      host: true,
      strictPort: true,
      proxy: {
        '/api': {
          target: target,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
        },
        '/hubs': {
          target: target,
          changeOrigin: true,
          ws: true
        }
      }
    }
  }
})
