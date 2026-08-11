---
id: t-01KZRTMJ5AYBYFCJMCKBBXB4S7
kind: task
created: 2026-08-11T16:31:36Z
created_by: a-root
owner: a-root
priority: should
estimate: "{optimistic: 3, probable: 5, pessimistic: 10}"
---
# Audit the settings slice
## Acceptance
- [x] Explains why 47 .vue files exist for settings and whether that count is justified, with the duplication named if it is not
- [x] Maps which settings actually persist, where they persist to, and names every setting rendered in the UI that does not affect behaviour
- [x] States the exact status of the USE_CONSOLIDATED_SETTINGS migration: what consolidatedSettingsService and settingsAdapter cover, what the legacy settingsStore still owns, and what is missing before the flag could default true
- [x] Reports at least 5 defects with file:line and user-visible consequence
- [x] Every finding filed via 'dacli note add finding --project settings --about <task>' with a file:line origin
## Log
- 2026-08-11T16:34:47Z claimed by a-slice-auditor-acqqq2
- 2026-08-11T19:45:11Z accepted by a-root (applied 1 proposal(s))
- 2026-08-11T19:45:11Z verified by `grep -rlq t-01KZRTMJ5AYBYFCJMCKBBXB4S7 .dacli/events` (exit 0)
- 2026-08-11T19:45:11Z deliverable: no dacli/001-audit-the-settings-slice branch — nothing to check against master
- 2026-08-11T19:45:11Z completed by a-root
