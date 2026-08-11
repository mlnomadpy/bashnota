---
id: 01KZRT7RV7CKX43NTAAYFJ30B4
kind: event
event_kind: finding
created: 2026-08-11T16:24:37Z
created_by: a-data-reviewer-1hm2w7
about: "[[t-01KZRSXR3X7GZNARQBY6SZRRMC]]"
origin: src/services/fileWatcherService.ts:208
applied: true
---
FileWatcherService onFileDeleted never fires — snapshot map reassigned before the delete-notify loop reads it

In checkForChanges(), deletedFiles is computed correctly from the OLD this.fileSnapshots (line 201, before reassignment). But line 208 does 'this.fileSnapshots = currentSnapshots' BEFORE the deletion-notification loop at lines 245-253, which then calls 'const oldSnapshot = this.fileSnapshots.get(name)' (line 248) against the NEW map. A deleted file is by definition absent from currentSnapshots, so oldSnapshot is always undefined and the 'if (oldSnapshot)' guard means this.options.onFileDeleted?.() is NEVER invoked. Even once the watcher is actually started (see companion finding), deletions of .nota files on disk would be silently ignored while additions/modifications work. Fix: capture the snapshot into a local before reassigning, or pass snapshot.notaId (already in scope in the deletedFiles loop) directly.
