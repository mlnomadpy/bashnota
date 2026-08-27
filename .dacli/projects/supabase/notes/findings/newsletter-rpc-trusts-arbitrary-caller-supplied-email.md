---
id: f-newsletter-rpc-trusts-arbitrary-caller-supplied-email
kind: note
note_kind: finding
created: 2026-08-14T09:26:00Z
created_by: a-root
about: "[[t-01KZYG57FETV6T5AGJF939HCCF]]"
severity: major
---
# Newsletter RPC trusts arbitrary caller-supplied email
upsert_newsletter_subscription derives user_id but stores any p_email, enabling unsolicited victim subscriptions. Derive normalized verified auth.users.email under lock or require exact match; reject mismatches without state change.
