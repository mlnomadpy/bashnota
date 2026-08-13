import { afterEach, describe, expect, it } from 'vitest'
import { DOMParser, DOMSerializer, Schema } from '@tiptap/pm/model'
import { EditorState } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'

import { parseMarkdown, serializeMarkdown } from '../markdown'
import { stableIdPlugin } from '../uniqueId'
import { drawIoDefinition } from '@/features/editor/components/blocks/drawio-block/drawio.node'

const cleanups: Array<() => void> = []
afterEach(() => {
  while (cleanups.length) cleanups.pop()!()
})

function idSchema() {
  return new Schema({
    nodes: {
      doc: { content: 'block+' },
      paragraph: { group: 'block', content: 'inline*', toDOM: () => ['p', 0] },
      text: { group: 'inline' },
      executableCodeBlock: {
        group: 'block',
        atom: true,
        attrs: { id: { default: null }, language: { default: 'python' } },
        toDOM: (node) => ['pre', { 'data-id': node.attrs.id }, ['code', 0]],
      },
    },
  })
}

function mountWithStableIds(schema: Schema, doc = schema.node('doc', null, [
  schema.node('executableCodeBlock'),
])) {
  const place = document.createElement('div')
  document.body.appendChild(place)
  const view = new EditorView(place, {
    state: EditorState.create({
      schema,
      doc,
      plugins: [stableIdPlugin({ types: ['executableCodeBlock'], createId: () => 'stable-id' })],
    }),
  })
  cleanups.push(() => {
    view.destroy()
    place.remove()
  })
  return view
}

describe('prosemirror-markdown replacement', () => {
  it('serialises and parses standard Markdown as a lossless document round-trip', () => {
    const original = '# Heading\n\nA paragraph with **strong text**.\n'

    const parsed = parseMarkdown(original)
    const markdown = serializeMarkdown(parsed)
    const reloaded = parseMarkdown(markdown)

    expect(reloaded.toJSON()).toEqual(parsed.toJSON())
    expect(markdown).toContain('# Heading')
    expect(markdown).toContain('**strong text**')
  })
})

describe('stableIdPlugin replacement', () => {
  it('keeps an assigned id when the document is serialised and reloaded', () => {
    const schema = idSchema()
    const firstView = mountWithStableIds(schema)
    const assignedId = firstView.state.doc.firstChild?.attrs.id
    expect(assignedId).toBe('stable-id')

    const persisted = firstView.state.doc.toJSON()
    firstView.destroy()
    const reloadedDocument = schema.nodeFromJSON(persisted)
    const reloadedView = mountWithStableIds(schema, reloadedDocument)

    expect(reloadedView.state.doc.firstChild?.attrs.id).toBe(assignedId)
  })

  it('repairs duplicate ids without changing the first stable id', () => {
    const schema = idSchema()
    const view = mountWithStableIds(schema, schema.node('doc', null, [
      schema.node('executableCodeBlock', { id: 'kept' }),
      schema.node('executableCodeBlock', { id: 'kept' }),
    ]))

    expect(view.state.doc.child(0).attrs.id).toBe('kept')
    expect(view.state.doc.child(1).attrs.id).toBe('stable-id')
  })
})

describe('DrawIo node replacement', () => {
  it('round-trips its diagram image through the ProseMirror DOM spec', () => {
    const schema = new Schema({
      nodes: {
        doc: { content: 'block+' },
        text: { group: 'inline' },
        [drawIoDefinition.name]: drawIoDefinition.spec,
      },
    })
    const node = schema.nodes.drawIoExtension.create({
      src: 'data:image/png;base64,diagram',
      alt: 'Diagram',
      title: 'Architecture',
    })
    const element = DOMSerializer.fromSchema(schema).serializeNode(node) as HTMLElement
    const container = document.createElement('div')
    container.appendChild(element)
    const parsed = DOMParser.fromSchema(schema).parse(container)

    expect(parsed.firstChild?.type.name).toBe('drawIoExtension')
    expect(parsed.firstChild?.attrs).toMatchObject({
      src: 'data:image/png;base64,diagram',
      alt: 'Diagram',
      title: 'Architecture',
    })
  })
})
