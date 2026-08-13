import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const compatibilityAdapter = 'src/services/cloud/firebaseCompatibility.ts'
const legacyBaseline = `src/features/auth/services/auth.ts:11:} from 'firebase/auth'
src/features/auth/services/auth.ts:16:import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
src/features/bashhub/composables/useNewsletter.ts:2:import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
src/features/bashhub/services/statisticsService.ts:2:import { doc, updateDoc, increment, getDoc, writeBatch, serverTimestamp, deleteField, FieldPath } from 'firebase/firestore';
src/features/bashhub/views/UserPublishedView.vue:16:import { doc, getDoc } from 'firebase/firestore'
src/features/nota/services/commentService.ts:14:} from 'firebase/firestore'
src/services/firebase.ts:1:import { initializeApp } from 'firebase/app'
src/services/firebase.ts:2:import { getAnalytics, logEvent } from 'firebase/analytics'
src/services/firebase.ts:3:import { getAuth, connectAuthEmulator } from 'firebase/auth'
src/services/firebase.ts:4:import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
src/utils/userTagGenerator.ts:2:import { doc, getDoc } from 'firebase/firestore';`

const directFirebasePatterns = [
  /\bfrom\s*['"]firebase(?:\/|['"])/,
  /\bimport\s*['"]firebase(?:\/|['"])/,
  /\bimport\s*\(\s*['"]firebase(?:\/|['"])/,
  /\b(?:require|require\.resolve)\s*\(\s*['"]firebase(?:\/|['"])/,
]
const hasDirectFirebaseImport = source => directFirebasePatterns.some(pattern => pattern.test(source))

function sourceFiles() {
  return execFileSync('rg', ['--files', 'src'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean)
}

function fail(message) {
  console.error(`::error::${message}`)
  process.exitCode = 1
}

// Keep the scanner covered with precisely the static, dynamic, and CommonJS
// shapes it is responsible for blocking before certifying the repository.
for (const candidate of [
  "import firebase from 'firebase/app'",
  "import('firebase/auth')",
  "require('firebase/firestore')",
  "require.resolve('firebase/analytics')",
]) {
  if (!hasDirectFirebaseImport(candidate)) fail(`Firebase boundary scanner missed: ${candidate}`)
}
if (hasDirectFirebaseImport("import { CloudApi } from '@/services/cloud'")) {
  fail('Firebase boundary scanner has a false positive.')
}

const directImports = sourceFiles().flatMap(file => {
  if (file === compatibilityAdapter) return []
  return readFileSync(file, 'utf8').split('\n').flatMap((line, index) => (
    hasDirectFirebaseImport(line) ? [`${file}:${index + 1}:${line}`] : []
  ))
}).sort().join('\n')

if (directImports !== legacyBaseline) {
  fail('New direct Firebase imports are prohibited outside the temporary compatibility adapter.')
  console.error('Expected legacy import baseline:\n' + legacyBaseline)
  console.error('Found direct Firebase imports:\n' + directImports)
}

const serviceRolePattern = /VITE_SUPABASE_(SERVICE_ROLE|SERVICE_KEY)|service_role/
for (const file of [...sourceFiles(), 'package.json', 'package-lock.json']) {
  if (serviceRolePattern.test(readFileSync(file, 'utf8'))) fail(`Browser code must not reference a Supabase service-role key: ${file}`)
}

if (!process.exitCode) console.log('Firebase import boundary check passed.')
