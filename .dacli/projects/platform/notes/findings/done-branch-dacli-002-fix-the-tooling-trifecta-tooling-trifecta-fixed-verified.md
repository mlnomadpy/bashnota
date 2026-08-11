---
id: f-done-branch-dacli-002-fix-the-tooling-trifecta-tooling-trifecta-fixed-verified
kind: note
note_kind: finding
created: 2026-08-11T17:00:08Z
created_by: a-fixer-y9jq1t
about: "[[002-fix-the-tooling-trifecta-tsconfig-noemit-eslint-parser-ci-gate]]"
severity: major
---
# DONE (branch dacli/002-fix-the-tooling-trifecta...): tooling trifecta fixed + verified; ready to accept
Commit 033d95b on branch dacli/002-fix-the-tooling-trifecta-tsconfig-noemit-eslint-parser-ci-gate. Only 6 config files changed, NONE under src. Verification (all run in the worktree):

AC1 noEmit/0-.js: tsconfig.app.json:6 + tsconfig.vitest.json:6 now set noEmit:true. 'npx vue-tsc --build --force' then 'find src -name *.js | wc -l' = 0. DEVIATION: did NOT add composite:true — in TS 5.7.3 composite+noEmit on a --build-referenced project errors TS6310 and breaks type-check; @vue/tsconfig base already provides noEmit. See decision note. Objective check (0 .js) passes.

AC2 gitignore guard: .gitignore now ignores src/**/*.js and src/**/*.js.map (kept .d.ts allowed — 2 legit committed .d.ts exist under src).

AC3 eslint parser: eslint.config.ts imports vueTsConfigs and adds vueTsConfigs.recommended. 'npx eslint src' | grep -c 'Parsing error' = 0 (reports 604 real rule violations, expected, not auto-fixed).

AC4 CI gate: deploy.yml adds setup-node + sequential steps type-check, 'npx eslint .', 'npx vitest run' BEFORE build+Deploy; a failing step stops the job so Deploy never runs on gate failure.

AC5 25 tests: added functions/** to vitest.config.ts exclude (separate Firebase package). 'npx vitest run' = 25 test files exactly (was 26 incl. functions test).

AC6 no src changes: git status shows only deploy.yml, .gitignore, eslint.config.ts, tsconfig.app.json, tsconfig.vitest.json, vitest.config.ts.

INHERITED (not introduced, not fixed — out of scope): vue-tsc reports 4 unique type errors (Bibliography.vue, UnifiedAdvancedSettings.vue); vitest has 5 failing timezone-date tests; vite build succeeds with the large-chunk warning. These pre-existing failures mean the new CI gates will currently BLOCK deploy until other tasks fix them — which is the intended behavior of a gate.
