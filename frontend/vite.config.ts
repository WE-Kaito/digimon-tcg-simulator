import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

let backendUrl = 'localhost:8080';
if (process.env.BACKEND_URL) {
  backendUrl = process.env.BACKEND_URL;
}

let websocketUrl = "wss://www.digi-tcg.online/";
if (process.env.NODE_ENV === "development") {
  websocketUrl = `ws://localhost:8080/`;
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __WEBSOCKET_URL__: JSON.stringify(websocketUrl),
  },
  server: {
    proxy: {
      '/api': `http://${backendUrl}`,
    },
  },
})