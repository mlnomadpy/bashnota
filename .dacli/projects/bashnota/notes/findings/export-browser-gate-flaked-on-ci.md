---
id: f-export-browser-gate-flaked-on-ci
kind: note
note_kind: finding
created: 2026-08-26T14:04:00Z
created_by: a-root
about: "[[bashnota/015-make-filesystem-notas-self-contained-and-atomic]]"
severity: moderate
---
# export-browser-gate-flaked-on-ci
GitHub Quality run 32977360485 initially failed export-security.browser.ts because safe export content was not rendered; exact failed-job rerun passed the browser gate and every other required step. Treat as a CI reliability finding for test task 025, not a task015 product regression.
