import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { EventEmitter } from 'node:events'
import { afterEach, describe, expect, it } from 'vitest'
import {
  type BrowserHarnessAggregateError,
  removeTemporaryDirectory,
  runBrowserAndCollectStdout,
  stopChildProcess,
  throwIfBrowserHarnessFailed,
} from '../../../e2e/browserHarnessCleanup'

const fixtures: string[] = []

afterEach(() => {
  for (const fixture of fixtures.splice(0)) rmSync(fixture, { force: true, recursive: true })
})

describe('throwIfBrowserHarnessFailed', () => {
  it('keeps the security assertion first when cleanup also fails', () => {
    const assertion = new Error('security assertion failed')
    const cleanup = new Error('cleanup failed')

    try {
      throwIfBrowserHarnessFailed(assertion, [cleanup])
      expect.unreachable('Expected the combined failure to be thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).name).toBe('AggregateError')
      expect((error as BrowserHarnessAggregateError).errors).toEqual([assertion, cleanup])
    }
  })
})

describe('stopChildProcess', () => {
  it('waits for delayed exit after escalating to SIGKILL', async () => {
    const child = new EventEmitter() as EventEmitter & {
      exitCode: number | null
      signalCode: NodeJS.Signals | null
      kill: (signal?: NodeJS.Signals) => boolean
    }
    child.exitCode = null
    child.signalCode = null
    const signals: Array<NodeJS.Signals | undefined> = []
    let exited = false
    child.kill = signal => {
      signals.push(signal)
      if (signal === 'SIGKILL') {
        setTimeout(() => {
          exited = true
          child.signalCode = 'SIGKILL'
          child.emit('exit', null, 'SIGKILL')
        }, 3)
      }
      return true
    }

    await stopChildProcess(child as never, 5)

    expect(signals).toEqual(['SIGTERM', 'SIGKILL'])
    expect(exited).toBe(true)
  })

  it('rejects without authorizing cleanup when a killed child never exits', async () => {
    const child = new EventEmitter() as EventEmitter & {
      exitCode: number | null
      signalCode: NodeJS.Signals | null
      kill: () => boolean
    }
    child.exitCode = null
    child.signalCode = null
    child.kill = () => true

    await expect(stopChildProcess(child as never, 5)).rejects.toThrow(/did not exit after SIGKILL/)
  })
})

describe('runBrowserAndCollectStdout', () => {
  it('waits for the spawned process to close before returning its complete output', async () => {
    const output = await runBrowserAndCollectStdout(
      process.execPath,
      ['-e', "setTimeout(() => process.stdout.write('browser-finished'), 10)"],
      { timeoutMs: 1_000 },
    )

    expect(output).toBe('browser-finished')
  })
})

function fixtureDirectory(): string {
  const directory = mkdtempSync(join(tmpdir(), 'bashnota-cleanup-test-'))
  fixtures.push(directory)
  writeFileSync(join(directory, 'still-being-written'), 'fixture')
  return directory
}

describe('removeTemporaryDirectory', () => {
  it('retries a transient non-empty browser profile and eventually removes it', () => {
    const directory = fixtureDirectory()
    let attempts = 0
    const waits: number[] = []

    removeTemporaryDirectory(directory, {
      removeDirectory(path, options) {
        attempts += 1
        if (attempts < 3) throw Object.assign(new Error('profile is still changing'), { code: 'ENOTEMPTY' })
        rmSync(path, options)
      },
      retryDelayMs: 10,
      wait: delay => waits.push(delay),
    })

    expect(attempts).toBe(3)
    expect(waits).toEqual([10, 20])
    expect(existsSync(directory)).toBe(false)
  })

  it('reports a terminal cleanup error without retrying it', () => {
    const directory = fixtureDirectory()
    let attempts = 0

    expect(() => removeTemporaryDirectory(directory, {
      removeDirectory() {
        attempts += 1
        throw Object.assign(new Error('invalid cleanup target'), { code: 'EINVAL' })
      },
      wait: () => undefined,
    })).toThrow(/after 1 attempt/)

    expect(attempts).toBe(1)
    expect(existsSync(directory)).toBe(true)
  })

  it('bounds repeated transient failures and reports the retained directory', () => {
    const directory = fixtureDirectory()
    let attempts = 0

    expect(() => removeTemporaryDirectory(directory, {
      maxAttempts: 3,
      removeDirectory() {
        attempts += 1
        throw Object.assign(new Error('profile is still changing'), { code: 'ENOTEMPTY' })
      },
      wait: () => undefined,
    })).toThrow(directory)

    expect(attempts).toBe(3)
    expect(existsSync(directory)).toBe(true)
  })
})
