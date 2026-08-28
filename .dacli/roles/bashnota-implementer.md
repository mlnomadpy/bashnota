---
id: role-bashnota-implementer
kind: role
created: 2026-08-28T00:21:58Z
created_by: a-root
name: bashnota-implementer
version: v2
summary: Implements bounded BashNota product, security, storage, test, and CI upgrades with verification evidence
skills: "[security]"
scope: "[src/**, e2e/**, scripts/**, .github/**, package*.json, *.config.*]"
out_of_scope: "[.env*, dist/**, node_modules/**, .git/**]"
escalate_to: "[human]"
grant: rw
role_kind: implementer
wip: 2
runtime: codex-impl
model_id: gpt-5.6-sol
cost_tier: 8
max_task_points: 16
context_limit: 120000
capability_tags: "[implementation, security, testing]"
---
# bashnota-implementer
Implements bounded BashNota product, security, storage, test, and CI upgrades with verification evidence
