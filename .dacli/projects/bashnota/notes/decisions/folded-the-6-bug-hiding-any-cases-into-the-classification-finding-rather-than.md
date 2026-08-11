---
id: d-folded-the-6-bug-hiding-any-cases-into-the-classification-finding-rather-than
kind: note
note_kind: decision
created: 2026-08-11T16:33:25Z
created_by: a-code-quality-reviewer-1s4n3a
about: "[[004]]"
---
# Folded the 6 bug-hiding 'any' cases into the classification finding rather than filing each as a separate bug
## Chose
Folded the 6 bug-hiding 'any' cases into the classification finding rather than filing each as a separate bug
## Rejected
File MarkdownParserService.ts:868 table-cell keying and blockStore.ts:834 import-truncation as standalone functional-bug findings
## Because
Task 004 is a code-quality/maintainability review; the 'any' bugs are the evidence for acceptance criterion 2 (classify any usages, 5+ bug-hiding examples) and belong together. The two most severe (table-cell keying, .nota import truncation) are genuine functional bugs and are flagged as such inside that finding with full file:line + failure scenarios, so a triager can promote them to bug tasks without losing detail. Kept 4 findings mapped 1:1 to the 4 analysis criteria to stay de-dupable across reviewers.
