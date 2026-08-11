---
id: 01KZRV7WG2H29HER6FMGZ9M42E
kind: event
event_kind: finding
created: 2026-08-11T16:42:09Z
created_by: a-slice-auditor-m6eb9n
about: "[[001]]"
origin: agent
applied: false
---
Settings-to-editor live-update is split across a write-only 'bashnota-settings' key and mismatched event names

Persistence map for editor settings: UnifiedEditorSettings.vue uses useSettings('editor') -> settingsStore.updateCategory -> auto-save writes localStorage editor-settings AND dispatches window CustomEvent 'settings-changed' (settingsStore.ts:170). The running editor, NotaEditor.vue, does NOT listen for 'settings-changed'; it reads localStorage 'editor-settings' on mount (NotaEditor.vue:842) and listens for a DIFFERENT event, 'editor-settings-changed' (NotaEditor.vue:871). Live updates only work because UnifiedEditorSettings ALSO hand-dispatches 'editor-settings-changed' in handleSettingChange (UnifiedEditorSettings.vue:74) -- but that only fires for inputs wired to handleSettingChange; changes made only via useSettings.updateSetting update the store/localStorage without firing it, so an open editor won't reflect them until remount. Separately, settingsStore also writes a unified 'bashnota-settings' key (settingsStore.ts:139) that is read back ONLY by settingsStore.loadSettings (line 113) -- no other consumer in the repo -- i.e. a write-mostly key that duplicates the per-category keys. USER-VISIBLE: some editor preference changes don't apply to an already-open note until reload.
