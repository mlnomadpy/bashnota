/**
 * Pipeline node — ported onto the raw-ProseMirror primitives.
 *
 * Like-for-like port of the former `Node.create`. Pipeline state (nodes/edges/
 * viewport) is persisted through the document JSON, not HTML; the original
 * `renderHTML` merely spread the attributes onto a `div[data-type="pipeline"]`
 * (objects stringify lossily in HTML — a pre-existing gap, unchanged here). The
 * parse rule recovers only the tag, exactly as before.
 */
import { defineNode, toTiptapNode } from '@/features/editor/pm'
import type { NodeDefinition } from '@/features/editor/pm'
import type { RawCommands } from '@tiptap/core'
import PipelineNode from './PipelineNode.vue'

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
    },
    nodes: { default: [] },
    edges: { default: [] },
    viewport: { default: { x: 0, y: 0, zoom: 1 } },
    title: { default: 'Execution Pipeline' },
    kernelMode: { default: 'mixed' },
    sharedKernelName: { default: '' },
    executionOrder: { default: 'topological' },
    stopOnError: { default: true },
  },
  parseDOM: [{ tag: 'div[data-type="pipeline"]' }],
  toDOM: (node) => ['div', { 'data-type': 'pipeline', ...node.attrs }],
}

export const pipelineDefinition = defineNode(pipelineNodeDefinition)

export const PipelineExtension = toTiptapNode(pipelineNodeDefinition, PipelineNode, {
  addCommands() {
    return {
      insertPipeline:
        (attributes?: Partial<PipelineAttributes>) =>
        ({ commands, state }: { commands: RawCommands; state: { doc: { content: { size: number } }; selection: { from: number } } }) => {
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
