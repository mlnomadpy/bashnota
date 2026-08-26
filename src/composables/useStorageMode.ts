import { ref, computed } from 'vue'
import { logger } from '@/services/logger'
import { getFileWatcher, type FileWatcherService } from '@/services/fileWatcherService'
import type { FileSystemNotaDocument } from '@/services/fileSystemBackend'

/**
 * Storage mode types
 */
export type StorageMode = 'indexeddb' | 'filesystem'

/**
 * Storage mode configuration
 */
interface StorageModeConfig {
  mode: StorageMode
  autoWatch: boolean // For filesystem mode: watch for file changes
  directoryHandle?: FileSystemDirectoryHandle | null
}

// Storage key for persistence
const STORAGE_KEY = 'bashnota-storage-mode'

function comparableDocument(document: FileSystemNotaDocument): string {
  return JSON.stringify({ nota: document.nota, canonicalContent: document.canonicalContent })
}

function assertCompleteMigration(
  source: ReadonlyArray<FileSystemNotaDocument>,
  target: ReadonlyArray<FileSystemNotaDocument>,
  message: string,
): void {
  const targetById = new Map(target.map((document) => [document.nota.id, comparableDocument(document)]))
  if (targetById.size !== source.length
    || source.some((document) => targetById.get(document.nota.id) !== comparableDocument(document))) {
    throw new Error(message)
  }
}

// File watcher instance
let fileWatcher: FileWatcherService | null = null

// Load initial configuration from localStorage
function loadStorageConfig(): StorageModeConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const config = JSON.parse(saved)
      return {
        mode: config.mode || 'indexeddb',
        autoWatch: config.autoWatch ?? true,
        directoryHandle: null // Can't persist this
      }
    }
  } catch (error) {
    logger.error('Failed to load storage mode config:', error)
  }

  // Default configuration
  return {
    mode: 'indexeddb',
    autoWatch: true,
    directoryHandle: null
  }
}

// Save configuration to localStorage
function persistStorageConfig(config: StorageModeConfig): void {
  const toSave = {
    mode: config.mode,
    autoWatch: config.autoWatch
    // Don't save directoryHandle as it can't be serialized
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  logger.info('[StorageMode] Configuration saved:', toSave)
}

function saveStorageConfig(config: StorageModeConfig): void {
  try {
    persistStorageConfig(config)
  } catch (error) {
    logger.error('Failed to save storage mode config:', error)
  }
}

// Reactive configuration
const config = ref<StorageModeConfig>(loadStorageConfig())

/**
 * Composable for managing storage mode
 */
export function useStorageMode() {
  // Current storage mode
  const storageMode = computed({
    get: () => config.value.mode,
    set: (value: StorageMode) => {
      config.value.mode = value
      saveStorageConfig(config.value)
      logger.info('[StorageMode] Mode changed to:', value)
    }
  })

  // Auto-watch setting for filesystem mode
  const autoWatch = computed({
    get: () => config.value.autoWatch,
    set: (value: boolean) => {
      config.value.autoWatch = value
      saveStorageConfig(config.value)
      logger.info('[StorageMode] Auto-watch changed to:', value)
      
      // Update file watcher
      if (fileWatcher) {
        if (value && config.value.mode === 'filesystem') {
          fileWatcher.start().catch(error => {
            logger.error('[StorageMode] Failed to start file watcher:', error)
          })
        } else {
          fileWatcher.stop()
        }
      }
    }
  })

  // Check if filesystem mode is supported
  const isFilesystemSupported = computed(() => {
    return typeof window !== 'undefined' && 'showDirectoryPicker' in window
  })

  // Check if currently using filesystem mode
  const isFilesystemMode = computed(() => config.value.mode === 'filesystem')

  // Check if currently using IndexedDB mode
  const isIndexedDBMode = computed(() => config.value.mode === 'indexeddb')

  // Check if file watcher is active
  const isWatchingFiles = computed(() => {
    return fileWatcher?.isActive() || false
  })

  // Switch to filesystem mode
  const switchToFilesystem = async (directoryHandle?: FileSystemDirectoryHandle) => {
    if (!isFilesystemSupported.value) {
      throw new Error('File System Access API is not supported in this browser')
    }

    // Build and verify the complete target while IndexedDB remains the
    // authority. Persisting the mode is deliberately the final operation.
    const [{ FileSystemBackend }, { db }, adapterModule] = await Promise.all([
      import('@/services/fileSystemBackend'),
      import('@/db'),
      import('@/services/databaseAdapter'),
    ])
    const target = new FileSystemBackend()
    if (directoryHandle) await target.setDirectoryHandle(directoryHandle)
    else await target.initialize()

    await adapterModule.runDatabaseAuthorityTransition(async () => {
      const sourceNotas = await db.notas.toArray()
      const targetBefore = await target.snapshotDirectory()
      try {
        const sourceDocuments: FileSystemNotaDocument[] = []
        for (const nota of sourceNotas) sourceDocuments.push(await target.createNotaDocument(nota))
        for (const document of sourceDocuments) await target.writeNotaDocument(document)
        const targetNotas = await target.listNotas()
        const sourceShape = sourceNotas
          .map(({ id, parentId }) => ({ id, parentId }))
          .sort((left, right) => left.id.localeCompare(right.id))
        const targetShape = targetNotas
          .map(({ id, parentId }) => ({ id, parentId }))
          .sort((left, right) => left.id.localeCompare(right.id))
        if (JSON.stringify(sourceShape) !== JSON.stringify(targetShape)) {
          throw new Error('Filesystem migration verification failed; IndexedDB remains authoritative.')
        }
        const targetDocuments = await Promise.all(
          sourceDocuments.map((document) => target.readNotaDocument(document.nota.id)),
        )
        assertCompleteMigration(
          sourceDocuments,
          targetDocuments,
          'Filesystem migration content verification failed; IndexedDB remains authoritative.',
        )

        const nextAdapter = adapterModule.createDatabaseAdapterForBackend(target, true)
        persistStorageConfig({ ...config.value, mode: 'filesystem' })
        adapterModule.installDatabaseAdapter(nextAdapter)
        config.value = { ...config.value, mode: 'filesystem', directoryHandle: directoryHandle ?? config.value.directoryHandle }
      } catch (error) {
        try {
          await target.restoreDirectory(targetBefore)
        } catch (rollbackError) {
          throw new Error(
            `Filesystem migration failed and target rollback was incomplete: ${String(error)}; rollback: ${String(rollbackError)}`,
          )
        }
        throw error
      }
    })
    logger.info('[StorageMode] Switched to filesystem mode')
  }

  // Switch to IndexedDB mode
  const switchToIndexedDB = async () => {
    // Reading the filesystem validates all documents before atomically
    // hydrating their canonical rows. Replace metadata in one Dexie
    // transaction and only then change the persisted authority flag.
    const [adapterModule, { db }] = await Promise.all([
      import('@/services/databaseAdapter'),
      import('@/db'),
    ])
    await adapterModule.runDatabaseAuthorityTransition(async () => {
      const adapter = adapterModule.useDatabaseAdapter()
      const notas = await adapter.getAllNotas()
      const sourceBackend = adapter.getStorageService().getBackend()
      if (!('readNotaDocument' in sourceBackend)) {
        throw new Error('Filesystem migration source cannot provide self-contained nota documents.')
      }
      const sourceDocuments = await Promise.all(notas.map((nota) => (
        sourceBackend as { readNotaDocument(id: string): Promise<FileSystemNotaDocument> }
      ).readNotaDocument(nota.id)))
      await db.transaction('rw', db.notas, async () => {
        await db.notas.clear()
        await db.notas.bulkPut(structuredClone(notas))
      })
      const persistedIds = (await db.notas.toCollection().primaryKeys()).map(String).sort()
      const expectedIds = notas.map((nota) => nota.id).sort()
      if (JSON.stringify(persistedIds) !== JSON.stringify(expectedIds)) {
        throw new Error('IndexedDB migration verification failed; filesystem remains authoritative.')
      }
      const { captureCanonicalContent } = await import('@/features/nota/services/versionHistoryPersistence')
      const targetDocuments = await Promise.all(sourceDocuments.map(async (document) => {
        const nota = await db.notas.get(document.nota.id)
        if (!nota) throw new Error(`IndexedDB migration lost nota ${document.nota.id}`)
        return {
          ...document,
          nota,
          canonicalContent: await captureCanonicalContent(document.nota.id),
        }
      }))
      assertCompleteMigration(
        sourceDocuments,
        targetDocuments,
        'IndexedDB migration content verification failed; filesystem remains authoritative.',
      )

      const nextAdapter = await adapterModule.createDatabaseAdapter(false, 'indexeddb')
      persistStorageConfig({ ...config.value, mode: 'indexeddb' })
      adapterModule.installDatabaseAdapter(nextAdapter)
      config.value = { ...config.value, mode: 'indexeddb', directoryHandle: null }
    })
    
    // Stop file watcher if running
    if (fileWatcher) {
      fileWatcher.stop()
    }
    
    logger.info('[StorageMode] Switched to IndexedDB mode')
  }

  // Set directory handle (for filesystem mode)
  const setDirectoryHandle = (handle: FileSystemDirectoryHandle | null) => {
    config.value.directoryHandle = handle
    logger.info('[StorageMode] Directory handle updated')
  }

  // Get directory handle
  const getDirectoryHandle = () => {
    return config.value.directoryHandle
  }

  // Initialize file watcher with backend
  const initializeFileWatcher = (backend: any, callbacks?: {
    onFileChanged?: (notaId: string, content: any) => void
    onFileAdded?: (notaId: string, content: any) => void
    onFileDeleted?: (notaId: string) => void
  }) => {
    if (!fileWatcher) {
      fileWatcher = getFileWatcher({
        pollInterval: 2000,
        onFileChanged: callbacks?.onFileChanged,
        onFileAdded: callbacks?.onFileAdded,
        onFileDeleted: callbacks?.onFileDeleted,
        onError: (error) => {
          logger.error('[StorageMode] File watcher error:', error)
        }
      })
    }
    
    fileWatcher.setBackend(backend)
    
    // Start watching if in filesystem mode and auto-watch is enabled
    if (config.value.mode === 'filesystem' && config.value.autoWatch) {
      fileWatcher.start().catch(error => {
        logger.error('[StorageMode] Failed to start file watcher:', error)
      })
    }
    
    return fileWatcher
  }

  // Stop file watcher
  const stopFileWatcher = () => {
    if (fileWatcher) {
      fileWatcher.stop()
    }
  }

  // Get storage mode description
  const getModeDescription = computed(() => {
    switch (config.value.mode) {
      case 'filesystem':
        return 'Files are stored directly in a selected folder as .nota files. Changes to files in the folder are reflected in real-time.'
      case 'indexeddb':
        return 'Files are stored in the browser\'s IndexedDB. Data is stored locally in the browser.'
      default:
        return 'Unknown storage mode'
    }
  })

  return {
    // State
    storageMode,
    autoWatch,
    
    // Computed
    isFilesystemSupported,
    isFilesystemMode,
    isIndexedDBMode,
    isWatchingFiles,
    getModeDescription,
    
    // Actions
    switchToFilesystem,
    switchToIndexedDB,
    setDirectoryHandle,
    getDirectoryHandle,
    initializeFileWatcher,
    stopFileWatcher
  }
}
