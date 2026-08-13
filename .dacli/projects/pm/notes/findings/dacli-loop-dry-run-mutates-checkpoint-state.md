---
id: f-dacli-loop-dry-run-mutates-checkpoint-state
kind: note
note_kind: finding
created: 2026-08-13T15:00:55Z
created_by: a-root
severity: moderate
---
# dacli loop dry-run mutates checkpoint state
On 2026-08-13, two consecutive `dacli loop --dry-run` previews advanced `pm.txt` cycle from 3 to 5 and `pm-governor.txt` zero-streak from 3 to 5, then set status to halt despite launching no work. Root reset only the derived checkpoint after tasks 003 and 004 actually landed; run/task history was preserved. Dry-run should not mutate loop state.
