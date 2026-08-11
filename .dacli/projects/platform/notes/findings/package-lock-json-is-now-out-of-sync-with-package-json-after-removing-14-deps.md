---
id: f-package-lock-json-is-now-out-of-sync-with-package-json-after-removing-14-deps
kind: note
note_kind: finding
created: 2026-08-11T16:59:57Z
created_by: a-fixer-e3zd2c
about: "[[007]]"
severity: moderate
---
# package-lock.json is now out of sync with package.json after removing 14 deps; operator must run npm install before CI npm ci
Task 007 removed 14 dependencies from package.json (i, install, npm, radix-vue, vue-toast-notification, localforage, mathjax, mathjax-full, @codemirror/gutter, @codemirror/highlight, unist, html-to-markdown, remark-parse, unified). Per the fixer sandbox rules ('Do not install'; edit package.json and report), I did NOT run npm install, so package-lock.json still lists these. Local 'npx vite build' and 'npx vitest run' both work because node_modules is untouched, but 'npm ci' (used by CI/deploy.yml) requires lock and package.json to be in sync and would fail. Operator: run 'npm install' at integration to regenerate the lock, then commit it.
