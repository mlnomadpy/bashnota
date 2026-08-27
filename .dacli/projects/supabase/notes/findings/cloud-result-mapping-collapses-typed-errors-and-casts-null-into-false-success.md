---
id: f-cloud-result-mapping-collapses-typed-errors-and-casts-null-into-false-success
kind: note
note_kind: finding
created: 2026-08-13T23:31:58Z
created_by: a-root
about: "[[t-01KZYG44QB4MRZSTMQ2JATD2ZZ]]"
severity: major
---
# Cloud result mapping collapses typed errors and casts null into false success
firebaseCompatibility rewraps CloudError via firebaseError so unauthenticated/invalid becomes unknown; recordView/recordClone cast missing-publication ok(null) into object/number successes and legacy methods can swallow failures. Preserve CloudError codes, reject null/missing targets, and cover swallowed provider failures.
