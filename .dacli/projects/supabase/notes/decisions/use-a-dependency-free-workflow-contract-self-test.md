---
id: d-use-a-dependency-free-workflow-contract-self-test
kind: note
note_kind: decision
created: 2026-08-19T13:19:03Z
created_by: a-codex-fixer-terra-a6k9dx
about: "[[015]]"
---
# Use a dependency-free workflow contract self-test
## Chose
Use a dependency-free workflow contract self-test
## Rejected
Add a YAML parser dependency or rely on manual workflow review
## Because
The test can inspect the versioned workflow directly and exercise unpinned and incorrect-ref regressions without increasing production dependencies.
