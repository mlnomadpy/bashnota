---
id: f-no-pr-reviewer-role-cannot-report-from-read-only-sandbox
kind: note
note_kind: finding
created: 2026-08-13T21:51:23Z
created_by: a-root
about: "[[t-01KZYG3H1D8CTBP7H8RCHQ0HCP]]"
severity: major
scope: workspace
---
# No-PR reviewer role cannot report from read-only sandbox
Run 01KZYHN1N0 used --review with no PR, codex-ro, and grant ro. Its prompt required gh PR inspection; GitHub was unavailable, then the read-only sandbox prevented dacli event writes and blocked.txt. Outcome correctly finalized as no visible result. Recovery: use a local-branch reviewer kind on codex-rw with an explicit no-source-edit mandate so it can inspect the committed task worktree and record findings without GitHub.
