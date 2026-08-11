---
id: f-done-008-bundle-split-web-llm-lazy-loaded-entry-chunk-10-057-89-1-938-27-kb
kind: note
note_kind: finding
created: 2026-08-11T17:17:07Z
created_by: a-fixer-kxmqy9
about: "[[008-split-the-bundle-and-stop-shipping-web-llm-to-everyone]]"
severity: major
---
# DONE 008: bundle split + web-llm lazy-loaded. Entry chunk 10,057.89->1,938.27 kB (gzip 3,327.82->552.19); PWA precache 10,673.45->6,171.78 KiB. Branch dacli/008-split-the-bundle-and-stop-shipping-web-llm-to-everyone, commit 6495160
Two files changed: src/features/ai/services/providers/webLLMProvider.ts (+dynamic import) and vite.config.ts (+manualChunks, +workbox globIgnores). No src feature code removed.

AC1 (web-llm out of entry graph, loads only on WebLLM use): webLLMProvider.ts:1 changed 'import * as webllm' -> 'import type * as WebLLM' (type-only, erased) plus a lazy loadWebLLM() that does import('@mlc-ai/web-llm'), awaited only inside initializeModel() and getAvailableModels(). PROOF: dist/index.html references index/d3-chart/editor/firebase/katex/vue-flow but NOT webllm; @mlc-ai emits as its own on-demand chunk webllm-*.js (4,600.98 kB). Only importer of the package repo-wide was this file (grep '@mlc-ai/web-llm' = package.json/lock + this line). Provider constructor and isAvailable() (only checks navigator.gpu) do not trigger the load.

AC2 (manualChunks): vite.config.ts build.rollupOptions.output.manualChunks separates editor (@tiptap/prosemirror/@codemirror/@lezer/tiptap-*/lowlight/highlight.js/tippy.js = 2,216.12 kB), katex (265.07), mermaid (rule defined; 0 kB because mermaid is never imported - see separate finding), d3-chart (d3-*/chart.js/vue-chartjs = 315.04), vue-flow (216.53), firebase (firebase/@firebase/@grpc/protobufjs = 490.14), and webllm.

AC3 (entry size vs baseline 10,057.95/3,327.84 kB): index-*.js = 1,938.27 kB raw / 552.19 kB gzip. -80.7% raw, -83.4% gzip.

AC4 (PWA precache drops): 66 entries/10,673.45 KiB -> 74 entries/6,171.78 KiB (-4,501.67 KiB). Drop = the webllm chunk, excluded via workbox globIgnores:['**/webllm-*.js'] so it is not precached/downloaded by every visitor (still served + runtime-cached on demand). Without globIgnores the split alone left precache at ~10,664 KiB (webllm still precached under the 10MB cap) - see decision note.

AC5 (no route broken): all 11 route view chunks still emitted (HomeView, SplitNotaView, PublicNotaView, UserPublishedView, FavoritesView, SettingsView, LoginView, RegisterView, ProfileView, CodeBlockOutputView, NotFound). manualChunks is pure output partitioning; Rollup build succeeds with no missing-chunk error.

VERIFICATION (all in worktree): npx vue-tsc --build = 0 errors, 0 .js emitted into src. npx vitest run = 24 files/338 tests all passing (no regression; base already has 002/003/004/007 merged). npx vite build = success 7.55s. npx eslint on both changed files = clean. LIMITATION: 'no console errors' in a live browser was not observable in this headless sandbox; it rests on the successful build, passing suite, intact route chunks, and webllm being invoked only on user action. Recommend owner smoke-test in a browser before ship.
