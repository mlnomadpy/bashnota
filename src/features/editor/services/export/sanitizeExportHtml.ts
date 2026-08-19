import DOMPurify, { type Config } from 'dompurify'

const allowedTags = [
  'a', 'annotation', 'article', 'b', 'blockquote', 'br', 'caption', 'code', 'col',
  'colgroup', 'del', 'div', 'em', 'figcaption', 'figure', 'h1', 'h2', 'h3', 'h4',
  'h5', 'h6', 'hr', 'i', 'iframe', 'img', 'li', 'math', 'mfrac', 'mi', 'mn',
  'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'mspace', 'msqrt',
  'mstyle', 'msub', 'msubsup', 'msup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder',
  'munderover', 'ol', 'p', 'pre', 'semantics', 'span', 'strong', 'sub', 'sup',
  'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'u', 'ul',
] as const

const safeLinkUrl = /^(?:(?:https?|mailto):[^\r\n\\]*|\/(?!\/)[^\r\n\\]*|\.{1,2}\/[^\r\n\\]*|[#?][^\r\n\\]*|[^:/?#\\\r\n]+(?:[/?#][^\r\n\\]*)?)$/i
const safeAssetUrl = /^(?:\.\.\/)?assets\/[a-zA-Z0-9._-]+$/
const safeYoutubeUrl = /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+$/

const exactClasses = new Set([
  'base', 'bibliography-item', 'bibliography-list', 'citation-interactive', 'confusion-matrix-block',
  'confusion-matrix-table', 'drawio-placeholder', 'katex', 'katex-display',
  'mermaid-placeholder', 'mord', 'mrel', 'mspace', 'mtight', 'nota-data-table',
  'nota-link', 'output', 'pipeline-placeholder', 'strut', 'sub-nota-link',
  'theorem', 'theorem-content', 'theorem-header', 'theorem-proof',
])

// KaTeX emits only inert typography/layout tokens. Avoid accepting generic app
// or Tailwind classes, which could turn persisted content into an overlay.
const safeGeneratedClass = /^(?:accent-body|accent-under|amsrm|arraycolsep|boldsymbol|delimsizing|enclosing|frac-line|fontsize-ensurer|halfarrow-left|halfarrow-right|hbox|hide-tail|html@mathml|katex-html|katex-mathml|lap|leftright|llap|mathnormal|mathit|mathrm|mathbf|mathsf|mathtt|mult|nulldelimiter|op-limits|overlay|pstrut|reset-size\d+|rlap|root|rule|sizing|size\d+|sqrt|sqrt-line|stretchy|text|textbf|textit|textrm|textsf|texttt|underline-line|vlist|vlist-r|vlist-s|vlist-t|vlist-t2)$/

const exportPurifier = DOMPurify(window)

exportPurifier.addHook('uponSanitizeAttribute', (node, event) => {
  const tagName = node.nodeName.toLowerCase()

  if (event.attrName === 'class') {
    event.attrValue = event.attrValue
      .split(/\s+/)
      .filter(token => exactClasses.has(token) || safeGeneratedClass.test(token) || /^language-[a-z0-9_+-]+$/i.test(token))
      .join(' ')
    event.keepAttr = event.attrValue.length > 0
  }

  if (event.attrName === 'href' && !safeLinkUrl.test(event.attrValue)) {
    event.keepAttr = false
  }

  if (event.attrName === 'src') {
    const allowed = tagName === 'img'
      ? safeAssetUrl.test(event.attrValue)
      : tagName === 'iframe' && safeYoutubeUrl.test(event.attrValue)
    if (!allowed) event.keepAttr = false
  }

  if (event.attrName === 'id' && !/^ref-[a-zA-Z0-9_-]+$/.test(event.attrValue)) {
    event.keepAttr = false
  }

  if (event.attrName.startsWith('data-') && event.attrName !== 'data-citation-json') {
    event.keepAttr = false
  }
})

const exportPolicy: Config = {
  ALLOWED_TAGS: [...allowedTags],
  ALLOWED_ATTR: [
    'allowfullscreen', 'alt', 'class', 'colspan', 'data-citation-json', 'frameborder', 'height',
    'href', 'id', 'rel', 'rowspan', 'src', 'target', 'title', 'width',
  ],
  ALLOWED_URI_REGEXP: safeLinkUrl,
  ALLOW_ARIA_ATTR: false,
  // The hook above reduces data attributes to data-citation-json only.
  ALLOW_DATA_ATTR: true,
  FORBID_TAGS: ['embed', 'form', 'link', 'meta', 'object', 'script', 'style', 'svg'],
  FORBID_ATTR: ['action', 'formaction', 'srcdoc', 'style', 'xlink:href'],
  KEEP_CONTENT: true,
  RETURN_TRUSTED_TYPE: false,
}

/** The one final trust boundary for the fully transformed exported nota body. */
export function sanitizeExportHtml(html: string): string {
  return exportPurifier.sanitize(html, exportPolicy)
}
