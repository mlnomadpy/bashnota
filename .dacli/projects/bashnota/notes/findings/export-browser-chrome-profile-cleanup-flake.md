---
id: f-export-browser-chrome-profile-cleanup-flake
kind: note
note_kind: finding
created: 2026-08-26T14:22:28Z
created_by: a-root
about: "[[025]]"
severity: major
origin: e2e/export-security.browser.ts:1
---
# export-browser-chrome-profile-cleanup-flake
GitHub Quality run 32979456328 for PR #25 failed after export assertions during cleanup: ENOTEMPTY removing /tmp/.../chrome-profile/Default. A prior run flaked on safe content rendering. The browser gate needs deterministic Chrome shutdown/profile cleanup with bounded retry and a regression; until fixed, rerun once and block on repeated failure.
