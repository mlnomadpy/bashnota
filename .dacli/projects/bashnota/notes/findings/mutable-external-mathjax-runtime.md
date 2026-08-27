---
id: f-mutable-external-mathjax-runtime
kind: note
note_kind: finding
created: 2026-08-26T14:11:15Z
created_by: a-root
about: "[[030]]"
severity: major
origin: src/features/editor/composables/useMathJax.ts:100
---
# mutable-external-mathjax-runtime
Production dynamically loads https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js: mutable major tag, executable third-party code, no integrity. Bundle retains the URL. Prefer a locked local dependency/dynamic import and add source+artifact policy plus browser math rendering test.
