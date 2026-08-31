---
id: t-01M1CQJ2NN8Y510928Y71AMRSQ
kind: task
created: 2026-08-31T20:18:19Z
created_by: a-root
owner: a-root
github:
  issue: 51
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 51
  body_digest: sha256:ce7a0f4ded376d552f30722f17ea6b76934f4e5fc7579fbbcc2caf6a425a99d6
  actor: a-root
  imported_at: 2026-08-31T20:18:19Z
---
# Add a production Docker image for Coolify PWA hosting
## Context
Adopted from GitHub issue #51.

## Objective

Package BashNota as a reproducible production container for custom-domain deployment through Coolify and Traefik.

## Context

The repository currently describes Netlify behavior in `netlify.toml`, but Coolify will not automatically apply those redirects, security headers, MIME types, or cache rules.

## Dependencies

- Coordinate PWA base-path and asset behavior with #11.

## Required work

- Add a multi-stage Dockerfile using the pinned Node 22 release for the build and an unprivileged production web server where practical.
- Run the type-checked production build rather than `build-only`.
- Serve `dist/` with SPA fallback to `/index.html`.
- Reproduce the required CSP, permissions policy, referrer policy, HSTS, content-type, and framing headers from `netlify.toml`.
- Serve `manifest.webmanifest` with the correct MIME type.
- Apply immutable caching only to content-hashed assets while keeping HTML and service-worker update metadata revalidatable.
- Support a root custom-domain deployment with `VITE_DEPLOY_BASE=/`.
- Add an internal container health check suitable for a Coolify Dockerfile application.
- Add container smoke tests for the root route, a deep link, PWA assets, headers, and cache policy.
- Document the Coolify build variables without committing secrets.

## Acceptance criteria

- [ ] `docker build` produces the application from a clean checkout.
- [ ] The container runs without development dependencies or a Vite development server.
- [ ] Root and direct deep-link navigation return the application.
- [ ] PWA install assets and service-worker update behavior pass the existing gates.
- [ ] Security headers match the documented production policy.
- [ ] The image exposes only its internal HTTP port and includes a passing health check.
- [ ] No Supabase secret or service-role credential appears in the image or frontend bundle.

## Acceptance
- [ ] `docker build` produces the application from a clean checkout.
- [ ] The container runs without development dependencies or a Vite development server.
- [ ] Root and direct deep-link navigation return the application.
- [ ] PWA install assets and service-worker update behavior pass the existing gates.
- [ ] Security headers match the documented production policy.
- [ ] The image exposes only its internal HTTP port and includes a passing health check.
- [ ] No Supabase secret or service-role credential appears in the image or frontend bundle.
## Log
