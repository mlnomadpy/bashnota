import type {
  Block,
  PersistedProseMirrorNode,
  ProseMirrorNodeJSON,
} from '@/features/nota/types/blocks'
import { isSafeLinkUri } from './stockExtensions'
import { assertDeclaredSchemaAttrs, persistedContentSchema } from './persistedContentSchema'

export const PERSISTED_PROSEMIRROR_NODE_VERSION = 1 as const

export const PERSISTED_PROSEMIRROR_NODE_POLICIES = {
  doc: 'document-root',
  paragraph: 'top-level-block',
  text: 'inline-exact',
  hardBreak: 'inline-exact',
  image: 'inline-exact',
  heading: 'top-level-block',
  blockquote: 'top-level-block',
  horizontalRule: 'top-level-block',
  bulletList: 'top-level-block',
  orderedList: 'top-level-block',
  listItem: 'nested-structure',
  taskList: 'top-level-block',
  taskItem: 'nested-structure',
  table: 'top-level-block',
  tableRow: 'nested-structure',
  tableCell: 'nested-structure',
  tableHeader: 'nested-structure',
  executableCodeBlock: 'top-level-block',
  pageLink: 'inline-exact',
  notaTable: 'top-level-block',
  math: 'top-level-block',
  youtube: 'top-level-block',
  subfigure: 'top-level-block',
  drawio: 'top-level-block',
  citation: 'inline-exact',
  bibliography: 'top-level-block',
  theorem: 'top-level-block',
  confusionMatrix: 'top-level-block',
  pipeline: 'top-level-block',
  subNotaLink: 'top-level-block',
  codeBlock: 'legacy-compatible-block',
  aiGeneration: 'legacy-compatible-block',
  mermaid: 'legacy-compatible-block',
  notaTitle: 'editor-title-block',
} as const

export const PERSISTED_PROSEMIRROR_MARK_POLICIES = {
  bold: 'inline-exact',
  italic: 'inline-exact',
  strike: 'inline-exact',
  code: 'inline-exact',
  link: 'inline-exact-safe-url',
} as const

const inlineNodeTypes = new Set(['text', 'hardBreak', 'image', 'pageLink', 'citation'])

function assertPlainJson(value: unknown, path: string, optionalObjectProperty = false): void {
  // ProseMirror NodeSpec defaults may materialize as `undefined` inside attrs.
  // JSON represents that identically to an absent optional attribute, so object
  // properties are omitted during cloning. Undefined array items remain invalid.
  if (value === undefined) {
    if (optionalObjectProperty) return
    throw new Error(`${path} is not JSON-serializable`)
  }
  // Legacy aiGeneration rows hydrate timestamps as Date instances before they
  // enter the editor. Their established JSON meaning is the same UTC instant.
  if (value instanceof Date) {
    if (Number.isFinite(value.getTime())) return
    throw new Error(`${path} contains an invalid date`)
  }
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return
  if (typeof value === 'number') {
    if (Number.isFinite(value)) return
    throw new Error(`${path} contains a non-finite number`)
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertPlainJson(item, `${path}[${index}]`))
    return
  }
  if (typeof value !== 'object') throw new Error(`${path} is not JSON-serializable`)
  const prototype = Object.getPrototypeOf(value)
  if (prototype !== Object.prototype && prototype !== null) {
    throw new Error(`${path} must be a plain JSON object`)
  }
  for (const [key, child] of Object.entries(value)) assertPlainJson(child, `${path}.${key}`, true)
}

function clonePlainJson<T>(value: T): T {
  assertPlainJson(value, 'ProseMirror content')
  return JSON.parse(JSON.stringify(value)) as T
}

function validateSafeLinks(node: ProseMirrorNodeJSON, path = 'doc'): void {
  for (const [index, mark] of (node.marks ?? []).entries()) {
    if (mark.type === 'link' && !isSafeLinkUri(mark.attrs?.href)) {
      throw new Error(`Unsafe link at ${path}.marks[${index}]`)
    }
  }
  if (node.type === 'pageLink' && node.attrs?.href != null && !isSafeLinkUri(node.attrs.href)) {
    throw new Error(`Unsafe page link at ${path}`)
  }
  ;(node.content ?? []).forEach((child, index) => validateSafeLinks(child, `${path}.content[${index}]`))
}

export function validateProseMirrorDocument(document: unknown): asserts document is ProseMirrorNodeJSON {
  assertPlainJson(document, 'ProseMirror document')
  const node = document as ProseMirrorNodeJSON
  if (node.type !== 'doc') throw new Error('Persisted ProseMirror content must have a doc root')
  assertDeclaredSchemaAttrs(node)
  const parsed = persistedContentSchema.nodeFromJSON(node)
  parsed.check()
  validateSafeLinks(parsed.toJSON() as ProseMirrorNodeJSON)
}

function normalizedTopLevelNode(node: ProseMirrorNodeJSON): ProseMirrorNodeJSON {
  if (inlineNodeTypes.has(node.type)) return { type: 'paragraph', content: [node] }
  return node
}

export function persistedProseMirrorNode(node: unknown): PersistedProseMirrorNode {
  const value = clonePlainJson(normalizedTopLevelNode(node as ProseMirrorNodeJSON))
  validateProseMirrorDocument({ type: 'doc', content: [value] })
  return { format: 'prosemirror-node', version: PERSISTED_PROSEMIRROR_NODE_VERSION, value }
}

const blockRootTypes: Record<Block['type'], ReadonlySet<string>> = {
  text: new Set(['paragraph', 'notaTitle']),
  heading: new Set(['heading']),
  code: new Set(['codeBlock']),
  math: new Set(['math']),
  table: new Set(['table']),
  image: new Set(['paragraph']),
  quote: new Set(['blockquote']),
  list: new Set(['bulletList', 'orderedList', 'taskList']),
  horizontalRule: new Set(['horizontalRule']),
  youtube: new Set(['youtube']),
  drawio: new Set(['drawio']),
  citation: new Set(['paragraph']),
  bibliography: new Set(['bibliography']),
  subfigure: new Set(['subfigure']),
  notaTable: new Set(['notaTable']),
  aiGeneration: new Set(['aiGeneration']),
  executableCodeBlock: new Set(['executableCodeBlock']),
  confusionMatrix: new Set(['confusionMatrix']),
  theorem: new Set(['theorem']),
  pipeline: new Set(['pipeline']),
  mermaid: new Set(['mermaid']),
  subNotaLink: new Set(['subNotaLink']),
}

export function restoredProseMirrorNode(block: Block): ProseMirrorNodeJSON | null {
  if (block.proseMirrorNode === undefined) return null
  const persisted = clonePlainJson(block.proseMirrorNode)
  if (
    persisted.format !== 'prosemirror-node'
    || persisted.version !== PERSISTED_PROSEMIRROR_NODE_VERSION
    || !persisted.value
  ) {
    throw new Error(`Unsupported persisted ProseMirror representation on ${block.type} block`)
  }
  validateProseMirrorDocument({ type: 'doc', content: [persisted.value] })
  if (!blockRootTypes[block.type].has(persisted.value.type)) {
    throw new Error(`Persisted ${persisted.value.type} node does not match ${block.type} block`)
  }
  return clonePlainJson(persisted.value)
}

export function persistedNodeText(node: any): string {
  if (typeof node?.text === 'string') return node.text
  return Array.isArray(node?.content)
    ? node.content.map(persistedNodeText).filter(Boolean).join(' ')
    : ''
}

export function persistedInlineBlockData(node: any): Record<string, unknown> | null {
  if (node?.content?.length !== 1) return null
  const child = node.content[0]
  if (child.type === 'image') {
    return {
      type: 'image',
      src: child.attrs?.src || '',
      alt: child.attrs?.alt || '',
      caption: child.attrs?.title || '',
    }
  }
  if (child.type === 'citation') {
    return {
      type: 'citation',
      citationKey: child.attrs?.citationKey || '',
      citationData: child.attrs?.citationData || {},
    }
  }
  return null
}

export function persistedTableBlockData(node: any): Record<string, unknown> {
  return {
    type: 'table',
    headers: node.content?.[0]?.content?.map(persistedNodeText) || [],
    rows: node.content?.slice(1)?.map((row: any) => row.content?.map(persistedNodeText) || []) || [],
  }
}

export function persistedCustomBlockData(node: any): Record<string, unknown> | null {
  switch (node?.type) {
    case 'codeBlock':
      return {
        type: 'code',
        language: node.attrs?.language || 'text',
        content: persistedNodeText(node),
        output: node.attrs?.output,
        sessionId: node.attrs?.sessionId,
        isExecuting: node.attrs?.isExecuting || false,
        executionTime: node.attrs?.executionTime,
        error: node.attrs?.error,
      }
    case 'math':
      return {
        type: 'math',
        latex: node.attrs?.latex ?? persistedNodeText(node),
        displayMode: node.attrs?.displayMode || false,
      }
    case 'youtube':
      return { type: 'youtube', videoId: node.attrs?.videoId || '', title: node.attrs?.title || '' }
    case 'drawio':
      return {
        type: 'drawio',
        diagramData: node.attrs?.diagramData || '',
        width: node.attrs?.width,
        height: node.attrs?.height,
      }
    case 'citation':
      return { type: 'citation', citationKey: node.attrs?.citationKey || '', citationData: node.attrs?.citationData || {} }
    case 'bibliography':
      return { type: 'bibliography', citations: node.attrs?.citations || [] }
    case 'subfigure':
      return { type: 'subfigure', images: node.attrs?.subfigures || [], layout: node.attrs?.layout || 'horizontal' }
    case 'notaTable':
      return { type: 'notaTable', tableData: node.attrs?.tableData || [], columns: node.attrs?.columns || [] }
    case 'aiGeneration':
      return {
        type: 'aiGeneration',
        prompt: node.attrs?.prompt || '',
        generatedContent: persistedNodeText(node),
        model: node.attrs?.model,
        timestamp: node.attrs?.timestamp,
      }
    case 'executableCodeBlock':
      return {
        type: 'executableCodeBlock',
        language: node.attrs?.language || 'text',
        content: persistedNodeText(node),
        output: node.attrs?.output,
        sessionId: node.attrs?.sessionId,
        isExecuting: node.attrs?.isExecuting || false,
        executionTime: node.attrs?.executionTime,
        error: node.attrs?.error,
        kernelPreferences: node.attrs?.kernelPreferences,
      }
    case 'confusionMatrix':
      return {
        type: 'confusionMatrix',
        matrixData: node.attrs?.matrixData,
        title: node.attrs?.title || 'Confusion Matrix',
        source: node.attrs?.source || 'upload',
        filePath: node.attrs?.filePath || '',
        stats: node.attrs?.stats,
      }
    case 'theorem':
      return {
        type: 'theorem',
        title: node.attrs?.title || 'Theorem',
        content: node.attrs?.content || '',
        proof: node.attrs?.proof || '',
        theoremType: node.attrs?.type || 'theorem',
        number: node.attrs?.number,
        tags: node.attrs?.tags || [],
      }
    case 'pipeline':
      return {
        type: 'pipeline',
        title: node.attrs?.title || 'Pipeline',
        description: node.attrs?.description,
        nodes: node.attrs?.nodes || [],
        edges: node.attrs?.edges || [],
        config: node.attrs?.config,
      }
    case 'mermaid':
      return {
        type: 'mermaid',
        content: node.attrs?.content || '',
        title: node.attrs?.title,
        theme: node.attrs?.theme || 'default',
        config: node.attrs?.config,
      }
    case 'subNotaLink':
      return {
        type: 'subNotaLink',
        targetNotaId: node.attrs?.targetNotaId || '',
        targetNotaTitle: node.attrs?.targetNotaTitle || 'Untitled Nota',
        displayText: node.attrs?.displayText || node.attrs?.targetNotaTitle || 'Untitled Nota',
        linkStyle: node.attrs?.linkStyle || 'inline',
      }
    default:
      return null
  }
}

/**
 * Convert one top-level editor node into its legacy typed block fields plus the
 * authoritative, versioned ProseMirror representation. Call this for the whole
 * document before writing any block so unsupported input cannot partially save.
 */
export function persistedBlockDataFromNode(
  node: unknown,
  notaId: string,
  order: number,
): Omit<Block, 'id' | 'createdAt' | 'updatedAt' | 'version'> {
  const proseMirrorNode = persistedProseMirrorNode(node)
  const source = node as ProseMirrorNodeJSON
  let legacy: Record<string, unknown> | null = persistedCustomBlockData(source)

  if (!legacy) {
    switch (source.type) {
      case 'heading':
        legacy = { type: 'heading', level: source.attrs?.level || 1, content: persistedNodeText(source) }
        break
      case 'paragraph':
        legacy = persistedInlineBlockData(source) ?? { type: 'text', content: source.content || '' }
        break
      case 'image':
        legacy = persistedInlineBlockData({ content: [source] })
        break
      case 'citation':
        legacy = persistedInlineBlockData({ content: [source] })
        break
      case 'pageLink':
        legacy = { type: 'text', content: [source] }
        break
      case 'notaTitle':
        legacy = { type: 'text', content: source.content || '' }
        break
      case 'table':
        legacy = persistedTableBlockData(source)
        break
      case 'blockquote':
        legacy = { type: 'quote', content: persistedNodeText(source) }
        break
      case 'bulletList':
      case 'orderedList':
      case 'taskList':
        legacy = {
          type: 'list',
          listType: source.type === 'orderedList' ? 'ordered' : source.type === 'taskList' ? 'task' : 'unordered',
          items: source.content?.map(persistedNodeText) || [],
          ...(source.type === 'taskList'
            ? { checked: source.content?.map((item) => item.attrs?.checked === true) || [] }
            : {}),
        }
        break
      case 'horizontalRule':
        legacy = { type: 'horizontalRule' }
        break
      default:
        throw new Error(`Unsupported top-level ProseMirror node: ${source.type}`)
    }
  }
  if (!legacy) throw new Error(`Unable to persist ProseMirror node: ${source.type}`)
  return clonePlainJson({ ...legacy, order, notaId, proseMirrorNode }) as Omit<Block, 'id' | 'createdAt' | 'updatedAt' | 'version'>
}
