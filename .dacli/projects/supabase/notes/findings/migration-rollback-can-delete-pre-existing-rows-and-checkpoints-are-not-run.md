---
id: f-migration-rollback-can-delete-pre-existing-rows-and-checkpoints-are-not-run
kind: note
note_kind: finding
created: 2026-08-18T13:11:03Z
created_by: a-root
about: "[[t-01KZYG5K04Z71RHFPEWKWGNRPH]]"
severity: major
---
# Migration rollback can delete pre-existing rows and checkpoints are not run-bound
ignoreDuplicates upsert then applied journal does not record insert ownership; rollback deletes every target, including pre-existing matching/conflicting rows. Checkpoints bind only manifestHash, letting run B claim run A state. Add source-hash conflict checks, insert ownership/provenance, run-bound checkpoints, and pre-existing/different-run rollback tests.
