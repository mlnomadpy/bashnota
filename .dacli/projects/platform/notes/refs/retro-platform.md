---
id: r-retro-platform
kind: note
note_kind: ref
created: 2026-08-11T19:45:58Z
created_by: a-root
about: "[[platform]]"
---
# Retro: platform
## Went well
- Worktree isolation plus APFS copy-on-write node_modules clones let 4 fixers run concurrently with zero disk cost and no cross-contamination
- Enriching roles with real hazards and entry points before wave 2 measurably raised finding quality: the slice auditors found shipped data-loss bugs that the generic wave-1 seats missed
- Instructing the lint task to treat unused values as bug evidence rather than autofix noise preserved NotaEditor.vue:952 and surfaced a second real bug in the migration rollback test

## Didn't go well
- Root closed 8 tasks with --verify true, a no-op, after verifying manually in the operator shell. The durable record claimed verification that the recorded command did not perform
- The adversarial verify panel was not used until prompted, leaving all 175 findings at trust-floor unverified when the tooling to grade them existed the whole time
- Wave 2's 9 slice tasks sat open long after their agents finished, so dacli next ranked completed work and burndown under-reported progress
- Fixer branches were spawned as a flat wave without dependency ordering, producing a semantic conflict where the lint branch would have reverted the reactivity branch's leak fix
- Agent worktrees live inside the repo at .dacli/worktrees, and vitest globbed into them, running every suite once per checkout against agents' half-written code

## Improve next time
- Pass the real command to --verify on every accept so dacli runs it and records the exit code; use --require-verify where the record matters
- Run dacli verify on every finding that will become work, before filing the fix task, so fixes are built on confirmed claims
- Accept each wave's tasks immediately on completion, before spawning the next wave, so next and burndown stay truthful
- Order fix branches by file overlap and integrate in dependency order rather than spawning a flat wave
- Exclude the agent workspace from every tool that globs the tree, at the moment the workspace is created

