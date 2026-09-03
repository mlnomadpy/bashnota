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
- `history/bashnota.bundle`, containing all repository refs visible in the
  packaging clone (branches and tags, including merge history);
- generated CycloneDX SBOM and resolved dependency-license JSON;
- a manifest with commit, source date, file digests, commands, and tool versions.

Dependencies, `dist/`, coverage, test output, local `.env*`, provider state,
emulator data, user data, and GitHub credentials are excluded. The packaging
script rejects a dirty checkout, a shallow clone, sensitive tracked filenames,
secret-shaped tracked content, oversized entries, and an archive that fails its
own integrity inspection.

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
