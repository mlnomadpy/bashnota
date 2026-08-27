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
]
  .filter((candidate): candidate is string => Boolean(candidate))
  .find(existsSync)

if (!chrome) throw new Error('Chrome/Chromium is required for the Jupyter authentication test')

const token = randomBytes(24).toString('hex')
const sameOriginSession = randomBytes(24).toString('hex')
const crossOriginSession = randomBytes(24).toString('hex')
const requestUrls: string[] = []
let sameOriginAuthorizationRequests = 0
let sameOriginChannelAuthenticated = false
let crossOriginAuthorizationRequests = 0
let crossOriginProbeAttempts = 0
let crossOriginCookiePresented = false
let crossOriginProtectedUpgradeAttempts = 0
const loadWaiters: ServerResponse[] = []

function releaseDocumentLoad(): void {
  const transparentGif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', 'base64')
  for (const response of loadWaiters.splice(0)) {
    response.setHeader('Content-Type', 'image/gif')
    response.end(transparentGif)
  }
}

const webSockets = new WebSocketServer({ noServer: true })
webSockets.on('connection', (socket) => {
  socket.once('message', (rawMessage) => {
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
  requestUrls.push(`${request.headers.host ?? 'missing-host'}${requestUrl}`)

  if (requestUrl === '/') {
    response.setHeader('Content-Type', 'text/html; charset=utf-8')
    response.end(
      '<!doctype html><html><body><p id="result">pending</p><img hidden src="/wait-for-channel"><script type="module" src="/bootstrap.js"></script></body></html>',
    )
    return
  }

  if (requestUrl === '/bootstrap.js') {
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Jupyter fixture lost its port')
    const crossOrigin = `http://127.0.0.1:${address.port}`
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('Content-Type', 'text/javascript; charset=utf-8')
    response.end(`
      void (async () => {
        const finish = value => {
          document.querySelector('#result').textContent = value
          document.documentElement.dataset.jupyterAuthComplete = value
        }
        const rejectCrossOriginTokenExecution = (serverOrigin, hasToken) => {
          if (hasToken && new URL(serverOrigin).origin !== location.origin) {
            throw new Error('cross-origin-token-server-blocked')
          }
        }
        const expectRejectedWebSocket = url => new Promise((resolve, reject) => {
          const socket = new WebSocket(url)
          let settled = false
          const complete = callback => {
            if (settled) return
            settled = true
            clearTimeout(timeout)
            callback()
          }
          const timeout = setTimeout(
            () => complete(() => reject(new Error('cross-origin-probe-timeout'))),
            2000,
          )
          socket.addEventListener('open', () => {
            socket.close()
            complete(() => reject(new Error('cross-origin-cookie-was-sent')))
          })
          socket.addEventListener('error', () => complete(resolve))
          socket.addEventListener('close', () => complete(resolve))
        })

        try {
          rejectCrossOriginTokenExecution(location.origin, true)
          const sameResponse = await fetch('/api', {
            credentials: 'include',
            headers: { Authorization: 'token ${token}' },
            redirect: 'error',
          })
          if (!sameResponse.ok) throw new Error('same-origin-token-bootstrap-failed')
          const sameMessage = await new Promise((resolve, reject) => {
            const socket = new WebSocket(
              'ws://' + location.host + '/api/kernels/kernel-id/channels',
            )
            socket.addEventListener('open', () => socket.send(JSON.stringify({
              msg_type: 'execute_request',
              code: 'print("cookie-channel-ok")',
            })))
            socket.addEventListener('message', event => {
              socket.close()
              resolve(JSON.parse(event.data))
            })
            socket.addEventListener('error', () => reject(new Error('same-origin-channel-error')))
          })
          if (
            sameMessage.msg_type !== 'execute_result'
            || sameMessage.text !== 'cookie-channel-ok'
          ) {
            throw new Error('unexpected-same-origin-channel-response')
          }

          const crossResponse = await fetch('${crossOrigin}/cross/api', {
            credentials: 'include',
            headers: { Authorization: 'token ${token}' },
            redirect: 'error',
          })
          if (!crossResponse.ok) throw new Error('cross-origin-token-bootstrap-failed')
          await expectRejectedWebSocket(
            '${crossOrigin.replace('http:', 'ws:')}/cross/probe',
          )

          let policyRejected = false
          try {
            rejectCrossOriginTokenExecution('${crossOrigin}', true)
          } catch (error) {
            policyRejected = error instanceof Error
              && error.message === 'cross-origin-token-server-blocked'
          }
          if (!policyRejected) throw new Error('cross-origin-policy-did-not-fail-closed')

          finish('same-origin-ok;cross-origin-cookie-rejected;cross-origin-token-failed-closed')
        } catch (error) {
          finish(error instanceof Error ? error.message : 'bootstrap-error')
        } finally {
          await fetch('/channel-complete', { method: 'POST' })
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
    sameOriginAuthorizationRequests += 1
    response.setHeader(
      'Set-Cookie',
      `jupyter-same-session=${sameOriginSession}; HttpOnly; SameSite=Strict; Path=/`,
    )
    response.setHeader('Content-Type', 'application/json')
    response.end('{"version":"test"}')
    return
  }

  if (requestUrl === '/cross/api') {
    const allowedOrigin = request.headers.origin ?? ''
    response.setHeader('Access-Control-Allow-Origin', allowedOrigin)
    response.setHeader('Access-Control-Allow-Credentials', 'true')
    response.setHeader('Access-Control-Allow-Headers', 'Authorization')
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.setHeader('Vary', 'Origin')
    if (request.method === 'OPTIONS') {
      response.writeHead(204).end()
      return
    }
    if (request.headers.authorization !== `token ${token}`) {
      response.writeHead(403).end()
      return
    }
    crossOriginAuthorizationRequests += 1
    response.setHeader(
      'Set-Cookie',
      `jupyter-cross-session=${crossOriginSession}; HttpOnly; SameSite=Strict; Path=/`,
    )
    response.setHeader('Content-Type', 'application/json')
    response.end('{"version":"test"}')
    return
  }

  response.writeHead(404).end()
})

server.on('upgrade', (request, socket, head) => {
  const requestUrl = request.url ?? ''
  requestUrls.push(`${request.headers.host ?? 'missing-host'}${requestUrl}`)

  if (requestUrl === '/cross/probe') {
    crossOriginProbeAttempts += 1
    crossOriginCookiePresented = Boolean(request.headers.cookie)
    if (
      request.headers.cookie
        ?.split(';')
        .map((value) => value.trim())
        .includes(`jupyter-cross-session=${crossOriginSession}`)
    ) {
      webSockets.handleUpgrade(request, socket, head, (client) =>
        webSockets.emit('connection', client, request),
      )
      return
    }
    socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n')
    socket.destroy()
    return
  }

  if (requestUrl.startsWith('/cross/api/kernels/')) {
    crossOriginProtectedUpgradeAttempts += 1
    socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n')
    socket.destroy()
    return
  }

  const authenticated = request.headers.cookie
    ?.split(';')
    .map((value) => value.trim())
    .includes(`jupyter-same-session=${sameOriginSession}`)
  if (
    requestUrl !== '/api/kernels/kernel-id/channels' ||
    requestUrl.includes('token=') ||
    !authenticated
  ) {
    socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n')
    socket.destroy()
    return
  }
  sameOriginChannelAuthenticated = true
  webSockets.handleUpgrade(request, socket, head, (client) =>
    webSockets.emit('connection', client, request),
  )
})

const port = await new Promise<number>((resolve, reject) => {
  server.once('error', reject)
  server.listen(0, () => {
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
  const result = await runBrowserAndCollectStdout(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--disable-background-networking',
      '--no-default-browser-check',
      '--no-first-run',
      '--virtual-time-budget=5000',
      `--user-data-dir=${profilePath}`,
      '--dump-dom',
      `http://localhost:${port}/`,
    ],
    {
      isOutputComplete: (output) => output.includes('data-jupyter-auth-complete='),
      timeoutMs: 30_000,
    },
  )
  cleanupFailures.push(...result.cleanupFailures)
  browserShutdownConfirmed = browserTreeShutdownConfirmed(result.cleanupFailures)

  if (result.stdout.includes(token) || requestUrls.some((url) => url.includes(token))) {
    throw new Error('The Jupyter token leaked into DOM output or a request URL')
  }
  const success = 'same-origin-ok;cross-origin-cookie-rejected;cross-origin-token-failed-closed'
  if (!result.stdout.includes(success)) {
    const renderedResult =
      result.stdout.match(/<p id="result">([^<]*)<\/p>/)?.[1] ?? 'missing-result'
    throw new Error(
      `Jupyter browser security assertions failed: ${renderedResult}; requests=${JSON.stringify(requestUrls)}`,
    )
  }
  if (sameOriginAuthorizationRequests !== 1 || !sameOriginChannelAuthenticated) {
    throw new Error('Same-origin Jupyter authentication did not transition to its channel cookie')
  }
  if (
    crossOriginAuthorizationRequests !== 1 ||
    crossOriginProbeAttempts !== 1 ||
    crossOriginCookiePresented
  ) {
    throw new Error('The distinct-origin fixture did not prove that its Strict cookie was rejected')
  }
  if (crossOriginProtectedUpgradeAttempts !== 0) {
    throw new Error('The application policy attempted a cross-origin token WebSocket')
  }
} catch (error) {
  testFailure = error
  if (error instanceof Error && error.name === 'BrowserProcessTreeShutdownError') {
    browserShutdownConfirmed = false
  }
}

releaseDocumentLoad()
await new Promise<void>((resolve) => webSockets.close(() => resolve()))
await new Promise<void>((resolve, reject) =>
  server.close((error) => (error ? reject(error) : resolve())),
)

if (browserShutdownConfirmed) {
  try {
    removeTemporaryDirectory(tempDirectory)
  } catch (error) {
    cleanupFailures.push(error)
  }
} else {
  cleanupFailures.push(
    new Error(`Retained Jupyter browser profile after unconfirmed shutdown: ${tempDirectory}`),
  )
}

throwIfBrowserHarnessFailed(testFailure, cleanupFailures)
console.log('Same-origin and cross-origin Jupyter browser assertions passed')
