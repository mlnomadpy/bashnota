---
id: f-lint-triage-done-eslint-src-600-347-249-unused-imports-removed-206-assigned
kind: note
note_kind: finding
created: 2026-08-11T17:21:47Z
created_by: a-fixer-mrwz72
about: "[[011]]"
severity: major
---
# Lint triage done: eslint src 600->347; 249 unused imports removed, 206 assigned values triaged (2 bugs, not deleted)
Branch dacli/011..., commit 437d435. Repaired-linter violations triaged (before=600 in this tree, root cited 604 pre-002/003/004/007). AFTER=347.

SPLIT of 573 no-unused-vars: (a) 249 unused IMPORT specifiers across 123 files -> REMOVED via TypeScript-AST codemod that only edits ImportDeclaration nodes (structurally cannot touch assigned values); 66 imports dropped whole, 183 narrowed. (b) 206 assigned-but-unused values -> KEPT, each triaged. (c) 117 non-import 'defined but never used' (params/destructures/type params) -> KEPT.

HOT assigned values (65 hold call/await/getJSON/map/filter result): 2 real bugs, 55 dead (unused computed/ref, unwired handlers, unread destructures), 8 benign (defineProps/defineEmits macro bindings). The 2 bugs left in place as evidence and filed, never deleted:
1. NotaEditor.vue:951 saveVersion() computes const content=editor.value.getJSON() but builds versionNota={...currentNota.value} and never attaches content -> every version saves stale content (data-loss; root's rank-1 example at line 952; corroborates 01KZRVA9MX/01KZRV1X9X).
2. migrationService.test.ts:190 const targetNotas=await mockTargetBackend.listNotas() is never asserted; rollback test only checks deleteNota was called, never that target was cleared (weak test).

8 named non-unused-vars rules investigated: FIXED no-unsafe-function-type (suggestion.ts:270,278), return-in-computed-property (CalendarLayout.vue:218 default return), no-mutating-props (TableBlock.vue:90 redundant direct node.attrs write removed). DOCUMENTED: no-mutating-props CommentItem.vue:145 (optimistic UI + emit), no-side-effects-in-computed SubfigureBlock.vue:102 (catch-only), no-dupe-v-else-if ErrorRenderer.vue:157 (dead branch, text still shown), no-dupe-keys AddServerDialog.vue:70 & SidebarToggleButton.vue:46 (benign setup-binding shadow), no-empty-object-type shims-vue.d.ts:3 (canonical Vue shim). Full report: docs/lint-triage-011.md. Verified: vue-tsc 0 errors/0 emitted js, vitest 338 passed, vite build ok.
