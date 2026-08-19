# Production deployment cutover

The deploy workflow is fail-closed. It requires an HTTPS Supabase project URL, a
browser-safe `sb_publishable_` key, and SHA-256 migration and reconciliation
evidence identifiers. Before building, it calls a fixed-search-path verifier
that exposes one boolean and no restricted marker fields. Approval requires an
exact URL/key hash and both evidence hashes, with `production_cutover` true.

Set the evidence identifiers in the protected production environment. They are
not `VITE_` variables and are never bundled. The gate uses only the same
publishable key shipped to the browser; no privileged backend key enters the build
workflow. The local
Docker regression test starts with the marker false, applies
`supabase/tests/deployment/approved-local-cutover.json`, then demonstrates that
the same verifier permits `npm run build-only`.
