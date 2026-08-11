---
id: f-task-001-complete-on-branch-dacli-001-phase-0-spike-all-7-acceptance-criteria
kind: note
note_kind: finding
created: 2026-08-11T19:42:12Z
created_by: a-pm-porter-33tj2x
about: "[[001]]"
severity: major
---
# Task 001 COMPLETE on branch dacli/001-phase-0-spike-...: all 7 acceptance criteria met, green build + tests
Branch: dacli/001-phase-0-spike-build-the-prosemirror-core-primitives-and-prove-them-on-one-block, commit 318cdc2. Owner: run dacli accept 001 then integrate. Evidence per criterion: (1) src/features/editor/pm/ has the four primitives — defineNode.ts, VueNodeView.ts, useEditor.ts, registry.ts (EditorRegistry: plugins+commands), plus index.ts and tiptapAdapter.ts. (2) VueNodeView.ts implements update/stopEvent/ignoreMutation/selectNode/deselectNode/destroy, each with a comment stating what breaks if wrong. (3) Live youtube file identified by grep as youtube-extension.ts (extensions/index.ts:35), NOT the dead capital YoutubeExtension.ts; ported end-to-end to youtube.node.ts + YoutubeBlockView.vue reusing YoutubePlayer.vue and useYoutubeParser.ts unchanged. (4) vitest suite src/features/editor/pm/__tests__/pm.test.ts (9 tests): parseDOM/toDOM round-trip, mount, attr-update propagation, no-leak unmount, selection, useEditor lifecycle, registry command run. (5) youtube node coexists in the LIVE TipTap editor via toTiptapNode adapter (extensions/index.ts now registers the ported Youtube); TipTap NOT removed. (6) Re-estimation evidence filed as separate finding (app-context threading, reactive prop propagation, stopEvent/ignoreMutation, insertContent commands). (7) VERIFIED: npx vitest run = 347 passed / 0 failed; npx vite build = built in ~8s; npx vue-tsc --build = clean; eslint on new files = clean. Inherited-vs-caused: zero pre-existing failures inherited; zero caused. NOTE: prosemirror imported via @tiptap/pm/* (shared instance) — making prosemirror-* direct deps is deferred to a later phase per project goal.
