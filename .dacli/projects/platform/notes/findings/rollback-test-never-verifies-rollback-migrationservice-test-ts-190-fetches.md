---
id: f-rollback-test-never-verifies-rollback-migrationservice-test-ts-190-fetches
kind: note
note_kind: finding
created: 2026-08-11T17:21:51Z
created_by: a-fixer-mrwz72
about: "[[011]]"
severity: moderate
---
# Rollback test never verifies rollback: migrationService.test.ts:190 fetches targetNotas but never asserts on it
src/services/__tests__/migrationService.test.ts:182-192, test 'should support rollback functionality'. Line 190 does const targetNotas = await mockTargetBackend.listNotas() but the only assertion (191) is expect(mockTargetBackend.deleteNota).toHaveBeenCalled(). The unused targetNotas is evidence the intended assertion (e.g. expect(targetNotas).toEqual([]) verifying the target was actually cleared) was never written. The test passes without checking what its name claims. Discovered while triaging unused assigned values (task 011). Not deleted; flagged per acceptance.
