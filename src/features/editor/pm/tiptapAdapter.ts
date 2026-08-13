/**
 * tiptapAdapter — run a primitives-based node inside the LIVE TipTap editor.
 *
 * Phase 0 keeps TipTap in place while the ported block must "coexist with TipTap
 * in the same editor". This adapter is the bridge: it wraps a {@link NodeDefinition}
 * (from `defineNode`) plus a Vue component into a TipTap `Node.create`, and — the
 * whole point — routes TipTap's `addNodeView` through our {@link VueNodeView}. So
 * the youtube node in the real editor is served by the new primitives, proving
 * them end-to-end against the same ProseMirror instance TipTap uses.
 *
 * The `NodeDefinition` is the single source of truth: its `attrs` feed TipTap's
 * `addAttributes`, its `parseDOM` tags feed `parseHTML`, and its `toDOM` IS the
 * `renderHTML` output. Nothing about the schema is duplicated here.
 */
import { InputRule as TiptapInputRule, Node, mergeAttributes } from '@tiptap/core'
import type { Component } from 'vue'
import type { DOMOutputSpec, NodeType } from '@tiptap/pm/model'
import type { EditorState, Transaction } from '@tiptap/pm/state'
import type { InputRule as ProseMirrorInputRule } from 'prosemirror-inputrules'
import type { NodeDefinition } from './defineNode'
import { VueNodeView } from './VueNodeView'

export interface TiptapAdapterOptions {
  /**
   * Contribute TipTap commands (e.g. `setYoutube`). Written as TipTap commands
   * so existing call sites (`editor.commands.setYoutube(url)`) keep working
   * unchanged during the port.
   */
  addCommands?: (this: { name: string }) => Record<string, (...args: never[]) => unknown>
  /**
   * TipTap `onUpdate` lifecycle hook (e.g. citation renumbering). Passed straight
   * through so behaviour that fired on every doc change keeps firing.
   */
  onUpdate?: (this: { editor: unknown }) => void
  /** Raw ProseMirror input rules contributed by the coexistence extension. */
  addInputRules?: (this: { type: NodeType }) => ProseMirrorInputRule[]
}

interface ProseMirrorInputRuleInternals {
  match: RegExp
  handler: (
    state: EditorState,
    match: RegExpMatchArray,
    start: number,
    end: number,
  ) => Transaction | null
}

/**
 * TipTap 2 has its own InputRule wrapper (`find` + command-style `handler`),
 * while this migration uses the official ProseMirror factories. Adapt the raw
 * PM rule here so ported extension files never need to import TipTap merely to
 * register an input rule during coexistence.
 */
function toTiptapInputRule(rule: ProseMirrorInputRule): TiptapInputRule {
  // `match` and `handler` are runtime fields on prosemirror-inputrules' class,
  // but its declaration intentionally marks them internal.
  const raw = rule as unknown as ProseMirrorInputRuleInternals
  return new TiptapInputRule({
    find: raw.match,
    handler: ({ state, range, match }) =>
      raw.handler(state, match, range.from, range.to) ? undefined : null,
  })
}

/**
 * Merge a node's configured `HTMLAttributes` (from `.configure({ HTMLAttributes })`
 * at the registration site) into the outermost element of a `toDOM` spec, exactly
 * as TipTap's `renderHTML` merged `this.options.HTMLAttributes` first (so `class`
 * concatenates and explicit attributes win). Raw-ProseMirror callers never pass
 * option attributes, so `toDOM` alone is authoritative there.
 */
function mergeOptionAttrs(
  spec: DOMOutputSpec,
  optionAttrs: Record<string, unknown> | undefined,
): DOMOutputSpec {
  if (!optionAttrs || Object.keys(optionAttrs).length === 0) return spec
  if (!Array.isArray(spec)) return spec

  const [tag, second, ...rest] = spec as unknown[]
  // A plain object at index 1 is the attribute map; a string/number (e.g. the
  // content-hole `0`) or array is a child, so attrs are absent.
  const hasAttrs = second != null && typeof second === 'object' && !Array.isArray(second)
  const existing = (hasAttrs ? second : {}) as Record<string, unknown>
  const children = hasAttrs ? rest : second === undefined ? [] : [second, ...rest]
  const merged = mergeAttributes(
    optionAttrs as Record<string, string>,
    existing as Record<string, string>,
  )
  return [tag, merged, ...children] as unknown as DOMOutputSpec
}

/**
 * Build a TipTap `Node` extension whose spec comes from `definition` and whose
 * node view is our `VueNodeView` mounting `component`.
 *
 * `component` is optional: a schema-only node (e.g. pageLink, which had no
 * `addNodeView` in TipTap and renders purely from `renderHTML`) passes `null`
 * and gets no node view — ProseMirror renders it straight from `toDOM`.
 */
export function toTiptapNode(
  definition: NodeDefinition,
  component: Component | null,
  options: TiptapAdapterOptions = {},
) {
  return Node.create({
    name: definition.name,
    group: definition.group,
    content: definition.content,
    marks: definition.marks,
    atom: definition.atom ?? false,
    code: definition.code ?? false,
    inline: definition.inline ?? false,
    selectable: definition.selectable ?? true,
    draggable: definition.draggable ?? false,
    defining: definition.defining ?? false,
    isolating: definition.isolating ?? false,

    addAttributes() {
      const attrs: Record<string, unknown> = {}
      for (const [key, def] of Object.entries(definition.attrs ?? {})) {
        attrs[key] = {
          default: def.default,
          parseHTML: (element: HTMLElement) =>
            def.parseHTML ? def.parseHTML(element) : element.getAttribute(key),
          renderHTML: (attributes: Record<string, unknown>) => {
            const value = attributes[key]
            if (def.renderHTML) return def.renderHTML(value)
            if (value == null) return {}
            return { [key]: String(value) }
          },
        }
      }
      return attrs
    },

    addOptions() {
      // Hold `.configure({ HTMLAttributes })` from the registration site so its
      // class survives into serialisation (see renderHTML below).
      return { HTMLAttributes: {} as Record<string, unknown> }
    },

    parseHTML() {
      // Pass the definition's raw parse rules through UNCHANGED — including any
      // rule-level `getAttrs` (subfigure reconstructs from child DOM). TipTap's
      // injectExtensionAttributesToParseRule then layers the per-attribute
      // parseHTML on top, exactly as it did for the original Node.create.
      return definition.parseDOM as never
    },

    renderHTML({ node }) {
      // The definition's toDOM is the single serializer for both paths. Merge the
      // configured HTMLAttributes (the `.configure` class) into the outermost
      // element so live serialisation matches the original renderHTML, which put
      // `this.options.HTMLAttributes` first in its mergeAttributes call.
      const optionAttrs = (
        this as unknown as {
          options?: { HTMLAttributes?: Record<string, unknown> }
        }
      ).options?.HTMLAttributes
      return mergeOptionAttrs(definition.toDOM(node), optionAttrs) as never
    },

    // A schema-only node (component === null) contributes no node view; TipTap
    // renders it directly from renderHTML/toDOM, exactly as the original did.
    ...(component
      ? {
          addNodeView() {
            return (props) =>
              new VueNodeView({
                node: props.node,
                view: props.view,
                getPos: props.getPos as () => number | undefined,
                component,
                editor: props.editor,
                // Inline node views must expose inline DOM. A block-level wrapper
                // inside a paragraph changes layout and gives the browser invalid
                // paragraph structure even when the Vue component itself is a span.
                as: definition.inline ? 'span' : 'div',
                // TipTap populates editor.appContext from <EditorContent>;
                // forwarding it lets the mounted component reach the host app's
                // plugins/provides.
                appContext: (props.editor as { appContext?: import('vue').AppContext | null })
                  .appContext,
              })
          },
        }
      : {}),

    ...(options.addCommands ? { addCommands: options.addCommands } : {}),
    ...(options.addInputRules
      ? {
          addInputRules() {
            return options.addInputRules!
              .call(this as unknown as { type: NodeType })
              .map(toTiptapInputRule)
          },
        }
      : {}),
    ...(options.onUpdate ? { onUpdate: options.onUpdate } : {}),
  })
}
