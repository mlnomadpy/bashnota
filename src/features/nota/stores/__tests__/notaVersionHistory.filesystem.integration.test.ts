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
import { FileSystemBackend } from '@/services/fileSystemBackend'
import { IndexedDBBackend } from '@/services/storageService'

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

  beforeEach(async () => {
    db.close()
    await db.delete()
    await db.open()
    setActivePinia(createPinia())
    memory = new MemoryFileSystem()
    backend = new FileSystemBackend()
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

  it('rejects a stale filesystem history writer after another tab changes the document generation', async () => {
    const nota: Nota = {
      id: notaId,
      title: 'Original title',
      parentId: null,
      tags: [],
      createdAt: new Date('2026-09-01T10:00:00.000Z'),
      updatedAt: new Date('2026-09-01T10:00:00.000Z'),
      versions: [],
    }
    await db.notas.put(nota)
    await useBlockStore().importTiptapContent(notaId, initialBody)
    await backend.writeNota(nota)
    const observed = await backend.readNotaDocument(notaId)

    const externalDocument = structuredClone(observed)
    externalDocument.exportedAt = '2026-09-01T10:05:00.000Z'
    externalDocument.revision = 'external-generation'
    externalDocument.nota.title = 'Title from another tab'
    memory.files.set(`${notaId}.nota`, JSON.stringify(externalDocument))

    await expect(backend.writeNotaIfDocumentUnchanged(
      { ...nota, title: 'Stale local title' },
      observed.revision ?? observed.exportedAt,
    )).rejects.toThrow('changed in another tab')
    expect((await backend.readNotaDocument(notaId)).nota.title).toBe('Title from another tab')
  })
})
