---
id: f-baseline-720-js-emitted-by-type-check-does-not-reproduce-vue-tsconfig-base
kind: note
note_kind: finding
created: 2026-08-11T16:59:05Z
created_by: a-fixer-y9jq1t
about: "[[002-fix-the-tooling-trifecta-tsconfig-noemit-eslint-parser-ci-gate]]"
severity: moderate
---
# Baseline '720 .js emitted by type-check' does not reproduce; @vue/tsconfig base already sets noEmit:true
In a clean worktree with current deps, 'npx vue-tsc --build --force' on the ORIGINAL (pre-fix) tsconfig emits 0 .js under src (find src -name '*.js' | wc -l = 0). Reason: node_modules/@vue/tsconfig/tsconfig.json:2 sets 'noEmit: true', which tsconfig.app.json/tsconfig.vitest.json inherit via extends. The task brief's diagnosis ('tsconfig.app/vitest lack noEmit') is imprecise — they inherit it. The emission likely occurred previously from a stale node_modules/.tmp tsbuildinfo or an older @vue/tsconfig. Fix landed: made noEmit explicit in tsconfig.app.json:6 and tsconfig.vitest.json:6 as a local guarantee. NOTE: adding composite:true (as the acceptance prescribes) instead BREAKS the build with TS6310 in TS 5.7.3 — see linked decision.
