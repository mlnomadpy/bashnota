# Release readiness and archive contract

No BashNota release exists merely because `package.json` has a version. A
release is a signed annotated tag whose target has passed the following gates.

## Required evidence

- The GitHub `Quality` workflow succeeded for the exact tag target, including
  static/supply-chain, unit/coverage, browser/security, local Jupyter, Supabase,
  build, and container jobs.
- `npm audit --omit=dev --audit-level=high` is green.
- `npm run release:check` is green in a clean checkout.
- The release archive is produced twice from the same commit and both archives
  have the same SHA-256 digest.
- `release-manifest.json`, `sbom.cdx.json`, `dependency-licenses.json`, test
  evidence, `CHANGELOG.md`, `LICENSE`, `NOTICE`, security policy, provenance
  records, and known limitations are present.
- Every human contributor and fixture has a reviewed rights/provenance entry.
- Every installed dependency has a declared license or a documented legal
  disposition; an `UNKNOWN` entry is evidence to resolve, not permission.
- A maintainer verifies the signed tag with `git verify-tag <tag>` and checks
  that its commit equals the successful Quality workflow SHA.

The release workflow refuses an unsigned tag and a tag target without a
successful Quality run. It packages but does not silently repair or rewrite
history.

## Archive contents

`npm run release:package` writes exactly one `.tar.gz` plus its adjacent
`.sha256` verification file to `release/`. Inside the archive are:

- a clean `git archive` snapshot of the selected commit;
- `history/bashnota.bundle`, containing the exact release commit's complete
  ancestry (including merged branches and merge commits) plus canonical tags;
- generated CycloneDX SBOM and resolved dependency-license JSON;
- `test-evidence.json`, linking the exact successful Quality and release workflow
  runs for publishable candidates (local packages are explicitly marked
  unattested);
- a manifest with commit, source date, file digests, commands, and tool versions.

The bundle preserves deleted files as part of authentic history. Historical
`.nota` blobs have therefore been privacy- and rights-reviewed separately in
`docs/provenance/fixtures.json`; the working-tree snapshot contains only the
purpose-built fixture under `e2e/fixtures/`.

The bundle deliberately excludes local branch labels, remote-tracking refs,
stashes, worktree refs, `refs/codex/*`, and the `dacli-record` branch. Those
namespaces are not part of the reviewed release and may contain private
workspace or collaboration records. A relevant branch must be merged without
squashing before release; its authentic commits then remain in `HEAD` ancestry.

Package manifests that omit a license field are resolved only through the
version-pinned, evidence-linked dispositions in
`docs/provenance/dependency-license-overrides.json`. The report generator fails
after writing its diagnostic report if any dependency remains unresolved.

Dependencies, `dist/`, coverage, test output, local `.env*`, provider state,
forbidden paths or secret shapes anywhere in released Git history,
emulator data, user data, and GitHub credentials are excluded. The packaging
script rejects a dirty checkout, a shallow clone, sensitive tracked filenames,
secret-shaped content in every current and historical blob (including binary
and large files) and released commit/tag metadata, oversized entries, and an
archive that fails its own integrity inspection. The scanner recognizes common
provider formats and contextual high-entropy assignments, but it is a release
backstop rather than a substitute for repository secret-scanning controls and
credential rotation.

The branch-classification ledger at `scripts/release/history-branches.json`
allowlists the exact release `HEAD`, `master`, `release/*` branches, their
`origin` tracking refs, and signed tags. It explicitly excludes ephemeral
private/tool, dependency-bot, and deployment refs. A remaining unclassified
branch is omitted only when it is fully merged into `HEAD`; packaging fails if
that branch has any unique commit. Merged feature work remains preserved
through `HEAD` ancestry even after its short-lived branch ref is deleted.

Clone archived history with:

```bash
git clone history/bashnota.bundle restored-bashnota
```

## Optional collaboration metadata

If the receiving program permits GitHub collaboration metadata, an authorized
operator may run `npm run release:github-metadata -- --repo mlnomadpy/bashnota`.
The exporter records issues, pull requests, reviews, and comments as JSON using
GitHub's API. It never includes the token. Review the export for private data
before placing it beside—not inside—the canonical source archive.

## Release sequence

1. Update `CHANGELOG.md`, known limitations, and `SECURITY.md` support status.
2. Obtain independent provenance/legal and security review.
3. Land the candidate on `master`; wait for Quality on that exact SHA.
4. Create a signed annotated tag locally and verify it.
5. Push only the tag. The release workflow rechecks tag signature, Quality SHA,
   dependency audit, tooling self-tests, and archive reproducibility.
6. A maintainer compares checksums and publishes the generated artifacts.

Failed gates leave the release unpublished. Fix through new commits; never
move a published tag or rewrite authentic dates/authors to make a gate pass.
