---
id: 01KZRT9H3R5624WHV5DP15FR2V
kind: event
event_kind: finding
created: 2026-08-11T16:25:35Z
created_by: a-tooling-reviewer-mfed01
about: "[[t-01KZRSXR3BZN6YK9YG0VCZMVPW]]"
origin: agent
applied: true
---
type-check uses vue-tsc --build with references that lack composite:true — an internally inconsistent tsconfig chain

package.json:12 sets type-check="vue-tsc --build". Build/solution mode is driven by tsconfig.json:3-13 which has files:[] and references [tsconfig.node.json, tsconfig.app.json, tsconfig.vitest.json]. TypeScript build mode (tsc -b / vue-tsc --build) REQUIRES every referenced project to set compilerOptions.composite:true (else TS6306). NONE of the three leaf configs set composite. Meanwhile the emit guard noEmit:true is only present because it is INHERITED from @vue/tsconfig/tsconfig.json (node_modules/@vue/tsconfig/tsconfig.json:4) via tsconfig.app.json:2 -> tsconfig.dom.json -> tsconfig.json; tsconfig.app.json and tsconfig.vitest.json never restate it. This is a fragile hybrid: build-mode semantics (which force per-project emit for composite projects) sit on top of an inherited noEmit that any override could silently drop, allowing vue-tsc to emit .js/.d.ts into src/. NOTE: I could not execute vue-tsc to reproduce the emit count — the read-only sandbox denied npx/node tsc — so the '720 .js' figure is verified by config-chain reading only, not by running the compiler.
