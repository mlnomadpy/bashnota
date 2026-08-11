---
id: t-01KZRSX01WV40GJGSSYCFMBS7Y
kind: task
created: 2026-08-11T16:18:44Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 2, probable: 4, pessimistic: 8}"
---
# Review: architecture and the stranded migration
## Acceptance
- [x] Maps how notas actually flow from UI to disk in BOTH storage modes, naming every layer with file:line
- [x] Answers with evidence: can USE_NEW_STORAGE be flipped to true today, and what breaks if it is
- [x] Enumerates every duplicated subsystem (storage, navigation, settings) and quantifies the code carried twice in LOC
- [x] Identifies dead or orphaned modules with file:line proof that nothing imports them
- [x] Recommends ONE migration end-state and a concrete ordered sequence to reach it, with the rejected alternative stated
- [x] Every finding is filed via 'dacli note add finding' with an --origin of file:line
## Log
- 2026-08-11T16:20:15Z claimed by a-architecture-reviewer-yksca5
- 2026-08-11T16:37:36Z accepted by a-root (applied 1 proposal(s))
- 2026-08-11T16:37:36Z closed WITHOUT verification — no --verify command was given
- 2026-08-11T16:37:36Z deliverable: no dacli/003-review-architecture-and-the-stranded-migration branch — nothing to check against master
- 2026-08-11T16:37:36Z completed by a-root
- 2026-08-11T16:37:41Z finding by a-architecture-reviewer-yksca5: New storage abstraction covers only whole-nota CRUD; 25 of 26 Dexie tables have no filesystem path (event 01KZRT4FT0ZXSCYHXA35A5WR3Q)
- 2026-08-11T16:37:41Z finding by a-architecture-reviewer-yksca5: Nota store bypasses the storage adapter on 10+ write paths, causing split-brain when filesystem storage is active (event 01KZRT4S6JXVQ386F0W9ZAM0W8)
- 2026-08-11T16:37:41Z finding by a-architecture-reviewer-yksca5: USE_NEW_STORAGE cannot be safely flipped today; filesystem mode already silently forces it and hits the split-brain (event 01KZRT53SPNQVWDCKGBVPCPHHZ)
- 2026-08-11T16:37:41Z finding by a-architecture-reviewer-yksca5: Migration engine and its dialog are orphaned: MigrationService + MigrationDialog.vue are imported only by their own tests, never wired into the app (event 01KZRT5SWXAX1YFGC25PFTX8PH)
- 2026-08-11T16:37:41Z finding by a-architecture-reviewer-yksca5: Consolidated settings subsystem (~527 LOC) is orphaned: booted but never read; all real settings UI uses the legacy settingsStore (event 01KZRT7B1MWPJBTDME4FS856BG)
- 2026-08-11T16:37:41Z finding by a-architecture-reviewer-yksca5: Two full navigation stacks ship together (~912 LOC new + ~909 LOC legacy); simplified stack is dark behind a default-off flag (event 01KZRT7K5A13WK4PBHSC43DT6N)
- 2026-08-11T16:37:41Z finding by a-architecture-reviewer-yksca5: CachedStorageService (~156 LOC) is orphaned: implements IStorageBackend but no code ever wraps a backend with it (event 01KZRT8GAZSRE7CDGBDA5M53AW)
- 2026-08-11T16:37:41Z finding by a-architecture-reviewer-yksca5: Three independent code paths write/read notas on disk; the storage abstraction is routinely bypassed (event 01KZRT8R0F4JB2F5A8TNV8XS7D)
- 2026-08-11T16:37:41Z finding by a-architecture-reviewer-yksca5: Nota flow map UI-to-disk in both modes: identical store/adapter layers, diverging only at the leaf backend (event 01KZRT9CW94QJQTDA5ARY36AFJ)
- 2026-08-11T16:37:41Z finding by a-architecture-reviewer-yksca5: Roughly 1,825 LOC is dead or dark: orphaned modules (~1,069) plus one never-default navigation stack (~912) (event 01KZRTANCD02EK7ARZG6ZWR5X1)
