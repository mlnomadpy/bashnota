---
id: f-unprotected-master-allowed-auto-merge-ahead-of-exact-ci
kind: note
note_kind: finding
created: 2026-08-27T02:05:45Z
created_by: a-root
about: "[[bashnota/027]]"
severity: major
---
# unprotected master allowed auto-merge ahead of exact CI
Concrete reproduction: PR #38 merged at 01:59:33Z before its Quality run began at 01:59:36Z; review trust grade was REFUTED. Required branch protection/ruleset must make Quality and independent approval prerequisites, and dacli task spawns must not request auto-merge on this repository until that protection exists.
