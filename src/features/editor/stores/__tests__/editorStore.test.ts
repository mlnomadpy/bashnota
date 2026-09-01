import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useEditorStore } from '@/features/editor/stores/editorStore'

describe('editor version action', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('resolves only after the mounted editor save succeeds', async () => {
    const store = useEditorStore()
    const saveVersion = vi.fn().mockResolvedValue(undefined)
    store.setActiveEditorComponent({ saveVersion })

    await expect(store.saveVersion()).resolves.toBeUndefined()
    expect(saveVersion).toHaveBeenCalledOnce()
  })

  it('propagates the persistence failure to the single UI outcome owner', async () => {
    const store = useEditorStore()
    const failure = new Error('history transaction failed')
    store.setActiveEditorComponent({ saveVersion: vi.fn().mockRejectedValue(failure) })

    await expect(store.saveVersion()).rejects.toBe(failure)
  })
})
