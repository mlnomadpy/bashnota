---
id: t-01M0F8AY2FNV61M44CWRKB91KX
kind: task
created: 2026-08-20T09:34:18Z
created_by: a-root
owner: a-root
github:
  issue: 9
  repo: mlnomadpy/bashnota
estimate: "{optimistic: 8, probable: 13, pessimistic: 21}"
---
# Feature request: harden APIs, uploads, credentials, and Jupyter trust boundaries
## Context
Adopted from GitHub issue #9.

## Objective

Harden the public API, image pipeline, AI-key storage, and Jupyter credential boundary without removing local-first functionality.

## Primary implementation areas

- `functions/src/index.ts`
- `functions/src/routes/*.ts`
- `functions/src/utils/ImageUploadService.ts`
- `src/features/ai/stores/aiSettingsStore.ts`
- `src/features/jupyter/**`
- `src/services/codeExecutionService.ts`
- `src/services/logger.ts`

## Required changes

- Add security headers and production-safe middleware defaults.
- Add per-IP and per-account rate limits to expensive or mutating routes.
- Add Firebase App Check where compatible with the product flow.
- Bound pagination and allowlist sortable fields.
- Validate IDs, content lengths, comment lengths, nesting, and relationships.
- Replace `req.user` suppressions with a typed authenticated request.
- Verify uploaded image bytes rather than trusting a declared data-URL MIME type.
- Reject unsupported active-content formats and enforce file-size/dimension limits.
- Add image deletion and orphan-cleanup behavior.
- Stop logging URLs containing credentials and add central redaction.
- Prefer authorization headers over query parameters where protocols support them.
- Store AI keys in memory/session scope by default, or route provider calls through a controlled backend.
- Require explicit user confirmation and HTTPS/WSS policy for non-local Jupyter servers.
- Document the authority granted by executing notebook code.

Do not add production endpoints, credentials, or exploit demonstrations to this public issue.

## Acceptance criteria

- Logs and error reports cannot contain provider keys, Firebase tokens, or Jupyter tokens.
- Unbounded requests and unsupported sort fields are rejected before database access.
- Uploads are validated by decoded content and have a complete lifecycle.
- Credential-storage behavior and local-execution risks are visible to users and documented.
- Integration tests cover authentication, authorization, rate limiting, input bounds, and redaction.

## Acceptance
## Log
- 2026-08-27T22:35:13Z claimed by a-supabase-implementer-ff8yqc
- 2026-08-27T22:50:54Z claimed by a-supabase-implementer-j24ccn
- 2026-08-27T23:08:17Z claimed by a-supabase-implementer-6wsvjy
- 2026-08-28T00:23:13Z claimed by a-bashnota-implementer-a7qe25
- 2026-08-28T09:52:25Z claimed by a-bashnota-implementer-s4d82d
- 2026-08-28T10:05:52Z a-root: Landing policy override: mode=pr base=master (event 01M13W66JBGYS1X11R3TYT6E3E)
- 2026-08-28T10:05:52Z a-root: Integrated via PR https://github.com/mlnomadpy/bashnota/pull/43 at merge commit 6fd87cd2863fe6f5871fd88cdcf524dc22301fde into master (generation 0) (event 01M13W6DX0EACAY6VW5Z1KHM6Z)
