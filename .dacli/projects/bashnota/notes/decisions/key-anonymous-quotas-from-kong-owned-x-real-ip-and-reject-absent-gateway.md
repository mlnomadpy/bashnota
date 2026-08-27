---
id: d-key-anonymous-quotas-from-kong-owned-x-real-ip-and-reject-absent-gateway
kind: note
note_kind: decision
created: 2026-08-27T09:55:03Z
created_by: a-supabase-implementer-a3cf9z
about: "[[t-01M10BZYP58YET7T0SEWJP0GZ8]]"
---
# Key anonymous quotas from Kong-owned X-Real-IP and reject absent gateway identity
## Chose
Key anonymous quotas from Kong-owned X-Real-IP and reject absent gateway identity
## Rejected
Select a position from client-supplied X-Forwarded-For
## Because
Kong derives X-Real-IP from the connection peer, while X-Forwarded-For admits arbitrary client prefixes and proxy-hop assumptions; fail-closed parsing plus same-peer poisoning tests closes rotation bypass without trusting attacker input.
