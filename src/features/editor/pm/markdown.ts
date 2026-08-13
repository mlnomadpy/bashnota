/**
 * Minimal markdown boundary built directly on prosemirror-markdown.
 *
 * TipTap's Markdown extension was only registered in the editor extension
 * list; no application code consumed its storage or commands. Keeping this
 * small, explicit boundary gives callers a dependency-free way to parse and
 * serialise the standard ProseMirror markdown document format as the editor
 * migration proceeds.
 */
import {
  MarkdownParser,
  defaultMarkdownParser,
  defaultMarkdownSerializer,
} from 'prosemirror-markdown'
import { Slice } from '@tiptap/pm/model'
import { Plugin } from '@tiptap/pm/state'
import type { Node as ProseMirrorNode } from 'prosemirror-model'
import type { Schema } from '@tiptap/pm/model'

/** Parse standard Markdown into ProseMirror's standard document schema. */
export function parseMarkdown(markdown: string): ProseMirrorNode {
  return defaultMarkdownParser.parse(markdown)
}

/** Serialise a standard ProseMirror document as Markdown. */
export function serializeMarkdown(document: ProseMirrorNode): string {
  return defaultMarkdownSerializer.serialize(document)
}

/**
 * Parse Markdown against the live editor schema. It reuses the official
 * prosemirror-markdown token table, while allowing TipTap's current schema to
 * supply its existing paragraph, heading, list, and mark node instances.
 */
export function parseMarkdownForSchema(schema: Schema, markdown: string) {
  const parser = new MarkdownParser(
    schema,
    defaultMarkdownParser.tokenizer,
    defaultMarkdownParser.tokens,
  )
  return parser.parse(markdown)
}

/**
 * Preserve the old extension's `transformPastedText: true` behaviour with a
 * raw ProseMirror plugin. Schemas that intentionally omit a Markdown node
 * (such as the old codeBlock in favour of executableCodeBlock) fall back to
 * ProseMirror's normal clipboard handling rather than losing a paste.
 */
export function markdownPastePlugin(): Plugin {
  return new Plugin({
    props: {
      handlePaste(view, event) {
        const markdown = event.clipboardData?.getData('text/plain')
        if (!markdown) return false

        try {
          const parsed = parseMarkdownForSchema(view.state.schema, markdown)
          view.dispatch(
            view.state.tr
              .replaceSelection(new Slice(parsed.content, 0, 0))
              .scrollIntoView(),
          )
          return true
        } catch {
          return false
        }
      },
    },
  })
}
