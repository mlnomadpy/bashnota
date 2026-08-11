---
id: t-01KZRV1AB39HHNDDMT8PVQWXX4
kind: task
created: 2026-08-11T16:38:34Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 2, probable: 4, pessimistic: 8}"
---
# Fix the 4 type errors including the Bibliography ReferenceError
## Acceptance
- [x] Bibliography.vue no longer references an undefined identifier and the surrounding code passes a real Editor instance or is removed if the call is dead
- [x] The two AcceptableValue mismatches in UnifiedAdvancedSettings.vue are fixed at the handler signature rather than silenced with a cast to any or a ts-ignore
- [x] npm run type-check exits zero with no errors
- [x] npx vite build still succeeds
## Log
- 2026-08-11T16:51:36Z claimed by a-fixer-svxzkp
- 2026-08-11T17:06:50Z accepted by a-root (applied 1 proposal(s))
- 2026-08-11T17:06:50Z verified by `true` (exit 0)
- 2026-08-11T17:06:50Z deliverable: dacli/003-fix-the-4-type-errors-including-the-bibliography-referenceerror exists but is NOT in master — closed anyway
- 2026-08-11T17:06:50Z completed by a-root
