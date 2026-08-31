---
id: t-01M0F8AY19HVWF3WBHAC68A8XH
kind: task
created: 2026-08-20T09:34:18Z
created_by: a-root
owner: a-root
github:
  issue: 11
  repo: mlnomadpy/bashnota
estimate: "{optimistic: 5, probable: 8, pessimistic: 13}"
---
# Feature request: reduce bundle size and complete PWA deployment support
## Context
Adopted from GitHub issue #11.

## Objective

Reduce startup cost, make optional AI/scientific features lazy, and make the PWA assets and deployment base paths correct across supported hosts.

## Audit baseline

The production build emits a main JavaScript chunk of roughly 10 MB, about 3.3 MB gzip. The repository ignores `public/` while the PWA configuration references icons and `robots.txt`. Vite also hardcodes `/bashnota/` as the deployment base.

## Primary implementation areas

- `vite.config.ts`
- `src/router/**`
- AI, WebLLM, Mermaid, MathJax, editor-extension and visualization imports
- `.gitignore`
- `public/`
- `netlify.toml` and Firebase/GitHub Pages deployment configuration

## Required changes

- Generate and inspect a Rollup visualizer report.
- Lazy-load WebLLM and model-management code only when local AI is selected.
- Lazy-load Mermaid, MathJax, advanced editor blocks, charts, and export tooling.
- Create stable manual vendor chunks where beneficial.
- Remove packages with no runtime imports.
- Add route-level and feature-level code splitting.
- Add bundle budgets for initial JavaScript, CSS, and largest lazy chunk.
- Track required icons, manifest assets, and `robots.txt`.
- Make the Vite base path environment-aware for Pages, Firebase, Netlify, and custom domains.
- Test service-worker update and cache invalidation across releases.

## Acceptance criteria

- The initial route no longer downloads local-model or advanced scientific-editor code unnecessarily.
- CI fails when the agreed bundle budget regresses materially.
- PWA install has valid icons and no missing tracked assets.
- Direct navigation works on every documented deployment target.
- A before/after report records bundle size and representative load metrics.

## Acceptance
## Log
- 2026-08-28T12:08:05Z claimed by a-bashnota-implementer-p25fv4
- 2026-08-31T20:17:50Z a-root: PR opened: https://github.com/mlnomadpy/bashnota/pull/49 (event 01M146A9Y66D6GB1RKJHD2S43M)
- 2026-08-31T20:17:50Z a-root: Landing policy override: mode=pr base=master (event 01M146SQJKMDRKJFVRVKDWD8V1)
- 2026-08-31T20:17:50Z a-root: Integrated via PR https://github.com/mlnomadpy/bashnota/pull/49 at merge commit 08276ddc091cb73cf0e7f32ec8f4ceff55247990 into master (generation 0) (event 01M146SZBGJAM9AB72997K3FW6)
