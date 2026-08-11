---
id: d-removed-unused-imports-with-a-typescript-ast-codemod-that-only-edits
kind: note
note_kind: decision
created: 2026-08-11T17:22:08Z
created_by: a-fixer-mrwz72
about: "[[011]]"
---
# Removed unused imports with a TypeScript-AST codemod that only edits ImportDeclaration nodes; kept all 206 assigned values
## Chose
Removed unused imports with a TypeScript-AST codemod that only edits ImportDeclaration nodes; kept all 206 assigned values
## Rejected
eslint --fix / regex line-deletion / bulk-deleting all 573 no-unused-vars
## Because
no-unused-vars is not eslint-autofixable and unused-imports plugin is not installed (sandbox forbids install). A regex over source lines cannot reliably narrow multi-specifier imports or handle .vue script blocks. The TS compiler API (ts 5.7.3, already a dep) parses precisely and, by only touching ImportDeclaration specifiers, is structurally incapable of deleting an assigned value — which the acceptance forbids. Bulk-deleting all 573 was rejected outright: root proved (NotaEditor:952) that an unused assigned value can be a data-loss bug whose only evidence is the unused var. Result verified: type-check 0 errors, 338 tests pass, build ok, 600->347 violations.
