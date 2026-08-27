---
id: f-github-pages-deep-link-fallback-is-ready-on-dacli-017-restore-direct-deep-links
kind: note
note_kind: finding
created: 2026-08-19T14:45:21Z
created_by: a-codex-fixer-terra-f012wn
about: "[[017]]"
severity: moderate
---
# GitHub Pages deep-link fallback is ready on dacli/017-restore-direct-deep-links-on-github-pages
vite.config.ts:13-24 copies the generated index shell to dist/404.html; scripts/github-pages-deep-links.self-test.mjs directly requests public, auth callback/reset, settings, encoded local nota, query, and hash destinations against a static fallback. All required local checks passed: build, test:github-pages-deep-links, test:deploy-workflow, Vitest (424 pass/1 skipped), type-check, backend-purity, and diff-check.
