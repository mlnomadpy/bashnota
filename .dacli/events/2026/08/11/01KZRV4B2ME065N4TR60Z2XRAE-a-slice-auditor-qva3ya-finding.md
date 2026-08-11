---
id: 01KZRV4B2ME065N4TR60Z2XRAE
kind: event
event_kind: finding
created: 2026-08-11T16:40:13Z
created_by: a-slice-auditor-qva3ya
about: "[[001]]"
origin: agent
applied: false
---
Router guard gates only /profile; every other route is reachable unauthenticated

router/index.ts:102-128 beforeEach: requiresAuth is set on exactly one route — /profile (index.ts:64). /login and /register carry requiresGuest (index.ts:52,58). All other routes (/ home, /nota/:id, /favorites, /settings, /output/:notaId/:blockId, /p/:id, /@:userTag, /@:userTag/:notaId, /u/:userId) have no auth meta, so an unauthenticated user reaches them all. This is defensible for a local-first app (local notas live in IndexedDB and need no login), but it means the SPA guard is NOT the security boundary — Firestore rules are. The blast radius of the guard is one route. Any reader assuming 'the app requires login' is wrong. Note ProfileView.vue:33-38 duplicates the guard with its own onMounted redirect — dead in practice because the guard already blocks unauthenticated access to /profile; redundant logic to remove.
