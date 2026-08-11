---
id: t-01KZRSNVJPJRQ62TNSTJT67Y1R
kind: task
created: 2026-08-11T16:14:50Z
created_by: a-root
owner: a-root
priority: should
---
# Provision the team for bashnota
## Context
A role-architect must provision this project's team BEFORE implementation work starts.

**Codebase map:**
**Languages:**
- TypeScript (279 files)
- Markdown (107 files)
- JavaScript (1 files)

**Top-level structure:**
- docs/
- functions/
- src/

**Existing docs:**
- COMPLETE_MIGRATION_SUMMARY.md
- CONTRIBUTING.md
- FILESYSTEM_HOME_VIEW.md
- FILESYSTEM_SECURITY_FIX.md
- IMPLEMENTATION_SUMMARY.md
- NAVBAR_SIMPLIFICATION_PLAN.md
- README.md
- RUNTIME_ISSUE_FIX.md
- VIBEME.md
- docs/COMPONENT_ARRANGEMENT.md
- docs/FILE_SYSTEM_MODE.md
- docs/MISSING_FEATURES.md
- docs/MISSING_TESTS.md
- docs/README.md
- docs/UX_UI_IMPROVEMENTS.md
- src/README.md
- src/assets/README.md
- src/composables/README.md
- src/constants/README.md
- src/features/README.md
- src/functions/README.md
- src/lib/README.md
- src/router/README.md
- src/services/README.md
- src/stores/README.md
- src/types/README.md
- src/ui/README.md
- src/utils/README.md

**Open markers (8):**
- TODO src/features/nota/composables/useNotaActions.ts:64 — Implement proper block copying from original nota
- TODO src/features/nota/composables/useNotaFiltering.ts:34 — Add content search using block system
- TODO src/features/nota/composables/useNotaFilters.ts:118 — Implement block-based content search
- TODO src/features/nota/composables/useNotaSorting.ts:53 — Implement proper block count when block structures are loaded
- TODO src/features/nota/stores/nota.ts:1319 — Implement proper block creation instead of legacy conversion
- TODO src/features/nota/stores/nota.ts:1379 — Implement proper block creation instead of legacy conversion
- TODO src/features/nota/stores/nota.ts:1439 — Implement proper block update instead of legacy conversion
- TODO src/services/fileSystemBackend.ts:264 — Implement file watching using polling or other mechanisms

**Directive:**
Analyze bashnota's stack and domains (see the languages and codebase map above). Decide the MINIMAL role roster it needs (e.g. an implementer, a reviewer, a language-specific auditor, a docs writer — justify EACH against the codebase; do not over-staff).

For each role:
1. Pick relevant skills from skills.sh and run `dacli skill fetch <owner/repo>`.
2. Create the role with `dacli role add <name> --kind implementer|reviewer|researcher|designer --grant ro|rw --model <tier> --skills <...>`.

Finish with `dacli note add decision` documenting the roster and why.

## Acceptance
## Log
- 2026-08-11T16:18:24Z closed with NO acceptance criteria — UNVERIFIED (--allow-unverified)
- 2026-08-11T16:18:24Z completed by a-root
