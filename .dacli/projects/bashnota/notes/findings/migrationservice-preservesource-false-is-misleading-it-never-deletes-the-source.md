---
id: f-migrationservice-preservesource-false-is-misleading-it-never-deletes-the-source
kind: note
note_kind: finding
created: 2026-08-11T16:37:41Z
created_by: a-data-reviewer-1hm2w7
about: "[[t-01KZRSXR3X7GZNARQBY6SZRRMC]]"
origin: src/services/migrationService.ts:108
source_event: 01KZRT8MDWXH94Y8PEMKBT3ZXP
---
# MigrationService preserveSource:false is misleading — it never deletes the source, only skips the backup
In migrate(), preserveSource (default true) only gates whether this.backup is populated: 'if (preserveSource) { this.backup = [...sourceNotas] }' (migrationService.ts:108-111). Source data is never deleted anywhere in migrate() regardless of the flag. So calling with preserveSource:false gives the worst combination — NO in-memory backup AND the source is still left fully intact — rather than the 'move' semantics the name implies. batchSize (default 10) is also a no-op for throughput: the inner batch loop (line 120-141) awaits each writeNota sequentially, so batching provides no concurrency and only affects nothing observable. Neither is a data-loss bug, but both are traps if this service is later wired up.
