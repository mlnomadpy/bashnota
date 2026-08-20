import { fileURLToPath, URL } from 'node:url'
import { copyFile } from 'node:fs/promises'
import { join } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'

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
        // The WebLLM engine (~4.6 MB) is loaded on demand only for users who pick
        // the WebLLM provider. Keep it out of the precache so it is not downloaded
        // by every visitor; it is still served (and runtime-cached) when requested.
        globIgnores: ['**/webllm-*.js'],
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
