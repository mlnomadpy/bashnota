---
id: t-01KZY5ZRJSYG7MFZ7W4SAERRYZ
kind: task
created: 2026-08-13T18:26:10Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 2, probable: 4, pessimistic: 7}"
---
# Prevent unsupported persisted blocks from blanking and overwriting notas
## So that
legacy or partially migrated block records cannot hide supported content or trigger destructive autosave
## Acceptance
- [x] Inventory every node emitted by the block-store conversion against the live schema; code, aiGeneration, and mermaid records have explicit schema-valid compatibility mappings that retain their stored payload
- [x] Editor setContent never reports success after replacing a valid document with an empty fallback because one incoming node is unsupported; it preserves the prior document or performs tested granular recovery with diagnostics
- [x] Live-schema integration tests hydrate and refresh mixed ordinary text plus code, aiGeneration, and mermaid block output, proving supported text stays visible and compatibility payloads survive
- [x] A regression test proves an invalid content load cannot trigger a destructive blockOrder rewrite or autosave
- [x] vue-tsc --build, full vitest, vite build, and git diff --check pass
## Log
- 2026-08-13T18:27:12Z claimed by a-root
- 2026-08-13T19:09:38Z accepted by a-root
- 2026-08-13T19:09:38Z verified by `cd /Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/pm-010-prevent-unsupported-persisted-blocks-from-blanking-and-overwriting-notas && npx vue-tsc --build && npx vitest run && npx vite build && git diff --check` (exit 0)
- 2026-08-13T19:09:38Z deliverable: dacli/010-prevent-unsupported-persisted-blocks-from-blanking-and-overwriting-notas exists but is NOT in master — closed anyway
- 2026-08-13T19:09:38Z completed by a-root
