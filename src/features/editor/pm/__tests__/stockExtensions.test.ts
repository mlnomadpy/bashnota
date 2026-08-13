import { afterEach, describe, expect, it, vi } from 'vitest'
import { Editor } from '@tiptap/core'
import { DOMParser as PMDOMParser, DOMSerializer } from 'prosemirror-model'
import { getStockExtensions } from '../stockExtensions'

vi.mock('@/services/firebase', () => ({
  analytics: {},
  auth: {},
  firestore: {},
  logAnalyticsEvent: vi.fn(),
}))

const editors: Editor[] = []

function createEditor(content: NonNullable<ConstructorParameters<typeof Editor>[0]>['content'] = '<p></p>') {
  const element = document.createElement('div')
  document.body.appendChild(element)
  const editor = new Editor({ element, extensions: getStockExtensions(), content })
  editors.push(editor)
  return editor
}

afterEach(() => {
  editors.splice(0).forEach((editor) => editor.destroy())
  document.body.innerHTML = ''
})

describe('official ProseMirror stock extensions', () => {
  it('boots the live editor extension registry', async () => {
    const { getEditorExtensions } = await import('@/features/editor/components/extensions')
    const element = document.createElement('div')
    document.body.appendChild(element)
    const editor = new Editor({ element, extensions: getEditorExtensions(), content: '<p>live</p>' })
    editors.push(editor)

    expect(editor.state.doc.childCount).toBeGreaterThan(0)
    expect(editor.schema.nodes.table.spec.tableRole).toBe('table')
    expect(editor.schema.nodes.executableCodeBlock.spec.code).toBe(true)
  })

  it('provides the stock schema and ProseMirror plugin stack', () => {
    const editor = createEditor()

    expect(Object.keys(editor.schema.nodes)).toEqual(expect.arrayContaining([
      'doc', 'paragraph', 'heading', 'blockquote', 'horizontalRule', 'image',
      'bulletList', 'orderedList', 'listItem', 'table', 'tableRow', 'tableCell',
      'tableHeader', 'taskList', 'taskItem',
    ]))
    expect(Object.keys(editor.schema.marks)).toEqual(expect.arrayContaining(['bold', 'italic', 'strike', 'code', 'link']))

    const pluginKeys = editor.state.plugins.map((plugin) => (plugin as unknown as { key: string }).key)
    expect(pluginKeys.some((key) => key.startsWith('history$'))).toBe(true)
    expect(pluginKeys.some((key) => key.startsWith('selectingCells$'))).toBe(true)
    expect(pluginKeys.some((key) => key.startsWith('placeholder$'))).toBe(true)
  })

  it('round-trips basic, list, link, image, and table DOM through the schema', () => {
    const editor = createEditor()
    const source = document.createElement('div')
    source.innerHTML = [
      '<blockquote><p><strong>quoted</strong> <a href="https://example.com">link</a></p></blockquote>',
      '<ul><li><p>item</p></li></ul>',
      '<img src="image.png" alt="diagram">',
      '<table><tbody><tr><th><p>head</p></th><td><p>cell</p></td></tr></tbody></table>',
      '<hr>',
    ].join('')

    const parsed = PMDOMParser.fromSchema(editor.schema).parse(source)
    const target = document.createElement('div')
    target.appendChild(DOMSerializer.fromSchema(editor.schema).serializeFragment(parsed.content))

    expect(target.querySelector('blockquote strong')?.textContent).toBe('quoted')
    expect(target.querySelector('a')?.getAttribute('href')).toBe('https://example.com')
    expect(target.querySelector('ul li')?.textContent).toBe('item')
    expect(target.querySelector('img')?.getAttribute('alt')).toBe('diagram')
    expect(target.querySelectorAll('table th, table td')).toHaveLength(2)
    expect(target.querySelector('hr')).not.toBeNull()
  })

  it('decorates an empty paragraph with the local placeholder', () => {
    const editor = createEditor()
    const paragraph = editor.view.dom.querySelector('p')

    expect(paragraph?.classList.contains('is-empty')).toBe(true)
    expect(paragraph?.classList.contains('is-editor-empty')).toBe(true)
    expect(paragraph?.getAttribute('data-placeholder')).toBe('Type "/" for commands ...')
  })

  it('parses task items and updates checked state from the local checkbox node view', () => {
    const editor = createEditor({
      type: 'doc',
      content: [{
        type: 'taskList',
        content: [{
          type: 'taskItem',
          attrs: { checked: false },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'ship it' }] }],
        }],
      }],
    })
    const checkbox = editor.view.dom.querySelector<HTMLInputElement>('li[data-type="taskItem"] input[type="checkbox"]')

    expect(checkbox).not.toBeNull()
    checkbox!.checked = true
    checkbox!.dispatchEvent(new Event('change', { bubbles: true }))

    expect(editor.getJSON().content?.[0].content?.[0].attrs?.checked).toBe(true)
    expect(editor.view.dom.querySelector('li')?.getAttribute('data-checked')).toBe('true')
  })

  it('keeps toolbar commands for marks, headings, lists, history, and tables', () => {
    const editor = createEditor('<p>hello</p>')
    editor.commands.selectAll()

    expect(editor.commands.toggleBold()).toBe(true)
    expect(editor.isActive('bold')).toBe(true)
    expect(editor.commands.setHeading({ level: 2 })).toBe(true)
    expect(editor.isActive('heading', { level: 2 })).toBe(true)
    expect(editor.commands.toggleBulletList()).toBe(true)
    expect(editor.isActive('bulletList')).toBe(true)
    expect(editor.commands.undo()).toBe(true)

    editor.commands.setContent('<p>after</p>')
    editor.commands.setTextSelection(editor.state.doc.content.size)
    expect(editor.commands.insertTable({ rows: 2, cols: 2, withHeaderRow: true })).toBe(true)
    const json = editor.getJSON()
    const table = json.content?.find((node) => node.type === 'table')
    expect(table?.content).toHaveLength(2)
    expect(table?.content?.[0].content?.[0].type).toBe('tableHeader')
    expect(table?.content?.[1].content?.[0].type).toBe('tableCell')
  })
})
