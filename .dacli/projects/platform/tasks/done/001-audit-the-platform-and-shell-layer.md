---
id: t-01KZRTN5088MJXQJ9RAY356WFX
kind: task
created: 2026-08-11T16:31:55Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 3, probable: 5, pessimistic: 10}"
---
# Audit the platform and shell layer
## Acceptance
- [x] Maps all 15 files in src/services and all 7 root stores: what each owns, who imports it, and which have zero importers proven by grep
- [x] States which of AppMenubar, SimplifiedMenubar, ThreePanelLayout, MenubarSidebars, PinnedSidebars and RightSidebarContainer are reachable in the shipped default configuration and which are only reachable behind a feature flag
- [x] Names every pair among layoutStore, sidebarStore, uiStore and simplifiedNavigationStore that owns overlapping state, with the specific fields
- [x] States what src/ui and src/lib contain and whether either duplicates a feature slice
- [x] Reports at least 6 defects with file:line and user-visible consequence
- [x] Every finding filed via 'dacli note add finding --project platform --about <task>' with a file:line origin
## Log
- 2026-08-11T16:34:47Z claimed by a-slice-auditor-v7c876
- 2026-08-11T19:45:11Z accepted by a-root (applied 1 proposal(s))
- 2026-08-11T19:45:11Z verified by `grep -rlq t-01KZRTN5088MJXQJ9RAY356WFX .dacli/events` (exit 0)
- 2026-08-11T19:45:11Z deliverable: no dacli/001-audit-the-platform-and-shell-layer branch — nothing to check against master
- 2026-08-11T19:45:11Z completed by a-root
