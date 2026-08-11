---
id: 01KZRV5NABKF8N8M0NQ7KMG88A
kind: event
event_kind: finding
created: 2026-08-11T16:40:56Z
created_by: a-slice-auditor-qtj7yr
about: "[[001]]"
origin: agent
applied: false
---
Route + data-source map for the bashhub slice (Firebase vs local storage)

ROUTES this slice serves (router/index.ts): '/' -> HomeView.vue (index.ts:10); '/@:userTag' -> UserPublishedView.vue (index.ts:76); '/u/:userId' -> UserPublishedView.vue (index.ts:89). (Note: '/@:userTag/:notaId' and '/p/:id' public-nota routes go to features/nota/PublicNotaView, not this slice, but that view calls bashhub's statisticsService.) DATA SOURCES: HomeView reads notas from notaStore.loadNotas() -> databaseAdapter (Dexie IndexedDB or .nota filesystem, per USE_NEW_STORAGE) — LOCAL only, no Firebase (HomeView.vue:79); useFilesystemNotas reads .nota files via FileSystemBackend/File System Access API — LOCAL (useFilesystemNotas.ts:58-63); useHomePreferences reads/writes viewType/filters via VueUse useLocalStorage — LOCAL (useHomePreferences.ts:17-31); HomeHeader fetches GitHub stars from api.github.com — EXTERNAL HTTP (HomeHeader.vue:74); useNewsletter writes newsletterSubscriptions/{uid} — FIREBASE Firestore (useNewsletter.ts:21-28). UserPublishedView: userTag->uid lookup reads userTags/{tag} then falls back to users where userTag== (FIREBASE, UserPublishedView.vue:209,237); profile image reads users/{uid} (FIREBASE, :652); published-notas list via notaStore.getPublishedNotasByUser -> REST fetchAPI /nota/user/:id (BACKEND API, nota.ts:1173) plus per-nota statisticsService.getStatistics -> publishedNotas/{id} (FIREBASE, statisticsService.ts:367); unpublish via notaStore (LOCAL + backend). statisticsService throughout reads/writes publishedNotas/{id}, publishedNotaViewers/{id}, users/{id} — FIREBASE Firestore.
