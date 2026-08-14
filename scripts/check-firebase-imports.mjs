import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

const compatibilityAdapter = 'src/services/cloud/firebaseCompatibility.ts'
const legacyBaseline = `src/features/auth/services/auth.ts:11:} from 'firebase/auth'
src/features/auth/services/auth.ts:16:import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
src/features/bashhub/composables/useNewsletter.ts:2:import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
src/features/bashhub/services/statisticsService.ts:2:import { doc, updateDoc, increment, getDoc, writeBatch, serverTimestamp, deleteField, FieldPath } from 'firebase/firestore';
src/features/nota/services/commentService.ts:14:} from 'firebase/firestore'
src/services/firebase.ts:1:import { initializeApp } from 'firebase/app'
src/services/firebase.ts:2:import { getAnalytics, logEvent } from 'firebase/analytics'
src/services/firebase.ts:3:import { getAuth, connectAuthEmulator } from 'firebase/auth'
src/services/firebase.ts:4:import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
src/utils/userTagGenerator.ts:2:import { doc, getDoc } from 'firebase/firestore';`

const isFirebaseSpecifier = value => value === 'firebase' || value.startsWith('firebase/')

/**
 * Scans a complete TypeScript/JavaScript module, including arbitrary
 * whitespace and comments.  The record starts at the syntax node's source
 * line so existing static imports retain the stable baseline format.
 */
function scanDirectFirebaseImports(file, source) {
  const script = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true)
  const records = []
  const add = node => {
    const specifier = node.moduleSpecifier ?? node.argument
    if (!specifier || !ts.isStringLiteralLike(specifier) || !isFirebaseSpecifier(specifier.text)) return
    const position = script.getLineAndCharacterOfPosition(specifier.getStart(script))
    const line = source.split('\n')[position.line]
    records.push(`${file}:${position.line + 1}:${line}`)
  }
  const visit = node => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) add(node)
    if (ts.isCallExpression(node)) {
      const isDynamicImport = node.expression.kind === ts.SyntaxKind.ImportKeyword
      const isRequire = ts.isIdentifier(node.expression) && node.expression.text === 'require'
      const isRequireResolve = ts.isPropertyAccessExpression(node.expression)
        && ts.isIdentifier(node.expression.expression)
        && node.expression.expression.text === 'require'
        && node.expression.name.text === 'resolve'
      if ((isDynamicImport || isRequire || isRequireResolve) && node.arguments.length === 1) {
        const argument = node.arguments[0]
        if (ts.isStringLiteralLike(argument) && isFirebaseSpecifier(argument.text)) {
          const position = script.getLineAndCharacterOfPosition(node.getStart(script))
          const line = source.split('\n')[position.line]
          records.push(`${file}:${position.line + 1}:${line}`)
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(script)
  return records
}

function sourceFiles() {
  return execFileSync('rg', ['--files', 'src'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean)
}

function fail(message) {
  console.error(`::error::${message}`)
  process.exitCode = 1
}

// Self-test the actual production scan with single/multiline forms before
// certifying the repository. This prevents the one-line-only regression.
for (const [kind, candidate] of [
  ['static', "import firebase from 'firebase/app'"],
  ['multiline static', "import {\n  getAuth,\n} from 'firebase/auth'"],
  ['dynamic', "import(\n  'firebase/auth'\n)"],
  ['require', "require(\n  'firebase/firestore'\n)"],
  ['require.resolve', "require.resolve(\n  'firebase/analytics'\n)"],
]) {
  if (!scanDirectFirebaseImports(`fixture-${kind}.ts`, candidate).length) {
    fail(`Firebase boundary scanner missed ${kind} import.`)
  }
}
if (scanDirectFirebaseImports('safe-fixture.ts', "import { CloudApi } from '@/services/cloud'").length) {
  fail('Firebase boundary scanner has a false positive.')
}

const directImports = sourceFiles().flatMap(file => {
  if (file === compatibilityAdapter) return []
  return scanDirectFirebaseImports(file, readFileSync(file, 'utf8'))
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
