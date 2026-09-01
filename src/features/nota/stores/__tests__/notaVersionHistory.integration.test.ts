import 'fake-indexeddb/auto'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { db } from '@/db'
import { useBlockEditor } from '@/features/nota/composables/useBlockEditor'
import { useBlockStore } from '@/features/nota/stores/blockStore'
import { useNotaStore } from '@/features/nota/stores/nota'
import type { Nota } from '@/features/nota/types/nota'

const notaId = 'durable-version-history'

function documentWith(text: string) {
  return {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  }
}

function nota(): Nota {
  return {
    id: notaId,
    title: 'Durable history',
    parentId: null,
    tags: [],
    createdAt: new Date('2026-08-31T10:00:00.000Z'),
    updatedAt: new Date('2026-08-31T10:00:00.000Z'),
    versions: [],
  }
}

async function seed(content = documentWith('saved body')) {
  const seededNota = nota()
  await db.notas.put(seededNota)
  const notaStore = useNotaStore()
  notaStore.items = [seededNota]
  await useBlockStore().importTiptapContent(notaId, content)
  return notaStore
}

describe('Dexie-backed version history', () => {
  beforeEach(async () => {
    db.close()
    await db.delete()
    await db.open()
    setActivePinia(createPinia())
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    db.close()
    await db.delete()
  })

  it('survives delayed editor preparation, reloads, and restores its canonical body', async () => {
    const notaStore = await seed(documentWith('body in the version'))
    const editorBridge = useBlockEditor(notaId)

    const saved = await notaStore.saveNotaVersion({
      id: notaId,
      versionName: 'Durable snapshot',
      createdAt: new Date('2026-08-31T10:01:00.000Z'),
      prepareCanonical: async () => {
        // A non-IndexedDB await here reproduced Dexie's PrematureCommitError
        // when preparation incorrectly ran inside the history transaction.
        await new Promise<void>((resolve) => setTimeout(resolve, 0))
        return editorBridge.syncContentForVersion(documentWith('body in the version'))
      },
    })

    await editorBridge.syncContentToBlocks(documentWith('newer live body'))

    db.close()
    await db.open()
    setActivePinia(createPinia())
    const reloadedNotas = useNotaStore()
    await reloadedNotas.loadNotas()
    expect(reloadedNotas.getNotaVersions(notaId).map((version) => version.id)).toEqual([saved.id])

    await reloadedNotas.restoreVersion(notaId, saved.id)
    const reloadedBlocks = useBlockStore()
    await reloadedBlocks.loadNotaBlocks(notaId)
    expect(reloadedBlocks.getTiptapContent(notaId)).toEqual(documentWith('body in the version'))
  })

  it('rolls prepared canonical content and history back when the append fails', async () => {
    const notaStore = await seed(documentWith('body before failed save'))
    const editorBridge = useBlockEditor(notaId)
    const originalPut = db.notas.put.bind(db.notas)
    let puts = 0
    vi.spyOn(db.notas, 'put').mockImplementation((value) => {
      puts += 1
      // The live editor preparation persists current metadata first. Fail the
      // following version-history append, then permit compensation to commit.
      if (puts === 2) return Promise.reject(new Error('injected history append failure'))
      return originalPut(value)
    })

    await expect(notaStore.saveNotaVersion({
      id: notaId,
      versionName: 'Must not exist',
      createdAt: new Date('2026-08-31T10:02:00.000Z'),
      prepareCanonical: () => editorBridge.syncContentForVersion(documentWith('body prepared for failed save')),
    })).rejects.toThrow('No changes were committed')

    const persisted = await db.notas.get(notaId)
    expect(persisted?.versions).toEqual([])
    setActivePinia(createPinia())
    const reloadedBlocks = useBlockStore()
    await reloadedBlocks.loadNotaBlocks(notaId)
    expect(reloadedBlocks.getTiptapContent(notaId)).toEqual(documentWith('body before failed save'))
  })

  it('does not change in-memory history when a version deletion fails', async () => {
    const notaStore = await seed()
    const saved = await notaStore.saveNotaVersion({
      id: notaId,
      versionName: 'Keep after failure',
      createdAt: new Date('2026-08-31T10:03:00.000Z'),
    })
    vi.spyOn(db.notas, 'put').mockRejectedValueOnce(new Error('injected delete failure'))

    await expect(notaStore.deleteVersion(notaId, saved.id)).rejects.toThrow('injected delete failure')

    expect(notaStore.getNotaVersions(notaId).map((version) => version.id)).toEqual([saved.id])
    expect((await db.notas.get(notaId))?.versions?.map((version) => version.id)).toEqual([saved.id])
  })
})
