---
id: f-task-048-durable-url-regression-has-mutation-proof
kind: note
note_kind: finding
created: 2026-08-27T10:42:31Z
created_by: a-security-fixer-pn48g3
about: "[[t-01M10BZYVVK03HWKPG17RXAVSV]]"
severity: major
---
# Task 048 durable URL regression has mutation proof
At clean commit 37288d0, mutating src/utils/credentialPersistence.ts:46 to return the original credential-bearing URL caused 3 deterministic failures in src/utils/__tests__/credentialPersistence.test.ts:40,61 and src/features/jupyter/stores/__tests__/jupyterStore.security.test.ts:48. Restoring the sanitizer returned all 11 selected persistence tests green, and git status/diff check confirmed a clean worktree.
