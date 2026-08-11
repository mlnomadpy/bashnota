---
id: 01KZRV63KZ9EF9H3EFFK815TRW
kind: event
event_kind: finding
created: 2026-08-11T16:41:11Z
created_by: a-slice-auditor-cz4f43
about: "[[001]]"
origin: agent
applied: false
---
Multiple shipped block UIs have 'coming soon' stubs wired to buttons users can click

Buttons render and are clickable but do nothing but toast: confusion-matrix ConfusionMatrixBlock.vue:577 'Reload functionality coming soon', :616 'PNG export functionality coming soon', :662 'Report generation functionality coming soon'. pipeline PipelineNode.vue:461-462 'TODO: Implement node-specific cancellation'/'not yet implemented', :475-476 'TODO: Implement output viewer'/'not yet implemented', :1011 TODO server-setup dialog on error. executable-code ExecutableCodeBlock.vue:330 'Implement clear all kernels', :334 'Implement session refresh', :405 'Implement running kernel selection'. citation CitationPicker.vue:596 'Manual citation entry coming soon'; CitationPicker.vue:184 & Citation.vue:292 Google-Scholar import is a placeholder with no API. USER-VISIBLE: dead-end controls that look functional. These are the specific missing pieces behind the 'partial' grades.
