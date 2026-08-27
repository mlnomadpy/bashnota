import { randomBytes } from 'node:crypto'
import { existsSync, mkdtempSync } from 'node:fs'
import { createServer, type ServerResponse } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { WebSocketServer } from 'ws'
import {
  browserTreeShutdownConfirmed,
  removeTemporaryDirectory,
  runBrowserAndCollectStdout,
  throwIfBrowserHarnessFailed,
} from './browserHarnessCleanup'

const chrome = [
  process.env.CHROME_BIN,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter((candidate): candidate is string => Boolean(candidate)).find(existsSync)

if (!chrome) throw new Error('Chrome/Chromium is required for the Jupyter authentication test')

const token = randomBytes(24).toString('hex')
const session = randomBytes(24).toString('hex')
const requestUrls: string[] = []
let authorizationRequests = 0
let channelCookieAuthenticated = false
let channelCookiePresented = false
const loadWaiters: ServerResponse[] = []

function releaseDocumentLoad(): void {
  const transparentGif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', 'base64')
  for (const response of loadWaiters.splice(0)) {
    response.setHeader('Content-Type', 'image/gif')
    response.end(transparentGif)
  }
}

const webSockets = new WebSocketServer({ noServer: true })
webSockets.on('connection', socket => {
  socket.once('message', rawMessage => {
    const request = JSON.parse(String(rawMessage)) as { code?: unknown; msg_type?: unknown }
    if (request.msg_type !== 'execute_request' || request.code !== 'print("cookie-channel-ok")') {
      socket.close(1008, 'Unexpected execution request')
      return
    }
    socket.send(JSON.stringify({ msg_type: 'execute_result', text: 'cookie-channel-ok' }))
  })
})

const server = createServer((request, response) => {
  const requestUrl = request.url ?? '/'
  requestUrls.push(requestUrl)

  if (requestUrl === '/') {
    response.setHeader('Content-Type', 'text/html; charset=utf-8')
    response.end('<!doctype html><html><body><p id="result">pending</p><img hidden src="/wait-for-channel"><script type="module" src="/bootstrap.js"></script></body></html>')
    return
  }

  if (requestUrl === '/bootstrap.js') {
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('Content-Type', 'text/javascript; charset=utf-8')
    response.end(`
      void (async () => {
      const finish = value => {
        document.querySelector('#result').textContent = value
        document.documentElement.dataset.jupyterAuthComplete = value
      }
      try {
        const response = await fetch('/api', {
          credentials: 'include',
          headers: { Authorization: 'token ${token}' },
          redirect: 'error',
        })
        if (!response.ok) throw new Error('token-bootstrap-failed')
        const message = await new Promise((resolve, reject) => {
          const socket = new WebSocket('ws://' + location.host + '/api/kernels/kernel-id/channels')
          socket.addEventListener('open', () => socket.send(JSON.stringify({
            msg_type: 'execute_request',
            code: 'print("cookie-channel-ok")',
          })))
          socket.addEventListener('message', event => {
            socket.close()
            resolve(JSON.parse(event.data))
          })
          socket.addEventListener('error', () => reject(new Error('channel-error')))
        })
        finish(message.msg_type === 'execute_result' ? message.text : 'unexpected-channel-response')
        await fetch('/channel-complete', { method: 'POST' })
      } catch (error) {
        finish(error instanceof Error ? error.message : 'bootstrap-error')
      }
      })()
    `)
    return
  }

  if (requestUrl === '/wait-for-channel') {
    loadWaiters.push(response)
    return
  }

  if (requestUrl === '/channel-complete' && request.method === 'POST') {
    response.writeHead(204).end()
    releaseDocumentLoad()
    return
  }

  if (requestUrl === '/api') {
    if (request.headers.authorization !== `token ${token}`) {
      response.writeHead(403).end()
      return
    }
    authorizationRequests += 1
    response.setHeader('Set-Cookie', `jupyter-session=${session}; HttpOnly; SameSite=Strict; Path=/`)
    response.setHeader('Content-Type', 'application/json')
    response.end('{"version":"test"}')
    return
  }

  response.writeHead(404).end()
})

server.on('upgrade', (request, socket, head) => {
  const requestUrl = request.url ?? ''
  requestUrls.push(requestUrl)
  channelCookiePresented = Boolean(request.headers.cookie)
  if (
    requestUrl !== '/api/kernels/kernel-id/channels'
    || requestUrl.includes('token=')
    || !request.headers.cookie?.split(';').map(value => value.trim()).includes(`jupyter-session=${session}`)
  ) {
    socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n')
    socket.destroy()
    return
  }
  channelCookieAuthenticated = true
  webSockets.handleUpgrade(request, socket, head, client => webSockets.emit('connection', client, request))
})

const port = await new Promise<number>((resolve, reject) => {
  server.once('error', reject)
  server.listen(0, '127.0.0.1', () => {
    const address = server.address()
    if (!address || typeof address === 'string') reject(new Error('Could not bind Jupyter fixture'))
    else resolve(address.port)
  })
})

const tempDirectory = mkdtempSync(join(tmpdir(), 'bashnota-jupyter-auth-'))
const profilePath = join(tempDirectory, 'chrome-profile')
let testFailure: unknown
const cleanupFailures: unknown[] = []
let browserShutdownConfirmed = true

try {
  const result = await runBrowserAndCollectStdout(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--disable-background-networking',
    '--no-default-browser-check',
    '--no-first-run',
    '--virtual-time-budget=5000',
    `--user-data-dir=${profilePath}`,
    '--dump-dom',
    `http://127.0.0.1:${port}/`,
  ], {
    isOutputComplete: output => output.includes('data-jupyter-auth-complete='),
    timeoutMs: 30_000,
  })
  cleanupFailures.push(...result.cleanupFailures)
  browserShutdownConfirmed = browserTreeShutdownConfirmed(result.cleanupFailures)

  if (result.stdout.includes(token) || requestUrls.some(url => url.includes(token))) {
    throw new Error('The Jupyter token leaked into DOM output or a request URL')
  }
  if (!result.stdout.includes('cookie-channel-ok')) {
    const renderedResult = result.stdout.match(/<p id="result">([^<]*)<\/p>/)?.[1] ?? 'missing-result'
    throw new Error(`The token-authenticated Jupyter channel did not execute successfully: ${renderedResult}; requests=${JSON.stringify(requestUrls)}; channelCookiePresented=${channelCookiePresented}; channelCookieAuthenticated=${channelCookieAuthenticated}`)
  }
  if (authorizationRequests !== 1 || !channelCookieAuthenticated) {
    throw new Error('Jupyter authentication did not transition from HTTP token to channel cookie')
  }
} catch (error) {
  testFailure = error
  if (error instanceof Error && error.name === 'BrowserProcessTreeShutdownError') {
    browserShutdownConfirmed = false
  }
}

releaseDocumentLoad()
await new Promise<void>(resolve => webSockets.close(() => resolve()))
await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))

if (browserShutdownConfirmed) {
  try {
    removeTemporaryDirectory(tempDirectory)
  } catch (error) {
    cleanupFailures.push(error)
  }
} else {
  cleanupFailures.push(new Error(`Retained Jupyter browser profile after unconfirmed shutdown: ${tempDirectory}`))
}

throwIfBrowserHarnessFailed(testFailure, cleanupFailures)
console.log('Token-authenticated Jupyter browser assertions passed')
