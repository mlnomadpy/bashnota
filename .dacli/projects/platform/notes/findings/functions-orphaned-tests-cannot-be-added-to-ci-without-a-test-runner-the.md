---
id: f-functions-orphaned-tests-cannot-be-added-to-ci-without-a-test-runner-the
kind: note
note_kind: finding
created: 2026-08-11T17:17:52Z
created_by: a-fixer-5jrghe
about: "[[010]]"
severity: minor
---
# functions/ orphaned tests cannot be added to CI without a test runner: the package has no test script and no vitest/jest dependency
a-root suggested (f-excluding-functions-from-vitest...) that the CI task add a job to run functions/src/utils/__tests__/NotaContentProcessor.test.ts (the 12 tests orphaned when 004 excluded functions/** from the app suite). I did NOT add it: functions/package.json has scripts {build, build:watch, serve, shell, start, deploy, logs} — NO 'test' script — and devDependencies list only firebase-functions-test (a helper), no vitest/jest/mocha runner. Wiring these tests into CI requires adding a test runner dependency + test script to the separate functions package, which is outside this task's acceptance criteria and my read-only-elsewhere scope. Recommend a dedicated task: add vitest (or jest) + a 'test' script to functions/, then a second CI job with working-directory: functions running npm ci && npm test.
