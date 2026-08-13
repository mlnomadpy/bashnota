/**
 * ProseMirror core primitives (Phase 0 spike).
 *
 * The in-house replacements for the TipTap wrapper the migration is removing:
 * - {@link defineNode}   — declarative spec → ProseMirror NodeSpec.
 * - {@link VueNodeView}  — the Vue↔ProseMirror node view bridge.
 * - {@link useEditor}    — EditorView lifecycle composable.
 * - {@link EditorRegistry} — plugin/command registry.
 *
 * {@link toTiptapNode} is the Phase-0-only adapter that lets a primitives-based
 * node run inside the still-present TipTap editor; it is expected to disappear
 * once TipTap is removed.
 */
export { defineNode } from './defineNode'
export type { AttrDefinition, DefinedNode, NodeDefinition } from './defineNode'

export { VueNodeView } from './VueNodeView'
export type { VueNodeViewOptions, VueNodeViewProps } from './VueNodeView'

export { VueRenderer } from './VueRenderer'
export type { VueRendererOptions } from './VueRenderer'

export { useEditor } from './useEditor'
export type { UseEditorOptions, UseEditorReturn } from './useEditor'

export { EditorRegistry } from './registry'

export { toTiptapNode } from './tiptapAdapter'
export type { TiptapAdapterOptions } from './tiptapAdapter'
