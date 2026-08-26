import { spawn, type ChildProcess } from 'node:child_process'
import { rmSync } from 'node:fs'

const RETRYABLE_CLEANUP_CODES = new Set(['EBUSY', 'EMFILE', 'ENFILE', 'ENOTEMPTY', 'EPERM'])

type RemoveDirectory = typeof rmSync

interface CleanupOptions {
  maxAttempts?: number
  removeDirectory?: RemoveDirectory
  retryDelayMs?: number
  wait?: (delayMs: number) => void
}

interface BrowserProcessOptions {
  timeoutMs?: number
}

function blockingWait(delayMs: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delayMs)
}

export function removeTemporaryDirectory(
  directory: string,
  {
    maxAttempts = 6,
    removeDirectory = rmSync,
    retryDelayMs = 50,
    wait = blockingWait,
  }: CleanupOptions = {},
): void {
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
    throw new TypeError('maxAttempts must be a positive integer')
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      removeDirectory(directory, { force: true, recursive: true })
      return
    } catch (error) {
      const code = error instanceof Error && 'code' in error ? String(error.code) : ''
      if (!RETRYABLE_CLEANUP_CODES.has(code) || attempt === maxAttempts) {
        const cleanupError = new Error(
          `Failed to remove browser test directory after ${attempt} attempt(s): ${directory}`,
        ) as Error & { cause?: unknown }
        cleanupError.cause = error
        throw cleanupError
      }
      wait(retryDelayMs * attempt)
    }
  }
}

export async function stopChildProcess(child: ChildProcess, timeoutMs = 2_000): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) return

  await new Promise<void>((resolve, reject) => {
    let killTimeout: ReturnType<typeof setTimeout> | undefined
    const termTimeout = setTimeout(() => {
      child.kill('SIGKILL')
      killTimeout = setTimeout(() => {
        reject(new Error(`Child process did not exit after SIGKILL within ${timeoutMs}ms`))
      }, timeoutMs)
    }, timeoutMs)

    child.once('exit', () => {
      clearTimeout(termTimeout)
      if (killTimeout) clearTimeout(killTimeout)
      resolve()
    })
    child.once('error', error => {
      clearTimeout(termTimeout)
      if (killTimeout) clearTimeout(killTimeout)
      reject(error)
    })
    child.kill('SIGTERM')
  })
}

function processGroupExists(pid: number): boolean {
  try {
    process.kill(-pid, 0)
    return true
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ESRCH') return false
    throw error
  }
}

async function waitForProcessGroupExit(pid: number, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs
  while (processGroupExists(pid) && Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 25))
  }
  return !processGroupExists(pid)
}

async function stopProcessGroup(pid: number, timeoutMs: number): Promise<void> {
  if (process.platform === 'win32' || !processGroupExists(pid)) return

  process.kill(-pid, 'SIGTERM')
  if (await waitForProcessGroupExit(pid, timeoutMs)) return

  process.kill(-pid, 'SIGKILL')
  if (await waitForProcessGroupExit(pid, timeoutMs)) return
  throw new Error(`Browser process group ${pid} did not exit after SIGKILL`)
}

export async function runBrowserAndCollectStdout(
  executable: string,
  args: string[],
  { timeoutMs = 8_000 }: BrowserProcessOptions = {},
): Promise<string> {
  const detached = process.platform !== 'win32'
  const child = spawn(executable, args, {
    detached,
    stdio: ['ignore', 'pipe', 'ignore'],
  })
  let stdout = ''
  child.stdout?.setEncoding('utf8')
  child.stdout?.on('data', chunk => {
    stdout += chunk
  })

  let timedOut = false
  let timeoutFailure: unknown
  const timeout = setTimeout(() => {
    timedOut = true
    if (detached && child.pid) {
      try {
        process.kill(-child.pid, 'SIGKILL')
      } catch (error) {
        if (!(error instanceof Error && 'code' in error && error.code === 'ESRCH')) {
          timeoutFailure = error
          child.kill('SIGKILL')
        }
      }
    } else {
      child.kill('SIGKILL')
    }
  }, timeoutMs)

  try {
    await new Promise<void>((resolve, reject) => {
      child.once('close', () => resolve())
      child.once('error', reject)
    })
  } finally {
    clearTimeout(timeout)
    if (detached && child.pid) await stopProcessGroup(child.pid, 1_000)
  }

  if (timeoutFailure !== undefined) throw timeoutFailure
  if (timedOut && stdout.length === 0) return ''
  return stdout
}

export interface BrowserHarnessAggregateError extends Error {
  errors: unknown[]
}

function aggregateError(errors: unknown[], message: string): BrowserHarnessAggregateError {
  const error = new Error(message) as BrowserHarnessAggregateError
  error.name = 'AggregateError'
  error.errors = errors
  return error
}

export function throwIfBrowserHarnessFailed(testFailure: unknown, cleanupFailures: unknown[]): void {
  if (testFailure !== undefined) {
    if (cleanupFailures.length > 0) {
      throw aggregateError(
        [testFailure, ...cleanupFailures],
        'Export security assertions and browser cleanup failed',
      )
    }
    throw testFailure
  }
  if (cleanupFailures.length > 0) {
    throw aggregateError(cleanupFailures, 'Export security browser cleanup failed')
  }
}
