# ADR 0001: Preserve authentic development history

- Status: accepted
- Date: 2026-09-03

## Decision

Release archives carry a Git bundle with all refs visible to the packaging
clone. We preserve merge commits, contributor names/emails, author/committer
dates, tags, relevant branches, bot identities, and dacli agent attribution.
Alias reconciliation is additive metadata under `docs/provenance/`; it never
rewrites commits.

Historical ambiguity is corrected through forward commits, tests, issues, and
ADRs. We do not squash authentic development, manufacture commits, normalize
authors with history rewriting, or move published tags.

## Consequences

The archive is larger than a source snapshot and may retain imperfect commit
messages or obsolete paths. That is intentional evidence. Personal data already
present in public Git history must be handled through a separate, explicit
legal/privacy process rather than silently edited during release preparation.
