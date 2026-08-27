---
id: f-local-reviewer-could-not-reproduce-two-environment-dependent-checks
kind: note
note_kind: finding
created: 2026-08-13T21:54:33Z
created_by: a-supabase-local-reviewer-fdmcw2
about: "[[001]]"
severity: minor
---
# Local reviewer could not reproduce two environment-dependent checks
npm run test:rules exits 127 because package.json:13 invokes firebase but firebase-tools is neither installed locally nor declared at package.json:devDependencies; npm run test:iframe-security reached e2e/iframe-output-sandbox.browser.mjs:50 but Chrome returned no rendered output in this sandbox. Contract verification, 432 unit tests, and production build pass.
