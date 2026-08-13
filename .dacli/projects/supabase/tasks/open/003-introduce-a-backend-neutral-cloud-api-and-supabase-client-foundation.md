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
- [ ] A typed cloud-service interface covers auth/session, profiles/tags, publishing, comments/votes, statistics/views, newsletter, and analytics without exposing Firebase or Supabase SDK types
- [ ] Supabase browser client initialization uses only URL and anon/publishable key, supports local development, and never imports a service-role secret
- [ ] The existing Firebase implementation conforms to the interface as a temporary compatibility adapter with unchanged behavior
- [ ] Unit contract tests run the same behavior suite against adapter fakes and establish error/result semantics, timestamps, pagination, and realtime subscriptions
- [ ] No new direct Firebase imports are allowed outside the compatibility adapter, enforced by a CI scan
## Log
