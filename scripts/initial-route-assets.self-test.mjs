import assert from 'node:assert/strict'
import { readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'

const DIST_DIRECTORY = new URL('../dist/', import.meta.url)
const ASSETS_DIRECTORY = new URL('../dist/assets/', import.meta.url)
const ENTRY_BUDGET_BYTES = 400_000
const PRELOAD_BUDGET_BYTES = 0
const INITIAL_STYLESHEET_BUDGET_BYTES = 150_000
const HEAVY_ASSET = /(?:^|\/)(?:editor|d3-chart|katex|vue-flow)-/i
const PRECACHE_FORBIDDEN = /(?:^|\/)(?:editor|d3-chart|katex|vue-flow|webllm|heavy-style)-|(?:^|\/)EditorAppShell-|(?:^|\/)KaTeX_/i
const representativeRoutes = ['/', '/login', '/p/published-nota', '/settings']

const html = await readFile(new URL('index.html', DIST_DIRECTORY), 'utf8')
const serviceWorker = await readFile(new URL('sw.js', DIST_DIRECTORY), 'utf8')
const assets = await readdir(ASSETS_DIRECTORY)
const entryMatches = [...html.matchAll(/<script type="module" crossorigin src="\/bashnota\/assets\/([^\"]+\.js)"><\/script>/g)]
const preloadMatches = [...html.matchAll(/<link rel="modulepreload" crossorigin href="\/bashnota\/assets\/([^\"]+)">/g)]
const stylesheetMatches = [...html.matchAll(/<link rel="stylesheet" crossorigin href="\/bashnota\/assets\/([^\"]+\.css)">/g)]

assert.equal(entryMatches.length, 1, 'The initial document must have exactly one application entry script.')

const entry = entryMatches[0][1]
const entryBytes = (await stat(new URL(`assets/${entry}`, DIST_DIRECTORY))).size
const preloadBytes = await Promise.all(preloadMatches.map(async ([, asset]) => (
  (await stat(new URL(`assets/${asset}`, DIST_DIRECTORY))).size
)))
const stylesheetBytes = await Promise.all(stylesheetMatches.map(async ([, asset]) => (
  (await stat(new URL(`assets/${asset}`, DIST_DIRECTORY))).size
)))
const initialAssets = [entry, ...preloadMatches.map(([, asset]) => asset), ...stylesheetMatches.map(([, asset]) => asset)]
const precacheAssets = [...serviceWorker.matchAll(/\burl\s*:\s*["']([^"']+)["']/g)].map((match) => match[1])

assert.ok(entryBytes <= ENTRY_BUDGET_BYTES, `Entry ${entry} is ${entryBytes} bytes; budget is ${ENTRY_BUDGET_BYTES}.`)
assert.ok(preloadBytes.reduce((total, bytes) => total + bytes, 0) <= PRELOAD_BUDGET_BYTES,
  `Modulepreloads total ${preloadBytes.reduce((total, bytes) => total + bytes, 0)} bytes; budget is ${PRELOAD_BUDGET_BYTES}.`)
assert.ok(stylesheetBytes.reduce((total, bytes) => total + bytes, 0) <= INITIAL_STYLESHEET_BUDGET_BYTES,
  `Initial stylesheets total ${stylesheetBytes.reduce((total, bytes) => total + bytes, 0)} bytes; budget is ${INITIAL_STYLESHEET_BUDGET_BYTES}.`)
assert.deepEqual(initialAssets.filter((asset) => HEAVY_ASSET.test(asset)), [],
  `Initial graph must not contain editor, D3, KaTeX, or Vue Flow assets: ${initialAssets.join(', ')}`)
assert.deepEqual(precacheAssets.filter((asset) => PRECACHE_FORBIDDEN.test(asset)), [],
  `PWA install precache must exclude deferred feature assets: ${precacheAssets.filter((asset) => PRECACHE_FORBIDDEN.test(asset)).join(', ')}`)
assert.deepEqual(
  precacheAssets.filter((asset) => asset.endsWith('.css')).sort(),
  stylesheetMatches.map(([, asset]) => `assets/${asset}`).sort(),
  'PWA precache must contain only the HTML shell stylesheet; lazy route/feature CSS is runtime-cached.',
)
for (const coreAsset of ['index.html', '404.html', 'registerSW.js', `assets/${entry}`,
  ...stylesheetMatches.map(([, asset]) => `assets/${asset}`)]) {
  assert.ok(precacheAssets.includes(coreAsset), `PWA precache must retain core shell asset ${coreAsset}.`)
}
assert.match(serviceWorker, /bashnota-deferred-features/,
  'PWA must runtime-cache deferred feature assets after their first request.')
assert.match(serviceWorker, /CacheFirst\(\{cacheName:["']bashnota-deferred-features["']/,
  'Deferred feature runtime caching must use CacheFirst so a feature works offline after first use.')
for (const runtimePattern of ['editor-', 'vue-flow-', 'KaTeX_', '\\.css']) {
  assert.ok(serviceWorker.includes(runtimePattern),
    `Deferred feature runtime route must cover ${runtimePattern}.`)
}

const editorChunks = await Promise.all(assets
  .filter((asset) => /^editor-.*\.js$/i.test(asset))
  .map(async (asset) => ({ asset, bytes: (await stat(join(ASSETS_DIRECTORY.pathname, asset))).size })))
const largestEditorChunk = editorChunks.sort((left, right) => right.bytes - left.bytes)[0]

assert.ok(largestEditorChunk, 'The editor must remain emitted as a lazy chunk.')
assert.ok(largestEditorChunk.bytes > 500_000, 'The editor report must identify the substantial deferred payload.')

for (const route of representativeRoutes) {
  assert.deepEqual(initialAssets.filter((asset) => HEAVY_ASSET.test(asset)), [],
    `${route} shares the SPA entry graph and must not preload editor assets.`)
}

console.log(`Initial entry: ${entry} = ${entryBytes} bytes (budget ${ENTRY_BUDGET_BYTES})`)
console.log(`Initial modulepreloads: ${preloadBytes.length} files = ${preloadBytes.reduce((total, bytes) => total + bytes, 0)} bytes (budget ${PRELOAD_BUDGET_BYTES})`)
console.log(`Initial route stylesheets: ${stylesheetBytes.reduce((total, bytes) => total + bytes, 0)} bytes (budget ${INITIAL_STYLESHEET_BUDGET_BYTES})`)
console.log(`Deferred editor chunks: ${editorChunks.length}; largest ${largestEditorChunk.asset} = ${largestEditorChunk.bytes} bytes`)
console.log(`PWA precache: ${precacheAssets.length} core assets; deferred feature payloads excluded and runtime-cached on first use`)
console.log(`Static artifact accounting verified for ${representativeRoutes.join(', ')}; browser network enforcement runs via test:initial-route-assets.`)
