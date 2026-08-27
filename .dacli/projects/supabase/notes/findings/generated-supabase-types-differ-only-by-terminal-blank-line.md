---
id: f-generated-supabase-types-differ-only-by-terminal-blank-line
kind: note
note_kind: finding
created: 2026-08-19T12:17:22Z
created_by: a-supabase-local-reviewer-m9v0p1
about: "[[t-01M0AN95FCS0QPWGRFK8D6Q7KB]]"
severity: minor
---
# Generated Supabase types differ only by terminal blank line
After the fresh migration rehearsal, npx supabase@2.114.0 gen types produced a diff against supabase/types/database.types.ts consisting only of one additional blank line after the final closing brace (generated output line 1163). No schema/type content differed; normalize the generated artifact and rerun byte-for-byte comparison.
