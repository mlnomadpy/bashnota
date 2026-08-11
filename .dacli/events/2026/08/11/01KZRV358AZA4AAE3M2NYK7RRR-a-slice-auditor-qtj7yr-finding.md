---
id: 01KZRV358AZA4AAE3M2NYK7RRR
kind: event
event_kind: finding
created: 2026-08-11T16:39:34Z
created_by: a-slice-auditor-qtj7yr
about: "[[001]]"
origin: agent
applied: false
---
Temporal view stats and referrers are write-only: recorded to Firestore on every view but never displayed anywhere

statisticsService.recordView (statisticsService.ts:44-51) writes stats.dailyViews.{day}, stats.weeklyViews.{week}, stats.monthlyViews.{month}, referrers.{host}, and uniqueViewers to publishedNotas on every page view, driven by getWeekIdentifier/getMonthIdentifier/normalizeReferrer (statisticsService.ts:427-466). getStatistics (statisticsService.ts:392-405) returns all of these, but every consumer reads ONLY likeCount/dislikeCount/cloneCount (PublicNotaView.vue:374-376) or viewCount/uniqueViewers/stats assigned onto a nota object (nota.ts:1186-1189) that is never rendered as a time series. Grepping the repo shows no UI renders stats.dailyViews/weeklyViews/monthlyViews or referrers. Consequence: per-view Firestore writes and their aggregation math (incl. the questionable getWeekIdentifier week-number logic at statisticsService.ts:427-439) are dead data collection — cost and write-contention with no user-facing payoff. This also means getWeekIdentifier correctness is currently moot because nothing displays weekly buckets.
