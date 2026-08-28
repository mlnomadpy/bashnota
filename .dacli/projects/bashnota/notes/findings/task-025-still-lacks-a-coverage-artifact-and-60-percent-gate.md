---
id: f-task-025-still-lacks-a-coverage-artifact-and-60-percent-gate
kind: note
note_kind: finding
created: 2026-08-28T12:00:24Z
created_by: a-root
about: "[[025-feature-request-add-critical-e2e-storage-jupyter-firebase-and-security-tests]]"
severity: major
---
# Task 025 still lacks a coverage artifact and 60 percent gate
At master 7d909e3, CI emits JUnit and enforces skip policy, but package.json and the Quality workflow have no compatible Vitest coverage provider, coverage artifact, or 60% line/branch threshold for services and stores. A cached Vitest-2 coverage provider was tested and rejected because the project uses Vitest 3 and would require a broad unsafe downgrade.
