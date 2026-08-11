---
id: t-01KZRZ3J85P4ER4Q172C0GZNS0
kind: task
created: 2026-08-11T17:49:42Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 4, probable: 8, pessimistic: 16}"
---
# Phase 0 spike: build the ProseMirror core primitives and prove them on one block
## Acceptance
- [x] Creates src/features/editor/pm/ containing four primitives: defineNode (declarative spec to ProseMirror NodeSpec), VueNodeView (the Vue-to-ProseMirror node view bridge), useEditor (EditorView lifecycle composable), and a plugin/command registry
- [x] VueNodeView correctly implements the ProseMirror NodeView contract: mounts a Vue component per node, updates on node change, and implements stopEvent, ignoreMutation, selectNode, deselectNode and destroy — each with a comment stating what breaks if it is wrong
- [x] The youtube block is ported end to end onto these primitives as the proving case, and the live one of the two youtube extension files is identified first with grep evidence for which is actually registered
- [x] A vitest suite covers the primitives: node spec round-trips through parseDOM and toDOM, the node view mounts and unmounts without leaking, and attribute updates propagate to the Vue component
- [x] The ported youtube block coexists with TipTap in the same editor during this phase; TipTap is NOT removed yet and the app still builds and runs
- [x] The report states plainly which parts of the TipTap API proved harder to replace than expected, so the remaining phases can be re-estimated from evidence
- [x] npx vite build succeeds and npx vitest run has zero failures
## Log
- 2026-08-11T17:50:42Z claimed by a-pm-porter-33tj2x
- 2026-08-11T20:36:20Z accepted by a-root
- 2026-08-11T20:36:20Z verified by `npx vitest run --root .dacli/worktrees/pm-001-phase-0-spike-build-the-prosemirror-core-primitives-and-prove-them-on-one-block src/features/editor/pm` (exit 0)
- 2026-08-11T20:36:20Z deliverable: dacli/001-phase-0-spike-build-the-prosemirror-core-primitives-and-prove-them-on-one-block exists but is NOT in master — closed anyway
- 2026-08-11T20:36:20Z completed by a-root
