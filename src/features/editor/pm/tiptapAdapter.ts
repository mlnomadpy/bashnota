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
import { Node } from '@tiptap/core'
import type { Component } from 'vue'
import type { NodeDefinition } from './defineNode'
import { VueNodeView } from './VueNodeView'

export interface TiptapAdapterOptions {
  /**
   * Contribute TipTap commands (e.g. `setYoutube`). Written as TipTap commands
   * so existing call sites (`editor.commands.setYoutube(url)`) keep working
   * unchanged during the port.
   */
  addCommands?: (this: { name: string }) => Record<string, (...args: never[]) => unknown>
}

/**
 * Build a TipTap `Node` extension whose spec comes from `definition` and whose
 * node view is our `VueNodeView` mounting `component`.
 */
export function toTiptapNode(
  definition: NodeDefinition,
  component: Component,
  options: TiptapAdapterOptions = {},
) {
  return Node.create({
    name: definition.name,
    group: definition.group,
    atom: definition.atom ?? false,
    inline: definition.inline ?? false,
    selectable: definition.selectable ?? true,
    draggable: definition.draggable ?? false,

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

    parseHTML() {
      // Only the tag selectors matter here; TipTap fills attributes from the
      // per-attribute `parseHTML` above.
      return definition.parseDOM
        .filter((rule): rule is typeof rule & { tag: string } => 'tag' in rule && !!rule.tag)
        .map((rule) => ({ tag: rule.tag }))
    },

    renderHTML({ node }) {
      // The definition's toDOM is a valid DOMOutputSpec; return it directly so
      // raw-PM serialisation and live-editor serialisation are identical.
      return definition.toDOM(node) as never
    },

    addNodeView() {
      return (props) =>
        new VueNodeView({
          node: props.node,
          view: props.view,
          getPos: props.getPos as () => number | undefined,
          component,
          editor: props.editor,
          // TipTap populates editor.appContext from <EditorContent>; forwarding
          // it lets the mounted component reach the host app's plugins/provides.
          appContext: (props.editor as { appContext?: import('vue').AppContext | null }).appContext,
        })
    },

    ...(options.addCommands ? { addCommands: options.addCommands } : {}),
  })
}
