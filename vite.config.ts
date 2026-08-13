import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'

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
    rollupOptions: {
      output: {
        // Split large third-party stacks out of the entry chunk so the app shell
        // ships lean and heavy libraries load only for the routes that need them.
        manualChunks(id) {
          // The ProseMirror adapter is application source, not a node_modules
          // dependency. Keep it with the editor stack just as the pre-cutover
          // TipTap wrapper was, rather than letting the app shell eagerly absorb
          // the new raw-editor implementation.
          if (
            id.includes('/src/features/editor/pm/') ||
            id.endsWith('/src/features/editor/components/extensions/MarkdownExtension.ts')
          ) {
            return 'editor'
          }

          if (!id.includes('node_modules')) return
          const pkg = id.split('node_modules/').pop() || ''

          // WebLLM is also dynamically imported (see webLLMProvider.ts); naming its
          // chunk keeps the browser-LLM stack fully isolated from everyone else.
          if (pkg.startsWith('@mlc-ai/')) return 'webllm'

          // Editor stack: TipTap + ProseMirror + CodeMirror + syntax highlighting.
          if (
            pkg.startsWith('@tiptap/') ||
            pkg.startsWith('prosemirror-') ||
            pkg.startsWith('tiptap-') ||
            pkg.startsWith('@rcode-link/') ||
            pkg.startsWith('@codemirror/') ||
            pkg.startsWith('@lezer/') ||
            pkg.startsWith('vue-codemirror') ||
            pkg.startsWith('cm6-theme') ||
            pkg.startsWith('lowlight') ||
            pkg.startsWith('highlight.js') ||
            pkg.startsWith('tippy.js')
          ) {
            return 'editor'
          }

          // Math renderer.
          if (pkg.startsWith('katex')) return 'katex'

          // Mermaid diagrams.
          if (pkg.startsWith('mermaid')) return 'mermaid'

          // d3 + charting.
          if (
            pkg.startsWith('d3/') ||
            pkg.startsWith('d3-') ||
            pkg.startsWith('chart.js') ||
            pkg.startsWith('vue-chartjs')
          ) {
            return 'd3-chart'
          }

          // Vue Flow (pipeline canvas).
          if (pkg.startsWith('@vue-flow/')) return 'vue-flow'

          // Firebase SDK.
          if (
            pkg.startsWith('firebase') ||
            pkg.startsWith('@firebase/') ||
            pkg.startsWith('@grpc/') ||
            pkg.startsWith('protobufjs')
          ) {
            return 'firebase'
          }
        },
      },
    },
  },
})
