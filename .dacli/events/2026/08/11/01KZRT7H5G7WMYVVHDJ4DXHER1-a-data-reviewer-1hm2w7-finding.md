---
id: 01KZRT7H5G7WMYVVHDJ4DXHER1
kind: event
event_kind: finding
created: 2026-08-11T16:24:29Z
created_by: a-data-reviewer-1hm2w7
about: "[[t-01KZRSXR3X7GZNARQBY6SZRRMC]]"
origin: src/composables/useStorageMode.ts:152
applied: true
---
File watcher never started in the running app — 'real-time sync' is inert; external .nota edits never reflected

The polling FileWatcherService (fileWatcherService.ts) is fully implemented, but the only function that wires it — initializeFileWatcher() in useStorageMode.ts:152-179 — has NO caller anywhere (grep: only its definition and its return in the composable object). The module-level 'fileWatcher' var (useStorageMode.ts:23) therefore stays null forever: handleAutoWatchChange's fileWatcher.start() (line 90-98) and switchToIndexedDB's fileWatcher.stop() are guarded by 'if (fileWatcher)' and no-op; isWatchingFiles (line 114) is always false. User-visible consequences: (a) the Settings UI 'File watcher is active/inactive' badge (StorageModeSettings.vue:232-237) is permanently 'inactive' even with Auto-Watch on; (b) the advertised benefits 'Real-time synchronization with file system' / 'Works across multiple instances' (StorageModeSettings.vue:246-247) and getModeDescription 'Changes to files in the folder are reflected in real-time' (useStorageMode.ts:192) are false — edits made to a .nota file by another editor, another BashNota tab, or git are never picked up while the app is open; the nota store's in-memory copy only refreshes on reload. This is the concrete user-facing consequence of the watchDirectory TODO area (fileSystemBackend.ts:264): the backend's own watchDirectory is an empty stub, and the alternative service meant to replace it is never turned on.
