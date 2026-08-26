import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '@/db'
import type { Nota } from '@/features/nota/types/nota'

const state = vi.hoisted(() => ({
  failWrite: false,
  restored: false,
  target: new Map<string, Nota>(),
  filesystemNotas: [] as Nota[],
}))

vi.mock('@/services/fileSystemBackend', () => ({
  FileSystemBackend: class {
    async setDirectoryHandle() {}
    async initialize() {}
    async snapshotDirectory() { return new Map([['existing.nota', 'before']]) }
    async restoreDirectory() { state.restored = true; state.target.clear() }
    async writeNota(nota: Nota) {
      if (state.failWrite && nota.id === 'child') throw new Error('injected migration write failure')
      state.target.set(nota.id, structuredClone(nota))
    }
    async listNotas() { return [...state.target.values()].map((nota) => structuredClone(nota)) }
  },
}))

vi.mock('@/services/databaseAdapter', () => ({
  useDatabaseAdapter: () => ({
    getAllNotas: async () => structuredClone(state.filesystemNotas),
  }),
}))

const timestamp = new Date('2026-08-26T12:00:00.000Z')
const root: Nota = { id: 'root', title: 'Root', parentId: null, tags: [], createdAt: timestamp, updatedAt: timestamp }
const child: Nota = { id: 'child', title: 'Child', parentId: 'root', tags: [], createdAt: timestamp, updatedAt: timestamp }

async function storageMode() {
  vi.resetModules()
  return (await import('@/composables/useStorageMode')).useStorageMode()
}

describe('verified storage authority switching', () => {
  beforeEach(async () => {
    db.close()
    await db.delete()
    await db.open()
    localStorage.setItem('bashnota-storage-mode', JSON.stringify({ mode: 'indexeddb', autoWatch: true }))
    state.failWrite = false
    state.restored = false
    state.target.clear()
    state.filesystemNotas = []
    vi.stubGlobal('showDirectoryPicker', async () => ({}))
    Object.defineProperty(window, 'showDirectoryPicker', { configurable: true, value: async () => ({}) })
  })

  afterEach(async () => {
    vi.unstubAllGlobals()
    db.close()
    await db.delete()
  })

  it('does not change authority and compensates the target when a filesystem write fails', async () => {
    await db.notas.bulkPut([root, child])
    state.failWrite = true
    const mode = await storageMode()

    await expect(mode.switchToFilesystem({} as FileSystemDirectoryHandle)).rejects.toThrow('injected migration')
    expect(state.restored).toBe(true)
    expect(mode.storageMode.value).toBe('indexeddb')
    expect(JSON.parse(localStorage.getItem('bashnota-storage-mode')!).mode).toBe('indexeddb')
    expect((await db.notas.toArray()).map((nota) => nota.id).sort()).toEqual(['child', 'root'])
  })

  it('changes to filesystem only after hierarchy verification succeeds', async () => {
    await db.notas.bulkPut([root, child])
    const mode = await storageMode()

    await mode.switchToFilesystem({} as FileSystemDirectoryHandle)
    expect(mode.storageMode.value).toBe('filesystem')
    expect([...state.target.values()].map(({ id, parentId }) => ({ id, parentId }))).toEqual([
      { id: 'child', parentId: 'root' },
      { id: 'root', parentId: null },
    ])
  })

  it('atomically replaces IndexedDB metadata before changing back from filesystem', async () => {
    await db.notas.put({ ...root, id: 'stale', title: 'Stale' })
    state.filesystemNotas = [root, child]
    localStorage.setItem('bashnota-storage-mode', JSON.stringify({ mode: 'filesystem', autoWatch: true }))
    const mode = await storageMode()

    await mode.switchToIndexedDB()
    expect(mode.storageMode.value).toBe('indexeddb')
    expect((await db.notas.toArray()).map((nota) => nota.id).sort()).toEqual(['child', 'root'])
  })
})
