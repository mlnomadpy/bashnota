import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useEditorStore } from '@/features/editor/stores/editorStore'

const committedVersion = {
  id: 'committed-version',
  notaId: 'nota',
  nota: {},
  versionName: 'Committed',
  createdAt: new Date(),
}

describe('editor version action', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('resolves only after the mounted editor save succeeds', async () => {
    const store = useEditorStore()
    const saveVersion = vi.fn().mockResolvedValue(committedVersion)
    store.setActiveEditorComponent({ saveVersion })

    await expect(store.saveVersion()).resolves.toBe(committedVersion)
    expect(saveVersion).toHaveBeenCalledOnce()
  })

  it('coalesces duplicate in-flight commands into one committed version', async () => {
    const store = useEditorStore()
    let release!: (value: typeof committedVersion) => void
    const pending = new Promise<typeof committedVersion>((resolve) => { release = resolve })
    const saveVersion = vi.fn().mockReturnValue(pending)
    store.setActiveEditorComponent({ saveVersion })

    const first = store.saveVersion()
    const second = store.saveVersion()
    await Promise.resolve()
    expect(saveVersion).toHaveBeenCalledOnce()
    release(committedVersion)
    await expect(Promise.all([first, second])).resolves.toEqual([committedVersion, committedVersion])
  })

  it('propagates the persistence failure to the single UI outcome owner', async () => {
    const store = useEditorStore()
    const failure = new Error('history transaction failed')
    store.setActiveEditorComponent({ saveVersion: vi.fn().mockRejectedValue(failure) })

    await expect(store.saveVersion()).rejects.toBe(failure)
  })

  it('rejects an unready editor or an editor that returns without a commit', async () => {
    const store = useEditorStore()
    await expect(store.saveVersion()).rejects.toThrow('No active editor')

    store.setActiveEditorComponent({ saveVersion: vi.fn().mockResolvedValue(undefined) })
    await expect(store.saveVersion()).rejects.toThrow('did not commit')
  })
})
