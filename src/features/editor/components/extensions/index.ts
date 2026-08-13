// src/components/editor/extensions/index.ts
import StarterKit from '@tiptap/starter-kit'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { Markdown } from 'tiptap-markdown'
// @ts-ignore
import UniqueId from 'tiptap-unique-id'
import Blockquote from '@tiptap/extension-blockquote'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import drawIoExtension from '@rcode-link/tiptap-drawio'
import Document from '@tiptap/extension-document'

// Import custom extensions
import { Extension } from '@tiptap/core'
import type { Editor } from '@tiptap/core'
import type { Plugin } from 'prosemirror-state'
import { PageLink } from './PageLinkExtension'
import { markdownAndKatexPlugin } from './MarkdownExtension'
import { globalDragHandlePlugins } from './DragHandlePlugin'

import {
  ExecutableCodeBlockExtension
} from '@/features/editor/components/blocks/executable-code-block/ExecutableCodeBlockExtension'
import {
  TableExtension
} from '@/features/editor/components/blocks/table-block/TableExtension'
import {
  MathExtension
} from '@/features/editor/components/blocks/math-block'
// Phase 0 (pm migration): the youtube node is ported onto the in-house
// ProseMirror primitives (defineNode + VueNodeView) and wrapped as a TipTap node
// so it coexists with the remaining TipTap extensions. Replaces the old
// youtube-extension.ts registration.
import {
  Youtube
} from '@/features/editor/components/blocks/youtube-block/youtube.node'
import {
  SubfigureExtension
} from '@/features/editor/components/blocks'
import {
  CitationExtension,
  BibliographyExtension
} from '@/features/editor/components/blocks/citation-block/CitationExtension'
import {
  TheoremExtension
} from '@/features/editor/components/blocks/theorem-block'
import {
  ConfusionMatrixExtension
} from '@/features/editor/components/blocks/confusion-matrix'
import {
  PipelineExtension
} from '@/features/editor/components/blocks/pipeline/PipelineExtension'
import { SubNotaLink } from './SubNotaLinkExtension'
import { subNotaLinkSlashCommandPlugin } from './SubNotaLinkSlashCommand'
// SubNotaLinkService is now imported lazily to avoid Pinia initialization issues
import { NotaTitleExtension } from './NotaTitleExtension'

// Import command-related extensions
import { slashCommandsPlugin } from './Commands'
import suggestion from './suggestion'

/**
 * Bridge a raw ProseMirror plugin factory back into the still-present TipTap
 * editor. The ported extensions (Commands, DragHandle, ContextMenu,
 * MarkdownExtension, SubNotaLinkSlashCommand) are now plain ProseMirror plugins
 * with no `@tiptap/*` imports; this thin `Extension.create` wrapper registers
 * them via TipTap's native `addProseMirrorPlugins`, passing `this.editor` so
 * suggestion plugins keep the editor handle they need. This wrapper disappears
 * with TipTap in a later phase.
 */
function pluginExtension(name: string, build: (editor: Editor) => Plugin[]) {
  return Extension.create({
    name,
    addProseMirrorPlugins() {
      return build(this.editor) as never
    },
  })
}

/**
 * Get all extensions for the full editor
 */
export function getEditorExtensions() {
  return [
    Markdown.configure({
      transformPastedText: true,
      transformCopiedText: false,
      breaks: true,
      tightLists: true,
      tightListClass: 'tight',
      bulletListMarker: '-',
      linkify: true,
      html: false,
    }),
    StarterKit.configure({
      codeBlock: false,
      blockquote: false,
      horizontalRule: false,
    }),
    UniqueId.configure({
      attributeName: 'id',
      types: ['executableCodeBlock'],
      createId: () => crypto.randomUUID(),
    }),
    ExecutableCodeBlockExtension.configure({
      HTMLAttributes: {
        class: 'code-block',
      },
      languageClassPrefix: 'language-',
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'nota-link',
      },
    }),
    PageLink,
    Table.configure({
      allowTableNodeSelection: true,
      resizable: true,
    }),
    TableRow,
    TableCell,
    TableHeader,
    Placeholder.configure({
      placeholder: 'Type "/" for commands ...',
    }),
    pluginExtension('slashCommands', (editor) => [
      slashCommandsPlugin({ editor, suggestion }),
    ]),
    TableExtension.configure({
      HTMLAttributes: {
        class: 'data-table',
      },
    }),
    MathExtension.configure({
      HTMLAttributes: {
        class: 'math-block',
      },
    }),
    pluginExtension('globalDragHandle', () =>
      globalDragHandlePlugins({ dragHandleWidth: 24 }),
    ),
    pluginExtension('markdownAndKatex', () => [markdownAndKatexPlugin()]),
    Youtube,
    SubfigureExtension,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    drawIoExtension.configure({
      openDialog: 'dblclick',
    }),
    Blockquote,
    HorizontalRule,
    CitationExtension,
    BibliographyExtension,
    TheoremExtension,
    ConfusionMatrixExtension,
    PipelineExtension,
    SubNotaLink,
    pluginExtension('subNotaLinkSlashCommand', (editor) => [
      subNotaLinkSlashCommandPlugin({ editor }),
    ]),
    NotaTitleExtension,
  ]
}

/**
 * Get extensions for the viewer (read-only mode)
 */
export function getViewerExtensions() {
  return [
    StarterKit.configure({
      document: false,
      codeBlock: false,
      blockquote: false,
      horizontalRule: false,
    }),
    Document.extend({
      content: 'block+',
    }),
    ExecutableCodeBlockExtension.configure({
      HTMLAttributes: {
        class: 'code-block',
      },
      languageClassPrefix: 'language-',
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'nota-link',
      },
    }),
    PageLink,
    Table.configure({
      resizable: false,
    }),
    TableRow,
    TableCell,
    TableHeader,
    TableExtension.configure({
      HTMLAttributes: {
        class: 'data-table',
      },
    }),
    MathExtension.configure({
      HTMLAttributes: {
        class: 'math-block',
      },
    }),
    pluginExtension('markdownAndKatex', () => [markdownAndKatexPlugin()]),
    Youtube,
    SubfigureExtension,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    drawIoExtension,
    Blockquote,
    HorizontalRule,
    CitationExtension,
    BibliographyExtension.configure({
      HTMLAttributes: {
        class: 'bibliography-block',
      },
    }),
    TheoremExtension,
    ConfusionMatrixExtension,
    PipelineExtension,
    SubNotaLink,
  ]
}









