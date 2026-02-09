import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env vars regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_BASE_URL || 'http://localhost:5000';

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
      port: 3000,
      host: true,
      strictPort: true,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
        },
        '/hubs': {
          target: apiTarget,
          changeOrigin: true,
          ws: true
        }
      }
    }
  };
})

