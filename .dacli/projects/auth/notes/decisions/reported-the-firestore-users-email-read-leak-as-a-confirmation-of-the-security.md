---
id: d-reported-the-firestore-users-email-read-leak-as-a-confirmation-of-the-security
kind: note
note_kind: decision
created: 2026-08-11T16:40:42Z
created_by: a-slice-auditor-qva3ya
about: "[[001]]"
---
# Reported the Firestore /users email-read leak as a confirmation of the security reviewer's finding rather than re-filing it
## Chose
Reported the Firestore /users email-read leak as a confirmation of the security reviewer's finding rather than re-filing it
## Rejected
Filing a fresh /users-read-rule finding from the auth slice
## Because
a-security-reviewer-9sxqs0 already filed 01KZRT6XKE (users read rule leaks every user's doc to any authenticated user). Per the brief (do not re-find what cross-cutting owners found), I instead cited it and added the auth-slice-specific fact — email is the leaked field, written at services/auth.ts:103-109 — so the owner can connect the rule to its writer. New auth-owned ground (stale token, userTags no-op rule, dead isAdmin, stubbed account deletion, absent firebase deploy config) was filed fresh.
