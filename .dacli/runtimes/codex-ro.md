---
id: rt-codex-ro
kind: runtime
created: 2026-08-13T14:40:09Z
created_by: a-root
name: codex-ro
binary: /Applications/ChatGPT.app/Contents/Resources/codex
invoke_mode: stdin
invoke_args: "[exec, --ephemeral, --skip-git-repo-check]"
sandbox_ro_args: "[--sandbox, read-only]"
env_passthrough: "[HOME, PATH, USER, LOGNAME, TMPDIR]"
model_flag: --model
---
# codex-ro
Flags here are assumptions until `dacli runtime doctor` verifies them against the installed binary.
