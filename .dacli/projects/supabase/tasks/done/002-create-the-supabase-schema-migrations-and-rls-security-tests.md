---
id: t-01KZYG3W31CADGKFQMD86D1VYY
kind: task
created: 2026-08-13T21:23:10Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 5, probable: 8, pessimistic: 13}"
depends_on: "[001]"
---
# Create the Supabase schema, migrations, and RLS security tests
## So that
Postgres and Row Level Security reproduce the current Firestore security invariants before application traffic moves
## Acceptance
- [x] Versioned SQL migrations define profiles/public_profiles/user_tags, published_notas, viewers, votes, comments/comment_votes, newsletter subscriptions, view aggregates/events, and required constraints/indexes
- [x] RLS policies preserve owner-private profile access, allowlisted public projections, immutable identities, allowed vote transitions, caller-owned viewers, exact counter semantics, and comment authorization
- [x] Privileged counter and aggregation updates use SECURITY DEFINER functions or database triggers with fixed search_path and least privilege rather than trusting client-supplied counts
- [x] Supabase local tests cover anonymous/authenticated/owner/other-user access, forged identities, counter inflation, viewer injection, comment/vote transitions, and public reads
- [x] Schema types are generated for the TypeScript client and migrations apply cleanly from an empty local database
## Log
- 2026-08-13T22:02:46Z claimed by a-supabase-implementer-bf1xyk
- 2026-08-13T23:11:49Z accepted by a-root
- 2026-08-13T23:11:49Z verified by `cd '/Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/supabase-002-create-the-supabase-schema-migrations-and-rls-security-tests' && npm run test:supabase:upgrade && npm run test:supabase && npm run type-check && npm run test:unit -- --run && npm run build-only && git diff --check` (exit 0)
- 2026-08-13T23:11:49Z completed by a-root
