import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { access, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const artifactDirectory = join(process.cwd(), 'dist')
const basePath = '/bashnota/'
const shell = await readFile(join(artifactDirectory, 'index.html'), 'utf8')
await access(join(artifactDirectory, '404.html'))

function routeName(pathname) {
  if (/^\/bashnota\/p\/[^/]+$/.test(pathname)) return 'public-nota'
  if (pathname === '/bashnota/auth/callback') return 'auth-callback'
  if (pathname === '/bashnota/auth/reset-password') return 'auth-reset-password'
  if (/^\/bashnota\/settings(?:\/[^/]+)?$/.test(pathname)) return 'settings'
  if (/^\/bashnota\/nota\/[^/]+$/.test(pathname)) return 'nota'
  if (/^\/bashnota\/@[^/]+\/[^/]+$/.test(pathname)) return 'user-tag-nota'
  return undefined
}

const staticHost = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? '/', 'http://static-host.test')
  if (!requestUrl.pathname.startsWith(basePath)) {
    response.writeHead(404).end()
    return
  }

  // GitHub Pages serves its SPA fallback for unknown files. This intentionally
  // does not redirect, so location.pathname/search/hash remain the destination.
  response.writeHead(404, { 'content-type': 'text/html; charset=utf-8' }).end(shell)
})

await new Promise((resolve) => staticHost.listen(0, '127.0.0.1', resolve))
const address = staticHost.address()
assert.ok(address && typeof address !== 'string', 'Static test server must bind a TCP port.')

const destinations = [
  ['/p/public-nota', 'public-nota'],
  ['/auth/callback?code=oauth-code&next=%2Fnota%2Flocal%252Fid', 'auth-callback'],
  ['/auth/reset-password?token=recovery-token', 'auth-reset-password'],
  ['/settings/advanced?tab=storage', 'settings'],
  ['/nota/local%2Ffolder%2Fnotebook%20one?focus=block%3A1#cell-2', 'nota'],
  ['/@alice/research%2Fnotes?ref=shared#discussion', 'user-tag-nota'],
]

try {
  for (const [destination, expectedRoute] of destinations) {
    const browserUrl = new URL(`${basePath}${destination.slice(1)}`, `http://127.0.0.1:${address.port}`)
    const response = await fetch(browserUrl)
    const deliveredShell = await response.text()

    assert.equal(response.status, 404, `Static host should use 404.html for ${destination}.`)
    assert.equal(response.url, browserUrl.href.replace(browserUrl.hash, ''), `Fallback must not redirect ${destination}.`)
    assert.equal(deliveredShell, shell, `Fallback must deliver the app shell for ${destination}.`)
    assert.equal(routeName(browserUrl.pathname), expectedRoute, `Fallback must boot the ${expectedRoute} app route.`)
  }
} finally {
  await new Promise((resolve, reject) => staticHost.close((error) => (error ? reject(error) : resolve())))
}

console.log('GitHub Pages deep-link artifact self-test passed.')
