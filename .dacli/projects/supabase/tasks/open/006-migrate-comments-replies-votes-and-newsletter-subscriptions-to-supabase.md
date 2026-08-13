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
- [ ] Comment create/edit/delete, nested replies, comment votes, nota votes, and newsletter upsert flows use Supabase and preserve existing UI/error semantics
- [ ] Database functions or triggers enforce caller identity, immutable nota/comment/vote IDs, allowed vote values, exact counter transitions, parent reply counts, and cascade/soft-delete policy
- [ ] Integration tests cover anonymous/authenticated/owner/other-user behavior, vote create/change/remove, comment edit/delete, reply counts, races, duplicate submissions, and newsletter idempotency
- [ ] CommentSection and related UI no longer mention Firebase or Firestore-specific errors
- [ ] Firebase-to-Supabase reconciliation validates comments, reply relationships, votes, counts, subscriptions, timestamps, and orphan handling before cutover
## Log
