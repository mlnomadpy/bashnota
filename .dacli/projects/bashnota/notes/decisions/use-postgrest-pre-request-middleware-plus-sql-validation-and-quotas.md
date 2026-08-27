---
id: d-use-postgrest-pre-request-middleware-plus-sql-validation-and-quotas
kind: note
note_kind: decision
created: 2026-08-27T01:13:10Z
created_by: a-security-fixer-3fpv88
about: "[[t-01M10BZYP58YET7T0SEWJP0GZ8]]"
---
# Use PostgREST pre-request middleware plus SQL validation and quotas
## Chose
Use PostgREST pre-request middleware plus SQL validation and quotas
## Rejected
Add a separate Edge Function proxy while leaving browser RPCs reachable
## Because
The existing application talks directly to PostgREST; a proxy would be bypassable. A configured db_pre_request hook and RPC/table constraints cover every existing production path while preserving auth.uid and RLS.
