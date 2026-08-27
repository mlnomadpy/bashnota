---
id: f-github-pages-cannot-serve-direct-application-routes
kind: note
note_kind: finding
created: 2026-08-19T14:38:34Z
created_by: a-root
about: "[[013]]"
severity: major
---
# GitHub Pages cannot serve direct application routes
src/router/index.ts uses createWebHistory while .github/workflows/deploy.yml publishes static dist. The root _redirects file is absent from dist and unsupported by GitHub Pages, so direct public/nota/settings URLs 404.
