---
id: f-type-check-emits-720-js-files-into-src-tsconfig-app-json-and-tsconfig-vitest
kind: note
note_kind: finding
created: 2026-08-11T16:16:02Z
created_by: a-root
origin: tsconfig.app.json:1
---
# type-check emits 720 .js files into src/: tsconfig.app.json and tsconfig.vitest.json lack noEmit:true, and vue-tsc --build emits by default. Side effect: vitest discovers compiled .test.js copies and double-runs every suite (51 files instead of 25).
