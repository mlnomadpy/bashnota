---
id: d-used-noemit-true-not-composite-true-in-tsconfig-app-vitest-to-stop-src-js
kind: note
note_kind: decision
created: 2026-08-11T16:58:56Z
created_by: a-fixer-y9jq1t
about: "[[002-fix-the-tooling-trifecta-tsconfig-noemit-eslint-parser-ci-gate]]"
---
# Used noEmit:true (not composite:true) in tsconfig.app/vitest to stop src .js emission
## Chose
Used noEmit:true (not composite:true) in tsconfig.app/vitest to stop src .js emission
## Rejected
Adding composite:true as the acceptance text prescribes
## Because
In TS 5.7.3, composite:true on a --build-referenced project that also has noEmit:true triggers TS6310 'Referenced project may not disable emit', which turns type-check into a hard config failure. @vue/tsconfig base already sets noEmit:true, so the app/vitest projects only needed noEmit made explicit. Empirically, vue-tsc --build --force with this config emits 0 .js under src while composite:true emits none only because it errors out first. noEmit-only is the create-vue-idiomatic, build-green solution.
