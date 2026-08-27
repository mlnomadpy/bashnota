---
id: t-01KZYG44QB4MRZSTMQ2JATD2ZZ
kind: task
created: 2026-08-13T21:23:19Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 3, probable: 5, pessimistic: 8}"
depends_on: "[001]"
---
# Introduce a backend-neutral cloud API and Supabase client foundation
## So that
feature code stops importing Firebase directly and can be migrated or rolled back behind one typed boundary
## Acceptance
- [x] A typed cloud-service interface covers auth/session, profiles/tags, publishing, comments/votes, statistics/views, newsletter, and analytics without exposing Firebase or Supabase SDK types
- [x] Supabase browser client initialization uses only URL and anon/publishable key, supports local development, and never imports a service-role secret
- [x] The existing Firebase implementation conforms to the interface as a temporary compatibility adapter with unchanged behavior
- [x] Unit contract tests run the same behavior suite against adapter fakes and establish error/result semantics, timestamps, pagination, and realtime subscriptions
- [x] No new direct Firebase imports are allowed outside the compatibility adapter, enforced by a CI scan
## Log
- 2026-08-13T23:12:29Z claimed by a-supabase-implementer-cn2ggd
- 2026-08-13T23:55:31Z accepted by a-root
- 2026-08-13T23:55:31Z verified by `cd '/Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/supabase-003-introduce-a-backend-neutral-cloud-api-and-supabase-client-foundation' && npm run check:firebase-imports && npm run type-check && npm run test:unit -- --run && npm run build-only && git diff --check` (exit 0)
- 2026-08-13T23:55:31Z completed by a-root
