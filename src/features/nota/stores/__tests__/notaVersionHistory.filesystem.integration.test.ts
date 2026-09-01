import 'fake-indexeddb/auto'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { db } from '@/db'
import { useBlockEditor } from '@/features/nota/composables/useBlockEditor'
import { useBlockStore } from '@/features/nota/stores/blockStore'
import { useNotaStore } from '@/features/nota/stores/nota'
import type { Nota } from '@/features/nota/types/nota'
import {
  createDatabaseAdapterForBackend,
  installDatabaseAdapter,
} from '@/services/databaseAdapter'
import { FileSystemBackend, InMemoryFileSystemMutationLocks } from '@/services/fileSystemBackend'
import { IndexedDBBackend } from '@/services/storageService'

class PausableMutationLocks extends InMemoryFileSystemMutationLocks {
  private gate?: { entered: () => void; released: Promise<void> }

  pauseNext(): { entered: Promise<void>; release: () => void } {
    let markEntered!: () => void
    let release!: () => void
    const entered = new Promise<void>((resolve) => { markEntered = resolve })
    const released = new Promise<void>((resolve) => { release = resolve })
    this.gate = { entered: markEntered, released }
    return { entered, release }
  }

  override request<T>(name: string, mutation: () => Promise<T>): Promise<T> {
    return super.request(name, async () => {
      const gate = this.gate
      if (gate) {
        this.gate = undefined
        gate.entered()
        await gate.released
      }
      return mutation()
    })
  }
}

class MemoryFileSystem {
  files = new Map<string, string>()
  handle = { name: 'version-history-files' } as any

  constructor() {
    this.handle.getFileHandle = async (name: string, options?: { create?: boolean }) => {
      if (!this.files.has(name) && !options?.create) throw new DOMException('missing', 'NotFoundError')
      if (!this.files.has(name)) this.files.set(name, '')
      return {
        getFile: async () => ({ text: async () => this.files.get(name) ?? '' }),
        createWritable: async () => {
          let staged = this.files.get(name) ?? ''
          return {
            write: async (value: string) => { staged = value },
            close: async () => { this.files.set(name, staged) },
            abort: async () => undefined,
          }
        },
      }
    }
    this.handle.removeEntry = async (name: string) => { this.files.delete(name) }
  }
}

const notaId = 'filesystem-version-history'
const initialBody = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'file body before edit' }] }] }
const editedBody = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'live edited body' }] }] }

describe('real filesystem version history persistence', () => {
  let backend: FileSystemBackend
  let memory: MemoryFileSystem
  let locks: PausableMutationLocks

  beforeEach(async () => {
    db.close()
    await db.delete()
    await db.open()
    setActivePinia(createPinia())
    memory = new MemoryFileSystem()
    locks = new PausableMutationLocks()
    backend = new FileSystemBackend(undefined, locks)
    ;(backend as any).directoryHandle = memory.handle
    ;(backend as any).initialized = true
    installDatabaseAdapter(createDatabaseAdapterForBackend(backend))
    localStorage.setItem('bashnota-storage-mode', JSON.stringify({ mode: 'filesystem' }))
  })

  afterEach(async () => {
    localStorage.removeItem('bashnota-storage-mode')
    const indexedDBBackend = new IndexedDBBackend()
    await indexedDBBackend.initialize()
    installDatabaseAdapter(createDatabaseAdapterForBackend(indexedDBBackend, true))
    db.close()
    await db.delete()
  })

  it('keeps the live edited body authoritative through save and filesystem reload', async () => {
    const nota: Nota = {
      id: notaId,
      title: 'Filesystem version',
      parentId: null,
      tags: [],
      createdAt: new Date('2026-09-01T10:00:00.000Z'),
      updatedAt: new Date('2026-09-01T10:00:00.000Z'),
      versions: [],
    }
    await db.notas.put(nota)
    const notaStore = useNotaStore()
    notaStore.items = [nota]
    await useBlockStore().importTiptapContent(notaId, initialBody)
    await backend.writeNota(nota)

    const editorBridge = useBlockEditor(notaId)
    const saved = await notaStore.saveNotaVersion({
      id: notaId,
      versionName: 'Edited filesystem snapshot',
      createdAt: new Date('2026-09-01T10:01:00.000Z'),
      prepareCanonical: () => editorBridge.syncContentForVersion(editedBody),
    })

    const document = await backend.readNotaDocument(notaId)
    expect(document?.canonicalContent.blocks).toContainEqual(expect.objectContaining({
      proseMirrorNode: expect.objectContaining({ value: editedBody.content[0] }),
    }))
    expect(document?.nota.versions?.map((version) => version.id)).toEqual([saved.id])
    expect(document?.nota.versions?.[0].canonicalContent).toEqual(saved.canonicalContent)

    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) await table.clear()
    })
    setActivePinia(createPinia())
    const reloadedNota = await backend.readNota(notaId)
    expect(reloadedNota?.versions?.map((version) => version.id)).toEqual([saved.id])
    const reloadedBlocks = useBlockStore()
    await reloadedBlocks.loadNotaBlocks(notaId, reloadedNota ?? undefined)
    expect(reloadedBlocks.getTiptapContent(notaId)).toEqual(editedBody)
  })

  it('serializes two backend instances that both append from the same file generation', async () => {
    const nota: Nota = {
      id: notaId,
      title: 'Original title',
      parentId: null,
      tags: [],
      createdAt: new Date('2026-09-01T10:00:00.000Z'),
      updatedAt: new Date('2026-09-01T10:00:00.000Z'),
      versions: [{
        id: 'base-version', notaId, versionName: 'Base', createdAt: new Date('2026-09-01T10:00:00.000Z'),
        nota: { id: notaId, title: 'Original title', parentId: null, tags: [], createdAt: new Date('2026-09-01T10:00:00.000Z'), updatedAt: new Date('2026-09-01T10:00:00.000Z') },
      }],
    }
    await db.notas.put(nota)
    await useBlockStore().importTiptapContent(notaId, initialBody)
    await backend.writeNota(nota)
    const otherTab = new FileSystemBackend(undefined, locks)
    ;(otherTab as any).directoryHandle = memory.handle
    ;(otherTab as any).initialized = true
    const [observedA, observedB] = await Promise.all([
      backend.readNotaDocument(notaId),
      otherTab.readNotaDocument(notaId),
    ])
    const append = (id: string) => ({
      id, notaId, versionName: id, createdAt: new Date('2026-09-01T10:01:00.000Z'),
      nota: { id: notaId, title: 'Original title', parentId: null, tags: [], createdAt: new Date('2026-09-01T10:00:00.000Z'), updatedAt: new Date('2026-09-01T10:01:00.000Z') },
    })

    const results = await Promise.allSettled([
      backend.writeNotaIfDocumentUnchanged(
        { ...observedA.nota, versions: [...(observedA.nota.versions ?? []), append('tab-a')] },
        observedA.revision ?? observedA.exportedAt,
      ),
      otherTab.writeNotaIfDocumentUnchanged(
        { ...observedB.nota, versions: [...(observedB.nota.versions ?? []), append('tab-b')] },
        observedB.revision ?? observedB.exportedAt,
      ),
    ])

    const committedIndex = results.findIndex((result) => result.status === 'fulfilled')
    const rejectedIndex = results.findIndex((result) => result.status === 'rejected')
    expect(committedIndex).toBeGreaterThanOrEqual(0)
    expect(rejectedIndex).toBeGreaterThanOrEqual(0)
    expect(committedIndex).not.toBe(rejectedIndex)
    expect((results[rejectedIndex] as PromiseRejectedResult).reason).toEqual(expect.objectContaining({
      message: expect.stringContaining('changed in another tab'),
    }))
    const finalIds = (await backend.readNotaDocument(notaId)).nota.versions?.map((version) => version.id)
    expect(finalIds).toHaveLength(2)
    expect(finalIds).toContain('base-version')
    expect(finalIds).toContain(committedIndex === 0 ? 'tab-a' : 'tab-b')
    expect(finalIds).not.toContain(rejectedIndex === 0 ? 'tab-a' : 'tab-b')
  })

  it('preserves a guarded history append when a stale normal autosave waits on its lock', async () => {
    const baseVersion = {
      id: 'base-version', notaId, versionName: 'Base', createdAt: new Date('2026-09-01T10:00:00.000Z'),
      nota: { id: notaId, title: 'Original title', parentId: null, tags: [], createdAt: new Date('2026-09-01T10:00:00.000Z'), updatedAt: new Date('2026-09-01T10:00:00.000Z') },
    }
    const nota: Nota = {
      id: notaId,
      title: 'Original title',
      parentId: null,
      tags: [],
      createdAt: new Date('2026-09-01T10:00:00.000Z'),
      updatedAt: new Date('2026-09-01T10:00:00.000Z'),
      versions: [baseVersion],
    }
    await db.notas.put(nota)
    const blocks = useBlockStore()
    await blocks.importTiptapContent(notaId, initialBody)
    await backend.writeNota(nota)

    const otherTab = new FileSystemBackend(undefined, locks)
    ;(otherTab as any).directoryHandle = memory.handle
    ;(otherTab as any).initialized = true
    const generationZero = await backend.readNotaDocument(notaId)
    const committedVersion = {
      id: 'guarded-version', notaId, versionName: 'Guarded', createdAt: new Date('2026-09-01T10:01:00.000Z'),
      nota: { id: notaId, title: 'Original title', parentId: null, tags: [], createdAt: new Date('2026-09-01T10:00:00.000Z'), updatedAt: new Date('2026-09-01T10:01:00.000Z') },
    }
    const staleAutosave: Nota = {
      ...structuredClone(generationZero.nota),
      title: 'Autosaved title',
      updatedAt: new Date('2026-09-01T10:02:00.000Z'),
    }
    await blocks.importTiptapContent(notaId, editedBody)

    const gate = locks.pauseNext()
    const historyWrite = backend.writeNotaIfDocumentUnchanged(
      { ...generationZero.nota, versions: [...(generationZero.nota.versions ?? []), committedVersion] },
      generationZero.revision ?? generationZero.exportedAt,
    )
    await gate.entered
    const autosave = otherTab.writeNota(staleAutosave)
    gate.release()
    await expect(Promise.all([historyWrite, autosave])).resolves.toEqual([undefined, undefined])

    const finalDocument = await backend.readNotaDocument(notaId)
    expect(finalDocument.nota.title).toBe('Autosaved title')
    expect(finalDocument.nota.versions?.map((version) => version.id)).toEqual([
      'base-version',
      'guarded-version',
    ])
    expect(finalDocument.canonicalContent.blocks).toContainEqual(expect.objectContaining({
      proseMirrorNode: expect.objectContaining({ value: editedBody.content[0] }),
    }))
  })
})
