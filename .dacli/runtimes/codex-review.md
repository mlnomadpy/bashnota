---
id: rt-codex-review
kind: runtime
created: 2026-08-27T22:29:31Z
created_by: a-root
name: codex-review
binary: codex
invoke_mode: stdin
invoke_args: "[exec, --json, --ephemeral, --color, never]"
global_args: "[--ask-for-approval, never]"
sandbox_ro_args: "[--sandbox, read-only]"
env_passthrough: "[HOME, PATH, USER, LOGNAME, TMPDIR, CODEX_HOME]"
model_flag: --model
usage_format: codex-jsonl
behavioral_preflight: codex-exec-json-v2
---
# codex-review
Flags here are assumptions until `dacli runtime doctor` verifies them against the installed binary.
