---
id: f-task-007-code-passes-final-independent-review-but-external-rehearsal-gates
kind: note
note_kind: finding
created: 2026-08-18T14:33:52Z
created_by: a-root
about: "[[t-01KZYG5K04Z71RHFPEWKWGNRPH]]"
severity: major
---
# Task 007 code passes final independent review but external rehearsal gates remain unmet
Final review through f308e28 accepts the migration engine, provenance-safe apply/rollback, leases, crash/retry behavior, lossless content, timestamps, audit chain, and local rehearsal. Acceptance criterion 4 remains unmet: no real staging credentials/production-shaped volume, Google provider callback, storage byte copy verification, seven-day lag/canary, or production runtime evidence. Do not accept/integrate or begin task008.
