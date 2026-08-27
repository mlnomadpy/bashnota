---
id: t-01M0N2YJ0CGHNXDH7ZWVQQSZK5
kind: task
created: 2026-08-22T15:55:36Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 4, probable: 8, pessimistic: 13}"
parent: "[[t-01M0N2XJE6PA1ZHYNA67CYQF93]]"
---
# Audit Supabase backend, data migration, RLS, Auth, Storage, and clients
## Acceptance
- [x] Inventory every schema object, RLS policy, grant, SECURITY DEFINER RPC, trigger, migration, generated type, and browser/service-role boundary with file:line evidence
- [x] Run a clean local Docker reset, pgTAP, lint, browser-key Auth/publishing/community/storage integrations, and migration rehearsal where the environment permits
- [x] Adversarially test owner/anon/cross-tenant access, counter races, hierarchy integrity, rollback/idempotency, and secret leakage
- [x] Deduplicate every proposed finding against existing Supabase tasks and document unmet external-only gates separately
## Log
- 2026-08-22T15:56:28Z claimed by a-supabase-reviewer-zbn31x
- 2026-08-22T16:57:58Z completed by a-root
