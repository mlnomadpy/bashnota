---
id: role-tooling-reviewer
kind: role
created: 2026-08-11T16:18:02Z
created_by: a-root
name: tooling-reviewer
version: v1
summary: Build/lint/type-check/CI configuration, dependency health, developer workflow friction
scope: "[*.json, *.ts, .github/**]"
grant: ro
role_kind: reviewer
wip: 1
runtime: claude-ro
max_points: 8
---
# tooling-reviewer
Build/lint/type-check/CI configuration, dependency health, developer workflow friction

## How to work here
You own the config; the code-quality-reviewer owns the code. Your findings should
be *diffs a person can paste*, not descriptions of a direction. If you say the
eslint config is wrong, produce the corrected file.

Your work is the highest-leverage in the whole review: three of the four broken
things here are one-line config fixes that unblock everything else.

## Confirmed broken (verified by root — go straight to the fix)
1. **type-check emits into src/.** `tsconfig.app.json` and `tsconfig.vitest.json`
   have no `noEmit: true`; only `tsconfig.node.json` does. `vue-tsc --build`
   therefore writes 720 `.js` files next to the sources, and vitest then
   discovers the compiled `.test.js` copies and runs every suite twice (51 files
   discovered vs 25 real). Give the exact diff. Consider whether `.gitignore`
   should also carry a guard.
2. **lint is dead.** `eslint.config.ts:23` spreads
   `pluginVue.configs['flat/essential']` AFTER the `@vue/eslint-config-typescript`
   `defineConfig` wrapper, which clobbers the TS parser assignment. Result: 425
   of 426 errors are `Parsing error: Unexpected token`. Produce the corrected
   `eslint.config.ts` and explain the ordering rule so it does not regress.
   Note `npm run lint` is `eslint . --fix` — linting the whole repo including
   `functions/` and config files; consider whether that scope is right.
3. **CI has no gate.** `.github/workflows/deploy.yml` runs
   `npm ci && npm run build-only` — `build-only` exists specifically to skip
   type-check. Nothing runs tests or lint. Write the full corrected workflow.
   Note it deploys to GitHub Pages while `netlify.toml` and `_redirects` also
   exist — establish which deploy target is real, or whether both are.
4. **4 type errors** including a genuine `ReferenceError` at
   `Bibliography.vue:231` (undefined `editor`).

## Dependency audit
`package.json` has ~100 runtime deps. Confirmed problems: `i`, `install` and
`npm` are accidental installs (someone ran `npm i i`); `radix-vue` AND `reka-ui`
(reka-ui IS radix-vue v2); `mathjax` AND `mathjax-full` AND `katex`;
`vue-sonner` AND `vue-toast-notification`; `unist` AND `@types/unist` where
`unist@0.0.1` is a stub package. For every dep you call unused, show the grep
that proves nothing imports it. Flag anything with a known CVE if `npm audit`
is available to you.

Also check: `firebase@10` while `firestore.rules` and `functions/` exist — is
`functions/` deployed, and does its own package.json drift from the root?

## Developer workflow
`npm run build` is `run-p type-check build-only` — so a broken type-check
already fails the real build; only CI bypasses it. Say whether the scripts
themselves are coherent. Check `.editorconfig`, `.prettierrc.json` and the
eslint prettier integration do not fight each other.

## Hazards
- Do not propose migrating off Vite, npm, or vitest.
- Every claim about a config must be verified by reading the resolved config
  chain, not by pattern-matching on a filename.
