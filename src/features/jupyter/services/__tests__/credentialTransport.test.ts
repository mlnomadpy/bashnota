import { afterEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import { JupyterService } from '../jupyterService'

vi.mock('axios', () => ({
  default: {
    delete: vi.fn(),
    get: vi.fn(),
    isAxiosError: vi.fn(() => false),
    post: vi.fn(),
  },
}))

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
    expect(new Headers(options?.headers).get('Authorization')).toBe('token jupyter-secret')
    expect(options?.credentials).toBe('include')
    expect(options?.redirect).toBe('error')
  })

  it('ignores compatibility URLs and dispatches managed requests only to the canonical origin', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ type: 'directory', path: '', content: [] }), { status: 200 }),
      )
    const service = new JupyterService()
    const id = service.addServer({
      ip: 'localhost',
      port: '8888',
      token: 'jupyter-secret',
      name: 'Local',
      url: 'https://attacker.example/collect?token=leak',
    })

    await service.browseDirectory(id)

    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      'http://localhost:8888/api',
      'http://localhost:8888/api/contents/',
    ])
  })

  it('bootstraps cookie auth over HTTP before opening a credential-free WebSocket', async () => {
    const originalWebSocket = globalThis.WebSocket
    const webSocketUrls: string[] = []
    class FakeWebSocket {
      onopen: (() => void) | null = null
      onmessage: ((event: { data: string }) => void) | null = null
      onerror: ((error: unknown) => void) | null = null

      constructor(url: string) {
        webSocketUrls.push(url)
        queueMicrotask(() => this.onopen?.())
      }

      send(raw: string) {
        const request = JSON.parse(raw)
        queueMicrotask(() =>
          this.onmessage?.({
            data: JSON.stringify({
              msg_type: 'status',
              parent_header: { msg_id: request.header.msg_id },
              content: { execution_state: 'idle' },
            }),
          }),
        )
      }

      close() {}
    }
    globalThis.WebSocket = FakeWebSocket as unknown as typeof WebSocket
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(axios.post).mockResolvedValue({ data: { id: 'kernel-1' } })
    vi.mocked(axios.delete).mockResolvedValue({})

    try {
      const server = { ip: 'https://jupyter.example', port: '443', token: 'jupyter-secret' }
      await new JupyterService().executeCode(server, 'python3', 'print(1)')

      expect(axios.post).toHaveBeenCalledWith(
        'https://jupyter.example/api/kernels',
        { name: 'python3' },
        {
          headers: { Authorization: 'token jupyter-secret' },
          withCredentials: true,
        },
      )
      expect(webSocketUrls).toEqual(['wss://jupyter.example/api/kernels/kernel-1/channels'])
      expect(webSocketUrls[0]).not.toContain(server.token)
      expect(axios.delete).toHaveBeenCalledWith('https://jupyter.example/api/kernels/kernel-1', {
        headers: { Authorization: 'token jupyter-secret' },
        withCredentials: true,
      })
    } finally {
      globalThis.WebSocket = originalWebSocket
    }
  })
})
