---
id: f-phase-0-evidence-which-tiptap-apis-are-harder-to-replace-than-the-mechanical
kind: note
note_kind: finding
created: 2026-08-11T19:41:02Z
created_by: a-pm-porter-33tj2x
about: "[[001]]"
severity: major
---
# Phase 0 evidence: which TipTap APIs are harder to replace than the mechanical spec mapping
defineNode (spec/parseDOM/toDOM) was mechanical as predicted. The hard parts, ranked, for re-estimating later phases: (1) APP CONTEXT THREADING — TipTap's editor.appContext lets node-view Vue components see host plugins/provides (Pinia, globally-registered UI). Raw PM has no editor object at all. Phase 0 forwards props.editor.appContext (populated by TipTap's EditorContent component). When TipTap is removed, useEditor must itself capture the mounting component's appContext (getCurrentInstance().appContext + provides) and thread it into every VueNodeView — see tiptapAdapter.ts addNodeView and VueNodeView.ts mount(). (2) REACTIVE PROP PROPAGATION — a one-shot render(h(component,props)) does NOT re-render on prop change; TipTap re-renders manually in VueRenderer.updateProps. Fixed with a reactive wrapper component in VueNodeView.ts mount(). Biggest correctness trap; get it wrong and attribute updates silently never reach the component. (3) stopEvent/ignoreMutation have NO stock PM equivalent — TipTap ships heuristics. My defaults suit ATOM nodes with no contentDOM. Blocks WITH editable contentDOM (code block, table, theorem) need different ignoreMutation logic — this is where the 55 call sites diverge and each needs hand-tuning. (4) COMMANDS — setYoutube uses TipTap commands.insertContent, a convenience with no 1:1 PM primitive. Replacing insertContent and chained commands across blocks is more work than the attr mapping. (5) selectNode only fires after view.focus() — selection highlight is focus-dependent (pm.test.ts). (6) Coexistence REQUIRES importing prosemirror via @tiptap/pm/* so Node instanceof holds across the boundary.
