import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const SELF = 'scripts/check-backend-purity.mjs'
const runtimeRoots = ['src', '.github', 'scripts', 'e2e']
const rootConfigs = [
  'package.json',
  'package-lock.json',
  '.env.example',
  'vite.config.ts',
  'vitest.config.ts',
  'netlify.toml',
]

const forbiddenRuntime = [
  { name: 'legacy backend SDK/tooling reference', pattern: /firebase(?:-admin|-functions|-tools)?|@firebase\/|firebase\/|firestore|firebasestorage/i },
  { name: 'legacy backend environment/config key', pattern: /VITE_FIREBASE_|FIREBASE_|GCLOUD_PROJECT|PROVIDER_VERSION|ROLLOUT_VERSION/i },
  { name: 'browser/server privileged Supabase credential path', pattern: /VITE_SUPABASE_(?:SERVICE_ROLE|SERVICE_KEY)|SUPABASE_SERVICE_ROLE_KEY|service[_-]role|DATABASE_URL|DB_PASSWORD/i },
]

const forbiddenArtifact = /(^|\/)(?:firebase\.json|firestore(?:-tests|\.|$)|storage\.rules|functions(?:\/|$)|emulator-data(?:\/|$))|firebase/i

function filesUnder(...roots) {
  const output = execFileSync('rg', ['--files', ...roots], { encoding: 'utf8' }).trim()
  return output ? output.split('\n') : []
}

export function scanText(file, source) {
  return forbiddenRuntime.flatMap(({ name, pattern }) => source.split('\n').flatMap((line, index) =>
    pattern.test(line) ? [`${file}:${index + 1}: ${name}`] : [],
  ))
}

export function scanArtifactNames(files) {
  return files.filter(file => forbiddenArtifact.test(file))
}

function selfTest() {
  const unsafe = [
    "import { initializeApp } from 'firebase/app'",
    'VITE_FIREBASE_API_KEY=secret',
    'SUPABASE_SERVICE_ROLE_KEY=server-secret',
    'const selected = env.PROVIDER_VERSION',
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
}

function main() {
  selfTest()
  const runtimeFiles = [...new Set([...filesUnder(...runtimeRoots), ...rootConfigs])]
    .filter(file => file !== SELF)
  const textViolations = runtimeFiles.flatMap(file => scanText(file, readFileSync(file, 'utf8')))
  const artifactViolations = scanArtifactNames(filesUnder('.'))
  const violations = [...textViolations, ...artifactViolations.map(file => `${file}: prohibited artifact`)]
  if (violations.length) {
    console.error(violations.join('\n'))
    process.exitCode = 1
    return
  }
  console.log(`Backend purity check passed across ${runtimeFiles.length} runtime/config files and all artifact names.`)
}

main()
