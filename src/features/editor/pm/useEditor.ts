/**
 * useEditor — EditorView lifecycle composable (raw ProseMirror).
 *
 * This is the replacement for TipTap's `new Editor({ ... })` / `useEditor()`.
 * It owns an `EditorView`: create it over a DOM element, expose it reactively,
 * and — critically — destroy it when the owning component unmounts so the view,
 * its plugins and its node views are torn down (otherwise every editor instance
 * leaks its DOM listeners and ProseMirror state).
 *
 * During Phase 0 the LIVE editor is still a TipTap Editor, so this composable is
 * exercised by the test suite rather than the app. It is the seam later phases
 * will mount the real editor on once TipTap is removed.
 */
import { getCurrentInstance, onBeforeUnmount, shallowRef } from 'vue'
import type { ShallowRef } from 'vue'
import { EditorState } from '@tiptap/pm/state'
import type { Plugin } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'
import type { DirectEditorProps, NodeViewConstructor } from '@tiptap/pm/view'
import type { Node as ProseMirrorNode, Schema } from '@tiptap/pm/model'

export interface UseEditorOptions {
  schema: Schema
  /** Initial document. Omit for an empty doc built from the schema. */
  doc?: ProseMirrorNode
  plugins?: readonly Plugin[]
  /** Node view constructors keyed by node type name. */
  nodeViews?: Record<string, NodeViewConstructor>
  /** Extra EditorView props (dispatchTransaction, editable, etc.). */
  viewProps?: Omit<DirectEditorProps, 'state' | 'nodeViews'>
}

export interface UseEditorReturn {
  /** The live EditorView, or null before `mount` / after `destroy`. */
  view: ShallowRef<EditorView | null>
  /** Create the EditorView over `element`. Destroys any previous view first. */
  mount: (element: HTMLElement) => EditorView
  /** Tear down the EditorView. Safe to call more than once. */
  destroy: () => void
}

export function useEditor(options: UseEditorOptions): UseEditorReturn {
  const view = shallowRef<EditorView | null>(null)

  const destroy = (): void => {
    if (view.value) {
      view.value.destroy()
      view.value = null
    }
  }

  const mount = (element: HTMLElement): EditorView => {
    destroy()
    const state = EditorState.create({
      schema: options.schema,
      doc: options.doc,
      plugins: options.plugins ? [...options.plugins] : [],
    })
    const nextView = new EditorView(element, {
      ...options.viewProps,
      state,
      nodeViews: options.nodeViews,
    })
    view.value = nextView
    return nextView
  }

  // Auto-cleanup only when used inside a component setup(); harmless (and
  // skipped) in a plain test that drives mount/destroy manually.
  if (getCurrentInstance()) {
    onBeforeUnmount(destroy)
  }

  return { view, mount, destroy }
}
