import type { JupyterServer } from '@/features/jupyter/types/jupyter'

type Confirmer = (message: string) => boolean

const confirmedRemoteServers = new Set<string>()

function serverUrl(server: JupyterServer): URL {
  const raw = /^https?:\/\//i.test(server.ip) ? server.ip : `http://${server.ip}`
  const url = new URL(raw)
  if (server.port) url.port = server.port
  return url
}

export function isLocalJupyterServer(server: JupyterServer): boolean {
  const hostname = serverUrl(server)
    .hostname.replace(/^\[|\]$/g, '')
    .toLowerCase()
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

export function getJupyterBaseUrl(server: JupyterServer): string {
  const url = serverUrl(server)
  if (!isLocalJupyterServer(server) && url.protocol !== 'https:') {
    throw new Error('Remote Jupyter servers require HTTPS (and WSS for execution).')
  }
  return url.origin
}

export function getJupyterHeaders(server: JupyterServer): Record<string, string> {
  return server.token ? { Authorization: `token ${server.token}` } : {}
}

export function confirmJupyterConnection(
  server: JupyterServer,
  confirm: Confirmer = (message) => window.confirm(message),
): void {
  if (isLocalJupyterServer(server)) return
  const origin = getJupyterBaseUrl(server)
  if (confirmedRemoteServers.has(origin)) return
  if (
    !confirm(`Connect to remote Jupyter server ${origin}? The server can receive notebook data.`)
  ) {
    throw new Error('Remote Jupyter connection was not confirmed.')
  }
  confirmedRemoteServers.add(origin)
}

export function confirmJupyterExecution(
  server: JupyterServer,
  confirm: Confirmer = (message) => window.confirm(message),
): void {
  confirmJupyterConnection(server, confirm)
  const location = isLocalJupyterServer(server) ? 'your local computer' : getJupyterBaseUrl(server)
  if (
    !confirm(
      `Run this code with Jupyter on ${location}? That kernel has the authority of its Jupyter process.`,
    )
  ) {
    throw new Error('Jupyter code execution was not confirmed.')
  }
}

export function getJupyterWebSocketUrl(server: JupyterServer, kernelId: string): string {
  confirmJupyterConnection(server)
  const base = new URL(getJupyterBaseUrl(server))
  base.protocol = base.protocol === 'https:' ? 'wss:' : 'ws:'
  base.pathname = `/api/kernels/${encodeURIComponent(kernelId)}/channels`
  return base.toString()
}

export function resetJupyterConfirmationsForTest(): void {
  confirmedRemoteServers.clear()
}
