---
id: 01KZRV6QV3DAQD3TBH229M0EYR
kind: event
event_kind: finding
created: 2026-08-11T16:41:32Z
created_by: a-slice-auditor-9gyqp5
about: "[[001]]"
origin: agent
applied: false
---
Root src/services/aiService.ts (308 LOC) is dead; sole importer localagents.ts is itself broken

Whole-repo grep for importers of src/services/aiService.ts: the ONLY importer is repo-root localagents.ts:1 (import { AIService } from ./src/services/aiService). No file under src/ imports it; the app's AI provider stack uses a DIFFERENT file, src/features/ai/services/aiService.ts (that one is imported by editor/stores/aiActionsStore.ts and AIProvidersSettings.vue). localagents.ts itself is dead: localagents.ts:2 imports ./src/services/jupyterService which does not exist (jupyterService lives at src/features/jupyter/services/jupyterService.ts), so localagents.ts cannot compile. Net: src/services/aiService.ts is orphaned. Filename collision (two aiService.ts) is the trap. Safe-delete candidate once localagents.ts is removed.
