/**
 * YouTube node — ported onto the raw-ProseMirror primitives (Phase 0 spike).
 *
 * This is a like-for-like port of the LIVE youtube extension. Grep evidence for
 * which of the two youtube files is actually registered:
 *
 *   src/features/editor/components/extensions/index.ts:35
 *     } from '@/features/editor/components/blocks/youtube-block/youtube-extension'
 *
 * i.e. the lowercase `youtube-extension.ts` is live; the capital
 * `YoutubeExtension.ts` is only re-exported by this folder's `index.ts` barrel,
 * and nothing imports that barrel. So this port reproduces the LIVE spec exactly:
 *   attrs = { url, videoId }   (NOT the dead file's startTime/autoplay)
 *   parseDOM tag = div[data-type="youtube"]
 *   toDOM       = div[data-type="youtube"] with url/videoId attributes.
 *
 * Behaviour is preserved verbatim; no redesign (per the porting brief).
 */
import { defineNode, toTiptapNode } from '@/features/editor/pm'
import type { NodeDefinition } from '@/features/editor/pm'
import YoutubeBlockView from './YoutubeBlockView.vue'

/**
 * The declarative node definition — the single source of truth consumed by both
 * `defineNode` (raw-PM spec, used by the test suite) and `toTiptapNode` (the
 * live TipTap adapter path).
 */
export const youtubeNodeDefinition: NodeDefinition = {
  name: 'youtube',
  group: 'block',
  atom: true,
  attrs: {
    url: {
      default: null,
      parseHTML: (element) => element.getAttribute('url'),
    },
    videoId: {
      default: null,
      parseHTML: (element) => element.getAttribute('videoId'),
    },
  },
  parseDOM: [{ tag: 'div[data-type="youtube"]' }],
  toDOM: (node) => {
    const attrs: Record<string, string> = { 'data-type': 'youtube' }
    if (node.attrs.url != null) attrs.url = String(node.attrs.url)
    if (node.attrs.videoId != null) attrs.videoId = String(node.attrs.videoId)
    return ['div', attrs]
  },
}

/** The ProseMirror `{ name, spec }` produced from the definition (raw-PM path). */
export const youtubeDefinition = defineNode(youtubeNodeDefinition)

/** Extract an 11-char YouTube video id from a URL (verbatim from the live file). */
function extractYoutubeId(url: string): string | null {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[7].length === 11 ? match[7] : null
}

/**
 * The live-editor extension: the primitives-based youtube node wrapped as a
 * TipTap `Node.create` so it coexists with the remaining TipTap extensions and
 * keeps the `editor.commands.setYoutube(url)` call site working.
 */
export const Youtube = toTiptapNode(youtubeNodeDefinition, YoutubeBlockView, {
  addCommands() {
    return {
      setYoutube:
        (url: string) =>
        ({ commands }: { commands: { insertContent: (content: unknown) => boolean } }) => {
          const videoId = extractYoutubeId(url)
          if (!videoId) return false
          return commands.insertContent({
            type: this.name,
            attrs: { url, videoId },
          })
        },
    }
  },
})

// Keep the youtube `setYoutube` command typed for TipTap consumers.
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    youtube: {
      /** Add a YouTube video */
      setYoutube: (url: string) => ReturnType
    }
  }
}
