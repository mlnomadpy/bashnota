---
id: f-migration-rollback-bypasses-the-exclusive-run-lease
kind: note
note_kind: finding
created: 2026-08-18T14:14:02Z
created_by: a-root
about: "[[t-01KZYG5K04Z71RHFPEWKWGNRPH]]"
severity: major
---
# Migration rollback bypasses the exclusive run lease
CLI rollback calls target.rollback without startRun; SupabaseTarget deletes rows and mark_rolled_back RPC has no lease owner check. A second process can rollback while apply owner holds a live lease. Require rollback lease acquisition/fencing, reject other live owner, stale takeover after expiry only, owner-check mutations/marking, and concurrent apply-vs-rollback tests.
