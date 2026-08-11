---
id: 01KZRV51P7G0DJ23M4V11E67E3
kind: event
event_kind: finding
created: 2026-08-11T16:40:36Z
created_by: a-slice-auditor-qva3ya
about: "[[001]]"
origin: agent
applied: false
---
Auth slice map + reconstructed intent + Firestore collection-to-rules audit (auth-owned collections)

MAP (1682 LOC over 8 src files): views/LoginView.vue, RegisterView.vue, ProfileView.vue (entry points via router /login /register /profile); components/UserTagEditor.vue (used only by ProfileView.vue:8); stores/auth.ts (Pinia 'auth', imported by 17 files — the public surface of the slice); services/auth.ts (AuthService singleton, imported only by the store — clean layering); types/user.ts. Cross-slice: the store is the intended public API; utils/userTagGenerator.ts lives OUTSIDE the slice (src/utils) but is auth-only logic — a boundary smell, not a violation. INTENT: thin wrapper over Firebase Auth (email/password + Google popup + password reset) plus a home-grown 'user tag' handle system (unique @tag mapped to uid via a userTags lookup collection) powering public profile URLs /@:userTag. ROUTER GUARD is the only client gate and covers just /profile. COLLECTIONS the auth client touches: (a) users/{uid} — WRITE at services/auth.ts:103-109 (uid,email,displayName,userTag,createdAt); firestore.rules:21 'allow read: if isAuthenticated()' exposes every user's email to any logged-in user — already filed by a-security-reviewer-9sxqs0 (01KZRT6XKE), NOT re-filing, but confirming from the auth side that email is the leaked field and it is written here. (b) userTags/{tag} — read public (rules:31 allow read: if true) enabling uid/tag enumeration by anyone; write rules broken per separate finding. Public author API (functions authors.ts:29-33) correctly exposes only id/tag/displayName, NOT email — so the public-page surface is clean; the leak is purely the client-side users read rule.
