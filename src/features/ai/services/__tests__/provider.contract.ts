import { expect, it, vi } from 'vitest'
import type { AIProvider } from '../types'

export interface StreamingProviderContract {
  create(): AIProvider
  successChunks: string[]
  expectedText: string
  errorBody: string
}

function streamFrom(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
      controller.close()
    },
  })
}

export function streamingProviderContract(contract: StreamingProviderContract): void {
  it('assembles deterministically split streaming responses and completes once', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(streamFrom(contract.successChunks), { status: 200 }),
    )
    const onChunk = vi.fn()
    const onComplete = vi.fn()
    const onError = vi.fn()

    await contract
      .create()
      .generateTextStream(
        { prompt: 'deterministic prompt', temperature: 0, topP: 0, maxTokens: 16 },
        { onChunk, onComplete, onError },
      )

    expect(onChunk.mock.calls.flat()).toEqual(contract.expectedText.split('|'))
    expect(onComplete).toHaveBeenCalledOnce()
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        text: contract.expectedText.split('|').join(''),
      }),
    )
    expect(onError).not.toHaveBeenCalled()
  })

  it('rejects deterministic HTTP failures and reports the error once', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(contract.errorBody, { status: 429, statusText: 'Too Many Requests' }),
    )
    const onError = vi.fn()

    await expect(
      contract
        .create()
        .generateTextStream(
          { prompt: 'deterministic prompt' },
          { onChunk: vi.fn(), onComplete: vi.fn(), onError },
        ),
    ).rejects.toThrow(/429/)

    expect(onError).toHaveBeenCalledOnce()
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error)
  })

  it('rejects a stream-reader failure and reports the error once', async () => {
    const failedStream = new ReadableStream<Uint8Array>({
      pull(controller) {
        controller.error(new Error('deterministic reader failure'))
      },
    })
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(failedStream, { status: 200 }))
    const onError = vi.fn()

    await expect(
      contract
        .create()
        .generateTextStream(
          { prompt: 'deterministic prompt' },
          { onChunk: vi.fn(), onComplete: vi.fn(), onError },
        ),
    ).rejects.toThrow('deterministic reader failure')

    expect(onError).toHaveBeenCalledOnce()
  })
}
