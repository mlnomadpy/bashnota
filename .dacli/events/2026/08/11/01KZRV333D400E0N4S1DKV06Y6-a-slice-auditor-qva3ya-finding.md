---
id: 01KZRV333D400E0N4S1DKV06Y6
kind: event
event_kind: finding
created: 2026-08-11T16:39:32Z
created_by: a-slice-auditor-qva3ya
about: "[[001]]"
origin: agent
applied: false
---
userTags one-tag-per-user rule check is a no-op — checks wrong document id

firestore.rules:35-39 create rule on /userTags/{tag} intends 'user must not already have a tag' via !existsAfter(/databases/$(database)/documents/userTags/$(request.auth.uid)). But the userTags collection is keyed by the TAG string (services/auth.ts:113 doc(firestore,'userTags',userTag)), never by uid. A document whose id equals a uid never exists, so existsAfter is always false and the guard is always satisfied. Consequence: a user can create unlimited userTags docs; the intended one-tag-per-user invariant is not enforced server-side. Combined with services/auth.ts:updateUserTag (128-178) which creates the new tag doc then deletes the old, an interrupted/duplicate call leaves orphan tag->uid mappings that /@:userTag (router index.ts:74) and functions/src/routes/authors.ts:13 will still resolve. To actually enforce it the rule must query by field (uid) which Firestore rules cannot do — needs a userTags/{uid} pointer doc or a Cloud Function.
