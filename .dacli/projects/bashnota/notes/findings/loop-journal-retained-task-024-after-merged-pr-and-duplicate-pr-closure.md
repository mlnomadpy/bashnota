---
id: f-loop-journal-retained-task-024-after-merged-pr-and-duplicate-pr-closure
kind: note
note_kind: finding
created: 2026-08-28T11:44:11Z
created_by: a-root
about: "[[024-feature-request-harden-apis-uploads-credentials-and-jupyter-trust-boundaries]]"
severity: moderate
---
# Loop journal retained task 024 after merged PR and duplicate PR closure
The loop journal retained pending_accept and pending_land for task 024 after dacli reported PR #43 merged, PR #45 was proven duplicate and closed, and the canonical branch was removed. Leaving the transient marker would risk false acceptance or repeated stale recovery. Recovery: remove only those two journal lines; preserve the open parent task and durable decision/finding records.
