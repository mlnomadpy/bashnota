---
id: p-nota
kind: project
created: 2026-08-11T16:29:30Z
created_by: a-root
status: active
stage: definition
---
# Nota slice
## Goal
Audit and upgrade src/features/nota (36 .vue, 30 .ts, 16656 LOC). Owns the document model and the dual content representation: Nota.content (TipTap JSON string) vs the 22 normalized Dexie block tables driven by blockStore.ts. Also owns nota CRUD, sub-notas, favourites, references, comments, publishing, and the public nota view. nota.ts (1480 LOC) imports from auth, jupyter, bashhub and services/axios.
## Constraints
- Vue 3 / TypeScript / Vite 6 / Tailwind 3 / Pinia. No framework rewrites, no swapping TipTap.
- Feature-Sliced Design under `src/features/*` is deliberate; work with it.
- READ-ONLY seat. Analyze and file findings. Do not modify source files.
- Every claim cites `file:line`. Claims without repo evidence are rejected.
- Comprehension before criticism: a defect list from someone who misread the design is worse than no list.
- `components/ui/**` is shadcn-vue generated and lint-excluded; do not file style findings against it.
- Firebase `VITE_*` keys in the client bundle are NOT secrets. The security boundary is `firestore.rules`.
- Proving code dead requires a whole-repo grep showing zero importers. A confident wrong call gets someone's working feature deleted. If unsure, say so and give the evidence both ways.

## Out of scope
- New product features as work items (propose them, do not build them).
- Anything needing credentials or a production deploy.
- Re-measuring the baseline below, or re-finding what the cross-cutting review already found.

## Success criteria
- A file-relation map of this slice that a newcomer could act on.
- Reconstructed intent: what this slice was meant to be, in prose, from code.
- Every feature graded complete/partial/stubbed/dead/orphaned with file:line.
- Defects filed via `dacli note add finding` with file:line origins and user-visible consequences.
- Upgrade proposals that are cheap specifically because of how this slice is already built.

## Codebase map

BashNota is a **local-first, code-executing research notebook**: a Vue 3 + TS SPA
(~120k LOC) combining TipTap rich-text with executable code blocks, Jupyter
kernels, AI assistance, LaTeX/Mermaid, citations, and dual storage (IndexedDB via
Dexie, or `.nota` files via the File System Access API). Last commit 2025-12-13;
abandoned mid-migration.

**Slice sizes** — `editor` is 44% of the app:
editor 53,231 LOC · nota 16,656 · settings 13,049 · ai 9,253 · bashhub 3,751 ·
jupyter 2,375 · auth 1,682 · help 1,532.

**THE CENTRAL ARCHITECTURAL FACT — two content models coexist:**
1. `Nota.content` — a serialized TipTap JSON string on the `notas` Dexie row.
2. **22 typed Dexie block tables** (textBlocks, codeBlocks, executableCodeBlocks,
   pipelineBlocks, theoremBlocks, confusionMatrixBlocks, …) plus a
   `blockStructures` index table, driven by `blockStore.ts` (987 LOC).
The seam is three `TODO: Implement proper block creation instead of legacy
conversion` markers at `nota.ts:1319/1379/1439`. Which model is authoritative is
a live question — trace it, never assume it.

**Persistence stack, outermost to disk:**
`nota.ts` (Pinia, 1480 LOC) → `useDatabaseAdapter()` → `databaseAdapter.ts` →
branches on `USE_NEW_STORAGE` → either `db` (Dexie) or `storageService.ts` →
`cachedStorageService.ts` (LRU) → `fileSystemBackend.ts` (File System Access API)
→ `.nota` files. `fileWatcherService.ts` is a stub (`fileSystemBackend.ts:264`).

**Three unfinished migrations**, flagged in `src/composables/useFeatureFlags.ts`,
all defaulting to **false**: `USE_NEW_STORAGE`, `USE_SIMPLIFIED_NAVIGATION`,
`USE_CONSOLIDATED_SETTINGS`. Both halves of each are still maintained.

**Routes** (`src/router/index.ts`, all lazy): `/` HomeView · `/nota/:id`
SplitNotaView · `/favorites` · `/settings/:section` · `/output/:notaId/:blockId`
· `/login` `/register` `/profile` · `/p/:id` and `/@:userTag/:notaId`
PublicNotaView · `/@:userTag` and `/u/:userId` UserPublishedView.

**Custom editor blocks** (`src/features/editor/components/blocks/`): citation,
confusion-matrix, executable-code, math, nota-config, nota-title, pipeline,
sub-nota, subfigure, table, theorem, youtube, plus markdown-input and the command
palette. `pipeline/PipelineNode.vue` is the largest file in the repo at 2116 LOC.

**Verified baseline (measured by root 2026-08-11 — do not re-measure):**
- `npm run build` SUCCEEDS in 7.8s. Main chunk **10,057.95 kB** (3,327.84 kB gzip), one chunk. PWA precaches 10,673 KiB.
- `npm run type-check` **FAILS** (4 errors) and **emits 720 .js files into src/** because `tsconfig.app.json` and `tsconfig.vitest.json` lack `noEmit`. Vitest then double-runs every suite.
- `npm run lint` is **dead**: 425 of 426 errors are `Parsing error` — `eslint.config.ts:23` clobbers the TS parser. The project has never been linted.
- 5 unique test failures. CI (`deploy.yml`) runs `build-only` and gates on nothing.
- Counts: 690 `any`, 431 `console.*`, 20 `@ts-ignore`, 19 TODO/FIXME.
- `localagents.ts` at repo root imports a path that no longer exists — a worked example of dead code, and a reminder that filenames lie.
