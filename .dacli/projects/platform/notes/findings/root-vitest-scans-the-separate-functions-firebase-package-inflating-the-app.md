---
id: f-root-vitest-scans-the-separate-functions-firebase-package-inflating-the-app
kind: note
note_kind: finding
created: 2026-08-11T16:59:09Z
created_by: a-fixer-y9jq1t
about: "[[002-fix-the-tooling-trifecta-tsconfig-noemit-eslint-parser-ci-gate]]"
severity: minor
---
# Root vitest scans the separate functions/ Firebase package, inflating the app test-file count (26 vs 25)
vitest.config.ts sets root:'./', so 'npx vitest run' discovers functions/src/utils/__tests__/NotaContentProcessor.test.ts — a test belonging to functions/ (its own package.json/tsconfig.json, name 'functions', Firebase Cloud Functions). That made the de-duplicated count 26, not the 25 the acceptance expects (baseline 51 = 25 src .ts doubled to 50 .js + 1 functions test). Fix: added 'functions/**' to vitest.config.ts exclude. Now 'npx vitest run' reports exactly 25 test files. functions/ has no test runner configured, so its tests are effectively orphaned and should get their own vitest setup.
