---
id: rt-claude-ro
kind: runtime
created: 2026-08-11T16:17:36Z
created_by: a-root
name: claude-ro
binary: claude
invoke_mode: arg
invoke_flag: -p
sandbox_ro_args: "[--allowedTools, \"Read,Grep,Glob,LS,Bash(dacli:*),Bash(/Users/tahabsn/go/bin/dacli:*),Bash(npx vite build:*),Bash(npx vitest run:*),Bash(npx vue-tsc:*),Bash(npx eslint:*),Bash(npm ls:*),Bash(git log:*),Bash(git grep:*),Bash(wc:*),Bash(find:*),Bash(sort:*),Bash(uniq:*),Bash(head:*),Bash(du:*)\"]"
env_passthrough: "[HOME, PATH, USER, LOGNAME, TMPDIR]"
model_flag: --model
skills_native_dir: .claude/skills
usage_format: stream-json
---
# claude-ro
Flags here are assumptions until `dacli runtime doctor` verifies them against the installed binary.
