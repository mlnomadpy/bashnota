/**
 * Confusion-matrix node — ported onto the raw-ProseMirror primitives.
 *
 * Like-for-like port of the former `Node.create`. Serialises to a custom
 * `<confusion-matrix>` element carrying JSON-encoded matrix/labels/stats, exactly
 * as before. The `class: 'confusion-matrix-block'` (previously an addOptions
 * default folded into HTMLAttributes) is emitted directly by `toDOM`.
 */
import { defineNode, toTiptapNode } from '@/features/editor/pm'
import type { NodeDefinition } from '@/features/editor/pm'
import type { RawCommands } from '@tiptap/core'
import ConfusionMatrixBlock from './ConfusionMatrixBlock.vue'

export interface ConfusionMatrixOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    confusionMatrix: {
      /**
       * Insert a confusion matrix block
       */
      insertConfusionMatrix: (options?: {
        data?: number[][]
        labels?: string[]
        title?: string
        source?: 'upload' | 'jupyter'
        filePath?: string
      }) => ReturnType
    }
  }
}

export const confusionMatrixNodeDefinition: NodeDefinition = {
  name: 'confusionMatrix',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,
  attrs: {
    data: {
      default: null,
      parseHTML: (element) => {
        const data = element.getAttribute('data-matrix')
        return data ? JSON.parse(data) : null
      },
    },
    labels: {
      default: [],
      parseHTML: (element) => {
        const labels = element.getAttribute('data-labels')
        return labels ? JSON.parse(labels) : []
      },
    },
    title: {
      default: 'Confusion Matrix',
      parseHTML: (element) => element.getAttribute('data-title'),
    },
    source: {
      default: 'upload',
      parseHTML: (element) => element.getAttribute('data-source'),
    },
    filePath: {
      default: '',
      parseHTML: (element) => element.getAttribute('data-file-path'),
    },
    stats: {
      default: null,
      parseHTML: (element) => {
        const stats = element.getAttribute('data-stats')
        return stats ? JSON.parse(stats) : null
      },
    },
  },
  parseDOM: [{ tag: 'confusion-matrix' }],
  toDOM: (node) => {
    const a = node.attrs
    const attrs: Record<string, unknown> = { class: 'confusion-matrix-block' }
    if (a.data) attrs['data-matrix'] = JSON.stringify(a.data)
    if (a.labels?.length) attrs['data-labels'] = JSON.stringify(a.labels)
    if (a.title) attrs['data-title'] = a.title
    if (a.source) attrs['data-source'] = a.source
    if (a.filePath) attrs['data-file-path'] = a.filePath
    if (a.stats) attrs['data-stats'] = JSON.stringify(a.stats)
    return ['confusion-matrix', attrs]
  },
}

export const confusionMatrixDefinition = defineNode(confusionMatrixNodeDefinition)

export const ConfusionMatrixExtension = toTiptapNode(confusionMatrixNodeDefinition, ConfusionMatrixBlock, {
  addCommands() {
    return {
      insertConfusionMatrix:
        (options: Record<string, unknown> = {}) =>
        ({ commands }: { commands: RawCommands }) => {
          return commands.insertContent({
            type: 'confusionMatrix',
            attrs: {
              data: options.data || null,
              labels: options.labels || [],
              title: options.title || 'Confusion Matrix',
              source: options.source || 'upload',
              filePath: options.filePath || '',
              stats: null,
            },
          })
        },
    } as unknown as Partial<RawCommands>
  },
})
