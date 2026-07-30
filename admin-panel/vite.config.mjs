import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3033
  },
  preview: {
    host: true,
    port: 3033
  },
  build: {
    chunkSizeWarningLimit: 1500
  }
});