---
id: 01KZRTGT6EYQZMT82KSNFWQF80
kind: event
event_kind: finding
created: 2026-08-11T16:29:33Z
created_by: a-tooling-reviewer-mfed01
about: "[[t-01KZRSXR3BZN6YK9YG0VCZMVPW]]"
origin: agent
applied: true
---
deploy.yml ships to production with no quality gate — build-only bypasses type-check, and lint/test never run

.github/workflows/deploy.yml is the only workflow. On every push to master (deploy.yml:4-6) it runs exactly 'npm ci' then 'npm run build-only' (deploy.yml:31-34) and deploys dist to GitHub Pages (deploy.yml:36-39). 'build-only' = 'vite build' (package.json:11), which does NOT type-check — the type-check only runs under the 'build' script via run-p (package.json:8), and deploy deliberately calls build-only, not build. So: (1) vue-tsc type errors never block deploy; (2) 'npm run lint' never runs in CI; (3) 'npm run test:unit'/vitest never runs in CI. A broken type, a failing test, or a lint error lands in production unblocked. The job also has no Node version pin (deploy.yml:14 runs-on ubuntu-latest with no actions/setup-node), so the CI Node is whatever the runner ships. Fix: add a gate job (install -> type-check -> lint -> test) that the deploy job 'needs:'.
