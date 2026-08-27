---
id: f-task-003-tests-and-import-ratchet-do-not-exercise-real-compatibility-boundary
kind: note
note_kind: finding
created: 2026-08-13T23:31:58Z
created_by: a-root
about: "[[t-01KZYG44QB4MRZSTMQ2JATD2ZZ]]"
severity: moderate
---
# Task 003 tests and import ratchet do not exercise real compatibility boundary
Contract suite runs only an in-memory fake, missing Firebase adapter mapping/errors/timestamps/pagination/realtime. CI rg matches static imports but not dynamic import('firebase/firestore') or require. Run reusable tests against mocked compatibility services and add self-tests/AST-strength import enforcement. Public cloud index also re-exports an SDK-typed client, contrary to neutral boundary.
