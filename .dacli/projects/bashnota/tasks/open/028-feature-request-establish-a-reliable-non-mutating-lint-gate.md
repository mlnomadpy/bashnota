---
id: t-01M0F8AY4ZRZMGZYR8W773FQQV
kind: task
created: 2026-08-20T09:34:18Z
created_by: a-root
owner: a-root
github:
  issue: 5
  repo: mlnomadpy/bashnota
estimate: "{optimistic: 2, probable: 3, pessimistic: 5}"
---
# Feature request: establish a reliable non-mutating lint gate
## Context
Adopted from GitHub issue #5.

## Objective

Turn ESLint into a reliable, non-mutating quality gate for Vue, TypeScript, tests, and Firebase Functions.

## Current state

The audit produced hundreds of parser errors because the Vue TypeScript configuration helper is used without enabling the recommended TypeScript configuration. The current `lint` script also modifies files through `--fix`, making it unsuitable as a CI check.

## Primary implementation areas

- `eslint.config.ts`
- `package.json`
- Optional backend-specific ESLint configuration

## Required changes

- Use `defineConfigWithVueTs` from `@vue/eslint-config-typescript`.
- Include `vueTsConfigs.recommended` initially; evaluate type-checked rules after the baseline is clean.
- Retain the Vue essential configuration and Vitest rules for test files.
- Add explicit ignores for `dist/`, `coverage/`, `functions/lib/`, generated assets, and dependency directories.
- Split scripts into non-mutating `lint` and mutating `lint:fix` commands.
- Add a separate backend lint target if differing Node/Firebase rules are required.
- Reduce broad rule suppressions gradually and document justified exceptions inline.

## Acceptance criteria

- `npm run lint` makes no filesystem changes.
- Vue SFC and TypeScript syntax is parsed correctly.
- Lint succeeds from a clean checkout and is required by CI.
- `npm run lint:fix` is available for local maintenance.
- New lint suppressions require a reason and a narrow scope.

## Acceptance
## Log
