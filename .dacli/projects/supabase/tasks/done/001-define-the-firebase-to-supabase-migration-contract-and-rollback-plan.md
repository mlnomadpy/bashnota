---
id: t-01KZYG3H1D8CTBP7H8RCHQ0HCP
kind: task
created: 2026-08-13T21:22:59Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 2, probable: 3, pessimistic: 5}"
---
# Define the Firebase-to-Supabase migration contract and rollback plan
## So that
the migration has an explicit source-of-truth map, identity strategy, compatibility window, and measurable go/no-go gates before production data is touched
## Acceptance
- [x] Inventory every Firebase collection, document shape, index, auth flow, analytics event, and direct client call site with owner and sensitivity classification
- [x] Map Firebase Auth UID preservation or translation, public URL/userTag stability, timestamps, counters, nested maps, and document IDs to Supabase representations
- [x] Choose and document phased read/write strategy, maintenance window assumptions, rollback checkpoints, reconciliation reports, and zero-data-loss invariants
- [x] Record required Supabase environments, local CLI/test setup, secrets and key boundaries; service-role keys never enter the client
- [x] Produce an executable migration verification matrix covering auth, profiles, published notas, comments, votes, views, newsletter, and analytics
## Log
- 2026-08-13T21:33:55Z claimed by a-supabase-implementer-5jrb3a
- 2026-08-13T22:02:06Z accepted by a-root
- 2026-08-13T22:02:06Z verified by `cd /Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/supabase-001-define-the-firebase-to-supabase-migration-contract-and-rollback-plan && node docs/supabase/verify-firebase-supabase.mjs && npm run type-check && npm run test:unit -- --run && npm run build-only && git diff --check` (exit 0)
- 2026-08-13T22:02:06Z deliverable: dacli/001-define-the-firebase-to-supabase-migration-contract-and-rollback-plan exists but is NOT in master — closed anyway
- 2026-08-13T22:02:06Z completed by a-root
