---
id: f-export-security-harness-still-times-out-before-chrome-renders-safe-content
kind: note
note_kind: finding
created: 2026-08-26T22:57:30Z
created_by: a-root
about: "[[t-01M0Z7KWRE652XYFQ1YXJQX19Q]]"
severity: major
---
# export security harness still times out before Chrome renders safe content
Fresh GitHub runs 33021105285 (PR30) and 33021223988 (PR29) both passed install, typecheck, purity, hygiene, workflow checks, lint and all unit tests, then failed export-security at e2e/export-security.browser.ts:106 with empty Chrome stdout and Safe export content was not rendered. This is deterministic across two independent branches; task045 requires a startup/readiness/timeout repair rather than downstream reruns.
