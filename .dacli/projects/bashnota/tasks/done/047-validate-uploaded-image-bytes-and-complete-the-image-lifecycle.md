---
id: t-01M10BZYS4VYEQJ5C7BVE438XZ
kind: task
created: 2026-08-27T01:05:18Z
created_by: a-root
owner: a-root
priority: must
estimate: "{optimistic: 3, probable: 5, pessimistic: 8}"
parent: "[[t-01M0F8AY2FNV61M44CWRKB91KX]]"
github:
  issue: 36
  repo: mlnomadpy/bashnota
---
# Validate uploaded image bytes and complete the image lifecycle
## So that
uploaded content cannot bypass declared MIME checks or leave unbounded orphaned storage
## Acceptance
- [x] Decoded bytes, allowed raster formats, size, and dimensions are validated before storage and active-content or polyglot inputs fail closed
- [x] Upload rollback, explicit deletion, nota deletion, and bounded orphan cleanup preserve referenced images and remove only owned unreferenced images
- [x] Browser-key and backend integration tests cover forged MIME, malformed bytes, limits, ownership, rollback, deletion, and orphan cleanup
- [x] No service-role credential or storage secret reaches browser code, logs, fixtures, or artifacts
## Log
- 2026-08-27T01:09:07Z claimed by a-supabase-implementer-66yyfy
- 2026-08-27T02:19:37Z claimed by a-supabase-implementer-fey0x8
- 2026-08-27T09:43:50Z claimed by a-supabase-implementer-zvcaja
- 2026-08-27T10:25:01Z claimed by a-supabase-implementer-3v0cpm
- 2026-08-27T13:13:15Z accepted by a-root
- 2026-08-27T13:13:15Z verified by `npm run test:supabase:storage` (exit 0) in branch master at b784b16 — proves that tree builds, not that the work is in trunk
- 2026-08-27T13:13:15Z deliverable: dacli/047-validate-uploaded-image-bytes-and-complete-the-image-lifecycle is merged into master
- 2026-08-27T13:13:15Z completed by a-root
- 2026-08-27T22:28:19Z a-root: PR opened: https://github.com/mlnomadpy/bashnota/pull/40 (event 01M11HAM24J62PV2MXV5BX9405)
- 2026-08-27T22:28:19Z a-root: Landing policy override: mode=pr base=master (event 01M11MWADM5D31YJ7CNRW8V29J)
- 2026-08-27T22:28:19Z a-root: Integrated via PR https://github.com/mlnomadpy/bashnota/pull/40 at merge commit 15f43e388a0e6f913b16c6d4be51b6cbb5ba3179 into master (event 01M11MWJ7GEQYMD96F1J71WY1P)
## Verification Evidence
{"command":"npm run test:supabase:storage","exit_code":0,"duration_ms":1594,"artifact_hash":"sha256:c3aaec4d28dfbd749fe82e87dde9d71440d2c2342070bf43b90f305b8dda4ce0","verifier":"a-root","branch":"master","commit_sha":"b784b16ffce33f4c733cc90b4c9089332cd62fb6"}
