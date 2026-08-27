---
id: f-dacli-loop-profile-resolves-foreign-go-gates-and-unsafe-auto-merge-for-bashnota
kind: note
note_kind: finding
created: 2026-08-27T11:13:22Z
created_by: a-root
severity: major
scope: workspace
---
# dacli loop profile resolves foreign Go gates and unsafe auto-merge for BashNota
On 2026-08-27, dacli start --project bashnota --profile loop --dry-run resolved gofmt/go vet/golangci/go test and auto-merge=true for this Vue/TypeScript repository. project show --landing-mode pr --landing-base master printed a temporary PR override but a subsequent JSON read still reported configured empty/effective local. Until profile persistence is repaired, use bounded manual worktrees/review/PR checks and never start the autonomous loop.
