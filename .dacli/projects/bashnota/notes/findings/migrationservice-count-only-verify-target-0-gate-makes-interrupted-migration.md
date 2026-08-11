---
id: f-migrationservice-count-only-verify-target-0-gate-makes-interrupted-migration
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-data-reviewer-1hm2w7
about: "[[t-01KZRSXR3X7GZNARQBY6SZRRMC]]"
origin: src/services/migrationService.ts:173
source_event: 01KZRT6XVSC4TDMHQ8N84TFWA8
---
# MigrationService: count-only verify + target!=0 gate makes interrupted migration silently lossy
If MigrationService were wired (see companion finding), two design flaws make it lose data. (1) verify() (migrationService.ts:173-206) only compares COUNTS: success = sourceCount === targetCount && errorCount===0. It never checks that each source nota's id/content actually landed in target. A write that lands under a wrong/colliding key, or writes garbage, still passes verification as long as the total count matches. (2) needsMigration() (line 58-64) returns true ONLY when target has 0 notas (sourceNotas.length>0 && targetNotas.length===0). migrate() (line 74-168) writes notas one-by-one with per-item try/catch that swallows failures into this.errors and CONTINUES. If the process is interrupted mid-migration (tab closed / crash) after k of N notas are written, target now has k>0 notas, so on next launch needsMigration() returns false forever — migration never resumes and the remaining N-k notas are silently absent from the target backend. No checkpoint/resume and no automatic rollback exists (rollback() at line 211 must be called manually and deletes ALL target notas).
