---
id: f-excluding-functions-from-vitest-means-the-cloud-functions-tests-now-run-nowhere
kind: note
note_kind: finding
created: 2026-08-11T17:08:49Z
created_by: a-root
severity: moderate
origin: vitest.config.ts:10
---
# Excluding functions/** from vitest means the Cloud Functions tests now run nowhere
The 004 fix correctly excluded functions/** from the app test suite — functions/ is a separate Firebase Cloud Functions package with its own package.json and tsconfig, so its tests do not belong in the app run. Master went from 25 files/350 tests to 24 files/338 tests; the missing 12 are functions/src/utils/__tests__/NotaContentProcessor.test.ts.

The exclusion is right, but it leaves those 12 tests orphaned: nothing in CI runs the functions package. Before the exclusion they at least ran by accident.

Fix belongs in the CI task: add a second job that installs and tests functions/ in its own working-directory, or a root script that delegates to it. Also verify functions/ has a test script at all — if it does not, that is the actual gap.
