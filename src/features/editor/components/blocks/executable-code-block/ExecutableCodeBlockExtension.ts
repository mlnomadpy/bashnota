/**
 * Executable code block — raw-ProseMirror schema plus the temporary live
 * TipTap adapter used during coexistence.
 *
 * The schema is declared once through the in-house PM primitives. The adapter
 * only registers that same schema and VueNodeView in the still-present TipTap
 * editor; it does not own a second model or node-view implementation.
 */
import { setBlockType } from 'prosemirror-commands'
import { textblockTypeInputRule } from 'prosemirror-inputrules'
import { defineNode, toTiptapNode } from '@/features/editor/pm'
import type { NodeDefinition } from '@/features/editor/pm'
import ExecutableCodeBlock from './ExecutableCodeBlock.vue'

const LANGUAGE_CLASS_PREFIX = 'language-'

function nullableAttribute(element: HTMLElement, name: string): string | null {
  return element.getAttribute(name)
}

/** The one schema definition used by both raw PM tests and the live editor. */
export const executableCodeBlockNodeDefinition: NodeDefinition = {
  name: 'executableCodeBlock',
  atom: true,
  content: 'text*',
  marks: '',
  group: 'block',
  code: true,
  defining: true,
  attrs: {
    language: {
      default: 'python',
      parseHTML: (element) =>
        [...(element.firstElementChild?.firstElementChild?.classList ?? [])]
          .find((className) => className.startsWith(LANGUAGE_CLASS_PREFIX))
          ?.slice(LANGUAGE_CLASS_PREFIX.length) ?? 'python',
    },
    executable: {
      default: true,
      parseHTML: (element) => element.getAttribute('executable') !== 'false',
    },
    output: {
      default: null,
      parseHTML: (element) => nullableAttribute(element, 'output'),
    },
    kernelName: {
      default: null,
      parseHTML: (element) => nullableAttribute(element, 'kernelName'),
    },
    serverID: {
      default: null,
      parseHTML: (element) => nullableAttribute(element, 'serverID'),
    },
    sessionId: {
      default: null,
      parseHTML: (element) => nullableAttribute(element, 'sessionId'),
    },
    id: {
      default: null,
      parseHTML: (element) => nullableAttribute(element, 'id'),
    },
  },
  parseDOM: [{
    tag: 'div[data-type="executableCodeBlock"]',
    preserveWhitespace: 'full',
  }],
  toDOM: (node) => {
    const attrs: Record<string, string> = {
      'data-type': 'executableCodeBlock',
      language: String(node.attrs.language ?? 'python'),
      executable: String(node.attrs.executable !== false),
    }
    for (const name of ['output', 'kernelName', 'serverID', 'sessionId', 'id']) {
      const value = node.attrs[name]
      if (value != null) attrs[name] = String(value)
    }

    return [
      'div',
      attrs,
      [
        'pre',
        {},
        [
          'code',
          {
            class: node.attrs.language
              ? `${LANGUAGE_CLASS_PREFIX}${node.attrs.language}`
              : '',
          },
          0,
        ],
      ],
      node.attrs.output
        ? ['div', { class: 'export-code-output', 'data-output': node.attrs.output }]
        : ['div', { style: 'display: none' }],
    ]
  },
}

/** Raw-ProseMirror `{ name, spec }`, used directly after TipTap is removed. */
export const executableCodeBlockDefinition = defineNode(
  executableCodeBlockNodeDefinition,
)

/**
 * Live coexistence registration. Commands and fence input rules remain on the
 * adapter so existing toolbar and Markdown-style insertion paths keep working.
 */
export const ExecutableCodeBlockExtension = toTiptapNode(
  executableCodeBlockNodeDefinition,
  ExecutableCodeBlock,
  {
    addCommands() {
      return {
        setCodeBlock:
          (attributes: { language?: string } = {}) =>
          ({ state, dispatch }) =>
            setBlockType(
              state.schema.nodes.executableCodeBlock,
              attributes,
            )(state, dispatch),
        toggleCodeBlock:
          (attributes: { language?: string } = {}) =>
          ({ state, dispatch }) => {
            const active =
              state.selection.$from.parent.type ===
              state.schema.nodes.executableCodeBlock
            return setBlockType(
              active
                ? state.schema.nodes.paragraph
                : state.schema.nodes.executableCodeBlock,
              active ? undefined : attributes,
            )(state, dispatch)
          },
      }
    },
    addInputRules() {
      return [
        textblockTypeInputRule(
          /^```([a-z]+)?[\s\n]$/,
          this.type,
          (match) => ({ language: match[1] ?? 'python' }),
        ),
        textblockTypeInputRule(
          /^~~~([a-z]+)?[\s\n]$/,
          this.type,
          (match) => ({ language: match[1] ?? 'python' }),
        ),
      ]
    },
  },
)
