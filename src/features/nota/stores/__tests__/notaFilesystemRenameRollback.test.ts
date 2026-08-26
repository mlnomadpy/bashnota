import 'fake-indexeddb/auto'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Nota } from '@/features/nota/types/nota'

const authority = vi.hoisted(() => ({
  nota: {
    id: 'rename-me', title: 'Before', parentId: null, tags: [],
    createdAt: new Date('2026-08-26T12:00:00.000Z'),
    updatedAt: new Date('2026-08-26T12:00:00.000Z'),
  } as Nota,
  failWrite: false,
}))

vi.mock('@/services/databaseAdapter', () => ({
  useDatabaseAdapter: () => ({
    isUsingNewStorage: () => true,
    getStorageService: () => ({ getBackendType: () => 'filesystem' }),
    getAllNotas: async () => [structuredClone(authority.nota)],
    getNota: async () => structuredClone(authority.nota),
    saveNota: async (nota: Nota) => {
      if (authority.failWrite) throw new Error('injected filesystem rename failure')
      authority.nota = structuredClone(nota)
    },
  }),
}))

import { useNotaStore } from '@/features/nota/stores/nota'

describe('filesystem metadata rollback', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    authority.nota.title = 'Before'
    authority.failWrite = false
  })

  it('does not stage a renamed title in Pinia when the atomic file commit fails', async () => {
    const store = useNotaStore()
    await store.loadNotas()
    authority.failWrite = true

    await expect(store.renameItem('rename-me', 'After')).rejects.toThrow('injected filesystem rename failure')
    expect(store.getItem('rename-me')?.title).toBe('Before')
    expect(authority.nota.title).toBe('Before')
  })
})
