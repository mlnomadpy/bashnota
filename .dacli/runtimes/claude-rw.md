---
id: rt-claude-rw
kind: runtime
created: 2026-08-11T16:17:36Z
created_by: a-root
name: claude-rw
binary: claude
invoke_mode: arg
invoke_flag: -p
invoke_args: "[--allowedTools, \"Read,Grep,Glob,LS,Edit,Write,Bash(git:*),Bash(dacli:*),Bash(/Users/tahabsn/go/bin/dacli:*),Bash(npm:*),Bash(npx:*),Bash(node:*),Bash(find:*),Bash(wc:*),Bash(sort:*),Bash(uniq:*),Bash(head:*),Bash(tail:*),Bash(grep:*),Bash(ls:*),Bash(du:*),Bash(mv:*),Bash(rm:*)\"]"
sandbox_ro_args: "[--allowedTools, \"Read,Grep,Glob,LS,Bash(dacli:*),Bash(/Users/tahabsn/go/bin/dacli:*)\"]"
env_passthrough: "[HOME, PATH, USER, LOGNAME, TMPDIR]"
model_flag: --model
skills_native_dir: .claude/skills
usage_format: stream-json
---
# claude-rw
Flags here are assumptions until `dacli runtime doctor` verifies them against the installed binary.
