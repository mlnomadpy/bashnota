---
id: t-01M1CQJ24FSCQQPN55072VMAH4
kind: task
created: 2026-08-31T20:18:19Z
created_by: a-root
owner: a-root
github:
  issue: 69
  repo: mlnomadpy/bashnota
github_acceptance_import:
  issue: 69
  body_digest: sha256:baf0b1653f0152a9882e0e45daa6fe4672c424bef8902351dc94e3061c51cc46
  actor: a-root
  imported_at: 2026-08-31T20:18:19Z
---
# Bug: remove broken Settings destinations and reveal search matches
## Context
Adopted from GitHub issue #69.

## Browser reproduction

1. Open Settings Quick Search and select Performance.
2. Search normal Settings for Jupyter.

## Observed

Performance routes to Settings section unavailable even though a PerformanceSettings component exists. Searching for Jupyter only leaves the collapsed Integrations category visible; the matching destination is not revealed.

## Expected

Every discoverable result resolves to a valid component, and standard search surfaces the exact matching item.

## Acceptance criteria

- Command-palette IDs, routes, and SettingsPanel component keys use one typed registry.
- Invalid or future settings are not discoverable.
- Search expands matching categories and highlights/focuses the matched setting.
- Keyboard selection lands on the rendered panel.
- Tests enumerate every registered settings destination.

## Acceptance
- [ ] Command-palette IDs, routes, and SettingsPanel component keys use one typed registry.
- [ ] Invalid or future settings are not discoverable.
- [ ] Search expands matching categories and highlights/focuses the matched setting.
- [ ] Keyboard selection lands on the rendered panel.
- [ ] Tests enumerate every registered settings destination.
## Log
