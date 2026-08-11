---
id: d-ci-ownership-split-task-002-fixes-tsconfig-eslint-and-adds-a-minimal-gate-to
kind: note
note_kind: decision
created: 2026-08-11T16:50:25Z
created_by: a-root
---
# CI ownership split: task 002 fixes tsconfig+eslint and adds a minimal gate to deploy.yml; task 010 then owns all CI structure
## Chose
CI ownership split: task 002 fixes tsconfig+eslint and adds a minimal gate to deploy.yml; task 010 then owns all CI structure
## Rejected
letting both 002 and 010 rewrite deploy.yml independently
## Because
002 was already in flight with a fixer when 010 was filed. Two agents rewriting the same workflow file on separate branches guarantees a merge conflict on the highest-value file in the change set. 010 must therefore run AFTER 002 lands and treat 002 deploy.yml output as its starting point, moving the gates into a dedicated ci.yml and making deploy depend on it. Tasks 005 and 006 were removed as duplicates of 008 and 009.
