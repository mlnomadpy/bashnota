import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const SELF = 'scripts/check-backend-purity.mjs'
const runtimeRoots = ['src', '.github', 'scripts', 'e2e', 'docs']
const rootConfigs = [
  'package.json',
  'package-lock.json',
  '.env.example',
  '.gitignore',
  'CONTRIBUTING.md',
  'README.md',
  'vite.config.ts',
  'vitest.config.ts',
  'netlify.toml',
]

// These documents describe retained, restricted migration/audit data. Legacy
// UID field names are part of that immutable import contract, not runtime
// provider selection, and are intentionally outside the runtime text scan.
const migrationAuditDocuments = new Set([
  'docs/supabase/auth-identity-migration.md',
])
const operatorMigrationFiles = new Set([
  'docs/supabase/data-migration-runbook.md',
  'scripts/legacy-migration/export-cli.mjs',
  'scripts/legacy-migration/cli.mjs',
])
const isOperatorMigrationFile = file => operatorMigrationFiles.has(file) || file.startsWith('scripts/legacy-migration/')

const forbiddenRuntime = [
  { name: 'legacy backend SDK/tooling reference', pattern: /firebase(?:-admin|-functions|-tools)?|@firebase\/|firebase\/|firestore|firebasestorage/i },
  { name: 'legacy backend environment/config key', pattern: /VITE_FIREBASE_|FIREBASE_|GCLOUD_PROJECT|PROVIDER_VERSION|ROLLOUT_VERSION/i },
  { name: 'removed backend Functions path', pattern: /(?:^|[\s`'"(])functions\//i },
  { name: 'browser/server privileged Supabase credential path', pattern: /VITE_SUPABASE_(?:SERVICE_ROLE|SERVICE_KEY)|SUPABASE_SERVICE_ROLE_KEY|service[_-]role|DATABASE_URL|DB_PASSWORD/i },
]

const forbiddenArtifact = /(^|\/)(?:firebase\.json|firestore(?:-tests|\.|$)|storage\.rules|functions(?:\/|$)|emulator-data(?:\/|$))|firebase/i
const forbiddenOperatorDependency = [
  /(?:from\s*|import\s*\(|require(?:\.resolve)?\s*\()\s*['"](?:firebase(?:\/|['"])|@firebase\/|firebase-admin|firebase-functions)/i,
  /(?:^|[\s`'"])(?:firebase|gcloud)\s+(?:auth:export|firestore:export|emulators:|projects:)/i,
  /(?:^|[\s`'"])(?:firebase-admin|firebase-tools|@firebase\/)/i,
]

function filesUnder(...roots) {
  const output = execFileSync('rg', [
    '--files',
    '--hidden',
    '--no-ignore',
    '-g', '!node_modules/**',
    '-g', '!dist/**',
    '-g', '!.git',
    '-g', '!.git/**',
    '-g', '!.dacli/**',
    ...roots,
  ], { encoding: 'utf8' }).trim()
  return output ? output.split('\n').map(file => file.replace(/^\.\//, '')) : []
}

export function scanText(file, source) {
  return forbiddenRuntime.flatMap(({ name, pattern }) => source.split('\n').flatMap((line, index) =>
    pattern.test(line) ? [`${file}:${index + 1}: ${name}`] : [],
  ))
}

export function scanArtifactNames(files) {
  return files.filter(file => forbiddenArtifact.test(file))
}

export function scanOperatorDependencies(file, source) {
  return source.split('\n').flatMap((line, index) => forbiddenOperatorDependency.some(pattern => pattern.test(line))
    ? [`${file}:${index + 1}: legacy backend SDK/Admin/tool dependency`]
    : [])
}

function selfTest() {
  const unsafe = [
    "import { initializeApp } from 'firebase/app'",
    'VITE_FIREBASE_API_KEY=secret',
    'SUPABASE_SERVICE_ROLE_KEY=server-secret',
    'const selected = env.PROVIDER_VERSION',
    'functions/src/index.ts',
  ]
  for (const fixture of unsafe) {
    if (!scanText('fixture.ts', fixture).length) throw new Error(`purity scanner missed fixture: ${fixture}`)
  }
  if (scanText('safe.ts', "import { createClient } from '@supabase/supabase-js'").length) {
    throw new Error('purity scanner rejected the browser-safe Supabase client')
  }
  if (!scanArtifactNames(['functions/src/index.ts', 'firebase.json', 'firestore.rules']).length) {
    throw new Error('purity scanner missed a prohibited artifact name')
  }
  if (!scanOperatorDependencies('operator.mjs', "import admin from 'firebase-admin'").length
    || scanOperatorDependencies('operator.mjs', "const row = { firebase_uid: sourceUid }").length) {
    throw new Error('operator migration dependency scanner is not exact')
  }
  const enumerated = filesUnder('.')
  if (!enumerated.includes('.gitignore') || enumerated.some(file => file.startsWith('.git/'))) {
    throw new Error('purity scanner did not enumerate hidden/ignored workspace files safely')
  }
}

function main() {
  selfTest()
  const environmentFiles = filesUnder('.')
    .filter(file => !file.includes('/') && (file === '.env' || file.startsWith('.env.')))
  const runtimeFiles = [...new Set([...filesUnder(...runtimeRoots), ...rootConfigs, ...environmentFiles])]
    .filter(file => file !== SELF)
    .filter(file => !migrationAuditDocuments.has(file))
    .filter(file => !isOperatorMigrationFile(file))
  const textViolations = runtimeFiles.flatMap(file => scanText(file, readFileSync(file, 'utf8')))
  const operatorFiles = [...new Set(filesUnder('scripts/legacy-migration', 'docs/supabase/data-migration-runbook.md'))]
  const operatorViolations = operatorFiles.flatMap(file => scanOperatorDependencies(file, readFileSync(file, 'utf8')))
  const artifactViolations = scanArtifactNames(filesUnder('.'))
  const violations = [...textViolations, ...operatorViolations, ...artifactViolations.map(file => `${file}: prohibited artifact`)]
  if (violations.length) {
    console.error(violations.join('\n'))
    process.exitCode = 1
    return
  }
  console.log(`Backend purity check passed across ${runtimeFiles.length} runtime/config files, ${operatorFiles.length} restricted operator files, and all artifact names.`)
}

main()
