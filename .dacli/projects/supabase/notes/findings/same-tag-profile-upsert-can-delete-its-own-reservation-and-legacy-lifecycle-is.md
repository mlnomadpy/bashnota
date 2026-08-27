---
id: f-same-tag-profile-upsert-can-delete-its-own-reservation-and-legacy-lifecycle-is
kind: note
note_kind: finding
created: 2026-08-13T23:42:20Z
created_by: a-root
about: "[[t-01KZYG44QB4MRZSTMQ2JATD2ZZ]]"
severity: major
---
# Same-tag profile upsert can delete its own reservation and legacy lifecycle is non-atomic
At firebaseCompatibility.ts:135-142 every upsert delegates to AuthService.updateUserTag. That service deletes oldTag after writing newTag even when equal, so a same-tag update returns success after deleting its live reservation. Multi-write sequence also permits partial users/publicProfiles mutation on concurrent reservation failure. Use a Firestore transaction/precondition with ownership, delete old only when distinct, and regress same-tag plus concurrent collision/failure across users/publicProfiles/old/new tag docs.
