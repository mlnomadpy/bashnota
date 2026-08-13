/**
 * Theorem node — ported onto the raw-ProseMirror primitives.
 *
 * Like-for-like port of the former `Node.create`. The original serialised BOTH a
 * `data-type` (from the `type` attribute's own renderHTML) and a `data-theorem-type`
 * (from the node-level renderHTML), while the parse rule reads `type` back from
 * `data-theorem-type` and the `type` attribute's parseHTML reads it from `data-type`.
 * That quirk is preserved verbatim — this is a behaviour-preserving port, not a fix.
 */
import { defineNode, toTiptapNode } from '@/features/editor/pm'
import type { NodeDefinition } from '@/features/editor/pm'
import type { RawCommands } from '@tiptap/core'
import TheoremBlock from './TheoremBlock.vue'

export interface TheoremOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    theorem: {
      /**
       * Add a theorem block
       */
      setTheorem: (options?: {
        title?: string
        content?: string
        proof?: string
        type?: 'theorem' | 'lemma' | 'proposition' | 'corollary' | 'definition'
        number?: number
      }) => ReturnType
    }
  }
}

export const theoremNodeDefinition: NodeDefinition = {
  name: 'theorem',
  group: 'block',
  atom: true,
  draggable: true,
  isolating: true,
  attrs: {
    title: {
      default: '',
      parseHTML: (element) => element.getAttribute('data-title') || '',
    },
    content: {
      default: '',
      parseHTML: (element) => element.getAttribute('data-content') || '',
    },
    proof: {
      default: '',
      parseHTML: (element) => element.getAttribute('data-proof') || '',
    },
    type: {
      default: 'theorem',
      // Mirrors the original per-attribute parseHTML: reads from `data-type`.
      parseHTML: (element) => element.getAttribute('data-type') || 'theorem',
    },
    number: {
      default: null,
      parseHTML: (element) => {
        const num = element.getAttribute('data-number')
        return num ? parseInt(num, 10) : null
      },
    },
  },
  parseDOM: [
    {
      tag: 'div[data-type-theorem]',
      getAttrs: (node) => {
        if (typeof node === 'string') return {}
        const element = node as HTMLElement
        return {
          title: element.getAttribute('data-title') || '',
          content: element.getAttribute('data-content') || '',
          proof: element.getAttribute('data-proof') || '',
          type: element.getAttribute('data-theorem-type') || 'theorem',
          number: element.getAttribute('data-number')
            ? parseInt(element.getAttribute('data-number') || '0', 10)
            : null,
        }
      },
    },
  ],
  toDOM: (node) => {
    const a = node.attrs
    const attrs: Record<string, unknown> = {
      'data-title': a.title,
      'data-content': a.content,
      'data-proof': a.proof,
      // The `type` attribute's own renderHTML emitted `data-type`…
      'data-type': a.type,
      // …and the node-level renderHTML emitted these two.
      'data-type-theorem': '',
      'data-theorem-type': a.type || 'theorem',
    }
    if (a.number != null) attrs['data-number'] = a.number
    return ['div', attrs]
  },
}

export const theoremDefinition = defineNode(theoremNodeDefinition)

export const TheoremExtension = toTiptapNode(theoremNodeDefinition, TheoremBlock, {
  addCommands() {
    return {
      setTheorem:
        (options: Record<string, unknown> = {}) =>
        ({ commands }: { commands: RawCommands }) => {
          return commands.insertContent({
            type: 'theorem',
            attrs: options,
          })
        },
    } as unknown as Partial<RawCommands>
  },
})

export default TheoremExtension
