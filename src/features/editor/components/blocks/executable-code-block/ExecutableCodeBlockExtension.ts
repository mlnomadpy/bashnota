import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { Node, mergeAttributes } from '@tiptap/core'
import { setBlockType } from 'prosemirror-commands'
import { textblockTypeInputRule } from 'prosemirror-inputrules'
import ExecutableCodeBlock from './ExecutableCodeBlock.vue'

export const ExecutableCodeBlockExtension = Node.create({
  name: 'executableCodeBlock',
  atom: true,
  content: 'text*',
  marks: '',
  group: 'block',
  code: true,
  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      languageClassPrefix: 'language-',
    }
  },

  addAttributes() {
    return {
      language: {
        default: 'python',
        parseHTML: (element: HTMLElement) => {
          const prefix = this.options.languageClassPrefix
          return [...(element.firstElementChild?.classList ?? [])]
            .find((className) => className.startsWith(prefix))
            ?.slice(prefix.length) ?? 'python'
        },
      },
      executable: {
        default: true,
      },
      output: {
        default: null,
      },
      kernelName: {
        default: null,
      },
      serverID: {
        default: null,
      },
      sessionId: {
        default: null,
      },
      id: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="executableCodeBlock"]', preserveWhitespace: 'full' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'executableCodeBlock' }),
      [
        'pre',
        {},
        [
          'code',
          { class: node.attrs.language ? `language-${node.attrs.language}` : '' },
          0,
        ],
      ],
      // We add a special div for output that export service can pick up
      node.attrs.output ?
        ['div', { class: 'export-code-output', 'data-output': node.attrs.output }] :
        ['div', { style: 'display: none' }]
    ]
  },

  addNodeView() {
    // @ts-ignore
    return VueNodeViewRenderer(ExecutableCodeBlock)
  },

  addCommands() {
    return {
      setCodeBlock: (attributes: { language?: string } = {}) => ({ state, dispatch }) =>
        setBlockType(state.schema.nodes.executableCodeBlock, attributes)(state, dispatch),
      toggleCodeBlock: (attributes: { language?: string } = {}) => ({ state, dispatch }) => {
        const active = state.selection.$from.parent.type === state.schema.nodes.executableCodeBlock
        return setBlockType(
          active ? state.schema.nodes.paragraph : state.schema.nodes.executableCodeBlock,
          active ? undefined : attributes,
        )(state, dispatch)
      },
    } as never
  },

  addInputRules() {
    return [
      textblockTypeInputRule(/^```([a-z]+)?[\s\n]$/, this.type, (match) => ({ language: match[1] ?? 'python' })) as never,
      textblockTypeInputRule(/^~~~([a-z]+)?[\s\n]$/, this.type, (match) => ({ language: match[1] ?? 'python' })) as never,
    ]
  },
})







