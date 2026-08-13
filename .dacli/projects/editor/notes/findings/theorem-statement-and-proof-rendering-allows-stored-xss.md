---
id: f-theorem-statement-and-proof-rendering-allows-stored-xss
kind: note
note_kind: finding
created: 2026-08-13T20:28:46Z
created_by: a-root
severity: major
scope: project
origin: src/features/editor/components/blocks/theorem-block/MixedContentDisplay.vue:3
---
# Theorem statement and proof rendering allows stored XSS
Persisted theorem statement/proof text is wrapped and MathJax-substituted without sanitization, then injected via v-html; the renderer-error path assigns raw content. Mounted transform reproduction retained img onerror. Deferred behind the critical same-origin executable-output iframe escape; next security cycle should use isolated sanitizer policy with MathJax-safe normal/error tests.
