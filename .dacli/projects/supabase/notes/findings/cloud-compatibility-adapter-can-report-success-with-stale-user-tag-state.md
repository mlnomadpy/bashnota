---
id: f-cloud-compatibility-adapter-can-report-success-with-stale-user-tag-state
kind: note
note_kind: finding
created: 2026-08-13T23:31:58Z
created_by: a-root
about: "[[t-01KZYG44QB4MRZSTMQ2JATD2ZZ]]"
severity: major
---
# Cloud compatibility adapter can report success with stale user-tag state
Review found firebaseCompatibility.upsertProfile writes publicProfiles only, unlike AuthService.updateUserTag which also updates users.userTag, creates the new userTags reservation, and removes the old one. This can return success with stale URL/tag lookup and collisions. Delegate to established atomic semantics and test all affected documents/results.
