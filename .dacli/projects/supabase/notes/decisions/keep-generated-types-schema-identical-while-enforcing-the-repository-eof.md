---
id: d-keep-generated-types-schema-identical-while-enforcing-the-repository-eof
kind: note
note_kind: decision
created: 2026-08-19T12:18:10Z
created_by: a-supabase-local-reviewer-m9v0p1
about: "[[t-01M0AN95FCS0QPWGRFK8D6Q7KB]]"
---
# Keep generated types schema-identical while enforcing the repository EOF whitespace contract
## Chose
Keep generated types schema-identical while enforcing the repository EOF whitespace contract
## Rejected
Commit the Supabase CLI's extra terminal blank line byte-for-byte
## Because
The sole generator difference is an empty final line; committing it makes git diff --check fail with 'new blank line at EOF'. The generated declarations are otherwise identical, so retain the repository-normalized EOF and prove semantic generation drift is empty after ignoring blank lines.
