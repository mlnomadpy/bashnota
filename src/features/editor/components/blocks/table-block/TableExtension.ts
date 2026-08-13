/**
 * Nota-table node — ported onto the raw-ProseMirror primitives.
 *
 * `tableData` uses JSON in `data-table-data`, matching the export service's
 * existing contract and making raw ProseMirror HTML round-trips reversible. The
 * configured `class: 'data-table'` still comes from the registration site.
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

function emptyTableData(): TableData {
  return {
    id: '',
    name: 'Untitled',
    columns: [],
    rows: [],
  }
}

function parseTableData(element: HTMLElement): TableData {
  const value = element.getAttribute('data-table-data') ?? element.getAttribute('tableData')
  if (!value) return emptyTableData()
  try {
    return JSON.parse(value) as TableData
  } catch {
    return emptyTableData()
  }
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
      default: emptyTableData(),
      parseHTML: parseTableData,
    },
  },
  parseDOM: [{ tag: 'div[data-type="data-table"]' }],
  toDOM: (node) => [
    'div',
    {
      'data-type': 'data-table',
      'data-table-data': JSON.stringify(node.attrs.tableData),
    },
    ['div', { class: 'data-table-content' }],
  ],
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
