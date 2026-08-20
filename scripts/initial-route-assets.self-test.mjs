import assert from 'node:assert/strict'
import { readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'

const DIST_DIRECTORY = new URL('../dist/', import.meta.url)
const ASSETS_DIRECTORY = new URL('../dist/assets/', import.meta.url)
const ENTRY_BUDGET_BYTES = 400_000
const PRELOAD_BUDGET_BYTES = 0
const INITIAL_STYLESHEET_BUDGET_BYTES = 150_000
const HEAVY_ASSET = /(?:^|\/)(?:editor|d3-chart|katex|vue-flow)-/i
const representativeRoutes = ['/', '/login', '/p/published-nota', '/settings']

const html = await readFile(new URL('index.html', DIST_DIRECTORY), 'utf8')
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

assert.ok(entryBytes <= ENTRY_BUDGET_BYTES, `Entry ${entry} is ${entryBytes} bytes; budget is ${ENTRY_BUDGET_BYTES}.`)
assert.ok(preloadBytes.reduce((total, bytes) => total + bytes, 0) <= PRELOAD_BUDGET_BYTES,
  `Modulepreloads total ${preloadBytes.reduce((total, bytes) => total + bytes, 0)} bytes; budget is ${PRELOAD_BUDGET_BYTES}.`)
assert.ok(stylesheetBytes.reduce((total, bytes) => total + bytes, 0) <= INITIAL_STYLESHEET_BUDGET_BYTES,
  `Initial stylesheets total ${stylesheetBytes.reduce((total, bytes) => total + bytes, 0)} bytes; budget is ${INITIAL_STYLESHEET_BUDGET_BYTES}.`)
assert.deepEqual(initialAssets.filter((asset) => HEAVY_ASSET.test(asset)), [],
  `Initial graph must not contain editor, D3, KaTeX, or Vue Flow assets: ${initialAssets.join(', ')}`)

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
console.log(`Initial graph verified for ${representativeRoutes.join(', ')}`)
