---
id: t-01KZYG5K04Z71RHFPEWKWGNRPH
kind: task
created: 2026-08-13T21:24:06Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 8, probable: 13, pessimistic: 21}"
depends_on: "[002, 004, 005, 006]"
---
# Build and rehearse the Firebase-to-Supabase data migration
## So that
all production cloud data can be moved repeatably, audited, resumed, and rolled back without silent loss
## Acceptance
- [ ] Idempotent export-transform-import tooling migrates Auth identity mappings and every in-scope Firestore collection with stable IDs, UTC timestamps, relationships, and typed nested fields
- [ ] The tool supports dry-run, checkpoints/resume, bounded batches, rate limits, retry classification, immutable audit logs, and safe re-execution without duplicate rows or counters
- [ ] Pre/post reconciliation checks counts, hashes or field-level samples, foreign keys, owner mappings, counters, orphan policy, and public URL resolution with zero unexplained differences
- [ ] A staging rehearsal measures runtime and validates application smoke tests, rollback restore, and a written production runbook with go/no-go thresholds
- [ ] Production credentials remain outside the repository and migration logs redact tokens, emails where unnecessary, and sensitive profile fields
## Log
