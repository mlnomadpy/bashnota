import { defineComponent, h, onBeforeUnmount } from 'vue'
import { toTiptapNode } from '@/features/editor/pm/tiptapAdapter'
import { defineNode } from '@/features/editor/pm/defineNode'
import type { NodeDefinition } from '@/features/editor/pm/defineNode'

const DRAWIO_URL =
  'https://embed.diagrams.net/?embed=1&ui=atlas&spin=1&modified=unsavedChanges&proto=json'

// A compact initial diagram image. It is replaced with the XMLPNG export as
// soon as the user saves from diagrams.net, exactly as the previous extension
// stored its diagram data in the image's src attribute.
const DEFAULT_DRAWIO_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"%3E%3Crect width="320" height="180" fill="%23f8fafc" stroke="%2394a3b8"/%3E%3Cpath d="M70 55h80v35H70zM170 90h80v35h-80zM150 72h20M160 72v18" fill="none" stroke="%23475569" stroke-width="3"/%3E%3Ctext x="160" y="155" text-anchor="middle" fill="%23334155" font-family="sans-serif" font-size="18"%3EDraw.io diagram%3C/text%3E%3C/svg%3E'

const DrawIoBlockView = defineComponent({
  name: 'DrawIoBlockView',
  props: {
    node: { type: Object, required: true },
    updateAttributes: { type: Function, required: true },
  },
  setup(props) {
    let dialog: HTMLDialogElement | null = null
    let receive: ((event: MessageEvent) => void) | null = null

    const closeDialog = () => {
      if (receive) window.removeEventListener('message', receive)
      receive = null
      if (dialog?.isConnected) dialog.remove()
      dialog = null
    }

    const openDialog = () => {
      if (dialog) return
      dialog = document.createElement('dialog')
      dialog.style.border = '0'
      dialog.style.padding = '0'
      dialog.addEventListener('close', closeDialog, { once: true })

      const iframe = document.createElement('iframe')
      iframe.setAttribute('frameborder', '0')
      iframe.src = DRAWIO_URL
      iframe.style.width = '99vw'
      iframe.style.height = '99vh'
      dialog.appendChild(iframe)
      document.body.appendChild(dialog)

      receive = (event: MessageEvent) => {
        if (typeof event.data !== 'string' || event.data.length === 0) return
        let message: { event?: string; data?: string }
        try {
          message = JSON.parse(event.data)
        } catch {
          return
        }

        switch (message.event) {
          case 'init':
            iframe.contentWindow?.postMessage(
              JSON.stringify({ action: 'load', xmlpng: props.node.attrs.src }),
              '*',
            )
            break
          case 'save':
            iframe.contentWindow?.postMessage(
              JSON.stringify({ action: 'export', format: 'xmlpng', spinKey: 'saving' }),
              '*',
            )
            break
          case 'export':
            if (message.data) props.updateAttributes({ src: message.data })
            break
          case 'exit':
            dialog?.close()
            break
        }
      }
      window.addEventListener('message', receive)
      dialog.showModal()
    }

    onBeforeUnmount(closeDialog)

    return () =>
      h('img', {
        src: String(props.node.attrs.src ?? ''),
        alt: String(props.node.attrs.alt ?? ''),
        title: String(props.node.attrs.title ?? ''),
        'data-type': 'drawio',
        class: 'drawio-diagram',
        onDblclick: openDialog,
      })
  },
})

export const drawIoNodeDefinition: NodeDefinition = {
  name: 'drawIoExtension',
  group: 'block',
  atom: true,
  draggable: true,
  attrs: {
    src: { default: DEFAULT_DRAWIO_IMAGE },
    alt: { default: '' },
    title: { default: '' },
  },
  parseDOM: [{ tag: 'img[data-type="drawio"]' }, { tag: 'img[data-type="drawIoExtension"]' }],
  toDOM: (node) => [
    'img',
    {
      src: String(node.attrs.src ?? ''),
      alt: String(node.attrs.alt ?? ''),
      title: String(node.attrs.title ?? ''),
      'data-type': 'drawio',
      class: 'drawio-diagram',
    },
  ],
}

/** Raw-ProseMirror `{ name, spec }` used by tests and the eventual PM editor. */
export const drawIoDefinition = defineNode(drawIoNodeDefinition)

/** Local ProseMirror-backed replacement for @rcode-link/tiptap-drawio. */
export const DrawIo = toTiptapNode(drawIoNodeDefinition, DrawIoBlockView, {
  addCommands() {
    return {
      insertDrawIo:
        () =>
        ({ commands }: { commands: { insertContent: (content: unknown) => boolean } }) =>
          commands.insertContent({
            type: this.name,
            attrs: { src: DEFAULT_DRAWIO_IMAGE, alt: '', title: '' },
          }),
    } as never
  },
})

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    drawIoExtension: {
      /** Insert a new diagrams.net block. */
      insertDrawIo: () => ReturnType
    }
  }
}
