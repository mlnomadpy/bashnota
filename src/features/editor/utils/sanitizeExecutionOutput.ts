import DOMPurify from 'dompurify'

// Execution output is untrusted. These sinks only need structural and
// syntax-highlighting markup; links, images, inline CSS, and embedded document
// formats are rendered by the sandboxed output path instead.
const allowedTags = [
  'b', 'br', 'code', 'div', 'em', 'i', 'p', 'pre', 'span', 'strong', 'u',
  'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr',
] as const

const forbiddenTags = ['embed', 'form', 'iframe', 'img', 'math', 'object', 'style', 'svg'] as const
const forbiddenAttributes = ['action', 'formaction', 'href', 'src', 'srcset', 'style', 'xlink:href'] as const

/** Sanitize markup immediately before it reaches an execution-output v-html sink. */
export function sanitizeExecutionOutput(html: string): string {
  // Pass a fresh, explicit, hook-free policy on every call. DOMPurify hooks
  // are process-global and could leak policy changes between components/tests.
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [...allowedTags],
    ALLOWED_ATTR: ['class'],
    FORBID_TAGS: [...forbiddenTags],
    FORBID_ATTR: [...forbiddenAttributes],
    ALLOW_ARIA_ATTR: false,
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
    RETURN_TRUSTED_TYPE: false,
  })
}
