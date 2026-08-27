---
id: t-01M0D6HV7JDJFXKJYY892MFGV2
kind: task
created: 2026-08-19T14:24:39Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 2, probable: 3, pessimistic: 5}"
---
# Audit post-cutover security, auth, storage, and Supabase boundaries
## So that
the Supabase-only runtime is challenged for exploitable authorization, secret, deployment, and migration failures before further feature work
## Acceptance
- [x] Inspect auth, RLS/RPCs, Storage, deployment workflows, migration tooling, and browser trust boundaries without editing source
- [x] Reproduce and prioritize every actionable finding with exact file/line evidence and a failing command or test where practical
- [x] For each major finding, propose a deduplicated task with independently checkable acceptance criteria and a three-point estimate
- [x] Report an explicit ACCEPT/BLOCK verdict and the verification commands run
## Log
- 2026-08-19T14:25:29Z claimed by a-supabase-reviewer-xtdynr
- 2026-08-19T14:40:56Z accepted by a-root
- 2026-08-19T14:40:56Z closed WITHOUT verification — no --verify command was given
- 2026-08-19T14:40:56Z completed by a-root
