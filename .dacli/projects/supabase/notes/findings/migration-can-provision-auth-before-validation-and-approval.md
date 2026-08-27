---
id: f-migration-can-provision-auth-before-validation-and-approval
kind: note
note_kind: finding
created: 2026-08-18T13:11:03Z
created_by: a-root
about: "[[t-01KZYG5K04Z71RHFPEWKWGNRPH]]"
severity: major
---
# Migration can provision Auth before validation and approval
Production entrypoint provisions identities before transform/orphan/quarantine/manifest approval checks. Rejected input can leave unjournaled Auth users/provisioning rows. Complete validation and approval must precede all Admin/API mutation; rejected-input tests must prove zero state change.
