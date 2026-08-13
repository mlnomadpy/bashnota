---
id: t-01KZYG5WVKKD6FNSZ519M8DEKX
kind: task
created: 2026-08-13T21:24:16Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 3, probable: 5, pessimistic: 8}"
depends_on: "[007]"
---
# Cut over to Supabase and remove Firebase
## So that
the production application has one cloud backend, no Firebase runtime dependency, and a tested rollback window
## Acceptance
- [ ] A configuration-controlled cutover switches reads and writes to Supabase only after reconciliation and smoke gates pass, with a documented time-bounded rollback procedure
- [ ] Firebase SDK, firebase-tools, rules-unit-testing, configuration, emulator scripts, firestore rules/indexes/tests, environment variables, direct imports, and Firebase-specific UI text are removed
- [ ] Client analytics has an explicit replacement or intentional removal decision; no analytics call silently becomes a no-op without recorded product intent
- [ ] Clean install, generated Supabase types, local database/RLS tests, vue-tsc, full Vitest, Vite build, bundle budget, and forbidden Firebase scan pass
- [ ] Post-cutover monitoring verifies auth success, public reads, publish/comment/vote/view error rates, reconciliation drift, and rollback readiness for the agreed observation window
## Log
