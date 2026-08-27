---
id: f-export-chrome-gate-still-times-out-during-cold-linux-startup
kind: note
note_kind: finding
created: 2026-08-27T12:02:52Z
created_by: a-root
about: "[[045]]"
severity: moderate
scope: project
origin: e2e/export-security.browser.ts:109
---
# Export Chrome gate still times out during cold Linux startup
GitHub Quality run 33069735696 failed after the structural gate because runBrowserAndCollectStdout exhausted its fixed 30000ms completion budget. Chrome spent roughly 14s in cold startup/DBus initialization and did not emit the completion marker in the remaining interval. The immediately preceding PR40 run passed the same gate, establishing load-sensitive nondeterminism rather than a content assertion. Repair task045 with a bounded production-shaped cold-start budget/readiness strategy and mutation-sensitive regression; preserve fail-loud timeout and cleanup fencing.
