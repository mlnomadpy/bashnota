---
id: d-preserve-the-completed-editoraiactions-rename-and-explicit
kind: note
note_kind: decision
created: 2026-08-13T14:36:28Z
created_by: a-codex-fixer-71x5hx
about: "[[002]]"
---
# Preserve the completed editorAiActions rename and explicit useEditorAIActionsStore API
## Chose
Preserve the completed editorAiActions rename and explicit useEditorAIActionsStore API
## Rejected
Replace the overlapping implementation with the narrower aiCodeActions id-only edit
## Because
The existing coherent patch already distinguishes both the Pinia id and hook name, updates every whole-repo consumer, and documents the store at src/features/settings/components/ai/README.md:97. Preserving it avoids overwriting concurrent work; npx vite build and all 347 Vitest tests pass. This supersedes the earlier proposed aiCodeActions naming decision.
