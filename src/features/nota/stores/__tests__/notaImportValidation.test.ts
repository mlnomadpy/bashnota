import 'fake-indexeddb/auto'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { db } from '@/db'
import { useBlockStore } from '@/features/nota/stores/blockStore'
import { useNotaStore } from '@/features/nota/stores/nota'
import type { Nota } from '@/features/nota/types/nota'

const parentId = 'existing-parent'
const childId = 'existing-child'

function nota(id: string, title: string, parent: string | null): Nota {
  return {
    id,
    title,
    parentId: parent,
    tags: [],
    createdAt: new Date('2026-08-20T00:00:00.000Z'),
    updatedAt: new Date('2026-08-20T00:00:00.000Z'),
  }
}

const validDocument = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'unchanged' }] }],
}

const invalidDocuments = [
  { label: 'invalid cardinality', content: { type: 'doc', content: [] } },
  {
    label: 'undeclared attrs',
    content: { type: 'doc', content: [{ type: 'heading', attrs: { level: 2, injected: true } }] },
  },
  {
    label: 'unsafe URL',
    content: {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'bad', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] }],
      }],
    },
  },
]

class TestFileReader {
  onload: ((event: { target: { result: string } }) => void) | null = null
  onerror: ((error: unknown) => void) | null = null

  readAsText(file: { text(): Promise<string> }): void {
    file.text().then(
      (result) => this.onload?.({ target: { result } }),
      (error) => this.onerror?.(error),
    )
  }
}

function jsonFile(value: unknown): File {
  const text = JSON.stringify(value)
  return { text: async () => text } as File
}

async function stateSnapshot() {
  const notaStore = useNotaStore()
  const blockStore = useBlockStore()
  return JSON.parse(JSON.stringify({
    durableNotas: await db.notas.orderBy('id').toArray(),
    durableStructures: await db.blockStructures.orderBy('id').toArray(),
    durableBlocks: await db.getAllBlocksForNota(childId),
    piniaNotas: notaStore.items,
    piniaStructures: Array.from(blockStore.blockStructures.entries()),
    piniaBlocks: Array.from(blockStore.blocks.entries()),
  }))
}

beforeEach(async () => {
  await db.delete()
  await db.open()
  setActivePinia(createPinia())
  vi.stubGlobal('FileReader', TestFileReader)

  const parent = nota(parentId, 'Parent', null)
  const child = nota(childId, 'Child', parentId)
  await db.notas.bulkPut([parent, child])
  useNotaStore().items.push(parent, child)
  await useBlockStore().importTiptapContent(childId, validDocument)
})

afterEach(async () => {
  vi.unstubAllGlobals()
  await db.delete()
})

describe('nota import validates all inline editor content before mutation', () => {
  it.each(invalidDocuments)('leaves an existing nota unchanged for $label', async ({ content }) => {
    const before = await stateSnapshot()
    const result = await useNotaStore().importNotas(jsonFile({
      id: childId,
      title: 'MUTATED',
      parentId: null,
      tags: ['mutated'],
      createdAt: '2026-08-20T00:00:00.000Z',
      updatedAt: '2026-08-20T01:00:00.000Z',
      content,
    }))

    expect(result).toEqual([])
    expect(await stateSnapshot()).toEqual(before)
  })

  it.each(invalidDocuments)('leaves a bulk hierarchy unchanged for $label', async ({ content }) => {
    const before = await stateSnapshot()
    await expect(useNotaStore().importNotaWithSubNotas({
      nota: {
        id: 'incoming-root',
        title: 'Incoming root',
        parentId: null,
        tags: [],
        content: validDocument,
      },
      subnotas: [{
        id: 'incoming-child',
        title: 'Incoming child',
        parentId: 'incoming-root',
        tags: [],
        content,
      }],
    })).rejects.toThrow()

    expect(await stateSnapshot()).toEqual(before)
    expect(await db.notas.where('id').startsWith('incoming-').count()).toBe(0)
  })
})
