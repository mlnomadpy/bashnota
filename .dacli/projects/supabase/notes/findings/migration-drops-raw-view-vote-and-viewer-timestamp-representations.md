---
id: f-migration-drops-raw-view-vote-and-viewer-timestamp-representations
kind: note
note_kind: finding
created: 2026-08-18T13:11:03Z
created_by: a-root
about: "[[t-01KZYG5K04Z71RHFPEWKWGNRPH]]"
severity: major
---
# Migration drops raw view vote and viewer timestamp representations
Transform canonicalizes lastViewedAt, vote timestamps and viewer timestamps but does not retain the raw source representation required for audit/reconciliation. Preserve and reconcile raw fields.
