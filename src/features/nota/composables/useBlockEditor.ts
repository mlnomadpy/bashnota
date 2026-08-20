import { ref, computed } from 'vue';
import { useBlockStore } from '@/features/nota/stores/blockStore'
import { useNotaStore } from '@/features/nota/stores/nota'
import type { Block } from '@/features/nota/types/blocks'
import { logger } from '@/services/logger'
import {
  persistedBlockDataFromNode,
  validateProseMirrorDocument,
} from '@/features/editor/pm/persistedBlockConversion'

/**
 * Composable that integrates Tiptap editor with our block-based database
 * Tiptap handles all the editing, we handle the database storage
 */
export function useBlockEditor(notaId: string) {
  const blockStore = useBlockStore()
  const notaStore = useNotaStore()

  const isInitialized = ref(false)
  const lastSavedContent = ref<any>(null)

  /**
   * Get all blocks for the current nota
   */
  const blocks = computed(() => blockStore.getNotaBlocks(notaId))

  /**
   * Get the block structure for the current nota
   */
  const blockStructure = computed(() => blockStore.getBlockStructure(notaId))

  /**
   * Initialize blocks for the current nota
   * This should be called when a nota is first loaded
   */
  const initializeBlocks = async () => {
    if (isInitialized.value) return

    try {
      // Get the current nota
      const nota = notaStore.getCurrentNota(notaId)

      // Check if we already have blocks for this nota
      const existingBlocks = await blockStore.loadNotaBlocks(notaId, nota)

      if (existingBlocks.length === 0) {
        // No blocks exist, create initial block structure
        await blockStore.initializeNotaBlocks(notaId, nota?.title || 'Untitled')
      }

      isInitialized.value = true
      logger.info('Block system initialized for nota:', notaId)
    } catch (error) {
      logger.error('Failed to initialize blocks:', error)
    }
  }

  /**
   * Sync current Tiptap content to blocks
   * This is the main function that gets called when content changes
   */
  const syncContentToBlocks = async (tiptapContent: any) => {
    if (!isInitialized.value) {
      await initializeBlocks()
    }

    // Don't sync if content hasn't changed
    if (JSON.stringify(tiptapContent) === JSON.stringify(lastSavedContent.value)) {
      return
    }

    try {
      // Get the current block structure
      const currentStructure = blockStore.getBlockStructure(notaId)
      if (!currentStructure) {
        logger.error('No block structure found for nota:', notaId)
        return
      }

      // Validate and convert the complete document before the first write. An
      // unsupported/corrupt node must never leave a partially updated nota.
      validateProseMirrorDocument(tiptapContent)
      const convertedBlocks = (tiptapContent.content ?? []).map((node: unknown, order: number) =>
        persistedBlockDataFromNode(node, notaId, order),
      )
      await blockStore.replaceNotaContent(notaId, convertedBlocks)

      // Update the last saved content
      lastSavedContent.value = tiptapContent

      logger.info('Successfully synced Tiptap content to blocks for nota:', notaId, {
        blockCount: convertedBlocks.length,
        blockOrder: blockStore.getBlockStructure(notaId)?.blockOrder ?? [],
      })
    } catch (error) {
      logger.error('Failed to sync content to blocks:', error)
      throw error
    }
  }

  /**
   * Prepare live editor JSON inside a version-history transaction. The returned
   * rollback restores the composable's save cache if a later transaction step
   * fails, so the next autosave will not incorrectly skip the live document.
   */
  const syncContentForVersion = async (content: any): Promise<() => void> => {
    const previousLastSavedContent = lastSavedContent.value
    try {
      await syncContentToBlocks(content)
    } catch (error) {
      lastSavedContent.value = previousLastSavedContent
      throw error
    }
    return () => {
      lastSavedContent.value = previousLastSavedContent
    }
  }

  /**
   * Get blocks as Tiptap content for the editor
   * This converts our blocks back to Tiptap format
   */
  const getTiptapContent = computed(() => {
    if (!blockStructure.value || blocks.value.length === 0) {
      return null
    }

    // Use the store's method to get Tiptap content
    return blockStore.getTiptapContent(notaId)
  })

  /**
   * Insert a new block at a specific position
   * This is called when Tiptap creates new blocks
   */
  const insertBlock = async (blockType: Block['type'], content: any, position: number) => {
    try {
      let blockData: any = {
        type: blockType,
        order: position,
        notaId,
      }

      // Add type-specific properties
      switch (blockType) {
        case 'heading':
          blockData = { ...blockData, content: content, level: 1 }
          break
        case 'text':
          blockData = { ...blockData, content: content }
          break
        case 'code':
          blockData = { ...blockData, content: content, language: 'text' }
          break
        case 'math':
          blockData = { ...blockData, latex: content, displayMode: false }
          break
        case 'table':
          blockData = { ...blockData, headers: [], rows: [] }
          break
        case 'list':
          blockData = { ...blockData, listType: 'unordered', items: [] }
          break
        case 'drawio':
          blockData = { ...blockData, diagramData: content, width: undefined, height: undefined }
          break
        case 'citation':
          blockData = { ...blockData, citationKey: content, citationData: {} }
          break
        case 'bibliography':
          blockData = { ...blockData, citations: [] }
          break
        case 'subfigure':
          blockData = { ...blockData, images: [], layout: 'horizontal' }
          break
        case 'notaTable':
          blockData = { ...blockData, tableData: [], columns: [] }
          break
        case 'aiGeneration':
          blockData = { ...blockData, prompt: content, generatedContent: '', timestamp: new Date() }
          break
        case 'executableCodeBlock':
          blockData = { ...blockData, content: content, language: 'text', output: undefined, sessionId: undefined, isExecuting: false, kernelPreferences: undefined }
          break
        case 'confusionMatrix':
          blockData = { ...blockData, matrixData: undefined, title: 'Confusion Matrix', source: 'upload', filePath: '', stats: undefined }
          break
        case 'theorem':
          blockData = { ...blockData, title: 'Theorem', content: content, proof: '', theoremType: 'theorem', number: undefined, tags: [] }
          break
        case 'pipeline':
          blockData = { ...blockData, title: 'Pipeline', description: undefined, nodes: [], edges: [], config: undefined }
          break
        case 'mermaid':
          blockData = { ...blockData, content: content, title: undefined, theme: 'default', config: undefined }
          break
        case 'subNotaLink':
          blockData = {
            ...blockData,
            targetNotaId: 'placeholder',
            targetNotaTitle: 'Untitled Nota',
            displayText: 'Untitled Nota',
            linkStyle: 'inline'
          }
          break
        default:
          blockData = { ...blockData, content: content }
      }

      const newBlock = await blockStore.createBlock(blockData)

      logger.info('Inserted new block:', newBlock.id)
      return newBlock
    } catch (error) {
      logger.error('Failed to insert block:', error)
      throw error
    }
  }

  /**
   * Update a specific block
   * This is called when Tiptap updates block content
   */
  const updateBlock = async (blockId: string, updates: Partial<Block>) => {
    try {
      const updatedBlock = await blockStore.updateBlock(blockId, updates)
      logger.info('Updated block:', blockId)
      return updatedBlock
    } catch (error) {
      logger.error('Failed to update block:', error)
      throw error
    }
  }

  /**
   * Delete a block
   * This is called when Tiptap deletes blocks
   */
  const deleteBlock = async (blockId: string) => {
    try {
      await blockStore.deleteBlock(blockId)
      logger.info('Deleted block:', blockId)
    } catch (error) {
      logger.error('Failed to delete block:', error)
      throw error
    }
  }

  /**
   * Reorder blocks
   * This is called when Tiptap reorders blocks
   */
  const reorderBlocks = async (newOrder: string[]) => {
    try {
      await blockStore.reorderBlocks(notaId, newOrder)
      logger.info('Reordered blocks for nota:', notaId)
    } catch (error) {
      logger.error('Failed to reorder blocks:', error)
      throw error
    }
  }

  /**
   * Get block statistics for the nota
   */
  const blockStats = computed(() => {
    const stats = {
      totalBlocks: blocks.value.length,
      blockTypes: {} as Record<string, number>,
      wordCount: 0,
      characterCount: 0
    }

    blocks.value.forEach(block => {
      // Count block types
      stats.blockTypes[block.type] = (stats.blockTypes[block.type] || 0) + 1

      // Count words and characters
      if ('content' in block && typeof block.content === 'string') {
        const words = block.content.trim().split(/\s+/).filter(word => word.length > 0)
        stats.wordCount += words.length
        stats.characterCount += block.content.length
      }
    })

    return stats
  })

  return {
    // State
    isInitialized,
    blocks,
    blockStructure,

    // Actions
    initializeBlocks,
    syncContentToBlocks,
    syncContentForVersion,
    insertBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,

    // Computed
    getTiptapContent,
    blockStats
  }
}
