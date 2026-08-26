import { defineStore } from 'pinia'
import { db } from '@/db'
import {
  type Nota,
  type NotaVersion,
  type PublishedNota,
  type CitationEntry,
  type RestoreVersionResult,
} from '@/features/nota/types/nota'
import type { NotaConfig } from '@/features/jupyter/types/jupyter'
import { nanoid } from 'nanoid'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/features/auth/stores/auth'
import { processNotaContent } from '@/features/nota/services/publishNotaUtilities'
import { getPublicationCloudApi, normalizeCloudPublishedContent } from '@/services/cloud'
import type { CloudJson, CloudPublication } from '@/services/cloud/types'
import { logger } from '@/services/logger'
import { FILE_EXTENSIONS, ERROR_MESSAGES } from '@/constants/app';
import { useBlockStore } from './blockStore'
import { useDatabaseAdapter, withNotaPersistence } from '@/services/databaseAdapter'
import {
  captureCanonicalContent,
  restoreCanonicalContent,
} from '@/features/nota/services/versionHistoryPersistence'
import {
  BLOCK_TABLES,
  createBackupArchive,
  restoreBackupArchive,
  type BackupNotaAuthority,
  type BashNotaBackupArchive,
} from '@/features/nota/services/backupArchiveService'
import { persistedBlockDataFromDocument } from '@/features/editor/pm/persistedBlockConversion'

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function versionMetadata(nota: Nota): NotaVersion['nota'] {
  const { versions: _versions, blockStructure: _blockStructure, ...metadata } = nota
  return JSON.parse(JSON.stringify(metadata)) as NotaVersion['nota']
}

function publishedNota(value: CloudPublication): PublishedNota {
  return {
    id: value.id, title: value.title, content: value.content, updatedAt: value.updatedAt,
    publishedAt: value.publishedAt, authorId: value.authorId, authorName: value.authorName,
    authorTag: value.authorTag,
    isPublic: value.isPublic, isSubPage: value.isSubPage, parentId: value.parentId,
    publishedSubPages: value.publishedSubPages ?? [], citations: value.citations as unknown as CitationEntry[],
    tags: value.tags, viewCount: value.viewCount, uniqueViewers: value.uniqueViewers,
    likeCount: value.likeCount, dislikeCount: value.dislikeCount, cloneCount: value.cloneCount,
    commentCount: value.commentCount, lastViewedAt: value.lastViewedAt ?? undefined,
  }
}

// Helper functions to convert dates and ensure data is serializable
const serializeNota = (nota: Partial<Nota> & { id: string }): any => {
  const serialized = {
    ...nota,
    tags: Array.isArray(nota.tags) ? [...nota.tags] : [], // Ensure tags is a new array
    createdAt: nota.createdAt instanceof Date ? nota.createdAt.toISOString() : nota.createdAt,
    updatedAt: nota.updatedAt instanceof Date ? nota.updatedAt.toISOString() : nota.updatedAt,
  }

  // If there's a config, deep clone it to ensure it's serializable
  if (nota.config) {
    serialized.config = JSON.parse(JSON.stringify(nota.config))
  }

  // Properly serialize versions array if it exists
  if (nota.versions && Array.isArray(nota.versions)) {
    serialized.versions = nota.versions.map((version) => ({
      id: version.id,
      notaId: version.notaId,
      versionName: version.versionName,
      createdAt: version.createdAt && version.createdAt instanceof Date
        ? version.createdAt.toISOString()
        : version.createdAt,
      // For the nota object in the version, we need to serialize it properly
      nota: version.nota ? serializeNota(version.nota) : undefined,
      canonicalContent: version.canonicalContent
        ? JSON.parse(JSON.stringify(version.canonicalContent))
        : undefined,
    }))
  }

  // Properly serialize citations array if it exists
  if (nota.citations && Array.isArray(nota.citations)) {
    serialized.citations = nota.citations.map((citation) => ({
      id: citation.id,
      key: citation.key,
      title: citation.title,
      authors: Array.isArray(citation.authors) ? [...citation.authors] : [],
      year: citation.year,
      journal: citation.journal,
      volume: citation.volume,
      number: citation.number,
      pages: citation.pages,
      publisher: citation.publisher,
      url: citation.url,
      doi: citation.doi,
      createdAt: citation.createdAt instanceof Date ? citation.createdAt.toISOString() : citation.createdAt,
    }))
  }

  // Handle blockStructure - only store metadata, not the full blocks
  if (nota.blockStructure) {
    serialized.blockStructure = {
      notaId: nota.blockStructure.notaId,
      blockOrder: [...(nota.blockStructure.blockOrder || [])],
      version: nota.blockStructure.version,
      lastModified: nota.blockStructure.lastModified instanceof Date 
        ? nota.blockStructure.lastModified.toISOString() 
        : nota.blockStructure.lastModified,
      // Don't include the blocks object - it's stored separately
    } as any
  }

  return serialized
}

const deserializeNota = (nota: any): Nota => ({
  ...nota,
  // Content is now stored in blocks, not in the content field
  tags: Array.isArray(nota.tags) ? [...nota.tags] : [],
  createdAt: nota.createdAt ? new Date(nota.createdAt) : new Date(),
  updatedAt: nota.updatedAt ? new Date(nota.updatedAt) : new Date(),
  config: nota.config ? JSON.parse(JSON.stringify(nota.config)) : undefined,
  citations: Array.isArray(nota.citations) ? nota.citations.map((citation: CitationEntry) => ({
    ...citation,
    createdAt: citation.createdAt ? new Date(citation.createdAt) : new Date(),
  })) : [],
  // Handle blockStructure - convert dates back to Date objects
  blockStructure: nota.blockStructure ? {
    ...nota.blockStructure,
    lastModified: nota.blockStructure.lastModified ? new Date(nota.blockStructure.lastModified) : new Date(),
  } : undefined,
  // Handle versions - deserialize the nota object in each version
  versions: Array.isArray(nota.versions) ? nota.versions.map((version: any) => ({
    ...version,
    createdAt: version.createdAt ? new Date(version.createdAt) : new Date(),
    nota: version.nota ? deserializeNota(version.nota) : undefined,
  })) : [],
})

// Helper function to get database adapter or fallback to db
function getDb() {
  try {
    // Resolve every operation so a verified live storage-mode switch takes
    // effect immediately instead of leaving stores pinned to the old adapter.
    return useDatabaseAdapter()
  } catch (error) {
    // The adapter is not initialized yet; use old db for this operation only.
    logger.warn('[NotaStore] DatabaseAdapter not initialized, using legacy db')
    return null
  }
}

function externalBackupAuthority(
  adapter: ReturnType<typeof getDb>,
): BackupNotaAuthority | undefined {
  if (!adapter?.isUsingNewStorage()) return undefined
  return adapter.getStorageService().getBackendType() === 'indexeddb' ? undefined : adapter
}

function resolveBackupAuthority(
  authorityOverride?: BackupNotaAuthority,
): BackupNotaAuthority | undefined {
  if (authorityOverride) return authorityOverride

  const adapter = getDb()
  if (!adapter && isFilesystemStorageConfigured()) {
    throw new Error(
      'Backup is unavailable while filesystem storage is initializing. Wait a moment and try again.',
    )
  }
  return externalBackupAuthority(adapter)
}

/**
 * Version records live inside the serialized Nota, so they can be stored
 * durably by the filesystem adapter. The normalized block rows remain in
 * Dexie; importantly, the nota metadata/history itself must never fall back
 * to db.notas while a filesystem backend is authoritative.
 */
function isFilesystemStorageAdapter(
  adapter: ReturnType<typeof useDatabaseAdapter> | null,
): adapter is ReturnType<typeof useDatabaseAdapter> {
  return Boolean(
    adapter?.isUsingNewStorage()
      && adapter.getStorageService().getBackendType() === 'filesystem',
  )
}

function isFilesystemStorageConfigured(): boolean {
  try {
    return typeof localStorage !== 'undefined'
      && JSON.parse(localStorage.getItem('bashnota-storage-mode') || '{}').mode === 'filesystem'
  } catch {
    return false
  }
}

function requireReadyFilesystemHistoryAdapter(
  adapter: ReturnType<typeof getDb>,
): void {
  if (!adapter && isFilesystemStorageConfigured()) {
    throw new Error(
      'Version history is unavailable while filesystem storage is initializing. Wait a moment and try again.',
    )
  }
}

export const useNotaStore = defineStore('nota', {
  state: () => ({
    items: [] as Nota[],
    loading: false,
    error: null as string | null,
    publishedNotas: [] as string[],
  }),

  getters: {
    rootItems: (state) => {
      // Return items that don't have a parentId and are not versions
      // (i.e., they don't have a notaId property which would indicate they're a version)
      return state.items.filter(
        (item) =>
          !item.parentId &&
          // This check ensures we're only returning actual notas, not version entries
          // that might have been inadvertently added to the items array
          !('notaId' in item),
      )
    },

    getChildren: (state) => (parentId: string) => {
      return state.items.filter((item) => item.parentId === parentId)
    },

    getParents: (state) => (id: string) => {
      const findParents = (itemId: string, chain: Nota[] = []): Nota[] => {
        const item = state.items.find((i) => i.id === itemId)
        if (!item) return chain

        // If this item has a parent, recursively get its parent
        if (item.parentId) {
          const parent = state.items.find((i) => i.id === item.parentId)
          if (parent) {
            return findParents(parent.id, [parent, ...chain])
          }
        }

        return chain
      }
      return findParents(id)
    },

    getItem: (state) => (id: string) => {
      return state.items.find((item) => item.id === id)
    },

    getCurrentNota: (state) => (id: string) => {
      return state.items.find((item) => item.id === id)
    },

    getRootNotaId: (state) => (id: string) => {
      const findRoot = (itemId: string): string => {
        const item = state.items.find((i) => i.id === itemId)
        if (!item?.parentId) return itemId
        return findRoot(item.parentId)
      }
      return findRoot(id)
    },

    isPublished: (state) => (id: string) => {
      return state.publishedNotas.includes(id)
    },

    getPublicLink: () => (id: string) => {
      // Check if we're currently using a user tag URL format
      const currentPath = window.location.pathname
      const isUserTagFormat = currentPath.startsWith('/@')
      
      // Extract user tag if present (format: /@username/notaId)
      let userTag = ''
      if (isUserTagFormat) {
        const pathParts = currentPath.split('/')
        if (pathParts.length >= 2) {
          userTag = pathParts[1] // Will include the @ symbol
        }
      }
      
      const baseURL = import.meta.env.VITE_APP_BASE_URL
      
      // Return URL in the appropriate format
      if (isUserTagFormat && userTag) {
        return `${baseURL}/${userTag}/${id}`
      }
      return `${baseURL}/p/${id}`
    },
  },

  actions: {
    async createItem(title: string, parentId: string | null = null): Promise<Nota> {
      const notaId = nanoid()
      const nota: Nota = {
        id: notaId,
        title,
        parentId: parentId,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        blockStructure: {
          notaId: notaId,
          blockOrder: [],
          version: 1,
          lastModified: new Date(),
        },
      }

      // Use database adapter if available, otherwise fallback to direct db
      const adapter = getDb()
      if (adapter) {
        await adapter.saveNota(nota)
      } else {
        const serialized = serializeNota(nota)
        await db.notas.add(serialized)
      }
      
      this.items.push(nota)

      toast(`Nota "${title}" created successfully`)

      return nota
    },

    async saveItem(nota: Nota) {
      await withNotaPersistence(nota.id, async () => {
        const notaToSave = deserializeNota(serializeNota({
          ...nota,
          tags: nota.tags ? [...nota.tags] : [],
          updatedAt: new Date(),
        }))

        // Use database adapter if available, otherwise fallback to direct db.
        // The surrounding coordinator already owns the global mutation guard.
        const adapter = getDb()
        if (adapter) await adapter.saveNotaWithinMutation(notaToSave)
        else await db.notas.update(nota.id, serializeNota(notaToSave))

        const index = this.items.findIndex((n) => n.id === nota.id)
        if (index !== -1) this.items[index] = notaToSave
        else this.items.push(notaToSave)
      })
    },

    /** Persist metadata together with the already-committed canonical block
     * snapshot when filesystem storage is authoritative. */
    async persistCanonicalContent(notaId: string, alreadyCoordinated = false): Promise<void> {
      const persist = async () => {
        const nota = this.getItem(notaId)
        if (!nota) throw new Error(`Nota with id ${notaId} not found`)
        const notaToPersist = deserializeNota(serializeNota(nota))
        const adapter = getDb()
        if (adapter) await adapter.saveNotaWithinMutation(notaToPersist)
        else await db.notas.put(serializeNota(notaToPersist))
      }
      if (alreadyCoordinated) await persist()
      else await withNotaPersistence(notaId, persist)
    },

    async loadNotas(authorityOverride?: BackupNotaAuthority) {
      this.loading = true
      try {
        const adapter = authorityOverride ?? getDb()
        if (adapter) {
          const results = await adapter.getAllNotas()
          this.items = results.map(deserializeNota)
        } else {
          const results = await db.notas.toArray()
          this.items = results.map(deserializeNota)
        }
      } catch (e) {
        logger.error(e)
        this.error = 'Failed to load notas'
      } finally {
        this.loading = false
      }
      return this.items
    },

    async renameItem(id: string, newTitle: string) {
      const item = this.items.find((i) => i.id === id)
      if (item) {
        await this.saveItem({ ...item, title: newTitle })
      }
    },

    async updateNotaTitle(id: string, newTitle: string) {
      const item = this.items.find((i) => i.id === id)
      if (item) {
        await this.saveItem({ ...item, title: newTitle })
        return this.getItem(id)!
      }
      throw new Error(`Nota with id ${id} not found`)
    },

    async deleteItem(id: string) {
      // First delete all children
      const children = this.getChildren(id)
      for (const child of children) {
        await this.deleteItem(child.id)
      }

      await withNotaPersistence(id, async () => {
        // Resolve the item and current authority only after earlier writes for
        // this nota have drained. This prevents a delayed autosave from
        // recreating a file after an acknowledged delete.
        const item = this.items.find((candidate) => candidate.id === id)
        if (!item) return

        const adapter = getDb()
        if (adapter) await adapter.deleteNotaWithinMutation(id)
        else await db.notas.delete(id)
        this.items = this.items.filter((candidate) => candidate.id !== id)
        toast(`Nota "${item.title}" deleted successfully`)
      })
    },

    async saveNota(nota: Partial<Nota> & { id: string }) {
      const now = new Date()
      const notaToStore = serializeNota({
        ...nota,
        updatedAt: now,
      })

      const index = this.items.findIndex((n) => n.id === nota.id)
      if (index !== -1) {
        this.items[index] = {
          ...this.items[index],
          ...nota,
          updatedAt: now,
        }
        const adapter = getDb()
        if (adapter) {
          await adapter.saveNota(this.items[index])
        } else {
          await db.notas.update(nota.id, notaToStore)
        }
      }
    },

    async updateNotaConfig(notaId: string, updater: (config: NotaConfig) => void) {
      const nota = this.getItem(notaId)
      if (nota) {
        const config = nota.config || {
          kernelPreferences: {},
          savedSessions: [],
        }

        updater(config)
        nota.config = config
        await this.saveItem(nota)
      }
    },

    async toggleFavorite(id: string) {
      const nota = this.items.find((item) => item.id === id)
      if (nota) {
        const favorite = !nota.favorite
        await this.saveItem({ ...nota, favorite })

        toast(`Nota ${favorite ? 'added to' : 'removed from'} favorites successfully`)
      }
    },

    async loadNota(id: string) {
      try {
        if (!this.getCurrentNota(id)) {
          const adapter = getDb()
          let nota
          if (adapter) {
            nota = await adapter.getNota(id)
          } else {
            nota = await db.notas.get(id)
          }
          if (nota) {
            const deserialized = deserializeNota(nota)
            // Ensure tags is initialized when loading
            if (!deserialized.tags) {
              deserialized.tags = []
              await this.saveItem(deserialized)
            }
            this.items.push(deserialized)
          }
        }
        return this.getCurrentNota(id)
      } catch (error) {
        logger.error('Failed to load nota:', error)
        return null
      }
    },

    /**
     * Export a nota in the new .nota format
     * 
     * The new format exports:
     * 1. Clean Tiptap JSON content (not stringified)
     * 2. All subnotas recursively (maintaining hierarchy)
     * 3. Proper metadata and versioning
     * 
     * This follows the Tiptap pattern: editor.getJSON() for clean content
     * and editor.commands.setContent(json) for restoration
     */
    async exportNota(id: string): Promise<void> {
      const nota = this.getItem(id)
      if (nota) {
        try {
          // Get all child notas recursively
          const getAllChildren = (parentId: string): Nota[] => {
            const children = this.items.filter(item => item.parentId === parentId)
            const allChildren: Nota[] = []
            
            for (const child of children) {
              allChildren.push(child)
              allChildren.push(...getAllChildren(child.id))
            }
            
            return allChildren
          }

          // Get all related notas (current nota + all children)
          const relatedNotas = [nota, ...getAllChildren(nota.id)]
          
          // Prepare the export data with proper Tiptap JSON content
          const exportData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            nota: {
              ...serializeNota(nota),
              // Content is now stored in blocks, get it from the block system
              content: await this.getNotaContentAsTiptap(nota.id)
            },
            subnotas: relatedNotas.length > 1 ? await Promise.all(relatedNotas.slice(1).map(async subNota => ({
              ...serializeNota(subNota),
              // Content is now stored in blocks, get it from the block system
              content: await this.getNotaContentAsTiptap(subNota.id)
            }))) : []
          }

          const dataStr = JSON.stringify(exportData, null, 2)
          const blob = new Blob([dataStr], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `${nota.title.replace(/[^a-z0-9]/gi, '_') || 'nota'}.nota`
          link.click()
          URL.revokeObjectURL(url)
        } catch (error) {
          logger.error('Failed to prepare nota for export:', error)
          toast(ERROR_MESSAGES.notas.exportFailed)
        }
      } else {
        toast('Nota not found for export.')
      }
    },

    /**
     * Import notas from various formats including the new .nota format
     * 
     * Supports:
     * 1. New .nota format: { nota: {...}, subnotas: [...] }
     * 2. Legacy array format: [{...}, {...}]
     * 3. Single nota format: {...}
     * 
     * Automatically handles subnotas hierarchy and maintains parent-child relationships
     */
    async importNotas(file: File): Promise<Nota[]> {
      return new Promise<Nota[]>(async (resolve, reject) => {
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const text = e.target?.result as string
            if (!text) {
              toast(ERROR_MESSAGES.notas.importFailed + ': Empty file content.')
              return resolve([])
            }
            
            const importedData = JSON.parse(text)
            
            // Handle new .nota format with main nota and subnotas
            let rawNotasToImport: any[] = []
            
            if (importedData.nota && importedData.subnotas) {
              // New .nota format
              rawNotasToImport = [importedData.nota, ...importedData.subnotas]
            } else if (Array.isArray(importedData)) {
              // Legacy array format
              rawNotasToImport = importedData
            } else if (importedData.id) {
              // Single nota format
              rawNotasToImport = [importedData]
            } else {
              throw new Error('Invalid .nota file format')
            }

            // A batch is validation-atomic: fully schema-check and convert every
            // inline document before changing nota metadata, hierarchy, Pinia,
            // block structures, or any typed block table.
            for (const notaData of rawNotasToImport) {
              if (notaData.content != null) {
                persistedBlockDataFromDocument(notaData.content, String(notaData.id ?? 'pending-import'))
              }
            }

            const allCurrentNotaIds = new Set(this.items.map(item => item.id))
            const importedNotaIdsInBatch = new Set(rawNotasToImport.map(n => n.id).filter(id => id != null))
            
            const cleanedNotas: Nota[] = [];
            const validNotasToProcess: Nota[] = []
            const successfullyImportedNotas: Nota[] = []

            for (const notaData of rawNotasToImport) {
              const deserializedNota = deserializeNota(notaData)
              
              // If the .nota includes inline content (TipTap JSON), stash it for block import
              const inlineContent = (notaData as any).content
              
              // Content is now stored as JSON objects (no need to stringify)
              
              if (deserializedNota.parentId) {
                const parentExistsInStore = allCurrentNotaIds.has(deserializedNota.parentId)
                const parentExistsInBatch = importedNotaIdsInBatch.has(deserializedNota.parentId)
                if (!parentExistsInStore && !parentExistsInBatch) {
                  cleanedNotas.push(JSON.parse(JSON.stringify(deserializedNota)));
                  deserializedNota.parentId = null;
                }
              }
              
              // Attach content for later processing
              ;(deserializedNota as any).__inlineContent = inlineContent
              validNotasToProcess.push(deserializedNota)
            }

            if (cleanedNotas.length > 0) {
              const cleanedTitles = cleanedNotas.map(n => `"${n.title || n.id}"`).join(', ')
              toast(
                `${cleanedNotas.length} sub-nota(s) had their parent reference removed and were imported as root notas: ${cleanedTitles}.`
              )
            }
            
            for (const notaToSave of validNotasToProcess) {
              const existingNota = this.getItem(notaToSave.id)

              if (existingNota) {
                const mergedNota = deserializeNota({
                    ...serializeNota(existingNota),
                    ...serializeNota(notaToSave),
                    createdAt: existingNota.createdAt,
                    updatedAt: new Date()
                });
                
                // Use database adapter if available
                const adapter = getDb()
                if (adapter) {
                  await adapter.saveNota(mergedNota)
                } else {
                  await db.notas.put(serializeNota(mergedNota))
                }
                
                const index = this.items.findIndex((n) => n.id === mergedNota.id)
                if (index !== -1) {
                  this.items[index] = mergedNota
                } else { 
                  this.items.push(mergedNota)
                }
                successfullyImportedNotas.push(mergedNota);
                // Populate blocks if inline content present
                const inline = (notaToSave as any).__inlineContent
                if (inline) {
                  const blockStore = useBlockStore()
                  await blockStore.importTiptapContent(mergedNota.id, inline)
                  await this.persistCanonicalContent(mergedNota.id)
                }
              } else {
                const newNota = deserializeNota({
                    ...serializeNota(notaToSave),
                    id: notaToSave.id || nanoid(),
                    createdAt: notaToSave.createdAt ? new Date(notaToSave.createdAt) : new Date(),
                    updatedAt: new Date()
                });
                
                // Use database adapter if available
                const adapter = getDb()
                if (adapter) {
                  await adapter.saveNota(newNota)
                } else {
                  await db.notas.add(serializeNota(newNota))
                }
                
                this.items.push(newNota)
                successfullyImportedNotas.push(newNota);
                // Populate blocks if inline content present
                const inline = (notaToSave as any).__inlineContent
                if (inline) {
                  const blockStore = useBlockStore()
                  await blockStore.importTiptapContent(newNota.id, inline)
                  await this.persistCanonicalContent(newNota.id)
                }
              }
            }

            if (cleanedNotas.length > 0 && successfullyImportedNotas.length === 0 && rawNotasToImport.length === cleanedNotas.length) {
            } else if (rawNotasToImport.length > 0 && successfullyImportedNotas.length === 0 && cleanedNotas.length === 0) {
               toast(ERROR_MESSAGES.notas.importFailed + ': No valid notas found in file or processed.')
            }

            resolve(successfullyImportedNotas)
          } catch (error: any) {
            logger.error('Import error in store:', error)
            let message = ERROR_MESSAGES.notas.importFailed;
            if (error instanceof SyntaxError) {
                message += ': Invalid JSON format.';
            } else if (error.message) {
                message += `: ${error.message}`;
            }
            toast(message)
            resolve([])
          }
        }
        reader.onerror = (error) => {
          logger.error('File reading error:', error)
          toast(ERROR_MESSAGES.notas.importFailed + ': Could not read file.')
          resolve([])
        }
        reader.readAsText(file)
      })
    },

    async exportAllNotas(authorityOverride?: BackupNotaAuthority): Promise<BashNotaBackupArchive> {
      const authority = resolveBackupAuthority(authorityOverride)
      const archive = await createBackupArchive(db, authority)
      if (archive.notas.length === 0) throw new Error('There are no notas to export.')

      const dataStr = JSON.stringify(archive, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      try {
        const link = document.createElement('a')
        link.href = url
        link.download = `bashnota_backup_${new Date().toISOString().split('T')[0]}${FILE_EXTENSIONS.json}`
        link.click()
      } finally {
        URL.revokeObjectURL(url)
      }
      return archive
    },

    async importAllNotas(input: unknown, authorityOverride?: BackupNotaAuthority): Promise<{ notaCount: number }> {
      const authority = resolveBackupAuthority(authorityOverride)
      const blockStore = useBlockStore()
      const itemsBefore = this.items
      const blocksBefore = new Map(blockStore.blocks)
      const structuresBefore = new Map(blockStore.blockStructures)

      try {
        const archive = await restoreBackupArchive(
          input,
          (validated) => {
            this.items = validated.notas.map(deserializeNota)
            blockStore.blocks.clear()
            blockStore.blockStructures.clear()

            for (const [tableName, type] of Object.entries(BLOCK_TABLES)) {
              for (const row of validated.blocks[tableName as keyof typeof BLOCK_TABLES]) {
                const block = {
                  ...row,
                  createdAt: new Date(row.createdAt as string),
                  updatedAt: new Date(row.updatedAt as string),
                  ...(type === 'aiGeneration' && typeof row.timestamp === 'string'
                    ? { timestamp: new Date(row.timestamp) }
                    : {}),
                }
                blockStore.blocks.set(`${type}:${String(row.id)}`, block as any)
              }
            }
            for (const row of validated.blockStructures) {
              blockStore.blockStructures.set(row.notaId as string, blockStore.deserializeBlockStructure(row))
            }
          },
          db,
          () => {
            this.items = itemsBefore
            blockStore.blocks.clear()
            blocksBefore.forEach((block, id) => blockStore.blocks.set(id, block))
            blockStore.blockStructures.clear()
            structuresBefore.forEach((structure, id) => blockStore.blockStructures.set(id, structure))
          },
          authority,
        )
        return { notaCount: archive.notas.length }
      } catch (error) {
        this.items = itemsBefore
        blockStore.blocks.clear()
        blocksBefore.forEach((block, id) => blockStore.blocks.set(id, block))
        blockStore.blockStructures.clear()
        structuresBefore.forEach((structure, id) => blockStore.blockStructures.set(id, structure))
        throw error
      }
    },

    async saveNotaVersion(version: {
      id: string
      versionName: string
      createdAt: Date
      prepareCanonical?: () => Promise<() => void>
    }): Promise<NotaVersion> {
      return withNotaPersistence(version.id, () => this.saveNotaVersionWithinPersistence(version))
    },

    async saveNotaVersionWithinPersistence(version: {
      id: string
      versionName: string
      createdAt: Date
      prepareCanonical?: () => Promise<() => void>
    }): Promise<NotaVersion> {
      const nota = this.getCurrentNota(version.id)
      if (!nota) throw new Error('Unable to save version: nota not found')

      const blockStore = useBlockStore()
      const memoryBefore = blockStore.captureNotaMemoryState(version.id)
      let rollbackPreparedContent: (() => void) | undefined
      let notaVersion: NotaVersion | undefined
      let committedVersions: NotaVersion[] | undefined
      const adapter = getDb()
      requireReadyFilesystemHistoryAdapter(adapter)

      if (isFilesystemStorageAdapter(adapter)) {
        let canonicalBefore: Awaited<ReturnType<typeof captureCanonicalContent>> | undefined
        let persistedBefore: Nota | undefined
        try {
          // A filesystem Nota owns its serialized history. Capture the current
          // block state before a live-editor preparation so a failed file write
          // can leave the separately persisted canonical rows unchanged too.
          canonicalBefore = await captureCanonicalContent(version.id)
          persistedBefore = await adapter.getNota(version.id)
          if (!persistedBefore) throw new Error('nota disappeared before its version could be written')
          rollbackPreparedContent = await version.prepareCanonical?.()
          const canonicalContent = await captureCanonicalContent(version.id)

          notaVersion = {
            id: nanoid(),
            notaId: version.id,
            nota: versionMetadata(nota),
            canonicalContent,
            versionName: version.versionName,
            createdAt: version.createdAt.toISOString(),
          }

          const persistedVersions = deserializeNota(persistedBefore).versions || []
          committedVersions = [...persistedVersions, notaVersion]
          await adapter.saveNotaWithinMutation(deserializeNota(serializeNota({ ...nota, versions: committedVersions })))
        } catch (error) {
          rollbackPreparedContent?.()
          try {
            if (canonicalBefore) {
              await db.transaction('rw', db.tables, async () => {
                await restoreCanonicalContent(version.id, canonicalBefore!)
              })
            }
            // prepareCanonical may already have committed the new body to the
            // authoritative file. Re-emit the pre-operation metadata after
            // restoring canonical rows so a failed history append is atomic.
            if (persistedBefore) await adapter.saveNotaWithinMutation(persistedBefore)
          } catch (rollbackError) {
            blockStore.replaceNotaMemoryState(version.id, memoryBefore)
            throw new Error(
              `Unable to save version "${version.versionName}" and filesystem rollback was incomplete: ${errorMessage(error)}; rollback: ${errorMessage(rollbackError)}`,
            )
          }
          blockStore.replaceNotaMemoryState(version.id, memoryBefore)
          logger.error('Failed to save filesystem nota version:', error)
          throw new Error(
            `Unable to save version "${version.versionName}": ${errorMessage(error)}. No changes were committed.`,
          )
        }

        if (!notaVersion) throw new Error('filesystem version write completed without a version record')
        nota.versions = committedVersions || [...(nota.versions || []), notaVersion]
        return notaVersion
      }

      try {
        await db.transaction('rw', db.tables, async () => {
          rollbackPreparedContent = await version.prepareCanonical?.()
          const canonicalContent = await captureCanonicalContent(version.id)
          const persistedNota = await db.notas.get(version.id)
          if (!persistedNota) throw new Error('nota disappeared before its version could be written')

          notaVersion = {
            id: nanoid(),
            notaId: version.id,
            nota: versionMetadata(nota),
            canonicalContent,
            versionName: version.versionName,
            createdAt: version.createdAt.toISOString(),
          }

          const persistedVersions = Array.isArray(persistedNota.versions)
            ? deserializeNota(persistedNota).versions || []
            : nota.versions || []
          committedVersions = [...persistedVersions, notaVersion]
          const serialized = serializeNota({
            ...nota,
            versions: committedVersions,
          })
          await db.notas.put(serialized)
        })

        if (!notaVersion) throw new Error('version transaction completed without a version record')
        nota.versions = committedVersions || [...(nota.versions || []), notaVersion]
        return notaVersion
      } catch (error) {
        rollbackPreparedContent?.()
        blockStore.replaceNotaMemoryState(version.id, memoryBefore)
        logger.error('Failed to save nota version:', error)
        throw new Error(
          `Unable to save version "${version.versionName}": ${errorMessage(error)}. No changes were committed.`,
        )
      }
    },

    getNotaVersions(notaId: string) {
      const nota = this.getCurrentNota(notaId)
      return nota?.versions || []
    },

    async restoreVersion(notaId: string, versionId: string): Promise<RestoreVersionResult> {
      return withNotaPersistence(notaId, () => this.restoreVersionWithinPersistence(notaId, versionId))
    },

    async restoreVersionWithinPersistence(notaId: string, versionId: string): Promise<RestoreVersionResult> {
      const nota = this.getCurrentNota(notaId)
      if (!nota || !nota.versions) throw new Error('Unable to restore version: nota or history not found')
      const version = nota.versions.find((candidate) => candidate.id === versionId)
      if (!version) throw new Error('Unable to restore version: selected version not found')

      const blockStore = useBlockStore()
      let restoredCanonicalState: Awaited<ReturnType<typeof restoreCanonicalContent>> | undefined
      let restoredNota: Nota | undefined
      let isLegacy = !version.canonicalContent
      const adapter = getDb()
      requireReadyFilesystemHistoryAdapter(adapter)

      if (isFilesystemStorageAdapter(adapter)) {
        let canonicalBefore: Awaited<ReturnType<typeof captureCanonicalContent>> | undefined
        try {
          const persistedNota = await adapter.getNota(notaId)
          if (!persistedNota) throw new Error('nota disappeared before restore could begin')

          const persistedCurrent = deserializeNota(persistedNota)
          const persistedVersion = persistedCurrent.versions?.find((candidate) => candidate.id === versionId)
          if (!persistedVersion) throw new Error('selected version is no longer present in persisted history')
          isLegacy = !persistedVersion.canonicalContent

          const historicalMetadata = JSON.parse(JSON.stringify(persistedVersion.nota)) as NotaVersion['nota']
          restoredNota = {
            ...persistedCurrent,
            ...historicalMetadata,
            id: notaId,
            // History is append-only and never rolls back with document metadata.
            versions: persistedCurrent.versions || nota.versions,
            updatedAt: new Date(),
          }

          const canonicalSnapshot = persistedVersion.canonicalContent
          if (canonicalSnapshot) {
            // Keep filesystem I/O outside the Dexie transaction. Dexie commits
            // transactions around arbitrary async work, so awaiting a file
            // write inside one can turn a successful restore into a premature
            // transaction commit. Roll the canonical rows back explicitly if
            // the subsequent authoritative file write fails.
            canonicalBefore = await captureCanonicalContent(notaId)
            const restoredCanonical = await db.transaction('rw', db.tables, async () => {
              return restoreCanonicalContent(notaId, canonicalSnapshot)
            })
            restoredCanonicalState = restoredCanonical
            restoredNota.blockStructure = restoredCanonical.structure
            restoredNota.blockStructureId = restoredCanonical.structure.id
          } else {
            restoredNota.blockStructure = persistedCurrent.blockStructure
            restoredNota.blockStructureId = persistedCurrent.blockStructureId
          }

          await adapter.saveNotaWithinMutation(deserializeNota(serializeNota(restoredNota)))
        } catch (error) {
          if (canonicalBefore) {
            await db.transaction('rw', db.tables, async () => {
              await restoreCanonicalContent(notaId, canonicalBefore!)
            })
          }
          logger.error('Failed to restore filesystem nota version:', error)
          throw new Error(
            `Unable to restore version "${version.versionName}": ${errorMessage(error)}. The current nota and history were left unchanged.`,
          )
        }

        if (!restoredNota) throw new Error('filesystem restore completed without restored metadata')
        const itemIndex = this.items.findIndex((item) => item.id === notaId)
        if (itemIndex !== -1) this.items[itemIndex] = restoredNota
        if (restoredCanonicalState) blockStore.replaceNotaMemoryState(notaId, restoredCanonicalState)

        return isLegacy
          ? {
              kind: 'legacy-metadata-only',
              message: 'This older version contains metadata only. Metadata was restored; the current document body was left unchanged.',
            }
          : { kind: 'canonical', message: 'Metadata and document content were restored.' }
      }

      try {
        await db.transaction('rw', db.tables, async () => {
          const persistedNota = await db.notas.get(notaId)
          if (!persistedNota) throw new Error('nota disappeared before restore could begin')

          const persistedCurrent = deserializeNota(persistedNota)
          const persistedVersion = persistedCurrent.versions?.find((candidate) => candidate.id === versionId)
          if (!persistedVersion) throw new Error('selected version is no longer present in persisted history')
          isLegacy = !persistedVersion.canonicalContent
          const historicalMetadata = JSON.parse(JSON.stringify(persistedVersion.nota)) as NotaVersion['nota']
          restoredNota = {
            ...persistedCurrent,
            ...historicalMetadata,
            id: notaId,
            // History is append-only and never rolls back with document metadata.
            versions: persistedCurrent.versions || nota.versions,
            updatedAt: new Date(),
          }

          if (persistedVersion.canonicalContent) {
            restoredCanonicalState = await restoreCanonicalContent(notaId, persistedVersion.canonicalContent)
            restoredNota.blockStructure = restoredCanonicalState.structure
            restoredNota.blockStructureId = restoredCanonicalState.structure.id
          } else {
            // Explicit compatibility contract: old entries never had a body.
            restoredNota.blockStructure = persistedCurrent.blockStructure
            restoredNota.blockStructureId = persistedCurrent.blockStructureId
          }

          await db.notas.put(serializeNota(restoredNota))
        })

        if (!restoredNota) throw new Error('restore transaction completed without restored metadata')
        const itemIndex = this.items.findIndex((item) => item.id === notaId)
        if (itemIndex !== -1) this.items[itemIndex] = restoredNota
        if (restoredCanonicalState) {
          blockStore.replaceNotaMemoryState(notaId, restoredCanonicalState)
        }

        return isLegacy
          ? {
              kind: 'legacy-metadata-only',
              message: 'This older version contains metadata only. Metadata was restored; the current document body was left unchanged.',
            }
          : { kind: 'canonical', message: 'Metadata and document content were restored.' }
      } catch (error) {
        logger.error('Failed to restore version:', error)
        throw new Error(
          `Unable to restore version "${version.versionName}": ${errorMessage(error)}. The current nota and history were left unchanged.`,
        )
      }
    },

    async deleteVersion(notaId: string, versionId: string): Promise<boolean> {
      return withNotaPersistence(notaId, () => this.deleteVersionWithinPersistence(notaId, versionId))
    },

    async deleteVersionWithinPersistence(notaId: string, versionId: string): Promise<boolean> {
      try {
        const nota = this.getCurrentNota(notaId)
        if (!nota || !nota.versions) throw new Error('Nota or versions not found')

        const adapter = getDb()
        requireReadyFilesystemHistoryAdapter(adapter)
        if (isFilesystemStorageAdapter(adapter)) {
          const persistedNota = await adapter.getNota(notaId)
          if (!persistedNota) throw new Error('nota disappeared before its version could be deleted')
          const persistedCurrent = deserializeNota(persistedNota)
          const persistedVersions = persistedCurrent.versions || []
          if (!persistedVersions.some((candidate) => candidate.id === versionId)) {
            throw new Error('selected version is no longer present in persisted history')
          }

          const committedVersions = persistedVersions.filter((candidate) => candidate.id !== versionId)
          await adapter.saveNotaWithinMutation(deserializeNota(serializeNota({ ...persistedCurrent, versions: committedVersions })))
          nota.versions = committedVersions
          return true
        }

        // Filter out the version to delete
        nota.versions = nota.versions.filter((v) => v.id !== versionId)

        // Save the updated nota with the version removed
        const serialized = serializeNota(nota)
        await db.notas.update(notaId, serialized)

        return true
      } catch (error) {
        logger.error('Failed to delete version:', error)
        throw error
      }
    },

    async getSubPages(notaId: string): Promise<Nota[]> {
      try {
        // Filter direct children from in-memory store if available
        const subPages = this.items.filter((item) => item.parentId === notaId)

        // If no items found in store, try fetching from database
        if (subPages.length === 0) {
          const dbSubPages = await db.notas.where('parentId').equals(notaId).toArray()

          return dbSubPages.map(deserializeNota)
        }

        return subPages
      } catch (error) {
        logger.error('Failed to get sub-pages:', error)
        return []
      }
    },

    async getPublishedSubPages(notaId: string): Promise<string[]> {
      try {
        // Get all sub-pages
        const subPages = await this.getSubPages(notaId)

        // Filter out only published ones by checking publishedNotas
        const publishedIds: string[] = []

        for (const subPage of subPages) {
          if (this.isPublished(subPage.id)) {
            publishedIds.push(subPage.id)
          }
        }

        return publishedIds
      } catch (error) {
        logger.error('Failed to get published sub-pages:', error)
        return []
      }
    },

    async getAllDescendants(notaId: string): Promise<Nota[]> {
      const result: Nota[] = []
      const subPages = await this.getSubPages(notaId)

      // Add immediate sub-pages
      result.push(...subPages)

      // Recursively add sub-pages of sub-pages
      for (const subPage of subPages) {
        const descendants = await this.getAllDescendants(subPage.id)
        result.push(...descendants)
      }

      return result
    },

    /**
     * Create a sub-nota under a parent
     */
    async createSubNota(parentId: string, title: string): Promise<Nota> {
      if (!parentId) {
        throw new Error('Parent ID is required for sub-nota creation')
      }

      const parentNota = this.getItem(parentId)
      if (!parentNota) {
        throw new Error('Parent nota not found')
      }

      const notaId = nanoid()
      const nota: Nota = {
        id: notaId,
        title,
        parentId: parentId,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        blockStructure: {
          notaId: notaId,
          blockOrder: [],
          version: 1,
          lastModified: new Date(),
        },
      }

      const adapter = getDb()
      if (adapter) await adapter.saveNota(nota)
      else await db.notas.add(serializeNota(nota))
      this.items.push(nota)

      toast(`Sub-nota "${title}" created successfully under "${parentNota.title}"`)
      return nota
    },

    /**
     * Move a nota to become a sub-nota of another nota
     */
    async moveNota(notaId: string, newParentId: string | null): Promise<boolean> {
      const nota = this.getItem(notaId)
      if (!nota) {
        throw new Error('Nota not found')
      }

      // Prevent circular references
      if (newParentId) {
        const newParent = this.getItem(newParentId)
        if (!newParent) {
          throw new Error('New parent nota not found')
        }

        // Check if moving would create a circular reference
        if (this.wouldCreateCircularReference(notaId, newParentId)) {
          throw new Error('Cannot move nota: would create circular reference')
        }
      }

      await this.saveItem({ ...nota, parentId: newParentId })

      const action = newParentId ? 'moved to' : 'moved from'
      const target = newParentId ? this.getItem(newParentId)?.title : 'root level'
      toast(`Nota "${nota.title}" ${action} "${target}"`)

      return true
    },

    /**
     * Check if moving a nota would create a circular reference
     */
    wouldCreateCircularReference(notaId: string, newParentId: string): boolean {
      if (notaId === newParentId) return true

      const checkAncestors = (currentId: string, targetId: string): boolean => {
        const current = this.getItem(currentId)
        if (!current?.parentId) return false
        if (current.parentId === targetId) return true
        return checkAncestors(current.parentId, targetId)
      }

      return checkAncestors(newParentId, notaId)
    },

    /**
     * Get the full hierarchy path for a nota
     */
    getNotaHierarchy(notaId: string): Nota[] {
      const hierarchy: Nota[] = []
      let currentId = notaId

      while (currentId) {
        const nota = this.getItem(currentId)
        if (!nota) break
        
        hierarchy.unshift(nota)
        currentId = nota.parentId || ''
      }

      return hierarchy
    },

    /**
     * Get the depth level of a nota in the hierarchy
     */
    getNotaDepth(notaId: string): number {
      let depth = 0
      let currentId = notaId

      while (currentId) {
        const nota = this.getItem(currentId)
        if (!nota?.parentId) break
        depth++
        currentId = nota.parentId
      }

      return depth
    },

    /**
     * Export a nota with all its sub-notas
     */
    async exportNotaWithSubNotas(notaId: string): Promise<any> {
      const mainNota = this.getItem(notaId)
      if (!mainNota) {
        throw new Error('Nota not found')
      }

      const descendants = await this.getAllDescendants(notaId)
      const allRelatedNotas = [mainNota, ...descendants]
      
      // Get content for each nota
      const notasWithContent = await Promise.all(
        allRelatedNotas.map(async (nota) => ({
          ...serializeNota(nota),
          content: await this.getNotaContentAsTiptap(nota.id)
        }))
      )

      return {
        nota: notasWithContent[0], // Main nota
        subnotas: notasWithContent.slice(1) // All sub-notas
      }
    },

    /**
     * Import a nota with sub-notas, maintaining hierarchy
     */
    async importNotaWithSubNotas(importData: any): Promise<Nota[]> {
      if (!importData.nota) {
        throw new Error('Invalid import data: missing main nota')
      }

      const importedNotas: Nota[] = []
      const idMapping = new Map<string, string>() // old ID -> new ID

      // Detach the plan from the caller before validation. Without this clone a
      // caller could mutate a later child's content while the first DB await is
      // in flight, invalidating the preflight guarantee.
      const allNotas = JSON.parse(JSON.stringify([
        importData.nota,
        ...(importData.subnotas || []),
      ])) as any[]

      // Generate the complete ID plan and validate every inline document before
      // the first nota/parent/Pinia/DB mutation. A later invalid child therefore
      // cannot leave an earlier root partially imported.
      for (const notaData of allNotas) {
        idMapping.set(notaData.id, nanoid())
      }
      for (const notaData of allNotas) {
        if (notaData.content != null) {
          persistedBlockDataFromDocument(notaData.content, idMapping.get(notaData.id)!)
        }
      }
      
      // First, create all notas without parent relationships
      for (const notaData of allNotas) {
        const newId = idMapping.get(notaData.id)!

        const newNota: Nota = {
          ...deserializeNota(notaData),
          id: newId,
          parentId: null, // Will be set after all notas are created
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const adapter = getDb()
        if (adapter) await adapter.saveNota(newNota)
        else await db.notas.add(serializeNota(newNota))
        this.items.push(newNota)
        importedNotas.push(newNota)
      }

      // Now establish parent-child relationships
      for (const notaData of allNotas) {
        if (notaData.parentId) {
          const newNotaId = idMapping.get(notaData.id)
          const newParentId = idMapping.get(notaData.parentId)
          
          if (newNotaId && newParentId) {
            await this.moveNota(newNotaId, newParentId)
          }
        }
      }

      // Import content for each nota
      for (let i = 0; i < allNotas.length; i++) {
        const notaData = allNotas[i]
        const newNotaId = idMapping.get(notaData.id)
        
        if (newNotaId && notaData.content) {
          const blockStore = useBlockStore()
          await blockStore.importTiptapContent(newNotaId, notaData.content)
          await this.persistCanonicalContent(newNotaId)
        }
      }

      return importedNotas
    },

    async publishNota(id: string, includeSubPages = false): Promise<PublishedNota> {
      try {
        const nota = this.getCurrentNota(id)
        if (!nota) throw new Error('Nota not found')

        toast(`Processing content for "${nota.title}"...`)

        // Get the list of published sub-pages if we're including them
        const publishedSubPageIds: string[] = []

        // Only publish sub-pages if includeSubPages is true
        if (includeSubPages) {
          const subPages = await this.getSubPages(id)
          if (subPages.length > 0) {
            toast(`Publishing ${subPages.length} sub-page(s)...`)

            // Publish all sub-pages first
            for (const subPage of subPages) {
              try {
                // Recursively publish each sub-page
                await this.publishNota(subPage.id, includeSubPages)
                // Add to the list of published sub-pages
                publishedSubPageIds.push(subPage.id)
              } catch (error) {
                logger.error(`Failed to publish sub-page "${subPage.title}":`, error)
                // Continue with other sub-pages even if one fails
              }
            }
          }
        } else {
          // If not including sub-pages, get existing published sub-pages
          const publishedNota = await this.getPublishedNota(id).catch(() => null)
          if (publishedNota?.publishedSubPages) {
            publishedSubPageIds.push(...publishedNota.publishedSubPages)
          }
        }

        // Get content from block-based system
        const blockStore = useBlockStore()
        const tiptapContent = blockStore.getTiptapContent(id)
        
        if (!tiptapContent) {
          throw new Error('No content available to publish')
        }

        // Process the content with the list of published sub-pages
        // This will replace data URLs with hosted images AND handle page links
        // according to the published sub-pages list
        const processedContent = await processNotaContent(tiptapContent, {
          publishedSubPages: publishedSubPageIds,
        })

        // Prepare nota data for publishing with processed content
        const authStore = useAuthStore()
        const actor = authStore.currentUser
        if (!actor) throw new Error('Sign in is required to publish')
        const canonicalContent = normalizeCloudPublishedContent(processedContent)
        if (!canonicalContent) throw new Error('Published content must be a JSON document object')
        const api = await getPublicationCloudApi()
        const result = await api.publishing.upsertPublication({
          id, authorId: actor.uid, title: nota.title,
          content: canonicalContent, authorName: actor.displayName ?? '',
          isPublic: true, isSubPage: Boolean(nota.parentId), parentId: nota.parentId ?? null,
          tags: nota.tags ?? [], citations: (nota.citations ?? []) as unknown as CloudJson[],
          publishedSubPages: publishedSubPageIds,
          publishedAt: nota.publishedAt ? String(nota.publishedAt) : new Date().toISOString(),
          updatedAt: nota.updatedAt instanceof Date ? nota.updatedAt.toISOString() : String(nota.updatedAt),
        })
        if (!result.ok) throw result.error
        const published = publishedNota(result.data)

        // Update local state
        if (!this.publishedNotas.includes(id)) {
          this.publishedNotas.push(id)
        }

        // Update nota with publish status
        nota.isPublished = true
        nota.publishedAt = published.publishedAt

        // Save the updated nota (no need to store processed content back)
        await this.saveItem({ ...nota })

        toast(`Nota "${nota.title}" published successfully`)

        return published
      } catch (error) {
        logger.error('Failed to publish nota:', error)
        toast('Failed to publish nota')
        throw error
      }
    },

    async unpublishNota(id: string): Promise<boolean> {
      try {
        const nota = this.getCurrentNota(id)
        if (!nota) throw new Error('Nota not found')

        // Get info about any published sub-pages
        let publishedSubPageIds: string[] = []

        // Get published nota to check for published sub-pages
        const publishedNota = await this.getPublishedNota(id).catch(() => null)

        if (publishedNota && publishedNota.publishedSubPages) {
          publishedSubPageIds = publishedNota.publishedSubPages
        }

        // Also check for any published sub-pages directly
        const subPages = await this.getSubPages(id)

        for (const subPage of subPages) {
          if (this.isPublished(subPage.id) && !publishedSubPageIds.includes(subPage.id)) {
            publishedSubPageIds.push(subPage.id)
          }
        }

        // Call the API to unpublish the nota and all sub-pages
        const api = await getPublicationCloudApi()
        const result = await api.publishing.deletePublication(id)
        if (!result.ok) throw result.error

        // Update local state for the main nota
        this.publishedNotas = this.publishedNotas.filter((notaId) => notaId !== id)
        nota.isPublished = false
        nota.publishedAt = null
        await this.saveItem(nota)

        // Update local state for all sub-pages
        if (publishedSubPageIds.length > 0) {
          for (const subPageId of publishedSubPageIds) {
            // Only update if it was published
            const subPage = this.getCurrentNota(subPageId)
            if (subPage) {
              this.publishedNotas = this.publishedNotas.filter((notaId) => notaId !== subPageId)
              subPage.isPublished = false
              subPage.publishedAt = null
              await this.saveItem(subPage)
            }
          }
        }

        toast(`Nota "${nota.title}" unpublished successfully`)

        return true
      } catch (error) {
        logger.error('Failed to unpublish nota:', error)
        toast('Failed to unpublish nota')
        throw error
      }
    },

    async getPublishedNota(id: string) {
      try {
        const result = await (await getPublicationCloudApi()).publishing.getPublication(id)
        if (!result.ok) throw result.error
        return result.data ? publishedNota(result.data) : null
      } catch (error) {
        logger.error('Failed to fetch published nota:', error)
        throw error
      }
    },

    async getPublishedNotasByUser(userId: string, userTag?: string) {
      try {
        const result = await (await getPublicationCloudApi()).publishing.listPublications({
          limit: 100, authorId: userId, authorTag: userTag || null,
        })
        if (!result.ok) throw result.error
        return result.data.items.map(publishedNota)
      } catch (error) {
        logger.error('Failed to fetch published notas by user:', error)
        return []
      }
    },

    async loadPublishedNotas() {
      try {
        const authStore = useAuthStore()
        const userId = authStore.currentUser?.uid

        if (!userId) return []

        const result = await (await getPublicationCloudApi()).publishing.listPublications({ limit: 100, ownerOnly: true })
        if (!result.ok) throw result.error
        const publishedNotas = result.data.items.map(publishedNota)

        // Extract IDs
        const publishedIds = publishedNotas.map((nota) => nota.id)

        // Update local state
        this.publishedNotas = publishedIds

        // Sync the isPublished status with our local notas
        for (const nota of this.items) {
          if (publishedIds.includes(nota.id) && !nota.isPublished) {
            nota.isPublished = true
            await this.saveItem(nota)
          } else if (!publishedIds.includes(nota.id) && nota.isPublished) {
            nota.isPublished = false
            nota.publishedAt = null
            await this.saveItem(nota)
          }
        }

        return publishedIds
      } catch (error) {
        logger.error('Failed to load published notas:', error)
        return []
      }
    },

    updateNota(id: string, updates: Partial<Nota>) {
      const index = this.items.findIndex(item => item.id === id)
      if (index !== -1) {
        const updatedNota = { ...this.items[index], ...updates }
        this.items[index] = updatedNota
        this.saveItem(updatedNota)
      }
    },

    async searchNotasByTitle(title: string): Promise<Nota[]> {
      try {
        const results = this.items.filter((nota) => nota.title.toLowerCase().includes(title.toLowerCase()))
        return results
      } catch (error) {
        logger.error('Failed to search notas by title:', error)
        return []
      }
    },

    async clonePublishedNota(publishedNotaId: string): Promise<Nota | null> {
      try {
        // Get the published nota data
        const publishedNota = await this.getPublishedNota(publishedNotaId)
        if (!publishedNota || !publishedNota.content) {
          throw new Error('Published nota not found or has no content')
        }

        // Record clone action in statistics
        const authStore = useAuthStore()
        if (authStore.isAuthenticated && authStore.currentUser?.uid) {
          void (await getPublicationCloudApi()).statistics.recordClone(publishedNotaId)
        }

        // Create a new nota with a new ID but copy the content
        const newNotaId = nanoid()
        const newNota: Nota = {
          id: newNotaId,
          title: `${publishedNota.title} (Clone)`,
          parentId: null, // Reset parent ID as this is a clone
          tags: publishedNota.tags ? [...publishedNota.tags] : [],
          createdAt: new Date(),
          updatedAt: new Date(),
          blockStructure: {
            notaId: newNotaId,
            blockOrder: [],
            version: 1,
            lastModified: new Date(),
          },
        }

        // Copy citations if they exist
        if (publishedNota.citations && publishedNota.citations.length > 0) {
          newNota.citations = publishedNota.citations.map(citation => ({
            ...citation,
            id: crypto.randomUUID()
          }))
        }

        // Save the new nota to the database
        const adapter = getDb()
        if (adapter) await adapter.saveNota(newNota)
        else await db.notas.add(serializeNota(newNota))
        
        // Add to the store's items array
        this.items.push(newNota)

        // Convert the published content to blocks
        const blockStore = useBlockStore()
        if (publishedNota.content) {
          try {
            // Parse the content if it's a string, or use it directly if it's an object
            const contentToConvert = typeof publishedNota.content === 'string' 
              ? JSON.parse(publishedNota.content) 
              : publishedNota.content
            
            // TODO: Implement proper block creation instead of legacy conversion
            logger.info('Content conversion not yet implemented for block system')
          } catch (error) {
            logger.error('Failed to convert published content to blocks:', error)
          }
        }

        // Clone sub-notas if they exist
        if (publishedNota.publishedSubPages && publishedNota.publishedSubPages.length > 0) {
          toast(`Cloning ${publishedNota.publishedSubPages.length} sub-pages...`)
          
          // Keep track of original ID to new ID mapping
          const idMapping = new Map<string, string>()
          idMapping.set(publishedNotaId, newNota.id)
          
          // First pass: clone all sub-pages
          for (const subPageId of publishedNota.publishedSubPages) {
            try {
              const subPageNota = await this.getPublishedNota(subPageId)
              if (!subPageNota) continue
              
              // Create clone of sub-nota
              const newSubNotaId = nanoid()
              const newSubNota: Nota = {
                id: newSubNotaId,
                title: subPageNota.title,
                parentId: newNota.id, // Set parent to the new parent nota
                tags: subPageNota.tags ? [...subPageNota.tags] : [],
                createdAt: new Date(),
                updatedAt: new Date(),
                blockStructure: {
                  notaId: newSubNotaId,
                  blockOrder: [],
                  version: 1,
                  lastModified: new Date(),
                },
              }
              
              // Copy citations if they exist
              if (subPageNota.citations && subPageNota.citations.length > 0) {
                newSubNota.citations = subPageNota.citations.map(citation => ({
                  ...citation,
                  id: crypto.randomUUID()
                }))
              }
              
              // Save the new sub-nota
              const adapter = getDb()
              if (adapter) await adapter.saveNota(newSubNota)
              else await db.notas.add(serializeNota(newSubNota))
              
              // Add to store's items array
              this.items.push(newSubNota)

              // Convert the published content to blocks for sub-nota
              if (subPageNota.content) {
                try {
                  const contentToConvert = typeof subPageNota.content === 'string' 
                    ? JSON.parse(subPageNota.content) 
                    : subPageNota.content
                  
                  // TODO: Implement proper block creation instead of legacy conversion
                  logger.info('Content conversion not yet implemented for block system')
                } catch (error) {
                  logger.error('Failed to convert sub-nota content to blocks:', error)
                }
              }
              
              // Track ID mapping for updating references
              idMapping.set(subPageId, newSubNota.id)
              
            } catch (error) {
              logger.error(`Failed to clone sub-nota ${subPageId}:`, error)
              // Continue with other sub-notas even if one fails
            }
          }
          
          // Second pass: update all content to reference new IDs for page links
          for (const newNotaId of idMapping.values()) {
            try {
              const nota = this.getCurrentNota(newNotaId)
              if (!nota) continue
              
              // Get content from block-based system
              const blockStore = useBlockStore()
              const tiptapContent = blockStore.getTiptapContent(newNotaId)
              
              if (!tiptapContent) continue
              
              let modified = false
              
              // Helper function to recursively update page links
              const updatePageLinks = (node: any) => {
                if (node.type === 'pageLink' && node.attrs && node.attrs.href) {
                  // Extract the old ID from the href
                  const hrefMatch = node.attrs.href.match(/\/nota\/([^/]+)/)
                  if (hrefMatch && hrefMatch[1]) {
                    const oldId = hrefMatch[1]
                    const newId = idMapping.get(oldId)
                    
                    if (newId) {
                      // Update href with new ID
                      node.attrs.href = `/nota/${newId}`
                      modified = true
                    }
                  }
                }
                
                // Process child nodes
                if (node.content && Array.isArray(node.content)) {
                  node.content.forEach(updatePageLinks)
                }
              }
              
              // Update links in content
              if (tiptapContent.content && Array.isArray(tiptapContent.content)) {
                tiptapContent.content.forEach(updatePageLinks)
              }
              
              // If content was modified, update the blocks
              if (modified) {
                // TODO: Implement proper block update instead of legacy conversion
                logger.info('Content update not yet implemented for block system')
              }
            } catch (error) {
              logger.error(`Failed to update references in nota ${newNotaId}:`, error)
            }
          }
        }

        toast(`Nota "${newNota.title}" cloned successfully with all sub-pages`)

        return newNota
      } catch (error) {
        logger.error('Failed to clone published nota:', error)
        toast('Failed to clone nota')
        return null
      }
    },

    /**
     * Get nota content as Tiptap format from the block system
     * This replaces the legacy content field
     */
    async getNotaContentAsTiptap(notaId: string): Promise<any | null> {
      try {
        const blockStore = useBlockStore()
        return blockStore.getTiptapContent(notaId)
      } catch (error) {
        logger.error('Failed to get nota content from blocks:', error)
        return null
      }
    }
  },
})
