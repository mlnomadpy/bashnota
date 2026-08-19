import { db, type NotaDB } from '@/db'
import type { Nota } from '@/features/nota/types/nota'
import type { NotaBlockStructure } from '@/features/nota/types/blocks'

export const BACKUP_FORMAT = 'bashnota-backup' as const
export const BACKUP_VERSION = 1 as const

export const BLOCK_TABLES = {
  textBlocks: 'text',
  headingBlocks: 'heading',
  codeBlocks: 'code',
  mathBlocks: 'math',
  tableBlocks: 'table',
  imageBlocks: 'image',
  quoteBlocks: 'quote',
  listBlocks: 'list',
  horizontalRuleBlocks: 'horizontalRule',
  youtubeBlocks: 'youtube',
  drawIoBlocks: 'drawio',
  citationBlocks: 'citation',
  bibliographyBlocks: 'bibliography',
  subfigureBlocks: 'subfigure',
  notaTableBlocks: 'notaTable',
  aiGenerationBlocks: 'aiGeneration',
  executableCodeBlocks: 'executableCodeBlock',
  confusionMatrixBlocks: 'confusionMatrix',
  theoremBlocks: 'theorem',
  pipelineBlocks: 'pipeline',
  mermaidBlocks: 'mermaid',
  subNotaLinkBlocks: 'subNotaLink',
} as const

export type BlockTableName = keyof typeof BLOCK_TABLES
export type BackupRow = Record<string, unknown>

export interface BashNotaBackupArchive {
  format: typeof BACKUP_FORMAT
  version: typeof BACKUP_VERSION
  exportedAt: string
  notas: BackupRow[]
  blockStructures: BackupRow[]
  blocks: Record<BlockTableName, BackupRow[]>
}

export class BackupArchiveError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BackupArchiveError'
  }
}

type BackupDatabase = Pick<NotaDB, 'notas' | 'blockStructures' | 'transaction'> & {
  [K in BlockTableName]: NotaDB[K]
}

const blockTableNames = Object.keys(BLOCK_TABLES) as BlockTableName[]

function isRecord(value: unknown): value is BackupRow {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function assertRecordArray(value: unknown, path: string): asserts value is BackupRow[] {
  if (!Array.isArray(value)) throw new BackupArchiveError(`${path} must be an array.`)
  value.forEach((row, index) => {
    if (!isRecord(row)) throw new BackupArchiveError(`${path}[${index}] must be an object.`)
  })
}

function requiredString(row: BackupRow, field: string, path: string): string {
  const value = row[field]
  if (typeof value !== 'string' || value.length === 0) {
    throw new BackupArchiveError(`${path}.${field} must be a non-empty string.`)
  }
  return value
}

function validKey(value: unknown): value is string | number {
  return (typeof value === 'string' && value.length > 0)
    || (typeof value === 'number' && Number.isFinite(value))
}

function assertDate(value: unknown, path: string): void {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) {
    throw new BackupArchiveError(`${path} must be an ISO date string.`)
  }
}

function assertString(value: unknown, path: string): void {
  if (typeof value !== 'string') throw new BackupArchiveError(`${path} must be a string.`)
}

function assertStringArray(value: unknown, path: string): void {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new BackupArchiveError(`${path} must be an array of strings.`)
  }
}

function validateTypedPayload(row: BackupRow, path: string): void {
  switch (row.type) {
    case 'text':
      if (typeof row.content !== 'string' && !Array.isArray(row.content)) throw new BackupArchiveError(`${path}.content must be text or inline content.`)
      break
    case 'heading':
      if (!Number.isInteger(row.level)) throw new BackupArchiveError(`${path}.level must be an integer.`)
      assertString(row.content, `${path}.content`)
      break
    case 'code':
    case 'executableCodeBlock':
      assertString(row.language, `${path}.language`)
      assertString(row.content, `${path}.content`)
      break
    case 'math': assertString(row.latex, `${path}.latex`); break
    case 'table':
      assertStringArray(row.headers, `${path}.headers`)
      if (!Array.isArray(row.rows) || row.rows.some((cells) => !Array.isArray(cells) || cells.some((cell) => typeof cell !== 'string'))) {
        throw new BackupArchiveError(`${path}.rows must be an array of string arrays.`)
      }
      break
    case 'image': assertString(row.src, `${path}.src`); break
    case 'quote': assertString(row.content, `${path}.content`); break
    case 'list':
      if (!['ordered', 'unordered', 'task'].includes(row.listType as string)) throw new BackupArchiveError(`${path}.listType is invalid.`)
      assertStringArray(row.items, `${path}.items`)
      break
    case 'youtube': assertString(row.videoId, `${path}.videoId`); break
    case 'drawio': assertString(row.diagramData, `${path}.diagramData`); break
    case 'citation':
      assertString(row.citationKey, `${path}.citationKey`)
      if (row.citationData === undefined) throw new BackupArchiveError(`${path}.citationData is required.`)
      break
    case 'bibliography': assertStringArray(row.citations, `${path}.citations`); break
    case 'subfigure':
      if (!Array.isArray(row.images) || row.images.some((image) => !isRecord(image) || typeof image.src !== 'string')) {
        throw new BackupArchiveError(`${path}.images must contain image objects with src values.`)
      }
      if (!['horizontal', 'vertical', 'grid'].includes(row.layout as string)) throw new BackupArchiveError(`${path}.layout is invalid.`)
      break
    case 'notaTable':
      if (!Array.isArray(row.tableData)) throw new BackupArchiveError(`${path}.tableData must be an array.`)
      assertStringArray(row.columns, `${path}.columns`)
      break
    case 'aiGeneration':
      assertString(row.prompt, `${path}.prompt`)
      assertString(row.generatedContent, `${path}.generatedContent`)
      assertDate(row.timestamp, `${path}.timestamp`)
      break
    case 'theorem':
      assertString(row.title, `${path}.title`)
      assertString(row.content, `${path}.content`)
      break
    case 'pipeline':
      assertString(row.title, `${path}.title`)
      if (!Array.isArray(row.nodes) || !Array.isArray(row.edges)) throw new BackupArchiveError(`${path}.nodes and .edges must be arrays.`)
      break
    case 'mermaid': assertString(row.content, `${path}.content`); break
    case 'subNotaLink':
      assertString(row.targetNotaId, `${path}.targetNotaId`)
      assertString(row.targetNotaTitle, `${path}.targetNotaTitle`)
      break
    case 'horizontalRule':
    case 'confusionMatrix':
      break
  }
}

function jsonClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

/** Validate the complete archive and all cross-table references without mutation. */
export function validateBackupArchive(input: unknown): BashNotaBackupArchive {
  if (!isRecord(input)) throw new BackupArchiveError('The selected file is not a BashNota backup object.')
  if (input.format !== BACKUP_FORMAT) {
    throw new BackupArchiveError(`Unsupported backup format. Expected "${BACKUP_FORMAT}".`)
  }
  if (input.version !== BACKUP_VERSION) {
    throw new BackupArchiveError(`Unsupported backup version ${String(input.version)}. Expected version ${BACKUP_VERSION}.`)
  }
  assertDate(input.exportedAt, 'exportedAt')
  assertRecordArray(input.notas, 'notas')
  assertRecordArray(input.blockStructures, 'blockStructures')
  if (!isRecord(input.blocks)) throw new BackupArchiveError('blocks must be an object containing all typed block tables.')

  const notaIds = new Set<string>()
  input.notas.forEach((nota, index) => {
    const id = requiredString(nota, 'id', `notas[${index}]`)
    if (notaIds.has(id)) throw new BackupArchiveError(`Duplicate nota id "${id}".`)
    notaIds.add(id)
    if (nota.parentId !== null && nota.parentId !== undefined && typeof nota.parentId !== 'string') {
      throw new BackupArchiveError(`notas[${index}].parentId must be a string or null.`)
    }
  })

  const parents = new Map<string, string>()
  input.notas.forEach((nota) => {
    const id = nota.id as string
    if (typeof nota.parentId === 'string') {
      if (!notaIds.has(nota.parentId)) {
        throw new BackupArchiveError(`Nota "${id}" refers to missing parent "${nota.parentId}".`)
      }
      parents.set(id, nota.parentId)
    }
  })
  for (const id of notaIds) {
    const seen = new Set<string>([id])
    let parent = parents.get(id)
    while (parent) {
      if (seen.has(parent)) throw new BackupArchiveError(`Nota hierarchy contains a cycle at "${parent}".`)
      seen.add(parent)
      parent = parents.get(parent)
    }
  }

  const structures = new Map<string, BackupRow>()
  input.blockStructures.forEach((structure, index) => {
    const path = `blockStructures[${index}]`
    const notaId = requiredString(structure, 'notaId', path)
    if (!notaIds.has(notaId)) throw new BackupArchiveError(`${path} refers to missing nota "${notaId}".`)
    if (structures.has(notaId)) throw new BackupArchiveError(`Nota "${notaId}" has multiple block structures.`)
    if (!Array.isArray(structure.blockOrder) || structure.blockOrder.some((id) => typeof id !== 'string')) {
      throw new BackupArchiveError(`${path}.blockOrder must be an array of composite block ids.`)
    }
    if (new Set(structure.blockOrder as string[]).size !== structure.blockOrder.length) {
      throw new BackupArchiveError(`${path}.blockOrder contains duplicate entries.`)
    }
    if (!Number.isInteger(structure.version) || (structure.version as number) < 1) {
      throw new BackupArchiveError(`${path}.version must be a positive integer.`)
    }
    assertDate(structure.lastModified, `${path}.lastModified`)
    structures.set(notaId, structure)
  })

  const blocks = {} as Record<BlockTableName, BackupRow[]>
  const blockOwners = new Map<string, { notaId: string; order: number }>()
  for (const tableName of blockTableNames) {
    const rows = input.blocks[tableName]
    assertRecordArray(rows, `blocks.${tableName}`)
    blocks[tableName] = rows
    const ids = new Set<string>()
    rows.forEach((row, index) => {
      const path = `blocks.${tableName}[${index}]`
      if (row.type !== BLOCK_TABLES[tableName]) {
        throw new BackupArchiveError(`${path}.type must be "${BLOCK_TABLES[tableName]}".`)
      }
      if (!validKey(row.id)) throw new BackupArchiveError(`${path}.id must be a string or number.`)
      const notaId = requiredString(row, 'notaId', path)
      if (!notaIds.has(notaId)) throw new BackupArchiveError(`${path} refers to missing nota "${notaId}".`)
      if (!Number.isInteger(row.order) || (row.order as number) < 0) {
        throw new BackupArchiveError(`${path}.order must be a non-negative integer.`)
      }
      if (!Number.isInteger(row.version) || (row.version as number) < 1) {
        throw new BackupArchiveError(`${path}.version must be a positive integer.`)
      }
      assertDate(row.createdAt, `${path}.createdAt`)
      assertDate(row.updatedAt, `${path}.updatedAt`)
      validateTypedPayload(row, path)
      const id = String(row.id)
      if (ids.has(id)) throw new BackupArchiveError(`Duplicate id "${id}" in blocks.${tableName}.`)
      ids.add(id)
      const compositeId = `${BLOCK_TABLES[tableName]}:${id}`
      blockOwners.set(compositeId, { notaId, order: row.order as number })
    })
  }

  const orderedIds = new Set<string>()
  for (const [notaId, structure] of structures) {
    for (const [order, compositeId] of (structure.blockOrder as string[]).entries()) {
      if (!blockOwners.has(compositeId)) {
        throw new BackupArchiveError(`Nota "${notaId}" orders missing block "${compositeId}".`)
      }
      const owner = blockOwners.get(compositeId)!
      if (owner.notaId !== notaId) {
        throw new BackupArchiveError(`Nota "${notaId}" orders block "${compositeId}" owned by another nota.`)
      }
      if (owner.order !== order) throw new BackupArchiveError(`Block "${compositeId}" has order ${owner.order}, expected ${order}.`)
      orderedIds.add(compositeId)
    }
  }
  for (const [compositeId, owner] of blockOwners) {
    if (!structures.has(owner.notaId)) throw new BackupArchiveError(`Nota "${owner.notaId}" has blocks but no block structure.`)
    if (!orderedIds.has(compositeId)) throw new BackupArchiveError(`Block "${compositeId}" is absent from canonical block order.`)
  }

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: input.exportedAt as string,
    notas: input.notas,
    blockStructures: input.blockStructures,
    blocks,
  }
}

function databaseTables(database: BackupDatabase) {
  return [
    database.notas,
    database.blockStructures,
    ...blockTableNames.map((tableName) => database[tableName]),
  ]
}

/** Capture one transactionally consistent, JSON-safe disaster-recovery archive. */
export async function createBackupArchive(database: BackupDatabase = db): Promise<BashNotaBackupArchive> {
  const tables = databaseTables(database)
  const archive = await database.transaction('r', tables, async () => {
    const blocks = {} as Record<BlockTableName, BackupRow[]>
    for (const tableName of blockTableNames) {
      blocks[tableName] = jsonClone(await database[tableName].toArray()) as unknown as BackupRow[]
    }
    return {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      notas: jsonClone(await database.notas.toArray()),
      blockStructures: jsonClone(await database.blockStructures.toArray()),
      blocks,
    }
  })
  return validateBackupArchive(archive)
}

function reviveBlock(row: BackupRow): BackupRow {
  const revived: BackupRow = {
    ...row,
    createdAt: new Date(row.createdAt as string),
    updatedAt: new Date(row.updatedAt as string),
  }
  if (row.type === 'aiGeneration' && typeof row.timestamp === 'string') revived.timestamp = new Date(row.timestamp)
  return revived
}

/** Restore only into an empty database. The optional stage hook participates in rollback. */
export async function restoreBackupArchive(
  input: unknown,
  stagePinia: (archive: BashNotaBackupArchive) => void,
  database: BackupDatabase = db,
  rollbackPinia: () => void = () => undefined,
): Promise<BashNotaBackupArchive> {
  const archive = validateBackupArchive(input)
  const tables = databaseTables(database)
  try {
    await database.transaction('rw', tables, async () => {
      for (const table of tables) {
        if (await table.count() !== 0) {
          throw new BackupArchiveError('Restore requires an empty database. Export or clear the current data first.')
        }
      }
      await database.notas.bulkAdd(jsonClone(archive.notas) as unknown as Nota[])
      await database.blockStructures.bulkAdd(archive.blockStructures.map((row) => ({
        ...row,
        lastModified: new Date(row.lastModified as string),
      })) as unknown as NotaBlockStructure[])
      for (const tableName of blockTableNames) {
        const table = database[tableName] as unknown as {
          bulkAdd(rows: readonly BackupRow[]): Promise<unknown>
        }
        await table.bulkAdd(archive.blocks[tableName].map(reviveBlock))
      }
      stagePinia(archive)
    })
  } catch (error) {
    rollbackPinia()
    throw error
  }
  return archive
}
