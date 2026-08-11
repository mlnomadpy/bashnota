---
id: f-docs-missing-tests-md-is-stale-and-understates-coverage-do-not-plan-from-it
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-test-reviewer-ce29ny
about: "[[t-01KZRSX034BWDE84AWXDZ2SCHX]]"
origin: docs/MISSING_TESTS.md:24
source_event: 01KZRT9FY3DKWMV1F6PHSGSTFP
---
# docs/MISSING_TESTS.md is stale and understates coverage — do not plan from it
docs/MISSING_TESTS.md (Last Updated Dec 2024) claims '11 test files', 'Services 2/25 tested (8%)', 'coverage 1.7%'. Reality now: ~24 project test files (git ls-files: 351 tests, 346 passing), and the SERVICE layer is the best-covered area — storageService, fileSystemBackend, databaseAdapter, migrationService, cachedStorageService, consolidatedSettingsService, directoryHandleStorage, storageServiceInitialization all have tests. The doc's priority list is inverted vs actual risk: it front-loads firebase.ts/aiService.ts (thin infra wrappers, 61/308 LOC) while omitting that the real gap is the STATE layer that owns document content — nota.ts store (1480 LOC) and blockStore.ts (987 LOC), both untested. Planning off this doc would spend effort re-testing covered storage code and miss the data-loss surface. Recommend regenerating it from actual git ls-files + a coverage run, or deleting it.
