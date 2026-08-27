---
id: p-bashnota
kind: project
created: 2026-08-11T16:14:50Z
created_by: a-root
status: active
stage: definition
github_repo: mlnomadpy/bashnota
github_public_confirmed: mlnomadpy/bashnota
landing.mode: local
landing.base: master
---
# bashnota
## Goal
BashNota is a local-first, code-and-AI-native notebook: a Vue 3 + TypeScript SPA
(~120k LOC, 459 .vue / 264 .ts files) combining TipTap rich-text editing with
executable code blocks, Jupyter integration, AI assistance, LaTeX/Mermaid, and
dual storage (IndexedDB via Dexie, or direct File System Access API).

The immediate goal is NOT new features. It is to establish an accurate,
evidence-backed picture of the project's current health across performance,
code quality, architecture, testing, and security — and to produce a prioritized
upgrade plan from that evidence. The codebase was left mid-migration and has
sat untouched since 2025-12-13.

## Constraints
- Vue 3 / TypeScript / Vite 6 / Tailwind 3 / Pinia. Do not propose a framework rewrite.
- Supabase is the sole production backend. Do not restore Firebase runtime dependencies, compatibility defaults, credentials, or deployment paths.
- GitHub Pages is the production web deployment target; any alternate hosting config must use the same locked npm build and Supabase-only boundary.
- Feature-sliced layout under `src/features/*` is deliberate; work with it, not against it.
- Findings must cite `file:line`. Claims without evidence in the repo are rejected.
- Reviewers are READ-ONLY: analyze and file findings. Do not modify source files.

## Out of scope
- Rewriting the editor or swapping TipTap.
- New product features (see docs/MISSING_FEATURES.md — deferred).
- Anything requiring credentials or deploying to production.

## Success criteria
- Every major subsystem has a written health assessment backed by file:line evidence.
- Findings are severity-ranked and de-duplicated across reviewers.
- A prioritized upgrade backlog exists where each item states cost, risk, and payoff.
- Known-broken tooling (lint, type-check emit, CI gates) has a concrete fix path.

## Baseline measurements (2026-08-11, verified by root)
- `npm run build`: SUCCEEDS in 7.8s. Main chunk `index-*.js` = 10,057.95 kB (3,327.84 kB gzip). PWA precaches 66 entries / 10,673 KiB.
- `npm run type-check`: FAILS. 4 errors. Also EMITS 720 .js files into src/ (tsconfig.app.json + tsconfig.vitest.json lack `noEmit`), which makes vitest double-run every suite.
- `npm run lint`: BROKEN. 426 errors, 425 of them `Parsing error` — eslint.config.ts ordering clobbers the TS parser. Effectively zero lint coverage to date.
- `npx vitest run`: 5 unique failures / 75 tests across the 4 affected files (690 pass overall when duplicates are counted).
- CI (.github/workflows/deploy.yml) runs `npm ci && npm run build-only` only — no test, type-check, or lint gate before deploy.
- Code smell counts: 690 `any`, 431 `console.*`, 20 `@ts-ignore`, 19 TODO/FIXME.
- Last commit 2025-12-13; last 5 PRs authored by copilot-swe-agent[bot].

## Architecture as verified by root (read this before opening files)

**Feature slices** (`src/features/*`), by size — this is where the weight is:

| slice | .vue | .ts | LOC | what it owns |
|---|---|---|---|---|
| editor | 114 | 82 | 53,231 | TipTap editor + 14 custom block types |
| nota | 36 | 30 | 16,656 | the document model, nota CRUD, publishing |
| settings | 47 | 8 | 13,049 | all settings UI |
| ai | 9 | 27 | 9,253 | provider abstraction, conversations, code actions |
| bashhub | 5 | 5 | 3,751 | home, public profiles, statistics |
| jupyter | 7 | 5 | 2,375 | kernel sessions, remote execution |
| auth | 4 | 3 | 1,682 | Firebase auth, profiles |
| help | 2 | 4 | 1,532 | in-app help content |

`editor` is 44% of the app. Any statement about "the codebase" that has not looked
inside `src/features/editor` is not about this codebase.

**The central architectural fact — there are TWO content models living at once:**
1. **Legacy**: `Nota.content` — a serialized TipTap JSON string on the `notas` row.
2. **Normalized blocks**: `src/db.ts` declares **22 block-type Dexie tables**
   (textBlocks, codeBlocks, mathBlocks, executableCodeBlocks, pipelineBlocks,
   theoremBlocks, confusionMatrixBlocks, …) plus a `blockStructures` table,
   driven by `src/features/nota/stores/blockStore.ts` (987 LOC).

The three `TODO: Implement proper block creation instead of legacy conversion`
markers at `nota.ts:1319/1379/1439` are the seam between them. Determining which
model is authoritative at runtime — and what the other one costs — is a primary
objective of this review. Do not assume; trace it.

**Persistence stack**, outermost to disk:
`nota.ts` (Pinia, 1480 LOC) → `useDatabaseAdapter()` → `databaseAdapter.ts`
→ branches on the `USE_NEW_STORAGE` flag → either `db` (Dexie/IndexedDB) or
`storageService.ts` → `cachedStorageService.ts` (LRU) → `fileSystemBackend.ts`
(File System Access API) → `.nota` files on disk. `directoryHandleStorage.ts`
persists the directory handle across reloads; `fileWatcherService.ts` is a stub
(`fileSystemBackend.ts:264`).

**Routes** (all lazy-loaded, `src/router/index.ts`): `/` HomeView (bashhub),
`/nota/:id` SplitNotaView, `/favorites`, `/settings/:section`,
`/output/:notaId/:blockId` (code output in a popped-out window), `/login`,
`/register`, `/profile`, `/p/:id` + `/@:userTag/:notaId` PublicNotaView,
`/@:userTag` + `/u/:userId` UserPublishedView.

**Custom editor blocks** (`src/features/editor/components/blocks/`): citation,
confusion-matrix, executable-code, math, nota-config, nota-title, pipeline,
sub-nota, subfigure, table, theorem, youtube, plus markdown-input and command
palette plumbing. `pipeline/PipelineNode.vue` is the single largest file at 2,116 LOC.

**Cross-slice coupling to watch:** `nota.ts` imports from auth, jupyter, bashhub
and services/axios — the document store reaches into four other slices. Whether
that is justified is a question for the architecture review, not an assumption.

## Codebase map
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
