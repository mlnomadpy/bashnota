---
id: f-authoritative-nota-failures-now-retain-last-known-good-state-and-surface-a-retry
kind: note
note_kind: finding
created: 2026-08-26T22:31:37Z
created_by: a-root
about: "[[041]]"
severity: major
---
# Authoritative nota failures now retain last known-good state and surface a retry
Implemented in src/features/nota/stores/nota.ts:38-49,386-405: NotaLoadError preserves the causal error, loading assigns only after full authority read/normalization, and failures retain items then reject. src/features/bashhub/views/HomeView.vue:66-105,169-184 keeps the accessible alert until complete success and provides an explicitly named retry. Coverage: notaLoadFailure.test.ts validates Dexie and filesystem adapter failure, retry success, and later refresh retention; HomeView.loadFailure.test.ts validates role=alert, retained list, and retry. Gates passed: focused Vitest (5 tests), type-check, full Vitest (523 passed, 1 skipped), build, git diff --check.
