---
id: t-01KZRV1AD380Z06CZ04FR8QTPF
kind: task
created: 2026-08-11T16:38:34Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 2, probable: 4, pessimistic: 8}"
---
# Tighten the Firestore rules that over-expose user data
## Acceptance
- [ ] The /users read rule no longer allows any authenticated user to read every user document; it grants only the fields the client genuinely needs for public profiles
- [ ] Stats, votes and viewer records can no longer be inflated or forged by an arbitrary authenticated user
- [ ] Every rule change is justified against a specific client read or write in src, cited by file:line
- [ ] No client code path that currently works is broken by the tightened rules, with the affected call sites listed
## Log
