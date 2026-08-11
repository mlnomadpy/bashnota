---
id: 01KZRV2TBES5WZMK4HZSZ8Y2M2
kind: event
event_kind: finding
created: 2026-08-11T16:39:23Z
created_by: a-slice-auditor-qva3ya
about: "[[001]]"
origin: agent
applied: false
---
Stale Firebase ID token breaks all authenticated API calls after ~1 hour

stores/auth.ts:42-46 stores user.accessToken into localStorage['token'] inside onAuthStateChanged. That callback fires only on sign-in/sign-out, NOT on Firebase's internal ~55min token refresh (that is onIdTokenChanged). services/axios.ts:13-15 sends this cached string as 'Bearer <token>' to the functions API. functions/src/helpers.ts:16 admin.auth().verifyIdToken rejects expired tokens. Firebase ID tokens expire after 1h, so every authenticated call through fetchAPI — publish (nota.ts:1077 POST /nota/publish/:id), unpublish (nota.ts:1127), image upload (publishNotaUtilities.ts:26 POST /image/upload), comments — returns 401 once a session/tab is older than ~1h. User-visible: publishing/commenting/image-upload silently fail with no re-auth; user must reload or re-login. Fix: call user.getIdToken() per request, or use onIdTokenChanged.
