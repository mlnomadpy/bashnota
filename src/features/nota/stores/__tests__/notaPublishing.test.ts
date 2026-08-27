import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { CloudError } from '@/services/cloud/types'
import { db } from '@/db'

const doubles = vi.hoisted(() => ({
  failProcessingId: null as string | null,
  contents: new Map<string, any>(),
  processNotaContent: vi.fn(),
  cleanup: vi.fn(),
  cleanupOrphans: vi.fn(),
  upsertHierarchy: vi.fn(),
  deletePublication: vi.fn(),
  getPublication: vi.fn(),
}))

vi.mock('@/features/auth/stores/auth', () => ({
  useAuthStore: () => ({ currentUser: { uid: 'owner-1', displayName: 'Owner' } }),
}))
vi.mock('@/features/nota/stores/blockStore', () => ({
  useBlockStore: () => ({
    getTiptapContent: (id: string) => doubles.contents.get(id) ?? null,
    loadNotaBlocks: vi.fn(),
  }),
}))
vi.mock('@/features/nota/services/publishNotaUtilities', () => ({
  processNotaContent: doubles.processNotaContent,
}))
vi.mock('@/services/cloud/supabaseImageStorage', () => ({
  deletePublishedImages: doubles.cleanup,
  cleanupOrphanedPublishedImages: doubles.cleanupOrphans,
}))
vi.mock('@/services/cloud', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/services/cloud')>()
  return {
    ...original,
    getPublicationCloudApi: async () => ({
      publishing: {
        upsertPublicationHierarchy: doubles.upsertHierarchy,
        getPublication: doubles.getPublication,
        deletePublication: doubles.deletePublication,
      },
    }),
  }
})
vi.mock('vue-sonner', () => {
  const toast = Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() })
  return { toast }
})

import { useNotaStore } from '@/features/nota/stores/nota'
import type { Nota } from '@/features/nota/types/nota'

const timestamp = new Date('2026-08-26T12:00:00.000Z')
const nota = (id: string, parentId: string | null, title = id): Nota => ({
  id,
  parentId,
  title,
  tags: [],
  createdAt: timestamp,
  updatedAt: timestamp,
})

function published(value: any) {
  return {
    ...value,
    publishedAt: timestamp.toISOString(),
    updatedAt: timestamp.toISOString(),
    viewCount: 0,
    uniqueViewers: 0,
    likeCount: 0,
    dislikeCount: 0,
    cloneCount: 0,
    commentCount: 0,
  }
}

describe('atomic nota hierarchy publication orchestration', () => {
  beforeEach(async () => {
    await db.notas.clear()
    setActivePinia(createPinia())
    doubles.failProcessingId = null
    doubles.contents.clear()
    doubles.cleanup.mockReset().mockResolvedValue(undefined)
    doubles.cleanupOrphans.mockReset().mockResolvedValue(undefined)
    doubles.deletePublication.mockReset().mockResolvedValue({ ok: true, data: undefined })
    doubles.getPublication.mockReset().mockResolvedValue({ ok: true, data: null })
    doubles.upsertHierarchy.mockReset().mockImplementation(async (values: any[]) => ({
      ok: true,
      data: values.map(published),
    }))
    doubles.processNotaContent.mockReset().mockImplementation(async (content: any, options: any) => {
      options.uploadedImagePaths.push(`owner-1/${content.notaId}.png`)
      if (doubles.failProcessingId === content.notaId) throw new Error(`failed ${content.notaId}`)
      return content
    })
  })

  function hierarchyStore() {
    const store = useNotaStore()
    store.items = [
      nota('root', null, 'Root'),
      nota('child-b', 'root', 'Child B'),
      nota('child-a', 'root', 'Child A'),
      nota('grandchild', 'child-b', 'Grandchild'),
    ]
    for (const item of store.items) doubles.contents.set(item.id, { type: 'doc', notaId: item.id })
    return store
  }

  it('publishes root and descendants once with stable pre-order and ordered direct edges', async () => {
    const store = hierarchyStore()
    await expect(store.publishNota('root', true)).resolves.toMatchObject({ id: 'root' })

    expect(doubles.upsertHierarchy).toHaveBeenCalledOnce()
    const writes = doubles.upsertHierarchy.mock.calls[0][0]
    expect(writes.map((value: any) => value.id)).toEqual(['root', 'child-b', 'grandchild', 'child-a'])
    expect(writes.map((value: any) => [value.id, value.publishedSubPages])).toEqual([
      ['root', ['child-b', 'child-a']],
      ['child-b', ['grandchild']],
      ['grandchild', []],
      ['child-a', []],
    ])
    expect(store.publishedNotas).toEqual(['root', 'child-b', 'grandchild', 'child-a'])
    expect(store.items.every(item => item.isPublished)).toBe(true)
    expect(doubles.cleanup).not.toHaveBeenCalled()
  })

  it('surfaces descendant failure, cleans uploaded images, preserves local state, and allows retry', async () => {
    const store = hierarchyStore()
    doubles.failProcessingId = 'grandchild'

    await expect(store.publishNota('root', true)).rejects.toThrow('failed grandchild')
    expect(doubles.upsertHierarchy).not.toHaveBeenCalled()
    expect(doubles.cleanup).toHaveBeenCalledWith([
      'owner-1/root.png',
      'owner-1/child-b.png',
      'owner-1/grandchild.png',
    ])
    expect(store.publishedNotas).toEqual([])
    expect(store.items.every(item => !item.isPublished)).toBe(true)

    doubles.failProcessingId = null
    await expect(store.publishNota('root', true)).resolves.toMatchObject({ id: 'root' })
    expect(doubles.upsertHierarchy).toHaveBeenCalledOnce()
    expect(store.items.every(item => item.isPublished)).toBe(true)
  })

  it('does not suppress an authoritative descendant read failure into root-only success', async () => {
    const store = hierarchyStore()
    const original = store.getSubPages.bind(store)
    vi.spyOn(store, 'getSubPages').mockImplementation(async (id, strict) => {
      if (id === 'child-b') throw new Error('injected descendant read failure')
      return original(id, strict)
    })

    await expect(store.publishNota('root', true)).rejects.toThrow('injected descendant read failure')
    expect(doubles.upsertHierarchy).not.toHaveBeenCalled()
    expect(store.publishedNotas).toEqual([])
    expect(store.items.every(item => !item.isPublished)).toBe(true)
  })

  it('includes persisted siblings when the in-memory hierarchy is only partially hydrated', async () => {
    const store = useNotaStore()
    store.items = [nota('root', null, 'Root'), nota('loaded-child', 'root', 'Loaded Child')]
    await db.notas.put(nota('persisted-child', 'root', 'Persisted Child'))
    for (const id of ['root', 'loaded-child', 'persisted-child']) {
      doubles.contents.set(id, { type: 'doc', notaId: id })
    }

    await expect(store.publishNota('root', true)).resolves.toMatchObject({ id: 'root' })
    expect(doubles.upsertHierarchy.mock.calls[0][0].map((value: any) => value.id)).toEqual([
      'root',
      'loaded-child',
      'persisted-child',
    ])
    expect(doubles.upsertHierarchy.mock.calls[0][0][0].publishedSubPages).toEqual([
      'loaded-child',
      'persisted-child',
    ])
  })

  it('coalesces concurrent publication of the same hierarchy into one remote commit', async () => {
    const store = hierarchyStore()
    let release!: () => void
    const gate = new Promise<void>(resolve => { release = resolve })
    doubles.upsertHierarchy.mockImplementationOnce(async (values: any[]) => {
      await gate
      return { ok: true, data: values.map(published) }
    })

    const first = store.publishNota('root', true)
    const second = store.publishNota('root', true)
    await vi.waitFor(() => expect(doubles.upsertHierarchy).toHaveBeenCalledOnce())
    release()
    await expect(Promise.all([first, second])).resolves.toMatchObject([{ id: 'root' }, { id: 'root' }])
    expect(doubles.processNotaContent).toHaveBeenCalledTimes(4)
    expect(doubles.cleanup).not.toHaveBeenCalled()
  })

  it('queues a stronger concurrent hierarchy request behind a root-only publish', async () => {
    const store = hierarchyStore()
    let release!: () => void
    const gate = new Promise<void>(resolve => { release = resolve })
    doubles.upsertHierarchy.mockImplementationOnce(async (values: any[]) => {
      await gate
      return { ok: true, data: values.map(published) }
    })

    const rootOnly = store.publishNota('root', false)
    const withDescendants = store.publishNota('root', true)
    await vi.waitFor(() => expect(doubles.upsertHierarchy).toHaveBeenCalledOnce())
    release()

    await expect(Promise.all([rootOnly, withDescendants])).resolves.toMatchObject([
      { id: 'root' },
      { id: 'root' },
    ])
    expect(doubles.upsertHierarchy).toHaveBeenCalledTimes(2)
    expect(doubles.upsertHierarchy.mock.calls[0][0]).toHaveLength(1)
    expect(doubles.upsertHierarchy.mock.calls[1][0].map((value: any) => value.id)).toEqual([
      'root',
      'child-b',
      'grandchild',
      'child-a',
    ])
  })

  it('surfaces incomplete image cleanup instead of claiming an atomic failure', async () => {
    const store = hierarchyStore()
    doubles.upsertHierarchy.mockResolvedValueOnce({ ok: false, error: new CloudError('conflict', 'injected commit failure') })
    doubles.cleanup.mockRejectedValueOnce(new Error('injected cleanup failure'))

    await expect(store.publishNota('root', true)).rejects.toThrow(/cleanup was incomplete.*injected commit failure.*injected cleanup failure/)
    expect(store.publishedNotas).toEqual([])
    expect(store.items.every(item => !item.isPublished)).toBe(true)
  })

  it('reconciles a committed hierarchy after its RPC response is lost', async () => {
    const store = hierarchyStore()
    let committed: any[] = []
    doubles.upsertHierarchy.mockImplementationOnce(async (values: any[]) => {
      committed = values
      return { ok: false, error: new CloudError('unavailable', 'response lost after commit') }
    })
    doubles.getPublication.mockImplementation(async (id: string) => ({
      ok: true,
      data: published(committed.find(value => value.id === id)),
    }))

    await expect(store.publishNota('root', true)).resolves.toMatchObject({ id: 'root' })
    expect(doubles.getPublication).toHaveBeenCalledTimes(4)
    expect(doubles.cleanup).not.toHaveBeenCalled()
    expect(store.items.every(item => item.isPublished)).toBe(true)
  })

  it('retains images and reports an indeterminate outcome when reconciliation is unavailable', async () => {
    const store = hierarchyStore()
    doubles.upsertHierarchy.mockResolvedValueOnce({
      ok: false,
      error: new CloudError('unavailable', 'response lost after possible commit'),
    })
    doubles.getPublication.mockResolvedValueOnce({
      ok: false,
      error: new CloudError('unavailable', 'reconciliation unavailable'),
    })

    await expect(store.publishNota('root', true)).rejects.toThrow(/outcome is indeterminate.*images were retained/i)
    expect(doubles.cleanup).not.toHaveBeenCalled()
    expect(store.publishedNotas).toEqual([])
    expect(store.items.every(item => !item.isPublished)).toBe(true)
  })

  it('does not accept stale publication metadata as reconciliation evidence', async () => {
    const store = hierarchyStore()
    let attempted: any[] = []
    doubles.upsertHierarchy.mockImplementationOnce(async (values: any[]) => {
      attempted = values
      return { ok: false, error: new CloudError('unavailable', 'request did not commit') }
    })
    doubles.getPublication.mockImplementation(async (id: string) => ({
      ok: true,
      data: published({
        ...attempted.find(value => value.id === id),
        authorName: 'Stale Author',
      }),
    }))

    await expect(store.publishNota('root', true)).rejects.toThrow('request did not commit')
    expect(doubles.cleanup).toHaveBeenCalledOnce()
    expect(store.publishedNotas).toEqual([])
    expect(store.items.every(item => !item.isPublished)).toBe(true)
  })

  it('does not delete images after the remote hierarchy has committed', async () => {
    const store = hierarchyStore()
    doubles.upsertHierarchy.mockResolvedValueOnce({ ok: true, data: [] })

    await expect(store.publishNota('root', true)).rejects.toThrow('response was incomplete')
    expect(doubles.cleanup).not.toHaveBeenCalled()
    expect(store.publishedNotas).toEqual([])
    expect(store.items.every(item => !item.isPublished)).toBe(true)
  })

  it('unpublishes a published nota before local nota deletion and schedules bounded cleanup', async () => {
    const store = hierarchyStore()
    store.publishedNotas = ['root']
    store.items[0].isPublished = true
    doubles.getPublication.mockResolvedValueOnce({ ok: true, data: published({
      id: 'root', publishedSubPages: [], content: { type: 'doc' },
    }) })

    await store.deleteItem('root')

    expect(doubles.deletePublication).toHaveBeenCalledWith('root')
    expect(store.items.find(item => item.id === 'root')).toBeUndefined()
    expect(doubles.cleanupOrphans).toHaveBeenCalledOnce()
  })

  it('unpublishes a recursive hierarchy once before deleting its local descendants', async () => {
    const store = hierarchyStore()
    store.publishedNotas = ['root', 'child-b', 'grandchild']
    for (const item of store.items) item.isPublished = store.publishedNotas.includes(item.id)
    doubles.getPublication.mockResolvedValueOnce({ ok: true, data: published({
      id: 'root', publishedSubPages: ['child-b'], content: { type: 'doc' },
    }) })

    await store.deleteItem('root')

    expect(doubles.deletePublication).toHaveBeenCalledOnce()
    expect(doubles.deletePublication).toHaveBeenCalledWith('root')
    expect(store.items).toEqual([])
    expect(store.publishedNotas).toEqual([])
  })
})
