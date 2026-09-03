# Changelog

All notable changes will be documented here. This project follows Keep a
Changelog and intends to use Semantic Versioning after its first verified
release.

## [Unreleased]

### Added

- Supabase-only authentication, publishing, community, storage, migration, and
  deployment boundaries.
- Risk-tier coverage, production browser/PWA/security journeys, repository
  hygiene checks, and pinned GitHub Pages deployment.
- Release-readiness policies, architecture documentation, provenance ledgers,
  SBOM/license generation, and deterministic history archive tooling.

### Known limitations

- No signed release has passed the release checklist yet; `package.json` version
  values before that point are development identifiers, not release evidence.
- Filesystem storage and external-edit synchronization remain experimental.
- The editor's TipTap JSON and normalized block-table migration is incomplete;
  compatibility-sensitive documents require independent backups and round-trip
  checks.
- The repository's production dependency audit must report zero high-severity
  findings before release.
- The installed manifests for `khroma@2.1.0` and `vaul-vue@0.4.1` do not declare
  a license; their upstream license evidence and redistribution disposition
  must be reviewed before release.
- AI and Jupyter connections send notebook content to user-configured services;
  users must assess those services and their data policies.

Release headings, comparison links, dates, checksums, test evidence, and an
explicit supported-version update will be added only when the signed tag is
created.
