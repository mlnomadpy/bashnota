---
id: f-ci-purity-gate-depended-on-unavailable-ripgrep
kind: note
note_kind: finding
created: 2026-08-22T15:36:34Z
created_by: a-root
about: "[[t-01M0F91R69D7KZMTKR3BRJYW3J]]"
severity: moderate
origin: scripts/check-backend-purity.mjs:51
---
# CI purity gate depended on unavailable ripgrep
PR #14 Quality failed because ubuntu-latest did not provide rg. The scanner now enumerates hidden and ignored repository files deterministically with Node standard-library filesystem APIs, retaining exact exclusions and eliminating the undeclared external binary dependency.
