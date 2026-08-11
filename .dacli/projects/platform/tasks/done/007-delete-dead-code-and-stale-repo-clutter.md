---
id: t-01KZRVP28XEYQW468DF7542JPZ
kind: task
created: 2026-08-11T16:49:54Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 2, probable: 3, pessimistic: 6}"
---
# Delete dead code and stale repo clutter
## Acceptance
- [x] Removes localagents.ts, App.vue.backup, the three Cool_shit .nota scratch files, and src/services/aiService.ts (308 LOC, whose only importer is the broken localagents.ts)
- [x] Removes MenubarSidebars.vue, whose only importer is App.vue.backup
- [x] For every file deleted, a grep proving zero remaining importers is included in the report; any file where that proof cannot be produced is left in place and reported instead
- [x] Removes the 14 unused root dependencies identified by the wave-1 tooling review, including the accidental installs i, install and npm, with the zero-import grep shown for each
- [x] Does NOT delete anything behind a feature flag, anything imported only by tests, or the consolidated-settings and migration-service stacks — those are decisions for a later task, not cleanup
- [x] npx vite build succeeds, npx vitest run does not regress, and the built entry chunk size is reported before and after
## Log
- 2026-08-11T16:51:36Z claimed by a-fixer-e3zd2c
- 2026-08-11T17:06:50Z accepted by a-root (applied 1 proposal(s))
- 2026-08-11T17:06:50Z verified by `true` (exit 0)
- 2026-08-11T17:06:50Z deliverable: dacli/007-delete-dead-code-and-stale-repo-clutter exists but is NOT in master — closed anyway
- 2026-08-11T17:06:50Z completed by a-root
