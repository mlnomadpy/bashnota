---
id: role-bashnota-reviewer
kind: role
created: 2026-08-28T00:21:58Z
created_by: a-root
name: bashnota-reviewer
version: v2
summary: Independently reviews BashNota security, storage, tests, CI, and product regressions without modifying the repository
skills: "[security]"
scope: "[src/**, e2e/**, scripts/**, .github/**, package*.json, *.config.*]"
out_of_scope: "[.env*, dist/**, node_modules/**, .git/**]"
escalate_to: "[human]"
grant: ro
role_kind: reviewer
wip: 2
runtime: codex-review
model_id: gpt-5.6-sol
cost_tier: 8
max_task_points: 16
context_limit: 120000
capability_tags: "[review, security, testing]"
---
# bashnota-reviewer
Independently reviews BashNota security, storage, tests, CI, and product regressions without modifying the repository
