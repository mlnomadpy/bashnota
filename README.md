# BashNota

<div align="center">
  <img src="src/assets/logo.svg" alt="BashNota Logo" width="120" />
  <h3>More Than a Second Brain, It's a Second Brain Cracked on Code and AI</h3>
  
  [![Issues](https://img.shields.io/github/issues/mlnomadpy/bashnota)](https://github.com/mlnomadpy/bashnota/issues)
  [![Pull Requests](https://img.shields.io/github/issues-pr/mlnomadpy/bashnota)](https://github.com/mlnomadpy/bashnota/pulls)
  [![License](https://img.shields.io/github/license/mlnomadpy/bashnota)](LICENSE)
  [![Deploy](https://img.shields.io/badge/deploy-live-brightgreen)](https://offline.bashnota.com)
</div>

## Overview

BashNota combines rich text editing with executable code blocks, AI assistance, and seamless organization. Built for developers who need more than just notes.

**Key Features:**
- 📝 Rich markdown editing with TipTap
- 💻 Execute Python/JavaScript code blocks
- 🤖 AI assistant integration
- 📊 LaTeX math & Mermaid diagrams
- 🔗 Jupyter notebook integration
- 🌙 Dark/light themes
- 💾 **Dual storage modes**: IndexedDB or direct file system access
- 🔄 **Real-time file watching**: Edit .nota files with any text editor

## Quick Start

### Prerequisites
- Node.js 22.14.0 or newer in the Node 22 line, and npm 10
- Supabase account

### Development
```bash
git clone https://github.com/mlnomadpy/bashnota.git
cd bashnota
npm ci
cp .env.example .env  # Configure your environment
npm run dev
```

### Build & Deploy
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deployment is performed by the GitHub Pages workflow after quality checks.
```

### Supabase local services
```bash
npm run supabase:start
npm run supabase:reset
npm run test:supabase
```

### Verification suites

```bash
# Deterministic unit/integration tests; writes test-results/vitest-junit.xml.
# The command fails on test failures and on skips outside the explicit local-
# Supabase integration allowlist.
npm run test:fast

# Critical storage, migration, publishing, editor-service, and store coverage.
# The command emits coverage/lcov.info and fails below 60% lines or branches.
npm run test:coverage

# Focused large-library, many-block, and large-output regression budgets. These
# also run as part of test:fast.
npm run test:performance

# Real-Chrome application workflow E2E with no automatic retries; writes
# test-results/playwright-junit.xml. Set CHROME_BIN for a nonstandard install.
npm run test:playwright

# Production-build PWA install, service-worker replacement, and offline-load
# checks; writes test-results/pwa-junit.xml.
npm run test:pwa

# Full local Supabase emulator suite followed by Playwright application E2E and
# the browser security, Jupyter, deep-link, and initial-route gates. Requires
# Docker and a Chrome installation.
npm run test:emulator-e2e
```

Production builds default to the GitHub Pages base `/bashnota/`. Set
`VITE_DEPLOY_BASE=/` for Netlify or another custom-domain root, or
set it to an absolute path such as `/notebooks/` for a subpath deployment.
The value is validated during config loading and always normalized with a
trailing slash.

### Coolify container deployment

The production image performs the type-checked build and serves the generated
PWA from an unprivileged Nginx process on port `8080`. In a Coolify Dockerfile
application, configure these build variables:

- `VITE_DEPLOY_BASE=/`
- `VITE_SUPABASE_URL=https://supabase.apps.tahabouhsine.com`
- `VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...`

Only the publishable key is browser-safe. Never provide privileged backend
credentials, a database password, or an SMTP credential as a Docker build
argument. Configure `SUPABASE_DEPLOY_GATE_SELF_HOSTED_ORIGIN` only in the
protected deployment-gate environment; for production its exact value is
`https://supabase.apps.tahabouhsine.com`. The public gateway must proxy Auth,
REST, Storage, and Edge Functions through that same HTTPS origin.

To verify the image locally (including SPA deep links, PWA MIME/cache policy,
security headers, health endpoint, and browser-bundle secret markers), run:

```bash
npm run test:container
```

Coolify should use `/healthz` as the health-check path. TLS terminates at
Traefik, while the container exposes only internal HTTP port `8080`.

The fast suite includes deterministic AI streaming contracts and an in-memory
Jupyter HTTP/WebSocket protocol server, so neither suite contacts a production
provider. The emulator command uses generated fixture users and nota content
only. It does not require production credentials or customer data. Unit tests
are never retried automatically; a flaky failure remains visible and blocking.

## Tech Stack

- **Frontend**: Vue 3 + TypeScript + Vite
- **Editor**: TipTap (ProseMirror)
- **UI**: Tailwind CSS + Radix Vue + Shadcn
- **Backend**: Supabase (Auth, Postgres, RLS, Storage)
- **Code Execution**: Jupyter protocol
- **AI**: OpenAI, Gemini, Claude

## Project Structure

```
src/
├── features/           # Feature modules
│   ├── ai/            # AI assistant
│   ├── editor/        # Note editor
│   ├── nota/          # Note management
│   └── jupyter/       # Jupyter integration
├── components/        # Shared components
├── ui/               # UI components
└── stores/           # State management
```

## Storage Modes

BashNota supports two storage modes for maximum flexibility:

- **IndexedDB Mode** (default): Browser-based storage for quick setup
- **File System Mode**: Direct file system access for .nota files
  - Edit notes with any text editor
  - Real-time synchronization
  - Easy backup and version control
  - Works with git

See [FILE_SYSTEM_MODE.md](docs/FILE_SYSTEM_MODE.md) for detailed documentation.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## Acknowledgments

Built with these amazing open-source projects:

- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [TipTap](https://tiptap.dev/) - Headless rich-text editor
- [ProseMirror](https://prosemirror.net/) - Rich text editing toolkit
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix Vue](https://www.radix-vue.com/) - Unstyled, accessible components
- [Supabase](https://supabase.com/) - Backend platform
- [Vite](https://vitejs.dev/) - Build tool

## License

GNU AFFERO GENERAL PUBLIC LICENSE License - see [LICENSE](LICENSE) file for details.

---

<div align="center">
  <a href="https://offline.bashnota.com">🚀 Try BashNota</a> • 
  <a href="https://github.com/mlnomadpy/bashnota/issues">Report Bug</a> •
  <a href="https://github.com/mlnomadpy/bashnota/discussions">Discussions</a>
</div>
