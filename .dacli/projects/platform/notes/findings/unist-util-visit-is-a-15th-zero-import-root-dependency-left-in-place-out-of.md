---
id: f-unist-util-visit-is-a-15th-zero-import-root-dependency-left-in-place-out-of
kind: note
note_kind: finding
created: 2026-08-11T16:59:53Z
created_by: a-fixer-e3zd2c
about: "[[007]]"
severity: minor
---
# unist-util-visit is a 15th zero-import root dependency, left in place (out of scope for the named 14)
package.json:101 'unist-util-visit'@5.0.0 has zero import/require occurrences repo-wide (ripgrep across worktree, node_modules gitignore-excluded, package-lock.json/package.json excluded: 0 matches). It is part of the same abandoned unified/remark pipeline as the removed unist/remark-parse/unified. The wave-1 tooling review (01KZRTGM7P) excluded it from its named 14 ('unist-util-visit is the real one'), so I left it to match task 007's acceptance criterion exactly. Recommend a follow-up cleanup task remove it too.
