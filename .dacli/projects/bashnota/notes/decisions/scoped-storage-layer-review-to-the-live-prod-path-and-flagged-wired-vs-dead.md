---
id: d-scoped-storage-layer-review-to-the-live-prod-path-and-flagged-wired-vs-dead
kind: note
note_kind: decision
created: 2026-08-11T16:25:10Z
created_by: a-data-reviewer-1hm2w7
about: "[[009]]"
---
# Scoped storage-layer review to the live prod path and flagged wired-vs-dead-code explicitly
## Chose
Scoped storage-layer review to the live prod path and flagged wired-vs-dead-code explicitly
## Rejected
Report every latent bug in MigrationService/CachedStorageService/FileWatcher as an active data-loss risk
## Because
MigrationService, CachedStorageService, and FileWatcherService are all fully built and unit-tested but have zero production callers (confirmed by grep). Treating their internal flaws as live incidents would overstate current risk. The genuinely user-visible defect is the opposite: features users can toggle in Settings (mode switch, auto-watch, real-time sync) silently do nothing because the wiring was never completed. Each finding states whether the code is on the live path so triage can rank apparent-data-loss (mode switch) above hypothetical (unwired migration internals).
