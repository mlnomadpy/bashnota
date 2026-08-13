import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import OutputRenderer from '../OutputRenderer.vue'
import ErrorDisplay from '../ErrorDisplay.vue'

const executionOutput = vi.hoisted(() => ({ value: '' }))

vi.mock('@/features/nota/stores/nota', () => ({
  useNotaStore: () => ({
    getCurrentNota: () => ({ title: 'Test nota' }),
  }),
}))

vi.mock('@/features/editor/stores/codeExecutionStore', () => ({
  useCodeExecutionStore: () => ({
    registerCodeCells: vi.fn(),
    getCellById: () => ({ output: executionOutput.value, hasError: false }),
  }),
}))

vi.mock('@/features/nota/stores/blockStore', () => ({
  useBlockStore: () => ({
    loadNotaBlocks: async () => [{
      id: 'block-1',
      type: 'executableCodeBlock',
      output: executionOutput.value,
      content: '',
      language: 'python',
    }],
  }),
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({}),
  useRouter: () => ({}),
}))

vi.mock('@/services/logger', () => ({
  logger: { debug: vi.fn(), error: vi.fn() },
}))

import CodeBlockOutputView from '@/features/editor/views/CodeBlockOutputView.vue'

const unsafeInlineOutput = '<strong onerror="alert(2)">unsafe</strong><a href="javascript:alert(3)">bad</a><strong>safe</strong><pre><code class="language-python">print(1)</code></pre>'
const unsafeTextOutput = '<strong onerror="alert(2)">unsafe</strong><strong>safe</strong><pre><code class="language-python">print(1)</code></pre>'
const maliciousOutput = `<script>alert(1)</script>${unsafeInlineOutput}`

const collapsibleStubs = {
  Collapsible: { template: '<div><slot /></div>' },
  CollapsibleTrigger: { template: '<div><slot /></div>' },
  CollapsibleContent: { template: '<div><slot /></div>' },
}

describe('execution output v-html sanitization', () => {
  it('sanitizes every OutputRenderer v-html path while retaining safe formatting', async () => {
    const text = mount(OutputRenderer, {
      props: { content: unsafeTextOutput, type: 'text' },
    })
    await flushPromises()

    const textOutput = text.find('.text-output')
    expect(textOutput.html()).not.toMatch(/onerror=/i)
    expect(textOutput.html()).toContain('<strong>safe</strong>')
    expect(textOutput.html()).toContain('<pre><code class="language-python">print(1)</code></pre>')

    const json = mount(OutputRenderer, {
      props: { content: JSON.stringify({ output: maliciousOutput }), type: 'json' },
    })
    await flushPromises()

    const jsonOutput = json.find('.json-viewer pre')
    expect(jsonOutput.html()).not.toContain('<script')
    expect(jsonOutput.html()).not.toMatch(/onerror=/i)
    expect(jsonOutput.html()).not.toMatch(/href="javascript:/i)

    const error = mount(OutputRenderer, {
      props: { content: `Error: ${maliciousOutput}`, type: 'error' },
    })
    await flushPromises()

    const errorOutput = error.find('.error-output-container')
    expect(errorOutput.html()).not.toContain('<script')
    expect(errorOutput.html()).not.toMatch(/onerror=/i)
    expect(errorOutput.html()).not.toMatch(/href="javascript:/i)
  })

  it('sanitizes ErrorDisplay error HTML while retaining its safe highlighted markup', () => {
    const wrapper = mount(ErrorDisplay, {
      props: { error: `Error: ${maliciousOutput}` },
      global: { stubs: collapsibleStubs },
    })

    expect(wrapper.html()).not.toContain('<script')
    expect(wrapper.html()).not.toMatch(/onerror=/i)
    expect(wrapper.html()).not.toMatch(/href="javascript:/i)
    expect(wrapper.html()).toContain('text-red-500')
    expect(wrapper.html()).toContain('<strong>safe</strong>')
  })

  it('sanitizes CodeBlockOutputView output before its v-html binding', async () => {
    executionOutput.value = maliciousOutput
    const wrapper = mount(CodeBlockOutputView, {
      props: { notaId: 'nota-1', blockId: 'block-1' },
      global: { stubs: { IframeOutputRenderer: true } },
    })
    await flushPromises()

    expect(wrapper.html()).not.toContain('<script')
    expect(wrapper.html()).not.toMatch(/onerror=/i)
    expect(wrapper.html()).not.toMatch(/href="javascript:/i)
    expect(wrapper.html()).toContain('<strong>safe</strong>')
    expect(wrapper.html()).toContain('<pre><code class="language-python">print(1)</code></pre>')
  })
})
