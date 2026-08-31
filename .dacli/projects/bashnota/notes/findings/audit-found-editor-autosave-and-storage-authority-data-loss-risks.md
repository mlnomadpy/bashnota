---
id: f-audit-found-editor-autosave-and-storage-authority-data-loss-risks
kind: note
note_kind: finding
created: 2026-08-31T00:15:01Z
created_by: a-root
about: "[[t-01M1AJ9H1RS4RFAPPCK6J20PX1]]"
severity: major
scope: project
origin: src/features/editor/components/NotaEditor.vue:92
---
# Audit found editor autosave and storage authority data-loss risks
Confirmed: the edit queue drops the triggering edit at capacity and retains applied entries; app mounting races storage adapter initialization; configured filesystem mode can silently fall back while UI still reports filesystem; block structure cleanup uses notaId as an auto-increment primary key. Supabase authorization, execution iframe isolation, credential persistence, and Jupyter transport controls are generally strong. Read-only reviewer transcript was independently reconciled by root.
