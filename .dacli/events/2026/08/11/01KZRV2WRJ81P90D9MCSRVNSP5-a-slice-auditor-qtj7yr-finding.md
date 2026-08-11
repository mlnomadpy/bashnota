---
id: 01KZRV2WRJ81P90D9MCSRVNSP5
kind: event
event_kind: finding
created: 2026-08-11T16:39:26Z
created_by: a-slice-auditor-qtj7yr
about: "[[001]]"
origin: agent
applied: false
---
Profile stats panel (Total/Average/Most Views) computed before view counts are fetched — shows stale/zero values

UserPublishedView.vue:461 gets notas via notaStore.getPublishedNotasByUser, then immediately (synchronously) calls calculateStats(notas) at :471. But getPublishedNotasByUser (nota.ts:1179-1194) fetches per-nota authoritative viewCount/uniqueViewers/stats via statisticsService.getStatistics FIRE-AND-FORGET (nota.ts:1181-1182 explicitly does NOT await the .then that assigns nota.viewCount). So calculateStats reads nota.viewCount (UserPublishedView.vue:510) before those async assignments land. stats is a reactive object populated ONCE in calculateStats and never recomputed, so the header 'Views' total (:776), 'Average Views' (:553), and 'Most Viewed' (:514) reflect only whatever viewCount the REST API returned inline — if the API omits viewCount they render 0/null permanently for the session. Evidence both ways: if the /nota/user/:id REST response already includes viewCount, the panel is correct and getStatistics only refreshes the raw grid numbers; the race only surfaces stale aggregates when the REST payload lacks viewCount. The ordering hazard (aggregate computed before fire-and-forget stat fetch) is real regardless.
