/**
 * SubNotaLink node — ported onto the raw-ProseMirror primitives.
 *
 * Like-for-like port of the former `Node.create`. `toDOM` reproduces the original
 * `renderHTML` (a `span[data-type="sub-nota-link"]` carrying the four data-*
 * attributes plus a text fallback); the three commands are passed through TipTap
 * unchanged so existing call sites keep working.
 */
import { defineNode, toTiptapNode } from '@/features/editor/pm'
import type { NodeDefinition } from '@/features/editor/pm'
import type { RawCommands } from '@tiptap/core'
import SubNotaBlock from '../blocks/sub-nota-block/SubNotaBlock.vue'

export interface SubNotaLinkOptions {
  HTMLAttributes: Record<string, unknown>
}

interface SubNotaLinkAttributes {
  targetNotaId: string
  targetNotaTitle: string
  displayText?: string
  linkStyle?: 'inline' | 'button' | 'card'
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    subNotaLink: {
      setSubNotaLink: (attributes: SubNotaLinkAttributes) => ReturnType
    }
  }
}

export const subNotaLinkNodeDefinition: NodeDefinition = {
  name: 'subNotaLink',
  group: 'block',
  selectable: true,
  atom: true,
  content: '', // Empty content since it's an atom
  attrs: {
    targetNotaId: {
      default: null,
      parseHTML: (element) => element.getAttribute('data-target-nota-id'),
    },
    targetNotaTitle: {
      default: null,
      parseHTML: (element) => element.getAttribute('data-target-nota-title'),
    },
    displayText: {
      default: null,
      parseHTML: (element) => element.getAttribute('data-display-text'),
    },
    linkStyle: {
      default: 'inline',
      parseHTML: (element) => element.getAttribute('data-link-style') || 'inline',
    },
  },
  parseDOM: [{ tag: 'span[data-type="sub-nota-link"]' }],
  toDOM: (node) => {
    const a = node.attrs
    return [
      'span',
      {
        'data-type': 'sub-nota-link',
        'data-target-nota-id': a.targetNotaId,
        'data-target-nota-title': a.targetNotaTitle,
        'data-display-text': a.displayText,
        'data-link-style': a.linkStyle,
      },
      a.displayText || a.targetNotaTitle || 'Sub Nota Link',
    ]
  },
}

export const subNotaLinkDefinition = defineNode(subNotaLinkNodeDefinition)

export const SubNotaLink = toTiptapNode(subNotaLinkNodeDefinition, SubNotaBlock, {
  addCommands() {
    return {
      setSubNotaLink:
        (attributes: SubNotaLinkAttributes) =>
        ({ commands }: { commands: RawCommands }) => {
          return commands.insertContent({
            type: 'subNotaLink',
            attrs: attributes,
          })
        },

      convertToSubNotaLink:
        (attributes: SubNotaLinkAttributes) =>
        ({ commands, state }: { commands: RawCommands; state: { selection: { empty: boolean } } }) => {
          const { selection } = state
          if (selection.empty) return false

          // Replace the selected content with a subNotaLink. `replaceSelection`
          // is not part of TipTap's typed RawCommands (it was untyped in the
          // original); the loose cast preserves the exact original call.
          return (commands as unknown as {
            replaceSelection: (content: unknown) => boolean
          }).replaceSelection({
            type: 'subNotaLink',
            attrs: attributes,
          })
        },

      insertSubNotaLink:
        (attributes: SubNotaLinkAttributes) =>
        ({ commands, state }: { commands: RawCommands; state: { selection: { $from: { pos: number } } } }) => {
          const { selection } = state
          const { $from } = selection

          // Insert at the current position, creating a new block
          return commands.insertContentAt($from.pos, {
            type: 'subNotaLink',
            attrs: attributes,
          })
        },
    } as unknown as Partial<RawCommands>
  },
})
