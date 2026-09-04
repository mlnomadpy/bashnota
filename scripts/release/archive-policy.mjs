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
  ['private-key marker', /-----BEGIN (?:(?:RSA|EC|OPENSSH|DSA|PGP|ENCRYPTED) )?PRIVATE KEY-----/],
  ['AWS access-key shape', /(?:AKIA|ASIA)[0-9A-Z]{16}/],
  ['Supabase secret-key shape', /sb_secret_[A-Za-z0-9_-]{20,}/],
  ['GitHub token shape', /gh[pousr]_[A-Za-z0-9]{30,}/],
  ['Google API-key shape', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['OpenAI API-key shape', /\bsk-(?!ant-)(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}\b/],
  ['Anthropic API-key shape', /\bsk-ant-[A-Za-z0-9_-]{20,}\b/],
  ['Groq API-key shape', /\bgsk_[A-Za-z0-9]{20,}\b/],
  ['Hugging Face token shape', /\bhf_[A-Za-z0-9]{20,}\b/],
  ['xAI API-key shape', /\bxai-[A-Za-z0-9_-]{20,}\b/],
  ['Stripe live secret-key shape', /\bsk_live_[A-Za-z0-9]{24,}\b/],
  ['Slack token shape', /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/],
  ['GitLab access-token shape', /\bglpat-[A-Za-z0-9_-]{20,}\b/],
  ['npm access-token shape', /\bnpm_[A-Za-z0-9]{36,}\b/],
  ['JWT shape', /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/],
  ['secret-named Vite variable', /VITE_[A-Z0-9_]*(?:SECRET|SERVICE_ROLE|PRIVATE_KEY|PASSWORD|TOKEN)[A-Z0-9_]*/],
]

const contextualSecret = /(?:^|[\s,{;])(?:[A-Za-z_$][\w$]*\.)*["']?(?:api[_-]?key|access[_-]?key|client[_-]?secret|jupyter[_-]?token|password|secret|token)["']?\s*[=:]\s*(?:"([A-Za-z0-9_./+=-]{32,})"|'([A-Za-z0-9_./+=-]{32,})'|([A-Za-z0-9_/+=-]{32,}))/gim
const credentialUrl = /\bhttps?:\/\/(?:[^\s/:?#@]+:([^\s/?#@]{16,})@[^\s]+|[^\s?#]+[?#][^\s#]*(?:api[_-]?key|access[_-]?key|client[_-]?secret|jupyter[_-]?token|password|secret|token)=([^&#\s]{16,}))/gim

function isPlaceholder(value) {
  return /^(?:(?:placeholder|example|dummy|sample|fixture|test|fake|marker|secret|token|key|value|password)[-_.]*)+$/i.test(value)
    || /^AIzaCredentialMarker[0-9]+$/.test(value)
}

function shannonEntropy(value) {
  const frequencies = new Map()
  for (const character of value) frequencies.set(character, (frequencies.get(character) ?? 0) + 1)
  return [...frequencies.values()].reduce((entropy, count) => {
    const probability = count / value.length
    return entropy - probability * Math.log2(probability)
  }, 0)
}

export function findSecretShape(content) {
  // Credentials are ASCII. Decoding the complete bounded blob keeps those byte
  // sequences visible even when unrelated bytes are binary or invalid UTF-8.
  const text = Buffer.isBuffer(content) ? content.toString('utf8') : String(content)
  const named = secretPatterns.find(([, regex]) => regex.test(text))?.[0]
  if (named) return named
  contextualSecret.lastIndex = 0
  for (const match of text.matchAll(contextualSecret)) {
    const value = match[1] ?? match[2] ?? match[3]
    if (isPlaceholder(value)) continue
    if (shannonEntropy(value) >= 4) return 'high-entropy value assigned to a secret-named field'
  }
  credentialUrl.lastIndex = 0
  for (const match of text.matchAll(credentialUrl)) {
    const encodedValue = match[1] ?? match[2]
    let value = encodedValue
    try {
      value = decodeURIComponent(encodedValue)
    } catch {
      // Malformed percent encoding is still scanned in its original form.
    }
    if (isPlaceholder(value)) continue
    if (shannonEntropy(value) >= 4) return 'credential-bearing URL'
  }
  return null
}
