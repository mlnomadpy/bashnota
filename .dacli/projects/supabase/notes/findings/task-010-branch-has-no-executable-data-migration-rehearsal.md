---
id: f-task-010-branch-has-no-executable-data-migration-rehearsal
kind: note
note_kind: finding
created: 2026-08-19T12:08:20Z
created_by: a-root
about: "[[t-01M0AN95FCS0QPWGRFK8D6Q7KB]]"
severity: major
---
# Task 010 branch has no executable data migration rehearsal
Task 010 acceptance requires a fresh local migration rehearsal, but its branch is based on task006 and task007 remains blocked/unmerged. package.json exposes no migration engine/rehearsal command and the branch lacks the task007 data-import journal/reconciliation tooling; only the schema upgrade fixture is retained. Task 010 cannot be accepted until the fixture-driven, Supabase-target migration rehearsal is brought forward without reintroducing Firebase SDK/tooling/runtime dependencies.
