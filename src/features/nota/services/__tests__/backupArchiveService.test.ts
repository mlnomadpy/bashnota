import 'fake-indexeddb/auto'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, describe, expect, it } from 'vitest'
import { db } from '@/db'
import { useBlockStore } from '@/features/nota/stores/blockStore'
import { useNotaStore } from '@/features/nota/stores/nota'
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  BLOCK_TABLES,
  BackupArchiveError,
  createBackupArchive,
  restoreBackupArchive,
  validateBackupArchive,
  type BackupRow,
  type BashNotaBackupArchive,
  type BlockTableName,
} from '../backupArchiveService'

class MemoryTable {
  rows: BackupRow[]
  failBulkAdd = false

  constructor(rows: BackupRow[] = []) {
    this.rows = structuredClone(rows)
  }

  async toArray() { return structuredClone(this.rows) }
  async count() { return this.rows.length }
  async bulkAdd(rows: BackupRow[]) {
    if (this.failBulkAdd) throw new Error('injected typed-row write failure')
    this.rows.push(...structuredClone(rows))
  }
}

class MemoryDatabase {
  notas = new MemoryTable()
  blockStructures = new MemoryTable()
  transactionCalls = 0
  failCommit = false

  constructor() {
    for (const tableName of Object.keys(BLOCK_TABLES) as BlockTableName[]) {
      ;(this as any)[tableName] = new MemoryTable()
    }
  }

  async transaction(_mode: string, tables: MemoryTable[], callback: () => Promise<unknown>) {
    this.transactionCalls++
    const snapshots = tables.map((table) => structuredClone(table.rows))
    try {
      const result = await callback()
      if (this.failCommit) throw new Error('injected transaction commit failure')
      return result
    } catch (error) {
      tables.forEach((table, index) => { table.rows = snapshots[index] })
      throw error
    }
  }
}

const timestamp = '2026-08-19T12:00:00.000Z'

function typedPayload(type: string): BackupRow {
  switch (type) {
    case 'text': return { content: 'text' }
    case 'heading': return { level: 2, content: 'heading' }
    case 'code':
    case 'executableCodeBlock': return { language: 'python', content: 'print(1)' }
    case 'math': return { latex: 'x^2' }
    case 'table': return { headers: ['A'], rows: [['1']] }
    case 'image': return { src: 'data:image/png;base64,AA==' }
    case 'quote': return { content: 'quote' }
    case 'list': return { listType: 'ordered', items: ['one'] }
    case 'youtube': return { videoId: 'video' }
    case 'drawio': return { diagramData: '<mxfile />' }
    case 'citation': return { citationKey: 'key', citationData: { title: 'Paper' } }
    case 'bibliography': return { citations: ['key'] }
    case 'subfigure': return { images: [{ src: 'image.png' }], layout: 'grid' }
    case 'notaTable': return { tableData: [{ id: 1 }], columns: ['id'] }
    case 'aiGeneration': return { prompt: 'prompt', generatedContent: 'answer', timestamp }
    case 'theorem': return { title: 'Theorem', content: 'Statement' }
    case 'pipeline': return { title: 'Pipeline', nodes: [], edges: [] }
    case 'mermaid': return { content: 'graph TD' }
    case 'subNotaLink': return { targetNotaId: 'root', targetNotaTitle: 'Root' }
    default: return {}
  }
}

function seededDatabase(): MemoryDatabase {
  const database = new MemoryDatabase()
  database.notas.rows = [
    {
      id: 'root', title: 'Root', blockStructureId: 1, parentId: null, tags: ['backup'],
      createdAt: timestamp, updatedAt: timestamp,
      citations: [{
        id: 'citation-1', key: 'key', title: 'Paper', authors: ['Author'], year: '2026',
        journal: 'Journal', createdAt: timestamp,
      }],
      versions: [{
        id: 'version-1', notaId: 'root', versionName: 'First', createdAt: timestamp,
        nota: {
          id: 'root', title: 'Earlier', parentId: null, tags: [],
          createdAt: timestamp, updatedAt: timestamp,
        },
        canonicalContent: {
          format: 'normalized-blocks-v1', structureVersion: 1, capturedAt: timestamp,
          blockOrder: ['text:history'],
          blocks: [{
            id: 'history', type: 'text', notaId: 'root', order: 0, version: 1,
            createdAt: timestamp, updatedAt: timestamp, content: 'historical text',
          }],
        },
      }],
    },
    {
      id: 'child', title: 'Child', blockStructureId: 'structure-child', parentId: 'root',
      tags: [], createdAt: timestamp, updatedAt: timestamp,
    },
  ]

  const rootOrder: string[] = []
  for (const [tableName, type] of Object.entries(BLOCK_TABLES) as [BlockTableName, string][]) {
    const notaId = type === 'subNotaLink' ? 'child' : 'root'
    const id = type === 'heading' ? 'legacy-heading' : 1
    const row: BackupRow = {
      id,
      type,
      notaId,
      order: notaId === 'root' ? rootOrder.length : 0,
      version: 1,
      createdAt: new Date(timestamp),
      updatedAt: new Date(timestamp),
      payload: { tableName, preserved: true },
      ...typedPayload(type),
    }
    if (type === 'aiGeneration') row.timestamp = new Date(timestamp)
    ;(database as any)[tableName].rows = [row]
    if (notaId === 'root') rootOrder.push(`${type}:${String(id)}`)
  }
  database.blockStructures.rows = [
    { id: 1, notaId: 'root', blockOrder: rootOrder, version: 7, lastModified: new Date(timestamp) },
    { id: 'structure-child', notaId: 'child', blockOrder: ['subNotaLink:1'], version: 2, lastModified: new Date(timestamp) },
  ]
  return database
}

function minimalArchive(): BashNotaBackupArchive {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: timestamp,
    notas: [{ id: 'only', title: 'Only', parentId: null, tags: [], createdAt: timestamp, updatedAt: timestamp }],
    blockStructures: [],
    blocks: Object.fromEntries(
      Object.keys(BLOCK_TABLES).map((tableName) => [tableName, []]),
    ) as unknown as BashNotaBackupArchive['blocks'],
  }
}

function semanticArchive(archive: BashNotaBackupArchive): BashNotaBackupArchive {
  const normalized = structuredClone(archive)
  normalized.notas.sort((a, b) => String(a.id).localeCompare(String(b.id)))
  normalized.blockStructures.sort((a, b) => String(a.notaId).localeCompare(String(b.notaId)))
  for (const rows of Object.values(normalized.blocks)) {
    rows.sort((a, b) => `${typeof a.id}:${String(a.id)}`.localeCompare(`${typeof b.id}:${String(b.id)}`))
  }
  return normalized
}

describe('canonical BashNota backup archive', () => {
  afterEach(async () => {
    db.close()
    await db.delete()
  })

  it('round-trips hierarchy, versions, canonical order, and payloads from all 22 typed tables', async () => {
    const source = seededDatabase()
    const archive = await createBackupArchive(source as any)

    expect(Object.keys(archive.blocks)).toEqual(Object.keys(BLOCK_TABLES))
    expect(archive.notas[0].versions).toHaveLength(1)
    expect(archive.notas[1].parentId).toBe('root')
    for (const [tableName, rows] of Object.entries(archive.blocks)) {
      expect(rows).toHaveLength(1)
      expect(rows[0].payload).toEqual({ tableName, preserved: true })
    }

    const restored = new MemoryDatabase()
    await restoreBackupArchive(archive, () => undefined, restored as any)
    const reloaded = await createBackupArchive(restored as any)

    expect({ ...reloaded, exportedAt: archive.exportedAt }).toEqual(archive)
  })

  it('validates the complete archive before starting a transaction', async () => {
    const database = new MemoryDatabase()
    const malformed = minimalArchive()
    delete (malformed.blocks as Partial<typeof malformed.blocks>).mermaidBlocks

    await expect(restoreBackupArchive(malformed, () => undefined, database as any))
      .rejects.toThrow('blocks.mermaidBlocks must be an array')
    expect(database.transactionCalls).toBe(0)
    expect(database.notas.rows).toEqual([])
  })

  it('rejects malformed metadata, structure keys, and historical canonical content before mutation', async () => {
    const valid = await createBackupArchive(seededDatabase() as any)
    const mutations: Array<[string, (archive: BashNotaBackupArchive) => void]> = [
      ['notas[0].title', (archive) => { archive.notas[0].title = 42 }],
      ['notas[0].createdAt', (archive) => { archive.notas[0].createdAt = 'not-a-date' }],
      ['notas[0].versions[0].notaId', (archive) => {
        ;((archive.notas[0].versions as BackupRow[])[0]).notaId = 'child'
      }],
      ['canonicalContent.structureVersion', (archive) => {
        const version = (archive.notas[0].versions as BackupRow[])[0]
        ;(version.canonicalContent as BackupRow).structureVersion = 0
      }],
      ['blockStructureId', (archive) => { archive.notas[0].blockStructureId = 'wrong-key' }],
      ['blockStructures[0].id', (archive) => { archive.blockStructures[0].id = Number.NaN }],
    ]

    for (const [expectedPath, mutate] of mutations) {
      const malformed = structuredClone(valid)
      mutate(malformed)
      const database = new MemoryDatabase()
      await expect(restoreBackupArchive(malformed, () => undefined, database as any))
        .rejects.toThrow(expectedPath)
      expect(database.transactionCalls).toBe(0)
    }
  })

  it('keeps numeric and string primary keys distinct during validation and restore', async () => {
    const archive = await createBackupArchive(seededDatabase() as any)
    archive.blocks.textBlocks.push({
      id: '1', type: 'text', notaId: 'child', order: 1, version: 1,
      createdAt: timestamp, updatedAt: timestamp, content: 'legacy string key',
    })
    archive.blockStructures[1].blockOrder = ['subNotaLink:1', 'text:1']
    const restored = new MemoryDatabase()

    await restoreBackupArchive(archive, () => undefined, restored as any)

    expect((restored as any).textBlocks.rows.map((row: BackupRow) => [row.id, typeof row.id])).toEqual([
      [1, 'number'],
      ['1', 'string'],
    ])
  })

  it('rejects broken hierarchy and canonical block references', () => {
    const missingParent = minimalArchive()
    missingParent.notas[0].parentId = 'absent'
    expect(() => validateBackupArchive(missingParent)).toThrow('refers to missing parent')

    const orphanedBlock = minimalArchive()
    orphanedBlock.blocks.textBlocks.push({
      id: 1, type: 'text', notaId: 'only', order: 0, version: 1,
      createdAt: timestamp, updatedAt: timestamp, content: 'lost',
    })
    expect(() => validateBackupArchive(orphanedBlock)).toThrow('has blocks but no block structure')
  })

  it('rolls back nota metadata, structures, typed rows, and staged Pinia state on write failure', async () => {
    const archive = await createBackupArchive(seededDatabase() as any)
    const database = new MemoryDatabase()
    ;((database as any).pipelineBlocks as MemoryTable).failBulkAdd = true
    const pinia = { notas: ['before'], blocks: ['before'] }

    await expect(restoreBackupArchive(
      archive,
      () => { pinia.notas = ['imported']; pinia.blocks = ['imported'] },
      database as any,
      () => { pinia.notas = ['before']; pinia.blocks = ['before'] },
    )).rejects.toThrow('injected typed-row write failure')

    expect(database.notas.rows).toEqual([])
    expect(database.blockStructures.rows).toEqual([])
    for (const tableName of Object.keys(BLOCK_TABLES) as BlockTableName[]) {
      expect((database as any)[tableName].rows).toEqual([])
    }
    expect(pinia).toEqual({ notas: ['before'], blocks: ['before'] })
  })

  it('rolls back database and Pinia when the transaction fails after Pinia is staged', async () => {
    const archive = await createBackupArchive(seededDatabase() as any)
    const database = new MemoryDatabase()
    database.failCommit = true
    let piniaState = 'before'

    await expect(restoreBackupArchive(
      archive,
      () => { piniaState = 'imported' },
      database as any,
      () => { piniaState = 'before' },
    )).rejects.toThrow('injected transaction commit failure')

    expect(database.notas.rows).toEqual([])
    expect(piniaState).toBe('before')
  })

  it('refuses to merge a backup into a non-empty database', async () => {
    const database = new MemoryDatabase()
    database.notas.rows = [{ id: 'existing' }]
    await expect(restoreBackupArchive(minimalArchive(), () => undefined, database as any))
      .rejects.toBeInstanceOf(BackupArchiveError)
    expect(database.notas.rows).toEqual([{ id: 'existing' }])
  })

  it('restores production Dexie and survives a fresh Pinia reload with exact canonical semantics', async () => {
    const archive = await createBackupArchive(seededDatabase() as any)
    db.close()
    await db.delete()
    await db.open()

    setActivePinia(createPinia())
    await useNotaStore().importAllNotas(archive)

    // Discard every staged in-memory object and prove the persisted archive via
    // the same fresh-store loading paths used after an application restart.
    setActivePinia(createPinia())
    const freshNotaStore = useNotaStore()
    const freshBlockStore = useBlockStore()
    await freshNotaStore.loadNotas()
    for (const nota of freshNotaStore.items) await freshBlockStore.loadNotaBlocks(nota.id, nota)

    expect(freshNotaStore.items.map(({ id, parentId }) => ({ id, parentId })).sort((a, b) => a.id.localeCompare(b.id))).toEqual([
      { id: 'child', parentId: 'root' },
      { id: 'root', parentId: null },
    ])
    const root = freshNotaStore.getItem('root')!
    expect(root.createdAt).toBeInstanceOf(Date)
    expect(root.updatedAt).toBeInstanceOf(Date)
    expect(root.citations?.[0].createdAt).toBeInstanceOf(Date)
    expect(root.versions?.[0].createdAt).toBeInstanceOf(Date)
    expect(root.versions?.[0].nota.createdAt).toBeInstanceOf(Date)
    expect(root.versions?.[0].canonicalContent?.blocks[0].content).toBe('historical text')
    expect(freshBlockStore.blocks.size).toBe(22)
    expect(freshBlockStore.blocks.get('heading:legacy-heading')?.id).toBe('legacy-heading')
    expect(freshBlockStore.blocks.get('text:1')?.id).toBe(1)
    expect((freshBlockStore.blocks.get('aiGeneration:1') as any)?.timestamp).toBeInstanceOf(Date)
    expect(freshBlockStore.getBlockStructure('root')?.id).toBe(1)
    expect(freshBlockStore.getBlockStructure('child')?.id).toBe('structure-child')

    const persisted = await createBackupArchive(db)
    expect(semanticArchive({ ...persisted, exportedAt: archive.exportedAt })).toEqual(semanticArchive(archive))
  })
})
