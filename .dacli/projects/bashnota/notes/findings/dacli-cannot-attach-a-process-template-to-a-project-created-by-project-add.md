---
id: f-dacli-cannot-attach-a-process-template-to-a-project-created-by-project-add
kind: note
note_kind: finding
created: 2026-08-11T20:33:55Z
created_by: a-root
severity: moderate
origin: .dacli/config.yml:1
---
# dacli cannot attach a process template to a project created by project add; --template exists only on init and new
Root hit this trying to put executable quality gates on the pm project.

`dacli project add` has no --template flag. --template exists on `dacli init` (workspace default) and `dacli new` (greenfield). An ADOPTED workspace with several projects added afterwards therefore has no supported way to attach a template, so `dacli stage <p>` reports "no template (solo): no gates".

Hand-writing `template: tdd` into the project frontmatter does NOT work: dacli then reports `project is at stage "", which template tdd does not define — the manifest changed under it`, even with a valid `stage: design` that the template does define. Reverted.

Consequence: on an adopted repo — the exact case `dacli adopt` exists for — the "quality gates that check software, not paperwork" feature is unreachable for any project except via re-init. That is the case where gates matter most, since adopted code arrives with unknown quality.

Workaround used instead: the same commands are enforced by .github/workflows/ci.yml and by passing them to `dacli accept --verify`. The vendored .dacli/templates/tdd.md was kept, rewritten from the Go defaults to this stack (vue-tsc, vitest, vite build, a no-emitted-js check, and a 2,200,000-byte entry-chunk budget), so the gate definitions are at least recorded even though dacli will not run them.

Worth filing upstream via `dacli report`.
