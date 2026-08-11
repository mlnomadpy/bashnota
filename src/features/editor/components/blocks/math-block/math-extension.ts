/**
 * Math node — ported onto the raw-ProseMirror primitives.
 *
 * Like-for-like port of the former `Node.create`. `toDOM` reproduces the original
 * `renderHTML` (a `div[data-type="math"]` carrying `data-latex`); the configured
 * `class: 'math-block'` from `.configure({ HTMLAttributes })` at the registration
 * site is merged back in by the adapter, so serialisation is unchanged.
 */
import { defineNode, toTiptapNode } from '@/features/editor/pm'
import type { NodeDefinition } from '@/features/editor/pm'
import type { RawCommands } from '@tiptap/core'
import MathBlock from './MathBlock.vue'

export interface MathOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    math: {
      /**
       * Add a math block
       */
      setMath: (options?: { latex?: string }) => ReturnType
    }
  }
}

export const mathNodeDefinition: NodeDefinition = {
  name: 'math',
  group: 'block',
  atom: true,
  draggable: true,
  isolating: true,
  attrs: {
    latex: {
      default: '',
      parseHTML: (element) => element.getAttribute('data-latex') || '',
    },
  },
  parseDOM: [{ tag: 'div[data-type="math"]' }],
  toDOM: (node) => ['div', { 'data-latex': node.attrs.latex, 'data-type': 'math' }],
}

export const mathDefinition = defineNode(mathNodeDefinition)

export const MathExtension = toTiptapNode(mathNodeDefinition, MathBlock, {
  addCommands() {
    return {
      setMath:
        (options: { latex?: string } = {}) =>
        ({ commands }: { commands: RawCommands }) => {
          return commands.insertContent({
            type: 'math',
            attrs: options,
          })
        },
    } as unknown as Partial<RawCommands>
  },
})

export default MathExtension
