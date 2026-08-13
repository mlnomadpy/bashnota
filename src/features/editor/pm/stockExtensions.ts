import { Extension, Mark, Node, getMarkRange, mergeAttributes } from '@tiptap/core'
import type { Command as TiptapCommand } from '@tiptap/core'
import {
  baseKeymap,
  chainCommands,
  exitCode,
  lift,
  newlineInCode,
  selectParentNode,
  setBlockType,
  toggleMark,
  wrapIn,
} from 'prosemirror-commands'
import { dropCursor } from 'prosemirror-dropcursor'
import { gapCursor } from 'prosemirror-gapcursor'
import { history, redo, undo } from 'prosemirror-history'
import {
  InputRule,
  inputRules,
  smartQuotes,
  textblockTypeInputRule,
  wrappingInputRule,
} from 'prosemirror-inputrules'
import { keymap } from 'prosemirror-keymap'
import type { MarkSpec, Node as PMNode, NodeSpec, Schema } from 'prosemirror-model'
import { marks as basicMarks, nodes as basicNodes } from 'prosemirror-schema-basic'
import {
  liftListItem,
  sinkListItem,
  splitListItem,
  wrapInList,
} from 'prosemirror-schema-list'
import {
  CellSelection,
  TableView,
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  columnResizing,
  deleteColumn,
  deleteRow,
  deleteTable,
  fixTables,
  goToNextCell,
  mergeCells,
  setCellAttr,
  splitCell,
  tableEditing,
  tableNodes,
  toggleHeaderCell,
  toggleHeaderColumn,
  toggleHeaderRow,
} from 'prosemirror-tables'
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state'
import type { Command as PMCommand } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'

type Attrs = Record<string, unknown>

function attributesFromSpec(spec: NodeSpec | MarkSpec) {
  return Object.fromEntries(
    Object.entries(spec.attrs ?? {}).map(([name, value]) => [
      name,
      { default: value.default ?? null },
    ]),
  )
}

function nodeFromSpec(name: string, spec: NodeSpec) {
  const config = {
    name,
    content: spec.content,
    marks: spec.marks,
    group: spec.group,
    inline: spec.inline,
    atom: spec.atom,
    selectable: spec.selectable,
    draggable: spec.draggable,
    code: spec.code,
    linebreakReplacement: spec.linebreakReplacement,
    defining: spec.defining,
    isolating: spec.isolating,
    addAttributes: () => attributesFromSpec(spec),
    parseHTML: () => (spec.parseDOM ?? []) as never,
    tableRole: spec.tableRole,
    ...(spec.toDOM ? { renderHTML: ({ node }: { node: PMNode }) => spec.toDOM!(node) as never } : {}),
  }
  return Node.create(config as never)
}

function markFromSpec(name: string, spec: MarkSpec) {
  return Mark.create({
    name,
    inclusive: spec.inclusive,
    excludes: spec.excludes,
    code: spec.code,
    addAttributes: () => attributesFromSpec(spec),
    parseHTML: () => (spec.parseDOM ?? []) as never,
    renderHTML: ({ mark }) => spec.toDOM!(mark, false) as never,
  })
}

const Document = Node.create({ name: 'doc', topNode: true, content: 'block+' })
const Paragraph = nodeFromSpec('paragraph', basicNodes.paragraph)
const Text = nodeFromSpec('text', basicNodes.text)
const HardBreak = nodeFromSpec('hardBreak', {
  ...basicNodes.hard_break,
  linebreakReplacement: true,
})
const Image = nodeFromSpec('image', basicNodes.image)

const Heading = Node.create({
  name: 'heading',
  content: 'inline*',
  group: 'block',
  defining: true,
  addAttributes: () => ({ level: { default: 1 } }),
  parseHTML: () => [1, 2, 3, 4, 5, 6].map((level) => ({ tag: `h${level}`, attrs: { level } })),
  renderHTML: ({ node }) => [`h${node.attrs.level}`, 0],
})

const Blockquote = nodeFromSpec('blockquote', basicNodes.blockquote)
const HorizontalRule = nodeFromSpec('horizontalRule', basicNodes.horizontal_rule)
const Bold = markFromSpec('bold', basicMarks.strong)
const Italic = markFromSpec('italic', basicMarks.em)
const Code = markFromSpec('code', basicMarks.code)

const Strike = Mark.create({
  name: 'strike',
  parseHTML: () => [
    { tag: 's' },
    { tag: 'del' },
    { tag: 'strike' },
    { style: 'text-decoration', consuming: false, getAttrs: (value) => String(value).includes('line-through') && null },
  ],
  renderHTML: () => ['s', 0],
})

const safeProtocols = new Set([
  'http', 'https', 'ftp', 'ftps', 'mailto', 'tel', 'callto', 'sms', 'cid', 'xmpp',
])

/** Mirrors TipTap's DOMPurify-derived protocol guard without importing Link. */
export function isSafeLinkUri(uri: unknown): uri is string {
  if (typeof uri !== 'string' || uri.length === 0) return false
  const compact = uri.replace(/[\u0000-\u0020\u00a0\u1680\u180e\u2000-\u2029\u205f\u3000]/g, '')
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(compact)?.[1]?.toLowerCase()
  return scheme ? safeProtocols.has(scheme) : !compact.startsWith('//')
}

function normalizeLinkHref(value: string) {
  if (/^www\./i.test(value)) return `http://${value}`
  return value
}

function isLinkablePaste(value: string) {
  const href = normalizeLinkHref(value)
  return isSafeLinkUri(href) && /^(?:(?:https?|ftp|ftps):\/\/|(?:mailto|tel|callto|sms|cid|xmpp):|www\.)\S+$/i.test(value)
}

function linkCandidates(text: string) {
  const candidates: Array<{ from: number; to: number; href: string }> = []
  const pattern = /(?:https?:\/\/|www\.)[^\s<>]+(?=\s)/gi
  for (const match of text.matchAll(pattern)) {
    const value = match[0].replace(/[.,!?;:]+$/, '').replace(/\)$/, '')
    const href = normalizeLinkHref(value)
    if (match.index !== undefined && isSafeLinkUri(href)) {
      candidates.push({ from: match.index, to: match.index + value.length, href })
    }
  }
  return candidates
}

const Link = Mark.create({
  name: 'link',
  priority: 1000,
  keepOnSplit: false,
  inclusive: true,
  addAttributes: () => ({
    href: { default: null },
    target: { default: '_blank' },
    rel: { default: 'noopener noreferrer nofollow' },
    class: { default: 'nota-link' },
  }),
  parseHTML: () => [{
    tag: 'a[href]',
    getAttrs: (dom: HTMLElement) => isSafeLinkUri(dom.getAttribute('href')) ? null : false,
  }],
  renderHTML: ({ HTMLAttributes }) => [
    'a',
    mergeAttributes(HTMLAttributes, { href: isSafeLinkUri(HTMLAttributes.href) ? HTMLAttributes.href : '' }),
    0,
  ],
  addCommands() {
    return {
      setLink: (attributes: Attrs) => ({ state, dispatch }) => {
        if (!isSafeLinkUri(attributes.href)) return false
        return addMark(state.schema.marks.link, attributes)(state, dispatch)
      },
      toggleLink: (attributes: Attrs) => ({ state, dispatch }) => {
        if (!isSafeLinkUri(attributes.href)) return false
        return toggleMark(state.schema.marks.link, attributes)(state, dispatch)
      },
      unsetLink: () => ({ state, dispatch }) => {
        if (dispatch) dispatch(state.tr.removeMark(state.selection.from, state.selection.to, state.schema.marks.link))
        return true
      },
      extendMarkRange: (typeOrName: string) => ({ state, dispatch }) => {
        const type = state.schema.marks[typeOrName]
        if (!type) return false
        const range = getMarkRange(state.selection.$from, type)
        if (!range) return false
        if (dispatch) dispatch(state.tr.setSelection(TextSelection.create(state.doc, range.from, range.to)))
        return true
      },
    } as never
  },
  addProseMirrorPlugins() {
    const type = this.type
    return [
      new Plugin({
        key: new PluginKey('autolink'),
        appendTransaction(transactions, oldState, newState) {
          if (!transactions.some((transaction) => transaction.docChanged) || oldState.doc.eq(newState.doc)) return null
          const tr = newState.tr
          newState.doc.descendants((node, pos) => {
            if (!node.isText || node.marks.some((mark) => mark.type === type || mark.type === newState.schema.marks.code)) return
            for (const candidate of linkCandidates(node.text ?? '')) {
              const from = pos + candidate.from
              const to = pos + candidate.to
              if (!newState.doc.rangeHasMark(from, to, type)) tr.addMark(from, to, type.create({ href: candidate.href }))
            }
          })
          return tr.steps.length ? tr : null
        },
      }),
      new Plugin({
        key: new PluginKey('linkOnPaste'),
        props: {
          handlePaste(view, event) {
            const text = event.clipboardData?.getData('text/plain')?.trim() ?? ''
            if (view.state.selection.empty || !isLinkablePaste(text)) return false
            view.dispatch(view.state.tr.addMark(
              view.state.selection.from,
              view.state.selection.to,
              type.create({ href: normalizeLinkHref(text) }),
            ))
            return true
          },
        },
      }),
    ]
  },
})

const BulletList = Node.create({
  name: 'bulletList',
  group: 'block list',
  content: 'listItem+',
  parseHTML: () => [{ tag: 'ul:not([data-type="taskList"])' }],
  renderHTML: () => ['ul', 0],
})

const OrderedList = Node.create({
  name: 'orderedList',
  group: 'block list',
  content: 'listItem+',
  addAttributes: () => ({ start: { default: 1 } }),
  parseHTML: () => [{
    tag: 'ol',
    getAttrs: (dom: HTMLElement) => ({ start: dom.hasAttribute('start') ? Number(dom.getAttribute('start')) : 1 }),
  }],
  renderHTML: ({ node }) => ['ol', node.attrs.start === 1 ? {} : { start: node.attrs.start }, 0],
})

const ListItem = Node.create({
  name: 'listItem',
  defining: true,
  content: 'paragraph block*',
  parseHTML: () => [{ tag: 'li:not([data-type="taskItem"])' }],
  renderHTML: () => ['li', 0],
  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.splitListItem('listItem'),
      Tab: () => this.editor.commands.sinkListItem('listItem'),
      'Shift-Tab': () => this.editor.commands.liftListItem('listItem'),
    }
  },
})

function ancestorDepth(state: Parameters<TiptapCommand>[0]['state'], names: string[]) {
  for (let depth = state.selection.$from.depth; depth > 0; depth -= 1) {
    if (names.includes(state.selection.$from.node(depth).type.name)) return depth
  }
  return -1
}

function addMark(type: Parameters<typeof toggleMark>[0], attrs?: Attrs): PMCommand {
  return (state, dispatch) => {
    if (!dispatch) return true
    const { empty, from, to } = state.selection
    const mark = type.create(attrs)
    dispatch(empty ? state.tr.addStoredMark(mark) : state.tr.addMark(from, to, mark))
    return true
  }
}

function toggleList(listName: 'bulletList' | 'orderedList' | 'taskList', itemName: 'listItem' | 'taskItem'): TiptapCommand {
  return ({ state, dispatch }) => {
    const listType = state.schema.nodes[listName]
    const itemType = state.schema.nodes[itemName]
    if (!listType || !itemType) return false
    const depth = ancestorDepth(state, ['bulletList', 'orderedList', 'taskList'])
    if (depth >= 0) {
      const current = state.selection.$from.node(depth)
      if (current.type === listType) return liftListItem(itemType)(state, dispatch)
      if (current.type.name !== 'taskList' && listName !== 'taskList') {
        if (dispatch) dispatch(state.tr.setNodeMarkup(state.selection.$from.before(depth), listType))
        return true
      }
    }
    if (state.selection.$from.parent.type !== state.schema.nodes.paragraph) {
      let nextState = state
      let combined = state.tr
      const changed = setBlockType(state.schema.nodes.paragraph)(state, (tr) => {
        combined = tr
        nextState = state.apply(tr)
      })
      if (!changed) return false
      const wrapped = wrapInList(listType)(nextState, (tr) => {
        tr.steps.forEach((step) => combined.step(step))
      })
      if (wrapped && dispatch) dispatch(combined)
      return wrapped
    }
    return wrapInList(listType)(state, dispatch)
  }
}

const CoreCommands = Extension.create({
  name: 'pmCoreCommands',
  addCommands() {
    const mark = (name: string, attrs?: Attrs) => ({ state, dispatch }: Parameters<TiptapCommand>[0]) =>
      addMark(state.schema.marks[name], attrs)(state, dispatch)
    const unmark = (name: string) => ({ state, dispatch }: Parameters<TiptapCommand>[0]) => {
      if (dispatch) dispatch(state.tr.removeMark(state.selection.from, state.selection.to, state.schema.marks[name]))
      return true
    }
    const toggle = (name: string, attrs?: Attrs) => ({ state, dispatch }: Parameters<TiptapCommand>[0]) =>
      toggleMark(state.schema.marks[name], attrs)(state, dispatch)
    return {
      setBold: () => mark('bold'), unsetBold: () => unmark('bold'), toggleBold: () => toggle('bold'),
      setItalic: () => mark('italic'), unsetItalic: () => unmark('italic'), toggleItalic: () => toggle('italic'),
      setStrike: () => mark('strike'), unsetStrike: () => unmark('strike'), toggleStrike: () => toggle('strike'),
      setCode: () => mark('code'), unsetCode: () => unmark('code'), toggleCode: () => toggle('code'),
      setParagraph: () => ({ state, dispatch }) => setBlockType(state.schema.nodes.paragraph)(state, dispatch),
      setHeading: (attrs: { level: number }) => ({ state, dispatch }) => setBlockType(state.schema.nodes.heading, attrs)(state, dispatch),
      toggleHeading: (attrs: { level: number }) => ({ state, dispatch }) => {
        const active = state.selection.$from.parent.type === state.schema.nodes.heading && state.selection.$from.parent.attrs.level === attrs.level
        return setBlockType(active ? state.schema.nodes.paragraph : state.schema.nodes.heading, active ? undefined : attrs)(state, dispatch)
      },
      setBlockquote: () => ({ state, dispatch }) => {
        const { blockquote } = state.schema.nodes
        return wrapIn(blockquote)(state, dispatch)
      },
      toggleBlockquote: () => ({ state, dispatch }) =>
        (ancestorDepth(state, ['blockquote']) >= 0 ? lift : wrapIn(state.schema.nodes.blockquote))(state, dispatch),
      unsetBlockquote: () => ({ state, dispatch }) => lift(state, dispatch),
      setHorizontalRule: () => ({ state, dispatch }) => {
        const paragraph = state.schema.nodes.paragraph.create()
        const hr = state.schema.nodes.horizontalRule.create()
        if (dispatch) {
          const tr = state.tr.replaceSelectionWith(hr)
          const mappedSelection = tr.mapping.map(state.selection.from)
          let hrPosition = -1
          tr.doc.descendants((node, pos) => {
            if (node.type === state.schema.nodes.horizontalRule
              && (hrPosition < 0 || Math.abs(pos - mappedSelection) < Math.abs(hrPosition - mappedSelection))) {
              hrPosition = pos
            }
          })
          if (hrPosition < 0) return false
          if (hrPosition + hr.nodeSize === tr.doc.content.size) tr.insert(hrPosition + hr.nodeSize, paragraph)
          dispatch(tr.setSelection(TextSelection.create(tr.doc, hrPosition + hr.nodeSize + 1)).scrollIntoView())
        }
        return true
      },
      setHardBreak: () => ({ state, dispatch }) => {
        if (exitCode(state, dispatch)) return true
        if (state.selection.$from.parent.type.spec.isolating) return false
        if (dispatch) dispatch(state.tr.replaceSelectionWith(state.schema.nodes.hardBreak.create()).scrollIntoView())
        return true
      },
      toggleBulletList: () => toggleList('bulletList', 'listItem'),
      toggleOrderedList: () => toggleList('orderedList', 'listItem'),
      splitListItem: (name: string) => ({ state, dispatch }) => splitListItem(state.schema.nodes[name])(state, dispatch),
      sinkListItem: (name: string) => ({ state, dispatch }) => sinkListItem(state.schema.nodes[name])(state, dispatch),
      liftListItem: (name: string) => ({ state, dispatch }) => liftListItem(state.schema.nodes[name])(state, dispatch),
      undo: () => ({ state, dispatch }) => undo(state, dispatch),
      redo: () => ({ state, dispatch }) => redo(state, dispatch),
    } as never
  },
})

const CorePlugins = Extension.create({
  name: 'pmCorePlugins',
  addProseMirrorPlugins() {
    const { listItem, taskItem } = this.editor.schema.nodes
    return [
      inputRules({
        rules: [
          ...smartQuotes,
          new InputRule(/--$/, '—'),
          new InputRule(/\.\.\.$/, '…'),
          textblockTypeInputRule(/^(#{1,6})\s$/, this.editor.schema.nodes.heading, (match) => ({ level: match[1].length })),
          wrappingInputRule(/^\s*>\s$/, this.editor.schema.nodes.blockquote),
          wrappingInputRule(/^\s*([-+*])\s$/, this.editor.schema.nodes.bulletList),
          wrappingInputRule(/^(\d+)\.\s$/, this.editor.schema.nodes.orderedList, (match) => ({ start: Number(match[1]) }), (match, node) => node.childCount + node.attrs.start === Number(match[1])),
          wrappingInputRule(/^\s*\[([ x])?\]\s$/i, this.editor.schema.nodes.taskItem, (match) => ({ checked: match[1]?.toLowerCase() === 'x' })),
          new InputRule(/^(?:---|—-|___\s|\*\*\*\s)$/, (state, _match, start) => {
            const paragraph = state.schema.nodes.paragraph.create()
            const $start = state.doc.resolve(start)
            const tr = state.tr.replaceWith(
              $start.before(),
              $start.after(),
              [state.schema.nodes.horizontalRule.create(), paragraph],
            )
            return tr.setSelection(TextSelection.create(tr.doc, $start.before() + 2))
          }),
        ],
      }),
      keymap({
        'Mod-z': undo,
        'Shift-Mod-z': redo,
        'Mod-y': redo,
        'Ctrl-Enter': exitCode,
        Enter: chainCommands(splitListItem(listItem), splitListItem(taskItem), newlineInCode, baseKeymap.Enter),
        'Mod-Enter': exitCode,
        Backspace: baseKeymap.Backspace,
        'Mod-Backspace': baseKeymap.Backspace,
        Delete: baseKeymap.Delete,
        'Mod-Delete': baseKeymap.Delete,
        'Alt-ArrowUp': selectParentNode,
      }),
      keymap(baseKeymap),
      history(),
      dropCursor(),
      gapCursor(),
    ]
  },
  addKeyboardShortcuts() {
    return {
      'Mod-b': () => this.editor.commands.toggleBold(),
      'Mod-i': () => this.editor.commands.toggleItalic(),
      'Mod-Shift-s': () => this.editor.commands.toggleStrike(),
      'Mod-e': () => this.editor.commands.toggleCode(),
      'Mod-Alt-0': () => this.editor.commands.setParagraph(),
      'Mod-Alt-1': () => this.editor.commands.toggleHeading({ level: 1 }),
      'Mod-Alt-2': () => this.editor.commands.toggleHeading({ level: 2 }),
      'Mod-Alt-3': () => this.editor.commands.toggleHeading({ level: 3 }),
      'Mod-Alt-4': () => this.editor.commands.toggleHeading({ level: 4 }),
      'Mod-Alt-5': () => this.editor.commands.toggleHeading({ level: 5 }),
      'Mod-Alt-6': () => this.editor.commands.toggleHeading({ level: 6 }),
      'Shift-Enter': () => this.editor.commands.setHardBreak(),
      'Mod-Enter': () => this.editor.commands.setHardBreak(),
      'Mod-Shift-7': () => this.editor.commands.toggleOrderedList(),
      'Mod-Shift-8': () => this.editor.commands.toggleBulletList(),
      'Mod-Shift-b': () => this.editor.commands.toggleBlockquote(),
    }
  },
})

export const Placeholder = Extension.create({
  name: 'placeholder',
  addOptions: () => ({
    placeholder: 'Write something …',
    emptyEditorClass: 'is-editor-empty',
    emptyNodeClass: 'is-empty',
    showOnlyWhenEditable: true,
    showOnlyCurrent: true,
  }),
  addProseMirrorPlugins() {
    const editor = this.editor
    const options = this.options
    return [new Plugin({
      key: new PluginKey('placeholder'),
      props: {
        decorations(state) {
          if (options.showOnlyWhenEditable && !editor.isEditable) return null
          const decorations: ReturnType<typeof Decoration.node>[] = []
          const emptyEditor = state.doc.childCount === 1 && state.doc.firstChild?.content.size === 0
          state.doc.descendants((node, pos) => {
            if (node.isTextblock && node.content.size === 0) {
              const hasCursor = state.selection.from >= pos && state.selection.to <= pos + node.nodeSize
              if (hasCursor || !options.showOnlyCurrent) {
                decorations.push(Decoration.node(pos, pos + node.nodeSize, {
                  class: [options.emptyNodeClass, emptyEditor ? options.emptyEditorClass : ''].filter(Boolean).join(' '),
                  'data-placeholder': options.placeholder,
                }))
              }
            }
            return false
          })
          return DecorationSet.create(state.doc, decorations)
        },
      },
    })]
  },
})

export const TaskList = Node.create({
  name: 'taskList',
  group: 'block list',
  content: 'taskItem+',
  parseHTML: () => [{ tag: 'ul[data-type="taskList"]' }],
  renderHTML: ({ HTMLAttributes }) => ['ul', mergeAttributes(HTMLAttributes, { 'data-type': 'taskList' }), 0],
  addCommands() {
    return { toggleTaskList: () => toggleList('taskList', 'taskItem') } as never
  },
})

export const TaskItem = Node.create({
  name: 'taskItem',
  content: 'paragraph block*',
  defining: true,
  addAttributes: () => ({ checked: { default: false } }),
  parseHTML: () => [{
    tag: 'li[data-type="taskItem"]',
    getAttrs: (dom: HTMLElement) => ({ checked: ['', 'true'].includes(dom.getAttribute('data-checked') ?? '') }),
  }],
  renderHTML: ({ node, HTMLAttributes }) => [
    'li',
    mergeAttributes(HTMLAttributes, { 'data-type': 'taskItem', 'data-checked': String(node.attrs.checked) }),
    ['label', { contenteditable: 'false' }, ['input', { type: 'checkbox', checked: node.attrs.checked ? 'checked' : null }], ['span']],
    ['div', 0],
  ],
  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement('li')
      const label = document.createElement('label')
      const checkbox = document.createElement('input')
      const checkmark = document.createElement('span')
      const contentDOM = document.createElement('div')
      label.contentEditable = 'false'
      checkbox.type = 'checkbox'
      checkbox.checked = Boolean(node.attrs.checked)
      checkbox.addEventListener('mousedown', (event) => event.preventDefault())
      checkbox.addEventListener('change', () => {
        const pos = typeof getPos === 'function' ? getPos() : undefined
        if (!editor.isEditable || typeof pos !== 'number') {
          checkbox.checked = Boolean(node.attrs.checked)
          return
        }
        const current = editor.state.doc.nodeAt(pos)
        if (current) editor.view.dispatch(editor.state.tr.setNodeMarkup(pos, undefined, { ...current.attrs, checked: checkbox.checked }))
      })
      label.append(checkbox, checkmark)
      dom.append(label, contentDOM)
      const sync = (value: boolean) => {
        dom.dataset.type = 'taskItem'
        dom.dataset.checked = String(value)
        checkbox.checked = value
      }
      sync(Boolean(node.attrs.checked))
      return {
        dom,
        contentDOM,
        update(updatedNode) {
          if (updatedNode.type.name !== 'taskItem') return false
          node = updatedNode
          sync(Boolean(updatedNode.attrs.checked))
          return true
        },
      }
    }
  },
  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.splitListItem('taskItem'),
      Tab: () => this.editor.commands.sinkListItem('taskItem'),
      'Shift-Tab': () => this.editor.commands.liftListItem('taskItem'),
    }
  },
})

const pmTableSpecs = tableNodes({ tableGroup: 'block', cellContent: 'block+', cellAttributes: {} })
const Table = nodeFromSpec('table', { ...pmTableSpecs.table, content: 'tableRow+' })
const TableRow = nodeFromSpec('tableRow', { ...pmTableSpecs.table_row, content: '(tableCell | tableHeader)*' })
const TableCell = nodeFromSpec('tableCell', pmTableSpecs.table_cell)
const TableHeader = nodeFromSpec('tableHeader', pmTableSpecs.table_header)

function createTableNode(schema: Schema, rows: number, cols: number, withHeaderRow: boolean) {
  const rowNodes: PMNode[] = []
  for (let row = 0; row < rows; row += 1) {
    const cellType = withHeaderRow && row === 0 ? schema.nodes.tableHeader : schema.nodes.tableCell
    const cells = Array.from({ length: cols }, () => cellType.createAndFill()).filter((cell): cell is PMNode => cell !== null)
    rowNodes.push(schema.nodes.tableRow.createChecked(null, cells))
  }
  return schema.nodes.table.createChecked(null, rowNodes)
}

export const TableKit = Extension.create({
  name: 'pmTableKit',
  addOptions: () => ({ resizable: true, allowTableNodeSelection: true }),
  addExtensions: () => [Table, TableRow, TableCell, TableHeader],
  extendNodeSchema(extension) {
    const roles: Record<string, string> = {
      table: 'table',
      tableRow: 'row',
      tableCell: 'cell',
      tableHeader: 'header_cell',
    }
    return roles[extension.name] ? { tableRole: roles[extension.name] } : {}
  },
  addCommands() {
    const pm = (command: typeof addColumnBefore): TiptapCommand => ({ state, dispatch }) => command(state, dispatch)
    return {
      insertTable: (options: { rows?: number; cols?: number; withHeaderRow?: boolean } = {}) => ({ state, dispatch }) => {
        const table = createTableNode(state.schema, options.rows ?? 3, options.cols ?? 3, options.withHeaderRow ?? true)
        if (dispatch) dispatch(state.tr.replaceSelectionWith(table).scrollIntoView())
        return true
      },
      addColumnBefore: () => pm(addColumnBefore), addColumnAfter: () => pm(addColumnAfter), deleteColumn: () => pm(deleteColumn),
      addRowBefore: () => pm(addRowBefore), addRowAfter: () => pm(addRowAfter), deleteRow: () => pm(deleteRow),
      deleteTable: () => pm(deleteTable), mergeCells: () => pm(mergeCells), splitCell: () => pm(splitCell),
      toggleHeaderColumn: () => pm(toggleHeaderColumn), toggleHeaderRow: () => pm(toggleHeaderRow), toggleHeaderCell: () => pm(toggleHeaderCell),
      setCellAttribute: (name: string, value: unknown) => pm(setCellAttr(name, value)),
      goToNextCell: () => pm(goToNextCell(1)), goToPreviousCell: () => pm(goToNextCell(-1)),
      fixTables: () => ({ state, dispatch }) => {
        const tr = fixTables(state)
        if (tr && dispatch) dispatch(tr)
        return Boolean(tr)
      },
      setCellSelection: ({ anchorCell, headCell = anchorCell }: { anchorCell: number; headCell?: number }) => ({ state, dispatch }) => {
        if (dispatch) dispatch(state.tr.setSelection(CellSelection.create(state.doc, anchorCell, headCell)))
        return true
      },
    } as never
  },
  addProseMirrorPlugins() {
    return [
      ...(this.options.resizable ? [columnResizing({ View: TableView })] : []),
      tableEditing({ allowTableNodeSelection: this.options.allowTableNodeSelection }),
    ]
  },
  addKeyboardShortcuts() {
    return { Tab: () => this.editor.commands.goToNextCell(), 'Shift-Tab': () => this.editor.commands.goToPreviousCell() }
  },
})

export function getStockExtensions(options: { placeholder?: boolean; resizableTables?: boolean } = {}) {
  return [
    Document, Paragraph, Text, HardBreak, Image, Heading, Blockquote, HorizontalRule,
    Bold, Italic, Strike, Code, Link,
    BulletList, OrderedList, ListItem,
    CoreCommands, CorePlugins,
    TableKit.configure({ resizable: options.resizableTables ?? true }),
    TaskList, TaskItem,
    ...(options.placeholder === false ? [] : [Placeholder.configure({ placeholder: 'Type "/" for commands ...' })]),
  ]
}

// Keep the command names used by the existing TipTap-facing UI typed until the
// final raw-ProseMirror editor phase removes that command facade.
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pmStock: {
      setBold: () => ReturnType
      unsetBold: () => ReturnType
      toggleBold: () => ReturnType
      setItalic: () => ReturnType
      unsetItalic: () => ReturnType
      toggleItalic: () => ReturnType
      setStrike: () => ReturnType
      unsetStrike: () => ReturnType
      toggleStrike: () => ReturnType
      setCode: () => ReturnType
      unsetCode: () => ReturnType
      toggleCode: () => ReturnType
      setParagraph: () => ReturnType
      setHeading: (attributes: { level: number }) => ReturnType
      toggleHeading: (attributes: { level: number }) => ReturnType
      setBlockquote: () => ReturnType
      toggleBlockquote: () => ReturnType
      unsetBlockquote: () => ReturnType
      setHorizontalRule: () => ReturnType
      setHardBreak: () => ReturnType
      toggleBulletList: () => ReturnType
      toggleOrderedList: () => ReturnType
      splitListItem: (name: string) => ReturnType
      sinkListItem: (name: string) => ReturnType
      liftListItem: (name: string) => ReturnType
      undo: () => ReturnType
      redo: () => ReturnType
      setLink: (attributes: Attrs) => ReturnType
      toggleLink: (attributes: Attrs) => ReturnType
      unsetLink: () => ReturnType
      extendMarkRange: (typeOrName: string) => ReturnType
      toggleTaskList: () => ReturnType
      insertTable: (options?: { rows?: number; cols?: number; withHeaderRow?: boolean }) => ReturnType
      addColumnBefore: () => ReturnType
      addColumnAfter: () => ReturnType
      deleteColumn: () => ReturnType
      addRowBefore: () => ReturnType
      addRowAfter: () => ReturnType
      deleteRow: () => ReturnType
      deleteTable: () => ReturnType
      mergeCells: () => ReturnType
      splitCell: () => ReturnType
      toggleHeaderColumn: () => ReturnType
      toggleHeaderRow: () => ReturnType
      toggleHeaderCell: () => ReturnType
      setCellAttribute: (name: string, value: unknown) => ReturnType
      goToNextCell: () => ReturnType
      goToPreviousCell: () => ReturnType
      fixTables: () => ReturnType
      setCellSelection: (position: { anchorCell: number; headCell?: number }) => ReturnType
      setCodeBlock: (attributes?: { language?: string }) => ReturnType
      toggleCodeBlock: (attributes?: { language?: string }) => ReturnType
    }
  }
}
