---
id: f-fix-stop-type-check-emitting-into-src-add-composite-true-noemit-true-to-the
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-tooling-reviewer-mfed01
about: "[[t-01KZRSXR3BZN6YK9YG0VCZMVPW]]"
origin: tsconfig.app.json:5
source_event: 01KZRTJD7QKMXNGM6WMJT4311G
---
# FIX: stop type-check emitting into src — add composite:true + noEmit:true to the three referenced tsconfigs
Root cause: type-check runs 'vue-tsc --build' (package.json:12) over tsconfig.json's references, but the referenced leaf projects never set composite:true (build mode's requirement) and only inherit noEmit from @vue/tsconfig; that hybrid lets emit leak into src/. Exact diff (TS 5.7.3 supports composite+noEmit under --build):\n\n# tsconfig.app.json  compilerOptions +=\n     "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",\n+    "composite": true,\n+    "noEmit": true,\n\n# tsconfig.vitest.json  compilerOptions +=\n     "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.vitest.tsbuildinfo",\n+    "composite": true,\n+    "noEmit": true,\n\n# tsconfig.node.json  compilerOptions +=  (already has noEmit:true)\n+    "composite": true,\n\nAlso add a gitignore guard so any future stray emit cannot be committed: append to .gitignore  ->  /src/**/*.js  and  /src/**/*.d.ts.map  (currently .gitignore only ignores *.tsbuildinfo at line 49 and dist at line 92, so emitted src .js would show up untracked). Verified by reading the chain (tsconfig.json:3-13 -> tsconfig.app.json:2 -> node_modules/@vue/tsconfig/tsconfig.json:4 noEmit:true); NOT verified by executing vue-tsc — the read-only sandbox denied npx/node tsc.
