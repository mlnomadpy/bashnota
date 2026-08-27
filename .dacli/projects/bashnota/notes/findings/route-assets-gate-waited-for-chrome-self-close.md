---
id: f-route-assets-gate-waited-for-chrome-self-close
kind: note
note_kind: finding
created: 2026-08-27T00:42:56Z
created_by: a-root
about: "[[bashnota/018]]"
severity: major
---
# Route-assets gate waited for Chrome self-close
After merging task045, task018's real route-assets browser gate hung over four minutes because it still used execFile and waited for Chrome self-exit. Repaired in 3c66427 by reusing the shared process-tree harness and completing on the injected resource-timing marker; structural and real-browser gates now pass.
