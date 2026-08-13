---
id: f-dacli-loop-is-unusable-in-a-multi-project-workspace-it-resolves-tasks-by-short
kind: note
note_kind: finding
created: 2026-08-11T20:39:05Z
created_by: a-root
severity: major
origin: .dacli/config.yml:1
---
# dacli loop is unusable in a multi-project workspace: it resolves tasks by short numeric ref, which collides across projects
Root ran `dacli loop --project pm --width 2 --max-cycles 1`. Every spawn was refused:

  spawn refused/failed: dacli: ref "003" is ambiguous: bashnota/003-review-architecture-..., platform/003-fix-the-4-type-errors-..., pm/003-phase-2-port-the-12-custom-block-nodes-...
  spawn refused/failed: dacli: ref "004" is ambiguous: ...
  review spawn refused:  dacli: ref "007" is ambiguous: ...
  cycle rollup: landed 0 - produced nothing 2 - stalled 0 - blocked 0

Cause: task numbering restarts at 001 per project, so short refs are only unique WITHIN a project. `dacli loop` selects tasks with `--project pm` — correctly — but then passes the bare number to spawn, which resolves workspace-wide and refuses as ambiguous. The `--project` scope is not carried through to resolution.

This workspace has 10 projects; the collision counts are 001 x10, 002 x6, 003 x3, 004 x3, 007 x3, 010 x2. Any workspace with more than one project and more than one task per project will hit this. The same ambiguity also affects `dacli integrate --tasks 002,003` (hit earlier) — the fix there was to pass full ULIDs, but loop offers no such option.

No agents were spawned, so the failure cost nothing beyond the cycle.

WORKAROUND ADOPTED: spawn directly with full ULIDs, which is what root had been doing and which works. The loop is set aside for this workspace, not because the pattern is wrong but because it cannot address these tasks.

NOTE ON ROOT CAUSE OWNERSHIP: the per-slice project structure is what created the collisions, and it was deliberate and valuable — it gave every slice its own goal, glossary and findings. The right fix is upstream (carry --project into ref resolution, or accept project/NNN qualified refs), not collapsing the projects. Worth filing via `dacli report`.
