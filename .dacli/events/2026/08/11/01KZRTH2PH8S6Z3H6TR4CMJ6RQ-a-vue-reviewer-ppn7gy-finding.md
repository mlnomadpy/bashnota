---
id: 01KZRTH2PH8S6Z3H6TR4CMJ6RQ
kind: event
event_kind: finding
created: 2026-08-11T16:29:42Z
created_by: a-vue-reviewer-ppn7gy
about: "[[t-01KZRSXR2NWWQWDQXHT68B2EGW]]"
origin: src/features/editor/components/blocks/executable-code-block/composables/useCodeBlockExecutionSimplified.ts:26
applied: true
---
availableServers computed triggers a store data-load action as a side effect

The availableServers computed getter (26-32) calls jupyterStore.loadServers() when jupyterServers is empty (28-30). Computed getters must be pure reads; here the getter performs a data-loading store mutation as a lazy side effect. loadServers() mutates jupyterServers, which is a dependency of this computed, so it can cause re-evaluation churn and makes the computed fire I/O on first access. Fix: load servers explicitly in onMounted/store init and keep the computed a pure return of jupyterStore.jupyterServers.
