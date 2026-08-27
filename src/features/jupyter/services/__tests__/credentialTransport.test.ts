import { afterEach, describe, expect, it, vi } from 'vitest'
import { JupyterService } from '../jupyterService'

describe('Jupyter credential transport', () => {
  afterEach(() => vi.restoreAllMocks())

  it('uses an authorization header and never places the token in the request URL', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 200 }))
    const service = new JupyterService()
    const server = { ip: 'localhost', port: '8888', token: 'jupyter-secret' }

    await expect(service.testConnection(server)).resolves.toEqual({
      success: true,
      message: 'Connection successful',
    })
    const [url, options] = fetchMock.mock.calls[0]
    expect(String(url)).toBe('http://localhost:8888/api')
    expect(String(url)).not.toContain(server.token)
    expect(options?.headers).toMatchObject({ Authorization: 'token jupyter-secret' })
  })
})
