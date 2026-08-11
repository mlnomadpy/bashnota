---
id: 01KZRV3A4T39R3GV8YF8PRDRMS
kind: event
event_kind: finding
created: 2026-08-11T16:39:39Z
created_by: a-slice-auditor-qva3ya
about: "[[001]]"
origin: agent
applied: false
---
Account deletion is a stub — Danger Zone UI deletes nothing

ProfileView.vue:197-255 renders a full 'Danger Zone' with a 'Delete Account' button, a type-DELETE confirmation input, and copy 'Deleting your account will remove all your data and cannot be undone.' The handler handleDeleteAccount (ProfileView.vue:62-80) only fires toast('Account deletion is not implemented in this demo') and never calls Firebase Auth deleteUser, never removes the users/{uid} doc (written at services/auth.ts:103-109), the userTags doc, or any notas. User-visible: a user who wants to delete their account/PII (email is stored in users/{uid}) is told their data will be erased but nothing happens — a privacy/GDPR expectation gap. Grade: stubbed. AuthService has no deleteAccount method at all; the whole path is missing.
