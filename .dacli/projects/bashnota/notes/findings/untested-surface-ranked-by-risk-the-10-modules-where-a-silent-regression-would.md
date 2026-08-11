---
id: f-untested-surface-ranked-by-risk-the-10-modules-where-a-silent-regression-would
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-test-reviewer-ce29ny
about: "[[t-01KZRSX034BWDE84AWXDZ2SCHX]]"
origin: src/features/nota/stores/nota.ts:337
source_event: 01KZRT83445ZWKB697VTABWKWX
---
# Untested surface ranked by RISK: the 10 modules where a silent regression would hurt users most (all 0% tested)
Ranked by blast radius x likelihood-of-silent-failure for a LOCAL-FIRST notebook (worst outcome = losing/corrupting the user's own documents), not by file count. All 10 have ZERO tests:

1. src/features/nota/stores/nota.ts (1480 LOC) — central nota CRUD/save/version/restore. saveNota:337, saveNotaVersion:658, restoreVersion:715, getNotaContentAsTiptap. Regression here = lost or corrupted notas across the whole app. HIGHEST.
2. src/features/nota/stores/blockStore.ts (987 LOC) — the actual document blocks (the content users type). Regression = silent content loss/corruption; nothing else guards it.
3. src/services/settingsAdapter.ts (328 LOC) — persists settings/notas via the active backend; the layer nota.ts calls (adapter.saveNota). Untested despite databaseAdapter.ts being tested.
4. src/features/editor/stores/codeExecutionStore.ts (913 LOC) — execution state + cell outputs. Regression can show STALE/WRONG outputs as if correct — a correctness lie, not a crash.
5. src/features/editor/services/MarkdownParserService.ts (1071 LOC) — markdown/paste -> blocks. Regression silently drops or mangles imported/pasted content.
6. src/services/fileWatcherService.ts (304 LOC) — FS-mode external-change detection. Regression = overwriting or losing edits made outside the app (data loss in filesystem mode).
7. src/features/jupyter/services/jupyterService.ts (681 LOC) — kernel/exec transport. Regression breaks the core code-execution value prop, often silently (hung/misattributed outputs).
8. src/services/codeExecutionService.ts (246 LOC) — execution queueing/cancellation/output parsing. Off-by-one in output routing shows one cell's result under another.
9. src/features/auth/stores/auth.ts (273 LOC) — session/token/login state. Regression locks users out or mis-scopes data access.
10. src/features/nota/services/publishNotaUtilities.ts (245 LOC) — publish workflow/visibility. Regression can publish a nota (or sub-pages) more publicly than intended — privacy blast radius.

Confirmed 0 tests: git ls-files for tests matching these names returns only jupyterErrorParser.test.ts (unrelated util).
