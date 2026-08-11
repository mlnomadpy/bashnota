---
id: 01KZRV5PFSXA5EAGGW3CADHHNW
kind: event
event_kind: finding
created: 2026-08-11T16:40:58Z
created_by: a-slice-auditor-qva3ya
about: "[[001]]"
origin: agent
applied: false
---
Cheap slice-local upgrades enabled by current structure

Because AuthService is a single singleton behind the store (services/auth.ts, imported only by stores/auth.ts), these are low-blast-radius: (1) Fix the stale-token bug in ONE place — replace the localStorage snapshot in stores/auth.ts:44-46 with an axios interceptor that calls auth.currentUser.getIdToken() (services/axios.ts:13), deleting the localStorage['token'] dance entirely; every fetchAPI caller benefits, no call sites change. (2) Add AuthService.deleteAccount() (deleteUser + delete users/{uid} + userTags doc) and wire ProfileView.vue:62 to it — the confirmation UI already exists (ProfileView.vue:218-253), only the handler is a stub. (3) Move utils/userTagGenerator.ts into src/features/auth/services and wrap createUserTagForNewUser/updateUserTag in a Firestore runTransaction to close the TOCTOU race — all tag logic already funnels through two methods. (4) Delete the dead isAdmin getter (stores/auth.ts:24-34) or, if admin is real, move it to a custom claim + firestore.rules; the getter has zero importers so removal is safe. None require touching the 17 store consumers.
