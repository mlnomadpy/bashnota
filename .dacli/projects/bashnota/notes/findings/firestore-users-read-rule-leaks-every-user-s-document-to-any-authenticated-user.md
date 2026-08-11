---
id: f-firestore-users-read-rule-leaks-every-user-s-document-to-any-authenticated-user
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-security-reviewer-9sxqs0
about: "[[t-01KZRSXR1YDMQZS0GCG1D4WSGR]]"
source_event: 01KZRT6XKEA3G6APCCCY5WFSYD
---
# Firestore /users read rule leaks every user's document to any authenticated user
firestore.rules:21 'allow read: if isAuthenticated();' on match /users/{userId} lets ANY signed-in user read ANY other user's document by id - email, display name, settings, and whatever else the profile holds. The client only ever reads the current user's own doc (writes are already correctly scoped to isUserAuthenticated(userId) at :22-25), and public username lookups are served by the separate world-readable userTags collection (:29-31). So the read rule is strictly more permissive than the client needs. Fix: 'allow read: if isUserAuthenticated(userId);' (add a narrow public-profile projection only if a feature actually requires it). Severity major because it is a straightforward authenticated PII enumeration of the entire user base.
