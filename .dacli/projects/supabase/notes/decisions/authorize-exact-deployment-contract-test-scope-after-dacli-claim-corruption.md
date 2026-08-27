---
id: d-authorize-exact-deployment-contract-test-scope-after-dacli-claim-corruption
kind: note
note_kind: decision
created: 2026-08-19T13:23:28Z
created_by: a-root
about: "[[015]]"
---
# Authorize exact deployment contract test scope after dacli claim corruption
## Chose
Authorize exact deployment contract test scope after dacli claim corruption
## Rejected
Discard the verified changes or bypass governance with a plain git commit
## Because
The files are directly required to pin the deployment and continuously execute its regression test; dacli issue #725 corrupted the accepted spawn claims.
