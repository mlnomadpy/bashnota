
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportNotaToHtml } from '../exportService'
import { buildHtmlPage } from '../export/templates/defaultTemplate'
import JSZip from 'jszip'

// Mock Dependencies
vi.mock('jszip', () => {
    return {
        default: vi.fn().mockImplementation(() => ({
            file: vi.fn(),
            folder: vi.fn().mockReturnThis(),
            generateAsync: vi.fn().mockResolvedValue(new Blob(['test'], { type: 'application/zip' }))
        }))
    }
})

vi.mock('file-saver', () => ({
    saveAs: vi.fn()
}))

vi.mock('katex', () => ({
    default: {
        renderToString: vi.fn((latex) => `<span class="katex">${latex}</span>`)
    }
}))

// Mock Extensions
vi.mock('@/features/editor/components/extensions', async () => {
    const { getStockExtensions } = await import('@/features/editor/pm/stockExtensions')
    const Node = {
        create(config: any) {
            const declared = config.addAttributes?.() ?? {}
            const attrs = Object.fromEntries(Object.entries(declared).map(([name, value]: [string, any]) => [
                name,
                { default: value.default ?? null },
            ]))
            return {
                nodes: {
                    [config.name]: {
                        group: config.group,
                        content: config.content,
                        inline: config.inline,
                        atom: config.atom,
                        attrs,
                        toDOM: (node: any) => config.renderHTML({ node }),
                    },
                },
            }
        },
    }

    return {
        getEditorExtensions: () => [
            getStockExtensions(),
            Node.create({
                name: 'executableCodeBlock',
                group: 'block',
                addAttributes() { return { output: { default: '' }, language: { default: 'python' } } },
                renderHTML({ node }) {
                    return ['div', { 'data-type': 'executableCodeBlock' },
                        ['pre', {}, ['code', { class: `language-${node.attrs.language}` }, 0]],
                        node.attrs.output ? ['div', { class: 'export-code-output', 'data-output': node.attrs.output }] : ''
                    ]
                }
            }),
            Node.create({
                name: 'math',
                group: 'block',
                atom: true,
                addAttributes() { return { latex: { default: '' } } },
                renderHTML({ node }) {
                    return ['div', { 'data-type': 'math', 'data-latex': node.attrs.latex }]
                }
            }),
            Node.create({
                name: 'citation',
                inline: true,
                group: 'inline',
                atom: true,
                addAttributes() { return { citationKey: { default: '' }, citationNumber: { default: 1 } } },
                renderHTML({ node }) {
                    return ['span', {
                        'data-type': 'citation',
                        'data-citation-key': node.attrs.citationKey,
                        'data-citation-number': node.attrs.citationNumber
                    }, `[${node.attrs.citationNumber}]`]
                }
            }),
            Node.create({
                name: 'theorem',
                group: 'block',
                atom: true, // Matches real extension
                addAttributes() { return { title: { default: '' }, content: { default: '' }, proof: { default: '' }, type: { default: 'theorem' }, number: { default: null } } },
                renderHTML({ node }) {
                    return ['div', {
                        'data-type-theorem': '',
                        'data-title': node.attrs.title,
                        'data-content': node.attrs.content,
                        'data-proof': node.attrs.proof,
                        'data-theorem-type': node.attrs.type,
                        'data-number': node.attrs.number
                    }]
                }
            }),
            // NEW BLOCKS FOR TDD
            Node.create({
                name: 'subNotaLink',
                group: 'block',
                atom: true,
                addAttributes() { return { targetNotaId: { default: null }, targetNotaTitle: { default: 'Sub Nota' } } },
                renderHTML({ node }) {
                    return ['span', { 'data-type': 'sub-nota-link', 'data-target-nota-id': node.attrs.targetNotaId }, node.attrs.targetNotaTitle]
                }
            }),
            Node.create({
                name: 'notaTable',
                group: 'block',
                atom: true,
                addAttributes() { return { tableData: { default: null } } },
                renderHTML({ node }) {
                    return ['div', { 'data-type': 'data-table', 'data-table-data': JSON.stringify(node.attrs.tableData) }]
                }
            }),
            Node.create({
                name: 'bibliography',
                group: 'block',
                atom: true,
                renderHTML() {
                    return ['div', { 'data-type': 'bibliography' }]
                }
            }),
            Node.create({
                name: 'drawIo',
                group: 'block',
                atom: true,
                renderHTML() {
                    return ['div', { 'class': 'drawio-diagram' }] // Simplified mock
                }
            }),
            Node.create({
                name: 'youtube',
                group: 'block',
                atom: true,
                addAttributes() { return { videoId: { default: null }, url: { default: null } } },
                renderHTML({ node }) {
                    return ['div', { 'data-type': 'youtube', 'videoId': node.attrs.videoId }]
                }
            }),
            Node.create({
                name: 'mermaid',
                group: 'block',
                atom: true,
                renderHTML() {
                    return ['div', { 'data-type': 'mermaid' }]
                }
            }),
            Node.create({
                name: 'taskList',
                group: 'block',
                content: 'taskItem+',
                renderHTML() { return ['ul', { 'data-type': 'taskList' }, 0] }
            }),
            Node.create({
                name: 'taskItem',
                group: 'block',
                content: 'paragraph',
                addAttributes() { return { checked: { default: false } } },
                renderHTML({ node }) {
                    return ['li', { 'data-type': 'taskItem', 'data-checked': node.attrs.checked }, 0]
                }
            })
        ]
    }
})

describe('Export Service', () => {
    let zipMock: any

    beforeEach(() => {
        vi.clearAllMocks()
        zipMock = {
            file: vi.fn(),
            folder: vi.fn().mockReturnThis(),
            generateAsync: vi.fn().mockResolvedValue(new Blob(['test'], { type: 'application/zip' }))
        }
            ; (JSZip as any).mockImplementation(() => zipMock)
    })

    // --- Existing Tests (Simplified for brevity but kept essential ones) ---
    it('should export simple text content correctly', async () => {
        const content = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello World' }] }] }
        await exportNotaToHtml({ title: 'Test Doc', content, fetchNota: vi.fn() as any })
        expect(zipMock.file).toHaveBeenCalledWith('index.html', expect.stringContaining('Hello World'))
    })

    // --- New Tests for Recursive Export & Custom Blocks ---

    it('should recursively export sub-notas and rewrite links', async () => {
        // Setup Root content with a link to Child
        const rootContent = {
            type: 'doc',
            content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'Root Page' }] },
                { type: 'subNotaLink', attrs: { targetNotaId: 'child-1', targetNotaTitle: 'Child Page' } }
            ]
        }

        // Setup Child content
        const childContent = {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'I am the child' }] }]
        }

        // Mock fetcher
        const fetchNota = vi.fn().mockImplementation(async (id) => {
            if (id === 'child-1') return { title: 'Child Page', content: childContent }
            return null
        })

        await exportNotaToHtml({ title: 'Root Doc', content: rootContent, rootNotaId: 'root', fetchNota })

        // 1. Check Root exported
        expect(zipMock.file).toHaveBeenCalledWith('index.html', expect.stringContaining('Root Page'))

        // 2. Check Child exported (in pages folder)
        expect(zipMock.file).toHaveBeenCalledWith('pages/child-1.html', expect.stringContaining('I am the child'))

        // 3. Check Link Rewritten in Root (index.html)
        // It currently renders as span[data-type=sub-nota-link]... export service should convert it to <a>
        // Note: checking if args passed to 'index.html' call contains the anchor tag
        const indexHtmlCall = zipMock.file.mock.calls.find((c: any) => c[0] === 'index.html')
        expect(indexHtmlCall[1]).toMatch(/<a [^>]*href="pages\/child-1\.html"/)
        expect(indexHtmlCall[1]).toContain('Child Page') // Link text
    })

    it('should transform notaTable to HTML table', async () => {
        const tableData = {
            columns: [{ id: 'col1', title: 'Name' }, { id: 'col2', title: 'Age' }],
            rows: [
                { id: 'row1', cells: { col1: 'Alice', col2: '30' } },
                { id: 'row2', cells: { col1: 'Bob', col2: '25' } }
            ]
        }

        const content = {
            type: 'doc',
            content: [
                { type: 'notaTable', attrs: { tableData } }
            ]
        }

        await exportNotaToHtml({ title: 'Table Doc', content, fetchNota: vi.fn() as any })

        const indexHtmlCall = zipMock.file.mock.calls.find((c: any) => c[0] === 'index.html')
        expect(indexHtmlCall[1]).toContain('<table')
        expect(indexHtmlCall[1]).toContain('Alice')
        expect(indexHtmlCall[1]).toContain('30')
        expect(indexHtmlCall[1]).toContain('Name') // Header
    })

    it('should generate bibliography from citations', async () => {
        const content = {
            type: 'doc',
            content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'Cite' }, { type: 'citation', attrs: { citationKey: 'ref1', citationNumber: 1 } }] },
                { type: 'bibliography', attrs: {} }
            ]
        }

        await exportNotaToHtml({ title: 'Bib Doc', content, fetchNota: vi.fn() as any })

        const indexHtmlCall = zipMock.file.mock.calls.find((c: any) => c[0] === 'index.html')
        // We expect the bibliography div to be replaced/filled with a list
        expect(indexHtmlCall[1]).toContain('<ul class="bibliography-list"')
        expect(indexHtmlCall[1]).toContain('[1] ref1') // Should list the citation
    })

    it('should transform youtube block to iframe', async () => {
        const content = {
            type: 'doc',
            content: [
                { type: 'youtube', attrs: { videoId: 'abc12345', url: 'https://youtu.be/abc12345' } }
            ]
        }

        await exportNotaToHtml({ title: 'YT Doc', content, fetchNota: vi.fn() as any })

        const indexHtmlCall = zipMock.file.mock.calls.find((c: any) => c[0] === 'index.html')
        expect(indexHtmlCall[1]).toContain('<iframe')
        expect(indexHtmlCall[1]).toContain('src="https://www.youtube.com/embed/abc12345"')
        expect(indexHtmlCall[1]).not.toContain('data-type="youtube"') // Should replace the div
    })

    it('should generate mermaid placeholder', async () => {
        const content = {
            type: 'doc',
            content: [
                { type: 'mermaid', attrs: {} }
            ]
        }

        await exportNotaToHtml({ title: 'Mermaid Doc', content, fetchNota: vi.fn() as any })

        const indexHtmlCall = zipMock.file.mock.calls.find((c: any) => c[0] === 'index.html')
        expect(indexHtmlCall[1]).toContain('class="mermaid-placeholder"')
        expect(indexHtmlCall[1]).toContain('Interactive Only')
    })

    it('should transform theorem and math blocks correctly', async () => {
        const content = {
            type: 'doc',
            content: [
                {
                    type: 'theorem',
                    attrs: {
                        title: 'Pythagoras',
                        content: 'a^2 + b^2 = c^2',
                        proof: 'Visual proof',
                        type: 'theorem',
                        number: 1
                    }
                },
                {
                    type: 'math',
                    attrs: { latex: 'E=mc^2' }
                }
            ]
        }

        await exportNotaToHtml({ title: 'Math Doc', content, fetchNota: vi.fn() as any })

        const indexHtmlCall = zipMock.file.mock.calls.find((c: any) => c[0] === 'index.html')

        // Check Theorem
        expect(indexHtmlCall[1]).toContain('class="theorem"')
        expect(indexHtmlCall[1]).toContain('Theorem 1: Pythagoras')
        expect(indexHtmlCall[1]).toContain('a^2 + b^2 = c^2')
        expect(indexHtmlCall[1]).toContain('Visual proof')

        // Check Math
        expect(indexHtmlCall[1]).toContain('<span class="katex">E=mc^2</span>')
    })

    it('should process inline latex in text', async () => {
        const content = {
            type: 'doc',
            content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'The energy is $E=mc^2$ in theory.' }] }
            ]
        }

        await exportNotaToHtml({ title: 'Inline Math', content, fetchNota: vi.fn() as any })

        const indexHtmlCall = zipMock.file.mock.calls.find((c: any) => c[0] === 'index.html')
        expect(indexHtmlCall[1]).toContain('The energy is ')
        expect(indexHtmlCall[1]).toContain('<span class="katex">E=mc^2</span>')
        expect(indexHtmlCall[1]).toContain(' in theory.')
    })

    it('applies one final export allowlist and URL policy after all block transformations', () => {
        const maliciousBody = `
          <p onclick="globalThis.__exportPwned = 1">kept text</p>
          <script>globalThis.__exportPwned = 2</script>
          <svg onload="globalThis.__exportPwned = 3"><script>globalThis.__exportPwned = 4</script></svg>
          <img src="https://attacker.invalid/fetch" onerror="globalThis.__exportPwned = 5">
          <a href="javascript:globalThis.__exportPwned = 6">unsafe link</a>
          <a href="https://example.com/safe">safe link</a>
          <iframe srcdoc="<script>globalThis.__exportPwned = 7</script>" src="data:text/html,pwn"></iframe>
          <div id="citation-tooltip" class="fixed inset-0 z-50 theorem">overlay</div>
          <img src="assets/image_0.png" alt="safe image">
          <table class="nota-data-table"><tbody><tr><td>safe table</td></tr></tbody></table>
          <span class="katex mord">safe math</span>
        `

        const html = buildHtmlPage('</title><script>globalThis.__exportPwned = 8</script>', maliciousBody)
        const parsed = new DOMParser().parseFromString(html, 'text/html')
        const article = parsed.querySelector('article')!

        expect(parsed.title).toBe('</title><script>globalThis.__exportPwned = 8</script>')
        expect(article.querySelector('script, svg, form, object, embed')).toBeNull()
        expect(article.querySelector('[onclick], [onerror], [onload], [srcdoc], [style]')).toBeNull()
        expect(article.querySelector('a')?.hasAttribute('href')).toBe(false)
        expect(article.querySelectorAll('a')[1]?.getAttribute('href')).toBe('https://example.com/safe')
        expect(article.querySelector('iframe')?.hasAttribute('src')).toBe(false)
        expect(article.querySelector('img[src="https://attacker.invalid/fetch"]')).toBeNull()
        expect(article.querySelector('img[src="assets/image_0.png"]')).not.toBeNull()
        expect(article.querySelector('.fixed, .inset-0, .z-50')).toBeNull()
        expect(article.querySelector('.theorem')).not.toBeNull()
        expect(article.querySelector('.nota-data-table')).not.toBeNull()
        expect(article.querySelector('.katex.mord')).not.toBeNull()
        expect(article.querySelector('#citation-tooltip')).toBeNull()
        expect(html).not.toContain('tooltip.innerHTML')
        expect(html).toContain('tooltip.replaceChildren()')
    })

    it('keeps citation metadata inert until tooltip text nodes are constructed', async () => {
        const payload = '<img src=x onerror="globalThis.__citationPwned = 1">'
        const content = {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'citation', attrs: { citationKey: 'evil', citationNumber: 1 } }] }]
        }
        await exportNotaToHtml({
            title: 'Citations',
            content,
            citations: [{ key: 'evil', title: payload, authors: [payload], journal: payload }]
        })

        const html = zipMock.file.mock.calls.find((call: any) => call[0] === 'index.html')[1]
        const parsed = new DOMParser().parseFromString(html, 'text/html')
        const citation = parsed.querySelector('.citation-interactive')
        expect(citation).not.toBeNull()
        expect(JSON.parse(citation!.getAttribute('data-citation-json')!).title).toBe(payload)
        expect(parsed.querySelector('article img')).toBeNull()
    })

})
