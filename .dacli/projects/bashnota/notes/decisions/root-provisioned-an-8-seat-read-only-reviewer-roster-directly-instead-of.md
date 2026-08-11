---
id: d-root-provisioned-an-8-seat-read-only-reviewer-roster-directly-instead-of
kind: note
note_kind: decision
created: 2026-08-11T16:18:11Z
created_by: a-root
---
# Root provisioned an 8-seat read-only reviewer roster directly instead of spawning a role-architect
## Chose
Root provisioned an 8-seat read-only reviewer roster directly instead of spawning a role-architect
## Rejected
spawn a role-architect agent for task 001
## Because
Root had already measured the baseline (build, type-check, lint, tests, bundle) in this session, so the review dimensions were known from evidence rather than inference. A role-architect would have spent a full run rediscovering them. All eight seats are grant:ro on runtime claude-ro — reviewers analyze and file findings, they do not touch source. Implementation roles will be provisioned separately once the findings are triaged.
