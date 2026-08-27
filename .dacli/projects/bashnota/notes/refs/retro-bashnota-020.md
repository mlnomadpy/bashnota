---
id: r-retro-bashnota-020
kind: note
note_kind: ref
created: 2026-08-26T14:28:53Z
created_by: a-root
about: "[[t-01M0D7FF5ZSF5VKQ7EECNAT7B9]]"
---
# Retro: bashnota/020
## Went well
- Four independent review rounds closed workflow parser, provenance, permissions, and stale-deploy bypasses; full CI rerun passed before merge.

## Didn't go well
- Native verifier runtimes produced no-verdict, dacli pr defaulted to main, and accept/integrate sequencing required documented force integration.

## Improve next time
- Fix dacli issue #790, repair runtime grant capability metadata, and define a single land command that merges a green PR before final task closure without a force/allow-unlanded catch-22.

