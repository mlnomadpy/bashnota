---
id: t-01M0D7FF4NP33JWH0EEKJZMKRH
kind: task
created: 2026-08-19T14:40:49Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 2, probable: 4, pessimistic: 6}"
parent: "[[t-01KZYG5K04Z71RHFPEWKWGNRPH]]"
---
# Fail closed when migration rollback targets have diverged
## So that
rollback never deletes legitimate application edits made after the migration
## Acceptance
- [ ] Rollback locks and canonicalizes each live target and compares it with the exact journaled post-import state before deletion
- [ ] Any divergence aborts or quarantines without changing the target, journal, or run state
- [ ] Unchanged run-created rows delete atomically with provenance transition while pre-existing rows and identity mappings survive
- [ ] pgTAP and two-client rehearsal cover publication/comment/counter/subscription edits, cascades, crash-resume, and concurrent traffic
- [ ] Clean reset, full pgTAP, migration rehearsal, browser integrations, typecheck, full tests, build, and diff-check pass
## Log
