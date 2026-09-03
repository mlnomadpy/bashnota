import path from 'node:path'

const forbiddenSegments = new Set([
  'node_modules', 'dist', 'coverage', 'test-results', 'playwright-report',
  '.firebase', '.supabase', '.netlify', '.cache',
])

export function forbiddenArchivePath(file) {
  const normalized = file.replaceAll('\\', '/').replace(/^\.\//, '')
  const segments = normalized.split('/').filter(Boolean)
  if (segments.some((segment) => forbiddenSegments.has(segment))) return 'generated/dependency directory'
  const name = path.posix.basename(normalized)
  if ((name === '.env' || name.startsWith('.env.')) && !name.endsWith('.example')) return 'private environment file'
  if (/\.(?:pem|key|p12|pfx|jks|keystore)$/i.test(name)) return 'private key or key store'
  if (/(?:service[-_]?account|firebase-adminsdk).*\.json$/i.test(name)) return 'service-account credential'
  if (/^(?:id_rsa|id_dsa|id_ecdsa|id_ed25519)$/.test(name)) return 'private key'
  if (/\.(?:nota|ipynb)$/i.test(name) && !normalized.includes('/fixtures/')) return 'unclassified notebook/user data'
  return null
}

export const secretPatterns = [
  ['private-key marker', /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/],
  ['AWS access-key shape', /(?:AKIA|ASIA)[0-9A-Z]{16}/],
  ['Supabase secret-key shape', /sb_secret_[A-Za-z0-9_-]{20,}/],
  ['GitHub token shape', /gh[pousr]_[A-Za-z0-9]{30,}/],
  ['secret-named Vite variable', /VITE_[A-Z0-9_]*(?:SECRET|SERVICE_ROLE|PRIVATE_KEY|PASSWORD|TOKEN)[A-Z0-9_]*/],
]

export function findSecretShape(text) {
  return secretPatterns.find(([, regex]) => regex.test(text))?.[0] ?? null
}
