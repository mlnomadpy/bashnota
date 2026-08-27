---
id: t-01M0D7BYT115F6FJBX56HFWENY
kind: task
created: 2026-08-19T14:38:54Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 3, probable: 5, pessimistic: 8}"
---
# Make rich-text block conversion semantically lossless
## So that
saving or importing ordinary rich text never truncates marks, links, inline runs, lists, quotes, or tables
## Acceptance
- [x] Production PM-to-normalized-to-PM and export-import round trips preserve multi-run marks, links, inline nodes, nested lists, multi-paragraph quotes, and table cells
- [x] Every registered live schema node has an explicit persisted representation or a tested compatibility policy
- [x] Semantic JSON matches after a fresh database reload and unsupported content fails closed without overwriting the prior document
- [x] Focused round-trip tests, full Vitest, typecheck, build, bundle budget, and diff-check pass
## Log
- 2026-08-20T08:04:51Z claimed by a-root
- 2026-08-20T09:02:50Z accepted by a-root
- 2026-08-20T09:02:50Z verified by `cd /Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/bashnota-016-make-rich-text-block-conversion-semantically-lossless && npm run type-check && npx vitest run src/features/nota/stores/__tests__/richTextPersistence.test.ts src/features/nota/stores/__tests__/notaImportValidation.test.ts src/features/nota/services/__tests__/versionHistoryPersistence.test.ts src/features/nota/stores/__tests__/blockStoreReload.test.ts && git diff --check master...HEAD` (exit 0)
- 2026-08-20T09:02:50Z completed by a-root
