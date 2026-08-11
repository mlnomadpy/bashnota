---
id: d-task-011-unblocked-by-root-after-a-manual-conflict-resolution-outside-dacli
kind: note
note_kind: decision
created: 2026-08-11T19:45:37Z
created_by: a-root
---
# Task 011 unblocked by root after a manual conflict resolution outside dacli integrate
## Chose
Task 011 unblocked by root after a manual conflict resolution outside dacli integrate
## Rejected
re-running dacli integrate on 011
## Because
dacli integrate correctly refused to merge 011 because of a conflict in TextEditingSettings.vue. The conflict was SEMANTIC, not textual: 011 branched before 009 landed and removed onUnmounted as an unused import, which would have reverted 009's MutationObserver leak fix. Auto-resolution either way would have been wrong, so root merged by hand taking 009's version and committed at 809fa36. The task record was left blocked; this closes it and states why. Lesson recorded in the retro: branches touching overlapping files must be integrated in dependency order, not spawned as a flat wave.
