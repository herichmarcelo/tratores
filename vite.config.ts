import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const cryptoShim = path.resolve(__dirname, 'src/shims/crypto.ts')

/** Rotas SPA precacheadas para uso offline */
const OFFLINE_ROUTES = ['/', '/abastecimento', '/abastecimentos', '/checklists', '/tratores', '/offline']

export default defineConfig({
  resolve: {
    alias: {
      crypto: cryptoShim,
      'node:crypto': cryptoShim,
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: [
        'favicon.svg',
        'icon-192.png',
        'icon-512.png',
        'ff-black.png',
        'ff-white.png',
        'manifest.json',
      ],
      manifest: {
        name: 'Franco Forte - Gestão de Frotas',
        short_name: 'Franco Forte',
        description: 'Sistema de gestão de frotas agrícolas',
        theme_color: '#facc15',
        background_color: '#0A0A0A',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'pt-BR',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest,json}'],
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: OFFLINE_ROUTES.map(
          (route) => new RegExp(`^${route.replace('/', '\\/')}`),
        ),
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallbackDenylist: [
          /^https?:\/\/.*supabase\.co/i,
          /^https?:\/\/api\.cloudinary\.com/i,
        ],
        runtimeCaching: [
          {
            urlPattern: /\.(?:js|css|png|svg|woff2|webmanifest)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24,
              },
              networkTimeoutSeconds: 8,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rpc\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-rpc-cache',
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  server: {
    // @ts-ignore: historyApiFallback is valid for dev server
    historyApiFallback: true,
  },
  preview: {
    // @ts-ignore: historyApiFallback is valid for preview server
    historyApiFallback: true,
  },
})
