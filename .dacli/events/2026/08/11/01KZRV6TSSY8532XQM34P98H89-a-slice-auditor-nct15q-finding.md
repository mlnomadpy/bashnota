---
id: 01KZRV6TSSY8532XQM34P98H89
kind: event
event_kind: finding
created: 2026-08-11T16:41:35Z
created_by: a-slice-auditor-nct15q
about: "[[001]]"
origin: agent
applied: false
---
INTENT + import graph: what the jupyter slice was meant to be, and its cross-slice edges

Reconstructed intent: a self-contained Jupyter integration providing (1) server config CRUD persisted to localStorage, (2) kernel/session discovery + a sidebar to inspect and kill running kernels, (3) a stateless HTTP+WebSocket transport (JupyterService) to run code, and (4) NotaConfig-level session binding so a notebook remembers its kernels. In practice the transport split in two and the store-owned CodeExecutionService (src/services) became the real one while JupyterService.executeCode was left behind. File map — entry surfaces (public): jupyterStore.ts (Pinia 'jupyter'), jupyterService.ts singleton, composables useJupyterServers/useJupyterSessions, components/* sidebar. Leaves: EmptyState/KernelLanguageBadge/ServerInfo/ServerItem (presentational). Cross-slice edges INTO other slices: consumed by editor (codeExecutionStore.ts, ExecutableCodeBlock.vue, pipeline/PipelineNode.vue, nota-config/*, confusion-matrix/JupyterFileBrowser.vue) and settings (JupyterSettings.vue) — this is the intended public surface. Boundary note: the actual execution engine (src/services/codeExecutionService.ts) lives OUTSIDE the slice while the slice's own JupyterService is the dead one — an inversion of the FSD intent, where 'the slice owns kernel execution'. Types (types/jupyter.ts) are imported cross-slice, which is fine.
