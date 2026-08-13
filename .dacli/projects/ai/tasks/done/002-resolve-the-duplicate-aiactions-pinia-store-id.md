---
id: t-01KZRV1V96PDBZRC2TQW97HACS
kind: task
created: 2026-08-11T16:38:51Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 1, probable: 2, pessimistic: 4}"
---
# Resolve the duplicate aiActions Pinia store id
## Acceptance
- [x] `src/features/ai/stores/aiActionsStore.ts` and `src/features/editor/stores/aiActionsStore.ts` register distinct Pinia ids, unless the implementation proves and documents that they can be merged without changing either public API
- [x] States which store was winning the id collision at runtime and what behaviour was therefore being silently lost
- [x] Import sites under `src/features/settings/**` and `src/features/editor/**` keep resolving to the intended store and are listed in the task log
- [x] npx vite build succeeds and npx vitest run stays green
## Log
- 2026-08-13T14:26:57Z claimed by a-fixer-xawdx2
- 2026-08-13T14:36:30Z accepted by a-root
- 2026-08-13T14:36:30Z verified by `npx vite build && npx vitest run` (exit 0)
- 2026-08-13T14:36:30Z deliverable: dacli/002-resolve-the-duplicate-aiactions-pinia-store-id exists but is NOT in master — closed anyway
- 2026-08-13T14:36:30Z completed by a-root
