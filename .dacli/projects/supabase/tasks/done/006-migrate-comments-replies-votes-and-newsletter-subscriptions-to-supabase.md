---
id: t-01KZYG57FETV6T5AGJF939HCCF
kind: task
created: 2026-08-13T21:23:54Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 5, probable: 8, pessimistic: 13}"
depends_on: "[002, 003, 004, 005]"
---
# Migrate comments, replies, votes, and newsletter subscriptions to Supabase
## So that
community interactions and newsletter signup preserve authorization and counters after Firestore removal
## Acceptance
- [x] Comment create/edit/delete, nested replies, comment votes, nota votes, and newsletter upsert flows use Supabase and preserve existing UI/error semantics
- [x] Database functions or triggers enforce caller identity, immutable nota/comment/vote IDs, allowed vote values, exact counter transitions, parent reply counts, and cascade/soft-delete policy
- [x] Integration tests cover anonymous/authenticated/owner/other-user behavior, vote create/change/remove, comment edit/delete, reply counts, races, duplicate submissions, and newsletter idempotency
- [x] CommentSection and related UI no longer mention Firebase or Firestore-specific errors
- [x] Firebase-to-Supabase reconciliation validates comments, reply relationships, votes, counts, subscriptions, timestamps, and orphan handling before cutover
## Log
- 2026-08-14T09:54:44Z accepted by a-root
- 2026-08-14T09:54:44Z verified by `cd '/Users/tahabsn/Documents/GitHub/bashnota/.dacli/worktrees/supabase-006-migrate-comments-replies-votes-and-newsletter-subscriptions-to-supabase' && SUPABASE_TELEMETRY_DISABLED=1 /Users/tahabsn/.npm/_npx/1517203cdeef2779/node_modules/@supabase/cli-darwin-arm64/bin/supabase db reset && SUPABASE_TELEMETRY_DISABLED=1 /Users/tahabsn/.npm/_npx/1517203cdeef2779/node_modules/@supabase/cli-darwin-arm64/bin/supabase test db && npm run test:supabase:auth && npm run test:supabase:publishing && npm run test:supabase:community && SUPABASE_TELEMETRY_DISABLED=1 /Users/tahabsn/.npm/_npx/1517203cdeef2779/node_modules/@supabase/cli-darwin-arm64/bin/supabase db lint --local --level error && npm run check:firebase-imports && npm run check:auth-deploy-config:self-test && npm run check:publishing-reconciliation && npm run check:community-reconciliation && npm run type-check && npm run test:unit -- --run && npm run build-only && git diff --check` (exit 0)
- 2026-08-14T09:54:44Z completed by a-root
