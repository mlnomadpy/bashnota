---
id: 01KZRV3BS0STMAW1X7WKKESKAD
kind: event
event_kind: finding
created: 2026-08-11T16:39:41Z
created_by: a-slice-auditor-qtj7yr
about: "[[001]]"
origin: agent
applied: false
---
statisticsService.getUserNotasStatistics is a permanent stub returning [] with zero callers

statisticsService.ts:417-422: getUserNotasStatistics(userId) logs 'to be implemented as a Cloud Function' and returns []. Whole-repo grep for getUserNotasStatistics shows only its definition line — zero call sites. It is both stubbed (no implementation) and orphaned (nothing routes to it). UserPublishedView does NOT use it; it computes per-user aggregates itself in calculateStats (UserPublishedView.vue:482-567). Safe to delete or wire up; today it is inert.
