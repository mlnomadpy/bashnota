---
id: f-migration-must-retire-parallel-browser-and-functions-mutations-before-cutover
kind: note
note_kind: finding
created: 2026-08-13T21:35:37Z
created_by: a-supabase-implementer-5jrb3a
about: "[[001]]"
severity: major
---
# Migration must retire parallel browser and Functions mutations before cutover
Comments and published-nota counters/votes are mutated directly by browser services (src/features/nota/services/commentService.ts:50 and src/features/bashhub/services/statisticsService.ts:21) while Firebase Functions expose overlapping mutations (functions/src/routes/comments.ts:75 and functions/src/routes/nota.ts:326). Dual-write/reconciliation cannot be complete until both paths route through one migration-aware server boundary.
