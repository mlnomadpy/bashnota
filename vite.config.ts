import { fileURLToPath, URL } from 'node:url'
import { copyFile, readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'
import { isSameOriginDeferredAssetRequest } from './src/pwa/deferredAssetPolicy'

/**
 * GitHub Pages only serves files and otherwise responds with `404.html`. Keep a
 * copy of Vite's generated shell at that path so history-mode Vue routes can
 * boot directly without rewriting the visitor's URL.
 */
function githubPagesSpaFallback() {
  return {
    name: 'github-pages-spa-fallback',
    async writeBundle(outputOptions: { dir?: string }) {
      const outputDirectory = outputOptions.dir ?? 'dist'
      await copyFile(join(outputDirectory, 'index.html'), join(outputDirectory, '404.html'))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/bashnota/',
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()],
    },
  },
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    githubPagesSpaFallback(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'BashNota',
        short_name: 'BashNota',
        description: 'Offline-first notebook with Jupyter integration',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        // Feature payloads are deliberately absent from the install-time
        // precache. Cache them only after the user opens the editor/reader (or
        // selects WebLLM), which preserves repeat/offline use without making a
        // Home/Login/Public visit download several megabytes in the background.
        globIgnores: [
          '**/webllm-*.js',
          '**/editor-*.js',
          '**/d3-chart-*.js',
          '**/katex-*.js',
          '**/vue-flow-*.js',
          '**/heavy-style-*.css',
          '**/EditorAppShell-*.css',
          '**/KaTeX_*.*',
        ],
        // Vite can combine editor/package CSS into a hash-only `index-*.css`
        // asset. Preserve only stylesheets referenced by the HTML shell in the
        // install manifest; every lazy-route stylesheet is runtime cached.
        manifestTransforms: [async (entries) => {
          const shell = await readFile(join(process.cwd(), 'dist', 'index.html'), 'utf8')
          const shellStyles = new Set(
            [...shell.matchAll(/href=["']\/bashnota\/(assets\/[^"']+\.css)["']/g)]
              .map((match) => match[1]),
          )
          return {
            manifest: entries.filter((entry) => !entry.url.endsWith('.css') || shellStyles.has(entry.url)),
            warnings: [],
          }
        }],
        runtimeCaching: [{
          urlPattern: isSameOriginDeferredAssetRequest,
          handler: 'CacheFirst',
          options: {
            cacheName: 'bashnota-deferred-features',
            cacheableResponse: { statuses: [200] },
            expiration: { maxEntries: 160, maxAgeSeconds: 30 * 24 * 60 * 60 },
          },
        }],
      },
    }),
  ],
  server: {
    proxy: {
      '/jupyter': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/jupyter/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err)
          })
          proxy.on('proxyReq', (proxyReq, req) => {
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization)
            }
          })
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Route chunks fetch their own dependencies once a route is selected. This
    // prevents Vite from promoting every dependency of a lazy editor route to
    // a document-level modulepreload, while preserving normal dynamic-import
    // loading and PWA caching semantics.
    modulePreload: false,
    rollupOptions: {
      output: {
        // Keep dependency preloads with their lazy import boundary. The default
        // transitive hoisting turns the editor's manual chunks into entry-module
        // imports, which defeats route-level loading even when the component
        // itself is a dynamic import.
        hoistTransitiveImports: false,
        chunkFileNames(chunk) {
          const moduleIds = chunk.moduleIds.join('\n')
          if (moduleIds.includes('/node_modules/@vue-flow/')) return 'assets/vue-flow-[hash].js'
          if (moduleIds.includes('/node_modules/katex/')) return 'assets/katex-[hash].js'
          if (/\/node_modules\/(?:d3(?:-|\/)|chart\.js|vue-chartjs)/.test(moduleIds)) return 'assets/d3-chart-[hash].js'
          if (/\/(?:src\/features\/editor|node_modules\/(?:@tiptap|prosemirror-|@codemirror|@lezer|highlight\.js|lowlight|tippy\.js))\//.test(moduleIds)) {
            return 'assets/editor-[hash].js'
          }
          return 'assets/[name]-[hash].js'
        },
        // Keep WebLLM's opt-in runtime independently named. Other editor
        // dependencies rely on Vite's route-aware automatic splitting: this
        // Vite/Rollup version hoists the transitive dependencies of manually
        // named groups into the app entry.
        manualChunks(id) {
          if (id.includes('/node_modules/@mlc-ai/')) return 'webllm'
        },
      },
    },
  },
})
