/**
 * parseDOM / toDOM round-trip tests for the 12 custom block nodes ported onto the
 * ProseMirror primitives (Phase 2).
 *
 * Each node's `defineNode` spec is mounted in a hand-built Schema (raw-ProseMirror
 * path — no TipTap), a node is created with every attribute set, serialised with
 * DOMSerializer and parsed back with DOMParser. The assertion is that every
 * attribute survives the round-trip.
 *
 * Three nodes serialise SOME state lossily by original design (documented inline
 * and in findings): pipeline (arrays/objects/booleans), bibliography and notaTable
 * (attributes persisted via the document JSON, not HTML). For those, the test
 * asserts the faithful behaviour — the surviving attributes round-trip and the
 * node parses back as the right type — rather than a preservation the original
 * never provided. This is a like-for-like port: lossy behaviour is reproduced, not
 * fixed.
 */
import { describe, expect, it, vi } from 'vitest'
import { DOMParser, DOMSerializer, Schema } from '@tiptap/pm/model'
import type { Node as PMNode } from '@tiptap/pm/model'

// The ported extension files transitively import Vue block components, some of
// which pull in `@/services/firebase`, whose module init calls getAnalytics and
// throws in the test environment. We only need the node DEFINITIONS here (the
// pure schema), so stub Firebase to keep those imports side-effect-free.
vi.mock('@/services/firebase', () => ({
  analytics: null,
  auth: {},
  firestore: {},
  logAnalyticsEvent: () => {},
}))

import { citationDefinition, bibliographyDefinition } from '@/features/editor/components/blocks/citation-block/CitationExtension'
import { mathDefinition } from '@/features/editor/components/blocks/math-block/math-extension'
import { theoremDefinition } from '@/features/editor/components/blocks/theorem-block/theorem-extension'
import { confusionMatrixDefinition } from '@/features/editor/components/blocks/confusion-matrix/ConfusionMatrixExtension'
import { pipelineDefinition } from '@/features/editor/components/blocks/pipeline/PipelineExtension'
import { subfigureDefinition } from '@/features/editor/components/blocks/subfigure-block/subfigure-extension'
import { notaTableDefinition } from '@/features/editor/components/blocks/table-block/TableExtension'
import { notaTitleDefinition } from '@/features/editor/components/extensions/NotaTitleExtension'
import { pageLinkDefinition } from '@/features/editor/components/extensions/PageLinkExtension'
import { subNotaLinkDefinition } from '@/features/editor/components/extensions/SubNotaLinkExtension'
import { youtubeDefinition } from '@/features/editor/components/blocks/youtube-block/youtube.node'

/** One schema holding every ported node plus the minimum to contain them. */
function makeSchema() {
  const defs = [
    citationDefinition,
    bibliographyDefinition,
    mathDefinition,
    theoremDefinition,
    confusionMatrixDefinition,
    pipelineDefinition,
    subfigureDefinition,
    notaTableDefinition,
    notaTitleDefinition,
    pageLinkDefinition,
    subNotaLinkDefinition,
    youtubeDefinition,
  ]
  const nodes: Record<string, unknown> = {
    doc: { content: 'block+' },
    paragraph: {
      group: 'block',
      content: 'inline*',
      parseDOM: [{ tag: 'p' }],
      toDOM: () => ['p', 0],
    },
    text: { group: 'inline' },
  }
  for (const def of defs) nodes[def.name] = def.spec
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Schema({ nodes: nodes as any })
}

const schema = makeSchema()

/** Serialise a node to DOM and parse it straight back, returning the parsed node. */
function roundTrip(node: PMNode, { inline = false } = {}): PMNode {
  const top = inline ? schema.node('paragraph', null, [node]) : node
  const dom = DOMSerializer.fromSchema(schema).serializeNode(top) as HTMLElement
  const container = document.createElement('div')
  container.appendChild(dom)
  const parsed = DOMParser.fromSchema(schema).parse(container)
  const first = parsed.firstChild!
  return inline ? first.firstChild! : first
}

describe('block node round-trips — every attribute preserved', () => {
  it('citation preserves every attribute', () => {
    const attrs = {
      citationKey: 'smith2020',
      citationNumber: '3',
      citationStyle: 'author-year',
      citationFormat: 'long',
      citationStatus: 'resolved',
    }
    const parsed = roundTrip(schema.node('citation', attrs), { inline: true })
    expect(parsed.type.name).toBe('citation')
    expect(parsed.attrs).toMatchObject(attrs)
  })

  it('pageLink preserves every attribute', () => {
    const attrs = { href: '/nota/abc123', title: 'My Page' }
    const parsed = roundTrip(schema.node('pageLink', attrs), { inline: true })
    expect(parsed.type.name).toBe('pageLink')
    expect(parsed.attrs).toMatchObject(attrs)
  })

  it('youtube preserves every attribute', () => {
    const attrs = { url: 'https://youtu.be/dQw4w9WgXcQ', videoId: 'dQw4w9WgXcQ' }
    const parsed = roundTrip(schema.node('youtube', attrs))
    expect(parsed.type.name).toBe('youtube')
    expect(parsed.attrs).toMatchObject(attrs)
  })

  it('math preserves every attribute', () => {
    const attrs = { latex: 'E = mc^2' }
    const parsed = roundTrip(schema.node('math', attrs))
    expect(parsed.type.name).toBe('math')
    expect(parsed.attrs).toMatchObject(attrs)
  })

  it('theorem preserves every attribute', () => {
    const attrs = {
      title: 'Pythagoras',
      content: 'a^2 + b^2 = c^2',
      proof: 'left as an exercise',
      type: 'lemma',
      number: 7,
    }
    const parsed = roundTrip(schema.node('theorem', attrs))
    expect(parsed.type.name).toBe('theorem')
    expect(parsed.attrs).toMatchObject(attrs)
  })

  it('confusionMatrix preserves every attribute', () => {
    const attrs = {
      data: [
        [5, 1],
        [2, 8],
      ],
      labels: ['cat', 'dog'],
      title: 'My Matrix',
      source: 'jupyter',
      filePath: '/path/to/file.json',
      stats: { accuracy: 0.9 },
    }
    const parsed = roundTrip(schema.node('confusionMatrix', attrs))
    expect(parsed.type.name).toBe('confusionMatrix')
    expect(parsed.attrs).toEqual(attrs)
  })

  it('subfigure preserves every attribute', () => {
    const attrs = {
      subfigures: [
        { src: 'a.png', caption: 'Fig A' },
        { src: 'b.png', caption: 'Fig B' },
      ],
      layout: 'grid',
      unifiedSize: false,
      objectFit: 'cover',
      isLocked: true,
      caption: 'Main caption',
      label: 'Figure 1',
      gridColumns: 3,
    }
    const parsed = roundTrip(schema.node('subfigure', attrs))
    expect(parsed.type.name).toBe('subfigure')
    expect(parsed.attrs).toEqual(attrs)
  })

  it('subNotaLink preserves every attribute', () => {
    const attrs = {
      targetNotaId: 'nota-42',
      targetNotaTitle: 'Target Nota',
      displayText: 'See also',
      linkStyle: 'button',
    }
    const parsed = roundTrip(schema.node('subNotaLink', attrs))
    expect(parsed.type.name).toBe('subNotaLink')
    expect(parsed.attrs).toMatchObject(attrs)
  })

  it('notaTitle preserves its title (parsed from textContent)', () => {
    // The title attribute serialises to `data-title` and an inline content hole,
    // and parses back from the element's textContent — verbatim original behaviour.
    const node = schema.node('notaTitle', { title: 'My Document' }, schema.text('My Document'))
    const parsed = roundTrip(node)
    expect(parsed.type.name).toBe('notaTitle')
    expect(parsed.attrs.title).toBe('My Document')
  })
})

describe('block node round-trips — nodes whose complex state persists via JSON, not HTML', () => {
  it('pipeline round-trips its scalar attributes (arrays/objects are lossy by original design)', () => {
    // The original renderHTML spread every attribute onto the element; scalars
    // survive a getAttribute round-trip, while nodes/edges/viewport/stopOnError
    // stringify lossily. Pipeline state is persisted through the document JSON.
    const attrs = {
      id: 'pipeline-fixed-1',
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      title: 'My Pipeline',
      kernelMode: 'shared',
      sharedKernelName: 'kernel-a',
      executionOrder: 'sequential',
      stopOnError: true,
    }
    const parsed = roundTrip(schema.node('pipeline', attrs))
    expect(parsed.type.name).toBe('pipeline')
    // Scalar string attributes survive HTML serialisation.
    expect(parsed.attrs.id).toBe('pipeline-fixed-1')
    expect(parsed.attrs.title).toBe('My Pipeline')
    expect(parsed.attrs.kernelMode).toBe('shared')
    expect(parsed.attrs.sharedKernelName).toBe('kernel-a')
    expect(parsed.attrs.executionOrder).toBe('sequential')
  })

  it('bibliography parses back as the right type (attributes persist via JSON — tracked, out of scope)', () => {
    // The original parseHTML read attributes by their bare name (`style`, `sortBy`)
    // while renderHTML wrote `data-style`/`data-sort-by`, so HTML never round-tripped
    // these; they persist through the document JSON. Reproduced, not fixed.
    const attrs = {
      style: 'mla',
      title: 'Works Cited',
      sortBy: 'author',
      groupBy: 'type',
      showType: false,
      showDOI: false,
      showURL: false,
    }
    const node = schema.node('bibliography', attrs)
    // toDOM emits the intended data-* attributes.
    const dom = DOMSerializer.fromSchema(schema).serializeNode(node) as HTMLElement
    expect(dom.getAttribute('data-type')).toBe('bibliography')
    expect(dom.getAttribute('data-style')).toBe('mla')
    expect(dom.getAttribute('data-sort-by')).toBe('author')
    // Round-trips back to the same node type (attribute recovery is via JSON).
    const parsed = roundTrip(node)
    expect(parsed.type.name).toBe('bibliography')
  })

  it('notaTable parses back as the right type (tableData is the tracked lossy-persistence bug)', () => {
    const attrs = {
      tableData: {
        id: 't1',
        name: 'Sales',
        columns: [{ id: 'c1', title: 'Region', type: 'text' }],
        rows: [{ id: 'r1', cells: { c1: 'West' } }],
      },
    }
    const node = schema.node('notaTable', attrs)
    const dom = DOMSerializer.fromSchema(schema).serializeNode(node) as HTMLElement
    expect(dom.getAttribute('data-type')).toBe('data-table')
    const parsed = roundTrip(node)
    expect(parsed.type.name).toBe('notaTable')
    // tableData does NOT round-trip through HTML (the separately-tracked, out-of-scope
    // lossy table-persistence bug); it resets to the default empty table on parse.
    expect(parsed.attrs.tableData.rows).toEqual([])
  })
})
