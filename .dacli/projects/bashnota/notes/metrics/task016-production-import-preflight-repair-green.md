---
id: m-task016-production-import-preflight-repair-green
kind: note
note_kind: metric
created: 2026-08-20T08:57:00Z
created_by: a-root
about: "[[t-01M0D7BYT115F6FJBX56HFWENY]]"
---
# Task016 production import preflight repair green
Both existing/update file import and new/bulk hierarchy import fully validate and convert all inline PM documents before metadata, hierarchy, Pinia, block structure, or typed-row mutation. Six negative regressions cover empty-doc cardinality, undeclared attrs, and javascript URL on both paths with exact durable+Pinia snapshots. Focused 24/24 and import 6/6; full Vitest 58 files passed/1 skipped, 501 passed/1 skipped; typecheck/build/backend purity/deploy/deep-link/export-security/diff passed; entry 1886756 <= 1941760.
