---
id: f-repository-hygiene-filename-bypasses-repaired
kind: note
note_kind: finding
created: 2026-08-22T15:32:06Z
created_by: a-root
about: "[[t-01M0F91R69D7KZMTKR3BRJYW3J]]"
severity: major
origin: scripts/repository-hygiene.self-test.mjs:23
---
# Repository hygiene filename bypasses repaired
Independent review found service_account JSON, extensionless SSH keys, uppercase key extensions on case-sensitive runners, envrc variant templates, and a scanner self-exemption were not fully governed. The implementation now classifies and ignores those paths, keeps public templates reviewable, scans its own source, and mutation-tests Linux-style ignore behavior. Final independent re-review: ACCEPT.
