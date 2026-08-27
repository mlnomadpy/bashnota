---
id: f-external-verification-runtimes-invalid
kind: note
note_kind: finding
created: 2026-08-26T13:32:51Z
created_by: a-root
about: "[[bashnota/015-make-filesystem-notas-self-contained-and-atomic]]"
severity: moderate
---
# external-verification-runtimes-invalid
Dacli runtime doctor on 2026-08-26 reports all configured adapters use invalid legacy context capability declarations; codex-ro additionally fails the read-only sandbox probe with app-server Operation not permitted. The prior verify claim produced no verdict and was killed. Independent in-process read-only review is required; do not represent dacli verify as passing.
