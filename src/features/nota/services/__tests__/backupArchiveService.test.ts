import { describe, expect, it } from 'vitest'
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
      id: 'root', title: 'Root', parentId: null, tags: ['backup'],
      createdAt: timestamp, updatedAt: timestamp,
      versions: [{
        id: 'version-1', notaId: 'root', versionName: 'First', createdAt: timestamp,
        nota: { id: 'root', title: 'Earlier', parentId: null, tags: [] },
        canonicalContent: { structureVersion: 1, blockOrder: ['text:1'], blocks: [] },
      }],
    },
    { id: 'child', title: 'Child', parentId: 'root', tags: [], createdAt: timestamp, updatedAt: timestamp },
  ]

  const rootOrder: string[] = []
  for (const [tableName, type] of Object.entries(BLOCK_TABLES) as [BlockTableName, string][]) {
    const notaId = type === 'subNotaLink' ? 'child' : 'root'
    const row: BackupRow = {
      id: 1,
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
    if (notaId === 'root') rootOrder.push(`${type}:1`)
  }
  database.blockStructures.rows = [
    { id: 1, notaId: 'root', blockOrder: rootOrder, version: 7, lastModified: new Date(timestamp) },
    { id: 2, notaId: 'child', blockOrder: ['subNotaLink:1'], version: 2, lastModified: new Date(timestamp) },
  ]
  return database
}

function minimalArchive(): BashNotaBackupArchive {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: timestamp,
    notas: [{ id: 'only', parentId: null, createdAt: timestamp, updatedAt: timestamp }],
    blockStructures: [],
    blocks: Object.fromEntries(
      Object.keys(BLOCK_TABLES).map((tableName) => [tableName, []]),
    ) as BashNotaBackupArchive['blocks'],
  }
}

describe('canonical BashNota backup archive', () => {
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
    ;(database.pipelineBlocks as MemoryTable).failBulkAdd = true
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
})
