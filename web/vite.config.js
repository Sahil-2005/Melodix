import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss()
  ],
  server: {
    proxy: {
      // Proxy Jamendo API requests to bypass CORS
      '/api/jamendo': {
        target: 'https://api.jamendo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jamendo/, ''),
        secure: true,
      },
    },
  },
});