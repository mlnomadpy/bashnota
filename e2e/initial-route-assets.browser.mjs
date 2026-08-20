import { execFile } from 'node:child_process'
import { createServer } from 'node:http'
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { tmpdir } from 'node:os'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const chrome = [
  process.env.CHROME_BIN,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
].find((candidate) => candidate && existsSync(candidate))
if (!chrome) throw new Error('Chrome/Chromium is required for initial route network assertions')

const dist = new URL('../dist/', import.meta.url)
const base = '/bashnota'
const namedHeavy = /\/(?:d3-chart|katex|vue-flow)-[^/]+\.(?:js|css)(?:\?|$)/i
const isEditorPayload = (path) => {
  if (!/\/editor-[^/]+\.js(?:\?|$)/i.test(path)) return false
  const asset = join(dist.pathname, path.slice(`${base}/`.length))
  return existsSync(asset) && statSync(asset).size > 500_000
}
const requests = []
const mime = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.ico': 'image/x-icon' }

const server = createServer((request, response) => {
  const requestPath = new URL(request.url ?? '/', 'http://localhost').pathname
  requests.push(requestPath)
  const relative = requestPath.startsWith(base) ? requestPath.slice(base.length) || '/' : requestPath
  const cleaned = normalize(relative).replace(/^\/+/, '')
  const asset = cleaned && !cleaned.includes('..') ? join(dist.pathname, cleaned) : ''
  const file = asset && existsSync(asset) ? asset : join(dist.pathname, 'index.html')
  response.writeHead(200, { 'content-type': mime[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' })
  if (file.endsWith('/index.html')) {
    const probe = '<script>setTimeout(()=>{document.body.dataset.routeAssets=performance.getEntriesByType("resource").map((entry)=>new URL(entry.name).pathname).join("|")},1200)</script>'
    response.end(readFileSync(file, 'utf8').replace('</body>', `${probe}</body>`))
  } else response.end(readFileSync(file))
})

const port = await new Promise((resolve, reject) => {
  server.once('error', reject)
  server.listen(0, '127.0.0.1', () => resolve(server.address().port))
})

try {
  for (const route of ['/', '/login', '/settings/unified-editor', '/p/published-nota']) {
    const url = `http://127.0.0.1:${port}${base}${route}`
    const start = requests.length
    const profile = mkdtempSync(join(tmpdir(), 'bashnota-route-assets-'))
    let dom = ''
    try {
      const result = await execFileAsync(chrome, ['--headless=new', '--disable-gpu', '--disable-background-networking', '--no-first-run', '--no-default-browser-check', '--virtual-time-budget=1800', `--user-data-dir=${profile}`, '--dump-dom', url], { timeout: 4_000 })
      dom = result.stdout
    } catch (error) {
      // Chrome can retain a background process after dumping a complete page.
      dom = typeof error?.stdout === 'string' ? error.stdout : ''
    } finally {
      rmSync(profile, { recursive: true, force: true })
    }
    const all = requests.slice(start)
    const timing = dom.match(/data-route-assets="([^"]*)"/)?.[1] ?? ''
    const assetRequests = timing.split('|').filter((path) => /\/assets\/.*\.(?:js|css)(?:\?|$)/.test(path))
    if (!timing) throw new Error(`${route} did not expose browser resource timing after router startup; server saw ${all.join(', ')}`)
    const forbidden = assetRequests.filter((path) => namedHeavy.test(path) || isEditorPayload(path))
    if (forbidden.length) throw new Error(`${route} fetched editor-only assets after router startup: ${forbidden.join(', ')}`)
    if (route.startsWith('/p/') && assetRequests.some((path) => /NotaContentViewer/i.test(path))) {
      throw new Error(`${route} fetched the public reader before published content became available`)
    }
    console.log(`${route}: ${assetRequests.join(', ') || 'no route assets'}; public viewer=${route.startsWith('/p/') ? 'deferred-until-content' : 'n/a'}`)
  }
  console.log('Initial route browser network assertions passed')
} finally {
  await new Promise((resolve) => server.close(resolve))
}
