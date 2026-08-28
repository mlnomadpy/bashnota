---
id: f-reused-canonical-branch-makes-dacli-integration-select-an-older-merged-pr
kind: note
note_kind: finding
created: 2026-08-28T10:30:53Z
created_by: a-root
about: "[[025-feature-request-add-critical-e2e-storage-jupyter-firebase-and-security-tests]]"
severity: major
---
# Reused canonical branch makes dacli integration select an older merged PR
After dacli created PR #46 from the reused canonical task-025 branch, dacli pr status and integrate continued selecting merged PR #44. PR #46 was open, mergeable, and green at head 7744093, but dacli integrate --force returned already landed for merge 2771f4a. Recovery requires GitHub merge fallback plus fresh-trunk observation; keep task 025 and issue #8 open.
