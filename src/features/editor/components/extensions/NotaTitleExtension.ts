/**
 * NotaTitle node — ported onto the raw-ProseMirror primitives.
 *
 * Like-for-like port of the former `Node.create`. A display-only `inline*`,
 * `defining` block whose Vue node view owns a contenteditable title. Its `title`
 * attribute parses from the element's `textContent` and serialises to `data-title`
 * plus an inline content hole — preserved verbatim from the original.
 */
import { defineNode, toTiptapNode } from '@/features/editor/pm'
import type { NodeDefinition } from '@/features/editor/pm'
import type { RawCommands } from '@tiptap/core'
import NotaTitleComponent from '../blocks/nota-title/NotaTitleComponent.vue'

export interface NotaTitleOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    notaTitle: {
      /**
       * Set a nota title
       */
      setNotaTitle: (title: string) => ReturnType
      /**
       * Update the nota title
       */
      updateNotaTitle: (title: string) => ReturnType
    }
  }
}

export const notaTitleNodeDefinition: NodeDefinition = {
  name: 'notaTitle',
  group: 'block',
  content: 'inline*',
  defining: true,
  attrs: {
    title: {
      default: '',
      parseHTML: (element) => element.textContent || '',
    },
  },
  parseDOM: [{ tag: 'div[data-type="nota-title"]' }],
  toDOM: (node) => ['div', { 'data-type': 'nota-title', 'data-title': node.attrs.title }, 0],
}

export const notaTitleDefinition = defineNode(notaTitleNodeDefinition)

export const NotaTitleExtension = toTiptapNode(notaTitleNodeDefinition, NotaTitleComponent, {
  addCommands() {
    return {
      setNotaTitle:
        (title: string) =>
        ({ commands }: { commands: RawCommands }) => {
          return commands.setNode('notaTitle', { title })
        },
      updateNotaTitle:
        (title: string) =>
        ({ commands }: { commands: RawCommands }) => {
          return commands.updateAttributes('notaTitle', { title })
        },
    } as unknown as Partial<RawCommands>
  },
})
