---
id: d-land-task041-before-task039-for-shared-nota-store
kind: note
note_kind: decision
created: 2026-08-26T22:29:16Z
created_by: a-root
---
# Land task041 before task039 for shared nota store
## Chose
Task041 owns plural loadNotas/HomeView authority failures; task039 owns singular loadNota/NotaPane recovery. Land 041 first, then refresh 039 from trunk and rerun focused/full gates.
## Rejected
Let both tasks freely modify both store load paths or land task039 first
## Because
The tasks share nota.ts but have distinct singular/plural contracts; ordered landing reduces conflict and prevents one error policy from accidentally overriding the other.
