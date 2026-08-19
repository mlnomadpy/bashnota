# Production deployment cutover

The deploy workflow is fail-closed. It requires an HTTPS Supabase project URL, a
browser-safe `sb_publishable_` key, SHA-256 migration and reconciliation evidence
identifiers, and a server-only verifier key. Before building, it queries the
restricted `runtime_deployment_state` singleton and proceeds only when
`production_cutover` is true.

Set the evidence identifiers and verifier key only in the protected production
environment. They are not `VITE_` variables and are never bundled. The local
Docker regression test starts with the marker false, applies
`supabase/tests/deployment/approved-local-cutover.json`, then demonstrates that
the same verifier permits `npm run build-only`.
