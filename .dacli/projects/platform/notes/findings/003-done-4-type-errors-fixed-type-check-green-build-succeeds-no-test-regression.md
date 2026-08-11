---
id: f-003-done-4-type-errors-fixed-type-check-green-build-succeeds-no-test-regression
kind: note
note_kind: finding
created: 2026-08-11T16:57:07Z
created_by: a-fixer-svxzkp
about: "[[003-fix-the-4-type-errors-including-the-bibliography-referenceerror]]"
severity: major
---
# 003 DONE: 4 type errors fixed, type-check green, build succeeds, no test regression
Branch dacli/003-fix-the-4-type-errors-including-the-bibliography-referenceerror, commit 4db587f. Fixes:
(1) Bibliography.vue:231 referenced undefined 'editor' -> now props.editor. Bibliography.vue:223 TS2345 (Record<string,any> not assignable to Editor): typed the 'editor' prop as PropType<Editor> from @tiptap/core (a real Editor instance is passed by TipTap's node view, so the call is live, not dead).
(2) UnifiedAdvancedSettings.vue:230/385 TS2322 (StorageMode/LogLevel handler not assignable to (v: AcceptableValue)=>any): fixed at the handler signature — handleStorageModeChange and new handleLogLevelChange now accept AcceptableValue and narrow via literal-union guards (no 'as any', no @ts-ignore). Template binds pass the handler directly.
VERIFICATION (all run in worktree):
- npm run type-check (vue-tsc --build): exits 0, zero errors (was 4).
- npx vite build: succeeds in ~10.5s, main chunk 10,057.89 kB gzip 3,327.82 kB (matches baseline; CSS @import + chunk-size warnings are pre-existing).
- npx vitest run: 346 passed / 5 failed — the 5 failures are the inherited baseline (dateUtils getTimeOfDay x3, lib/citation year, statisticsService week-padding), all timezone/date-sensitive and untouched by this change. No regression.
- find src -name '*.js': empty (no emitted JS committed).
Owner: run dacli accept to check the 4 boxes and mark done.
