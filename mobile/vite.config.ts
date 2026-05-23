import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'RYB Mobile',
        short_name: 'RYB',
        description: 'Are You Broke? — Mobile Audit',
        theme_color: '#16a34a',
        background_color: '#111827',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  server: { port: 5174, host: true },
  resolve: { conditions: ['import', 'browser', 'default'] },
});
