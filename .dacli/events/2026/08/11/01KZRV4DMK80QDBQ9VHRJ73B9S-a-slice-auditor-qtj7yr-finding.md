---
id: 01KZRV4DMK80QDBQ9VHRJ73B9S
kind: event
event_kind: finding
created: 2026-08-11T16:40:16Z
created_by: a-slice-auditor-qtj7yr
about: "[[001]]"
origin: agent
applied: false
---
bashhub feature grades (complete/partial/stubbed/dead/orphaned) with file:line

COMPLETE: Home landing/CTA (HomeHeader.vue) incl. GitHub-stars fetch (:71) and import dropdown; Newsletter subscribe (useNewsletter.ts:11 + NewsletterModal.vue, reachable from HomeHeader.vue:250-258 for authed users); Home nota list/search/filter/pagination/batch-actions (HomeNotaList.vue, delegates to nota-slice useNotaList/useNotaBatchActions); UserPublishedView profile + publications grid + activity heatmap + CSV export + unpublish (UserPublishedView.vue), routed at /@:userTag and /u/:userId (router index.ts:76,89); vote/clone/view recording as a service (statisticsService recordVote/recordClone/recordView/getUserVote/getVoters/getStatistics) consumed by nota slice. PARTIAL: profile stats aggregates depend on a fire-and-forget stat fetch ordering (see stats-race finding). Filesystem-notas home integration (useFilesystemNotas.ts) works for listing filesystem-only notas but only when USE_NEW_STORAGE/filesystem mode is on. STUBBED: statisticsService.getUserNotasStatistics returns [] (statisticsService.ts:417). Twitter-followers fetch is a no-op placeholder (HomeHeader.vue:86-101, always sets null). ORPHANED: home viewType grid/list preference (useHomePreferences.ts:17) — stored, never applied; layoutPreferences/activeView/resetPreferences (useHomePreferences.ts:23,18,47) — exported but no consumer; temporal view stats + referrers (write-only). DEAD: filteredNotas (UserPublishedView.vue:156), hasNotas (HomeView.vue:56), getSharedNotas (useFilesystemNotas.ts:151).
