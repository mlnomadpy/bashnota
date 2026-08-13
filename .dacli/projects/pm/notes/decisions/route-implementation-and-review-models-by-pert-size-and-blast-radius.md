---
id: d-route-implementation-and-review-models-by-pert-size-and-blast-radius
kind: note
note_kind: decision
created: 2026-08-13T15:59:14Z
created_by: a-root
---
# Route implementation and review models by PERT size and blast radius
## Chose
Route implementation and review models by PERT size and blast radius
## Rejected
Use one frontier model for every task or always accept the cheapest capacity match
## Because
Calibrated implementation cost is roughly 6.7k-8.2k tokens per point. Terra handles bounded work at Te <=8; Sol handles Te >8 and schema, persistence, security, or editor-foundation changes. Independent review may escalate to Sol even when Terra implemented the change. The first cycle validated this: Terra completed PM-005 cheaply, while Sol review caught live-schema, persistence, lockfile, ID-collision, and Draw.io protocol defects that green tests missed.
