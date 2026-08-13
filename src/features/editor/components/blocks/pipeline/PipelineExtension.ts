/**
 * Pipeline node — ported onto the raw-ProseMirror primitives.
 *
 * Pipeline state is encoded in explicit data-* attributes. Arrays and objects use
 * JSON, so the raw ProseMirror parseDOM/toDOM path preserves the same state as the
 * document JSON path instead of relying on lossy DOM string coercion.
 */
import { defineNode, toTiptapNode } from '@/features/editor/pm'
import type { NodeDefinition } from '@/features/editor/pm'
import type { RawCommands } from '@tiptap/core'
import PipelineNode from './PipelineNode.vue'

function attribute(element: HTMLElement, dataName: string, legacyName: string): string | null {
  return element.getAttribute(dataName) ?? element.getAttribute(legacyName)
}

function jsonAttribute<T>(
  element: HTMLElement,
  dataName: string,
  legacyName: string,
  fallback: T,
): T {
  const value = attribute(element, dataName, legacyName)
  if (value == null || value === '') return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export interface PipelineAttributes {
  id: string
  nodes: unknown[]
  edges: unknown[]
  viewport: { x: number; y: number; zoom: number }
  title: string
  kernelMode: 'shared' | 'isolated' | 'mixed'
  sharedKernelName: string
  executionOrder: 'topological' | 'sequential' | 'parallel'
  stopOnError: boolean
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pipeline: {
      /**
       * Insert a pipeline
       */
      insertPipeline: (attributes?: Partial<PipelineAttributes>) => ReturnType
    }
  }
}

export const pipelineNodeDefinition: NodeDefinition = {
  name: 'pipeline',
  group: 'block',
  atom: true,
  draggable: true,
  attrs: {
    id: {
      default: () => `pipeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      parseHTML: (element) => attribute(element, 'data-id', 'id'),
    },
    nodes: {
      default: [],
      parseHTML: (element) => jsonAttribute(element, 'data-nodes', 'nodes', []),
    },
    edges: {
      default: [],
      parseHTML: (element) => jsonAttribute(element, 'data-edges', 'edges', []),
    },
    viewport: {
      default: { x: 0, y: 0, zoom: 1 },
      parseHTML: (element) =>
        jsonAttribute(element, 'data-viewport', 'viewport', { x: 0, y: 0, zoom: 1 }),
    },
    title: {
      default: 'Execution Pipeline',
      parseHTML: (element) => attribute(element, 'data-title', 'title') ?? 'Execution Pipeline',
    },
    kernelMode: {
      default: 'mixed',
      parseHTML: (element) => attribute(element, 'data-kernel-mode', 'kernelMode') ?? 'mixed',
    },
    sharedKernelName: {
      default: '',
      parseHTML: (element) =>
        attribute(element, 'data-shared-kernel-name', 'sharedKernelName') ?? '',
    },
    executionOrder: {
      default: 'topological',
      parseHTML: (element) =>
        attribute(element, 'data-execution-order', 'executionOrder') ?? 'topological',
    },
    stopOnError: {
      default: true,
      parseHTML: (element) => {
        const value = attribute(element, 'data-stop-on-error', 'stopOnError')
        return value == null ? true : value === 'true'
      },
    },
  },
  parseDOM: [{ tag: 'div[data-type="pipeline"]' }],
  toDOM: (node) => {
    const a = node.attrs as PipelineAttributes
    return [
      'div',
      {
        'data-type': 'pipeline',
        'data-id': a.id,
        'data-nodes': JSON.stringify(a.nodes),
        'data-edges': JSON.stringify(a.edges),
        'data-viewport': JSON.stringify(a.viewport),
        'data-title': a.title,
        'data-kernel-mode': a.kernelMode,
        'data-shared-kernel-name': a.sharedKernelName,
        'data-execution-order': a.executionOrder,
        'data-stop-on-error': String(a.stopOnError),
      },
    ]
  },
}

export const pipelineDefinition = defineNode(pipelineNodeDefinition)

export const PipelineExtension = toTiptapNode(pipelineNodeDefinition, PipelineNode, {
  addCommands() {
    return {
      insertPipeline:
        (attributes?: Partial<PipelineAttributes>) =>
        ({
          commands,
          state,
        }: {
          commands: RawCommands
          state: { doc: { content: { size: number } }; selection: { from: number } }
        }) => {
          // Ensure we're inserting at a valid position
          const { selection } = state
          const { from } = selection

          // Validate position
          if (from < 0 || from > state.doc.content.size) {
            console.warn(
              'Invalid position for pipeline insertion:',
              from,
              'Document size:',
              state.doc.content.size,
            )
            return false
          }

          return commands.insertContent({
            type: 'pipeline',
            attrs: {
              id: `pipeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              nodes: [],
              edges: [],
              viewport: { x: 0, y: 0, zoom: 1 },
              title: 'Execution Pipeline',
              kernelMode: 'mixed',
              sharedKernelName: '',
              executionOrder: 'topological',
              stopOnError: true,
              ...attributes,
            },
          })
        },
    } as unknown as Partial<RawCommands>
  },
})
