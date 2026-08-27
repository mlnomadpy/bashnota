import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  confirmJupyterConnection,
  confirmJupyterExecution,
  getJupyterHeaders,
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

  it('requires explicit remote confirmation and refuses token leakage over browser WebSockets', () => {
    const server = { ip: 'https://example.com', port: '443', token: 'jupyter-secret' }
    expect(() => confirmJupyterConnection(server, () => false)).toThrow('not confirmed')
    confirmJupyterConnection(server, () => true)

    expect(() => getJupyterWebSocketUrl(server, 'kernel id')).toThrow(
      'WebSocket authorization headers are not supported',
    )
    expect(getJupyterHeaders(server)).toEqual({ Authorization: 'token jupyter-secret' })
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
