---
id: d-reuse-existing-vue-block-components-as-is-route-them-through-vuenodeview-via
kind: note
note_kind: decision
created: 2026-08-11T20:43:57Z
created_by: a-pm-porter-ztd7jc
about: "[[003]]"
---
# Reuse existing Vue block components as-is; route them through VueNodeView via toTiptapNode
## Chose
Reuse existing Vue block components as-is; route them through VueNodeView via toTiptapNode
## Rejected
Clone each component to strip @tiptap/vue-3 NodeViewWrapper (as youtube's YoutubeBlockView.vue did)
## Because
NodeViewWrapper uses inject:['onDragStart','decorationClasses'] with NO defaults (node_modules/@tiptap/vue-3/dist/index.js:237); Vue inject returns undefined when unprovided, so it degrades to a plain <div data-node-view-wrapper> under our bridge — no error. Every block component reads only node/updateAttributes/deleteNode/getPos/editor/selected, all supplied by VueNodeView (editor is the real TipTap Editor through the adapter). Cloning 11 components is high divergence risk against a like-for-like port; the only cost of reuse is one extra nested wrapper div.
