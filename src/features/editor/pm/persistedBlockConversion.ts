export function persistedNodeText(node: any): string {
  if (typeof node?.text === 'string') return node.text
  return Array.isArray(node?.content)
    ? node.content.map(persistedNodeText).filter(Boolean).join(' ')
    : ''
}

export function persistedInlineBlockData(node: any): Record<string, unknown> | null {
  if (node?.content?.length !== 1) return null
  const child = node.content[0]
  if (child.type === 'image') {
    return {
      type: 'image',
      src: child.attrs?.src || '',
      alt: child.attrs?.alt || '',
      caption: child.attrs?.title || '',
    }
  }
  if (child.type === 'citation') {
    return {
      type: 'citation',
      citationKey: child.attrs?.citationKey || '',
      citationData: child.attrs?.citationData || {},
    }
  }
  return null
}

export function persistedTableBlockData(node: any): Record<string, unknown> {
  return {
    type: 'table',
    headers: node.content?.[0]?.content?.map(persistedNodeText) || [],
    rows: node.content?.slice(1)?.map((row: any) => row.content?.map(persistedNodeText) || []) || [],
  }
}

export function persistedCustomBlockData(node: any): Record<string, unknown> | null {
  switch (node?.type) {
    case 'codeBlock':
      return {
        type: 'code',
        language: node.attrs?.language || 'text',
        content: persistedNodeText(node),
        output: node.attrs?.output,
        sessionId: node.attrs?.sessionId,
        isExecuting: node.attrs?.isExecuting || false,
        executionTime: node.attrs?.executionTime,
        error: node.attrs?.error,
      }
    case 'math':
      return {
        type: 'math',
        latex: node.attrs?.latex ?? persistedNodeText(node),
        displayMode: node.attrs?.displayMode || false,
      }
    case 'youtube':
      return {
        type: 'youtube',
        videoId: node.attrs?.videoId || '',
        title: node.attrs?.title || '',
      }
    case 'citation':
      return {
        type: 'citation',
        citationKey: node.attrs?.citationKey || '',
        citationData: node.attrs?.citationData || {},
      }
    case 'bibliography':
      return { type: 'bibliography', citations: node.attrs?.citations || [] }
    case 'subfigure':
      return {
        type: 'subfigure',
        images: node.attrs?.subfigures || [],
        layout: node.attrs?.layout || 'horizontal',
      }
    case 'notaTable':
      return {
        type: 'notaTable',
        tableData: node.attrs?.tableData || [],
        columns: node.attrs?.columns || [],
      }
    case 'aiGeneration':
      return {
        type: 'aiGeneration',
        prompt: node.attrs?.prompt || '',
        generatedContent: persistedNodeText(node),
        model: node.attrs?.model,
        timestamp: node.attrs?.timestamp,
      }
    case 'executableCodeBlock':
      return {
        type: 'executableCodeBlock',
        language: node.attrs?.language || 'text',
        content: persistedNodeText(node),
        output: node.attrs?.output,
        sessionId: node.attrs?.sessionId,
        isExecuting: node.attrs?.isExecuting || false,
        executionTime: node.attrs?.executionTime,
        error: node.attrs?.error,
        kernelPreferences: node.attrs?.kernelPreferences,
      }
    case 'confusionMatrix':
      return {
        type: 'confusionMatrix',
        matrixData: node.attrs?.matrixData,
        title: node.attrs?.title || 'Confusion Matrix',
        source: node.attrs?.source || 'upload',
        filePath: node.attrs?.filePath || '',
        stats: node.attrs?.stats,
      }
    case 'theorem':
      return {
        type: 'theorem',
        title: node.attrs?.title || 'Theorem',
        content: node.attrs?.content || '',
        proof: node.attrs?.proof || '',
        theoremType: node.attrs?.type || 'theorem',
        number: node.attrs?.number,
        tags: node.attrs?.tags || [],
      }
    case 'pipeline':
      return {
        type: 'pipeline',
        title: node.attrs?.title || 'Pipeline',
        description: node.attrs?.description,
        nodes: node.attrs?.nodes || [],
        edges: node.attrs?.edges || [],
        config: node.attrs?.config,
      }
    case 'mermaid':
      return {
        type: 'mermaid',
        content: node.attrs?.content || '',
        title: node.attrs?.title,
        theme: node.attrs?.theme || 'default',
        config: node.attrs?.config,
      }
    default:
      return null
  }
}
