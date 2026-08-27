import { afterEach, describe, expect, it, vi } from 'vitest'
import { GeminiProvider } from '../providers/geminiProvider'

describe('Gemini credential transport', () => {
  afterEach(() => vi.restoreAllMocks())

  it('uses x-goog-api-key instead of a URL query credential for streaming', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('[]', { status: 200 }))
    const provider = new GeminiProvider('provider-secret')

    await provider.generateTextStream(
      { prompt: 'hello' },
      { onChunk: vi.fn(), onComplete: vi.fn() },
    )
    const [url, options] = fetchMock.mock.calls[0]
    expect(String(url)).not.toContain('provider-secret')
    expect(String(url)).not.toContain('?key=')
    expect(options?.headers).toMatchObject({ 'x-goog-api-key': 'provider-secret' })
  })
})
