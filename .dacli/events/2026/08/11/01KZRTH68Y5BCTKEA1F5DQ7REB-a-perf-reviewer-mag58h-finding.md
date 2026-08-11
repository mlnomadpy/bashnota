---
id: 01KZRTH68Y5BCTKEA1F5DQ7REB
kind: event
event_kind: finding
created: 2026-08-11T16:29:46Z
created_by: a-perf-reviewer-mag58h
about: "[[t-01KZRSX0151GFYPXJNE9M9B86Z]]"
origin: agent
applied: true
---
App.vue wordCount computed rebuilds the entire TipTap document and re-instantiates a composable on every block change

src/App.vue:87-102 wordCount computed calls useBlockEditor(activeNota.value.id) INSIDE the computed (:91), then reads getTiptapContent.value (:92) and walks the whole doc via extractTextFromTiptapContent (:56-76) then .split(' '). getTiptapContent (blockStore.ts:472+) reconstructs the full TipTap JSON from all blocks (iterates blockOrder, maps blocks, logs). Because App.vue is the always-mounted root and the legacy top bar renders wordCount (App.vue:367-369), every reactive block mutation (i.e. every keystroke in a nota) re-runs: full-doc rebuild + full-tree text walk + string split = O(document size) per keystroke, on the main thread, in the toolbar. Instantiating the composable in a computed also re-allocates its computeds each run. Fix: derive word count from the editor's own transaction/debounced content instead of rebuilding the doc; hoist useBlockEditor out of the computed; debounce. Risk: low. Note: only active in legacy (non-simplified) navigation where the counter renders.
