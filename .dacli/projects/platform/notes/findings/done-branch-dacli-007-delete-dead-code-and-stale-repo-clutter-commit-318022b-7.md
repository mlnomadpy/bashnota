---
id: f-done-branch-dacli-007-delete-dead-code-and-stale-repo-clutter-commit-318022b-7
kind: note
note_kind: finding
created: 2026-08-11T17:00:20Z
created_by: a-fixer-e3zd2c
about: "[[007]]"
severity: major
---
# DONE (branch dacli/007-delete-dead-code-and-stale-repo-clutter, commit 318022b): 7 files + 14 deps deleted, all zero-importer proven, build green, tests unchanged
Deleted (8 files changed, 2230 deletions):
FILES (zero-importer proof, ripgrep whole worktree, node_modules gitignore-excluded):
- localagents.ts: 0 refs to 'localagents' anywhere in repo.
- src/App.vue.backup: 0 refs to 'App.vue.backup' in src/ (a .backup file, non-importable).
- src/services/aiService.ts (308 LOC): only importer was localagents.ts (import './src/services/aiService'). All other 'aiService' imports resolve to the DIFFERENT file @/features/ai/services/aiService — verified: grep 'services/aiService' shows only @/features/ai/... matches, none for @/services/aiService.
- src/components/MenubarSidebars.vue: only code importer was src/App.vue.backup:20 (now deleted); remaining refs are in markdown docs only.
- Cool_shit.nota, Cool_shit (1).nota, Cool_shit (2).nota: root-level .nota scratch data files, not referenced by any code.
DEPENDENCIES (14, each zero import/require repo-wide; only appeared in package.json/lock/README): i, install, npm, radix-vue (superseded by reka-ui, used in 168 files), vue-toast-notification (superseded by vue-sonner), localforage (dexie is storage), mathjax + mathjax-full (MathJax is CDN window-global via useMathJax.ts:100, katex is bundled), @codemirror/gutter + @codemirror/highlight (0.19.x pre-CM6, superseded by @codemirror/view), unist (0.0.1 placeholder), html-to-markdown, remark-parse + unified (abandoned pipeline; marked is used).
VERIFICATION (in worktree):
- npx vite build: SUCCEEDS. Entry chunk index-MNUhVMoo.js BEFORE=10,057.89 kB (gzip 3,327.82) / AFTER=10,057.89 kB (gzip 3,327.82) — byte-identical (same hash), expected since dead code/deps were never bundled; removals are install-size/hygiene wins.
- npx vitest run: 5 failed / 346 passed (351) BEFORE and AFTER — no regression (the 5 are pre-existing timezone-dependent tests, finding 01KZRT3VPR).
- npx vue-tsc --build: same 4 pre-existing errors (Bibliography.vue, UnifiedAdvancedSettings.vue), none in touched files; no .js emitted into src.
SCOPE: did NOT touch feature flags, test-only imports, consolidated-settings, or migration-service stacks. Left stale doc mentions (src/services/README.md, NAVBAR_SIMPLIFICATION_PLAN.md, COMPLETE_MIGRATION_SUMMARY.md) untouched to keep diff narrow. Closes 01KZRV6H1T, 01KZRV6QV3, 01KZRV9AYD, and 007's slice of 01KZRTGM7P.
FOLLOW-UP: package-lock.json out of sync (separate finding); unist-util-visit also unused (separate finding).
