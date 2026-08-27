---
id: f-lost-completion-response-can-downgrade-an-applied-migration-record-to-failed
kind: note
note_kind: finding
created: 2026-08-18T13:48:33Z
created_by: a-root
about: "[[t-01KZYG5K04Z71RHFPEWKWGNRPH]]"
severity: major
---
# Lost completion response can downgrade an applied migration record to failed
runMigration retries whole apply/complete/audit without re-reserving; apply requires applying, and fail can downgrade applied. A lost 503 after durable complete yields a retry ownership error and failed journal despite target row existing. Make apply/complete/audit confirmation idempotent or re-read/reserve per retry, and prohibit fail from changing applied; add lost-response regressions.
