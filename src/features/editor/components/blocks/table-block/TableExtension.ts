/**
 * Nota-table node — ported onto the raw-ProseMirror primitives.
 *
 * Like-for-like port of the former `Node.create`. `tableData` is persisted through
 * the document JSON and does NOT round-trip through HTML: the original parse rule
 * had no `getAttrs` for it and the original `renderHTML` only stringified it
 * (`[object Object]`). That is the separately-tracked, out-of-scope lossy
 * table-persistence gap — reproduced, not fixed, here. `toDOM` emits the same
 * `div[data-type="data-table"] > div.data-table-content` shell; the `class:
 * 'data-table'` comes from `.configure({ HTMLAttributes })` at registration.
 */
import { defineNode, toTiptapNode } from '@/features/editor/pm'
import type { NodeDefinition } from '@/features/editor/pm'
import type { RawCommands } from '@tiptap/core'
import TableBlock from '@/features/editor/components/blocks/table-block/TableBlock.vue'
import { v4 as uuidv4 } from 'uuid'

export interface TableColumn {
  id: string
  title: string
  type: 'text' | 'number' | 'select' | 'date'
  options?: string[]
}

export interface TableData {
  id: string
  name: string
  columns: TableColumn[]
  rows: Array<{
    id: string
    cells: Record<string, any>
  }>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    notaTable: {
      insertNotaTable: (notaId: string) => ReturnType
    }
  }
}

export const notaTableNodeDefinition: NodeDefinition = {
  name: 'notaTable',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,
  inline: false,
  attrs: {
    tableData: {
      default: {
        id: '',
        name: 'Untitled',
        columns: [],
        rows: [],
      },
    },
  },
  parseDOM: [{ tag: 'div[data-type="data-table"]' }],
  toDOM: () => ['div', { 'data-type': 'data-table' }, ['div', { class: 'data-table-content' }]],
}

export const notaTableDefinition = defineNode(notaTableNodeDefinition)

export const TableExtension = toTiptapNode(notaTableNodeDefinition, TableBlock, {
  addCommands() {
    return {
      insertNotaTable:
        (_notaId: string) =>
        ({ chain }: { chain: () => { insertContent: (c: unknown) => { run: () => boolean } } }) => {
          const tableId = uuidv4()
          const columnId = uuidv4()

          return chain()
            .insertContent({
              type: 'notaTable',
              attrs: {
                tableData: {
                  id: tableId,
                  name: 'Untitled',
                  columns: [
                    {
                      id: columnId,
                      title: 'Title',
                      type: 'text',
                    },
                  ],
                  rows: [
                    {
                      id: uuidv4(),
                      cells: {
                        [columnId]: '',
                      },
                    },
                  ],
                },
              },
            })
            .run()
        },
    } as unknown as Partial<RawCommands>
  },
})
