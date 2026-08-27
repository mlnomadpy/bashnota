---
id: f-task-010-claim-omits-required-removal-surfaces
kind: note
note_kind: finding
created: 2026-08-19T11:56:36Z
created_by: a-codex-fixer-jyr8b6
about: "[[t-01M0AN95FCS0QPWGRFK8D6Q7KB]]"
severity: major
---
# Task 010 claim omits required removal surfaces
dacli commit refused 18 verified files outside the assigned claim: .env.example, README/docs, firestore-tests, storage.rules, vite.config.ts, vitest.config.ts, and vitest.rules.config.ts. These paths are required by acceptance to remove credentials, rules/testing artifacts, and bundler assumptions. The agent did not use --force; changes remain in the isolated task worktree for owner authorization/materialization.
