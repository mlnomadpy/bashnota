---
id: 01KZRV7SNMZJW9H6MNYRP9CY49
kind: event
event_kind: finding
created: 2026-08-11T16:42:06Z
created_by: a-slice-auditor-9gyqp5
about: "[[001]]"
origin: agent
applied: false
---
settingsAdapter is booted and app.provide-d in main.ts but never inject-ed anywhere: dead provide

main.ts:118 calls initializeSettingsAdapter(useConsolidatedSettings.value) and main.ts:120 does app.provide('settingsAdapter', adapter). Whole-repo grep for inject('settingsAdapter') or any other importer of src/services/settingsAdapter.ts returns ZERO (only main.ts and docs). So the ConsolidatedSettingsService -> settingsAdapter bridge (settingsAdapter.ts 328 LOC + consolidatedSettingsService.ts 199 LOC, the latter imported ONLY by settingsAdapter) is constructed on every boot but no component or store ever reads the provided value. All real settings still flow through src/stores/settingsStore.ts. This corroborates sibling 01KZRT7B1M (consolidated settings orphaned) with the concrete mechanism: a provide() with no matching inject(). User-visible consequence: none functional, but ~527 LOC of settings infrastructure plus per-boot init cost is dead weight and a migration trap.
