import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  confirmJupyterConnection,
  confirmJupyterExecution,
  getJupyterFetchOptions,
  getJupyterHeaders,
  getJupyterRequestUrl,
  getJupyterWebSocketUrl,
  resetJupyterConfirmationsForTest,
} from '../jupyterSecurity'

describe('Jupyter trust boundary', () => {
  beforeEach(() => resetJupyterConfirmationsForTest())

  it('rejects insecure non-local transport before requesting confirmation', () => {
    const confirm = vi.fn(() => true)
    expect(() =>
      confirmJupyterConnection(
        { ip: 'http://example.com', port: '8888', token: 'secret' },
        confirm,
      ),
    ).toThrow('require HTTPS')
    expect(confirm).not.toHaveBeenCalled()
  })

  it('requires explicit remote confirmation and keeps tokens out of browser WebSocket URLs', () => {
    const server = { ip: 'https://example.com', port: '443', token: 'jupyter-secret' }
    expect(() => confirmJupyterConnection(server, () => false)).toThrow('not confirmed')
    confirmJupyterConnection(server, () => true)

    const url = getJupyterWebSocketUrl(server, 'kernel id')
    expect(url).toBe('wss://example.com/api/kernels/kernel%20id/channels')
    expect(url).not.toContain(server.token)
    expect(getJupyterHeaders(server)).toEqual({ Authorization: 'token jupyter-secret' })
  })

  it('keeps HTTP requests on the confirmed origin and enables cookie bootstrap', () => {
    const server = { ip: 'localhost', port: '8888', token: 'jupyter-secret' }
    const options = getJupyterFetchOptions(server, { method: 'POST' })

    expect(getJupyterRequestUrl(server, '/api/kernels')).toBe('http://localhost:8888/api/kernels')
    expect(() => getJupyterRequestUrl(server, 'https://attacker.example/collect')).toThrow(
      'confirmed server origin',
    )
    expect(options.credentials).toBe('include')
    expect(options.redirect).toBe('error')
    expect(new Headers(options.headers).get('Authorization')).toBe('token jupyter-secret')
  })

  it('produces credential-free WSS URLs for cookie-authenticated remote servers', () => {
    const server = { ip: 'https://example.com', port: '443', token: '' }
    confirmJupyterConnection(server, () => true)

    const url = getJupyterWebSocketUrl(server, 'kernel id')
    expect(url).toBe('wss://example.com/api/kernels/kernel%20id/channels')
    expect(url).not.toContain('token=')
  })

  it('states local process authority and requires confirmation before execution', () => {
    const messages: string[] = []
    const confirm = vi.fn((message: string) => {
      messages.push(message)
      return true
    })
    confirmJupyterExecution({ ip: 'localhost', port: '8888', token: '' }, confirm)

    expect(confirm).toHaveBeenCalledOnce()
    expect(messages[0]).toContain('local computer')
    expect(messages[0]).toContain('authority of its Jupyter process')
  })
})
