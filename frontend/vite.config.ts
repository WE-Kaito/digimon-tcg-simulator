import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

let backendUrl = 'http://localhost:8080';
if (process.env.BACKEND_URL) {
  backendUrl = process.env.BACKEND_URL;
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': backendUrl,
    },
  },
})