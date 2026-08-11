---
id: 01KZRV582JH8156P891YXT60YE
kind: event
event_kind: finding
created: 2026-08-11T16:40:43Z
created_by: a-slice-auditor-qtj7yr
about: "[[001]]"
origin: agent
applied: false
---
Cheap slice-local upgrades enabled by how bashhub is already built

Leverage points: (1) Kill the stats race in ONE line — make getPublishedNotasByUser await the getStatistics batch (nota.ts:1181) OR have UserPublishedView call calculateStats inside a watch on the notas array instead of once (UserPublishedView.vue:471); since stats is already a reactive object, recomputation is free. (2) Surface the write-only analytics almost for free: getStatistics already returns stats.dailyViews/weeklyViews/monthlyViews (statisticsService.ts:397) and UserPublishedView already renders an activity heatmap from publishedAt (calculateActivityGrid, :335) — repoint that same grid at the existing dailyViews map to show a real view-heatmap with no new data model. (3) Make viewType actually work: HomeNotaList already receives paginatedNotas and NotaTable supports mode; add a 'viewType' prop + a grid branch (mirroring the existing mode="list" NotaTable at :433) and the already-persisted preference (useHomePreferences.ts:17) lights up with no new state. (4) Fix getVoters N+1 by batching with Promise.all over the existing votes map (statisticsService.ts:334) — pure-local change, no schema change. (5) Delete the three dead symbols and reconcile the READMEs to the 3 real components — trivially cheap, high orientation payoff.
