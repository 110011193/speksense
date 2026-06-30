import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cleanUrlsPlugin } from './vite.cleanUrls';

export default defineConfig({
  plugins: [react(), cleanUrlsPlugin()],
  server: {
    proxy: {
      // Dev: forward API calls to the .NET backend (avoids CORS).
      '/api': { target: 'http://localhost:5179', changeOrigin: true },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        signup: resolve(__dirname, 'signup.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        people: resolve(__dirname, 'people.html'),
        calendar: resolve(__dirname, 'calendar.html'),
      },
    },
  },
});
