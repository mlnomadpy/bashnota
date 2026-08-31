import { describe, expect, it } from 'vitest'
import {
  enqueuePersistedEdit,
  type PersistedEditOperation,
} from '../editPersistenceQueue'

function edit(index: number): PersistedEditOperation<{ value: number }> {
  return {
    id: `edit-${index}`,
    type: 'update',
    position: index,
    content: { value: index },
    timestamp: index,
    applied: false,
  }
}

describe('enqueuePersistedEdit', () => {
  it('retains the triggering edit when the bounded queue is saturated', () => {
    let queue: PersistedEditOperation<{ value: number }>[] = []
    for (let index = 0; index < 60; index += 1) {
      queue = enqueuePersistedEdit(queue, edit(index), 50)
    }

    expect(queue.at(-1)?.content).toEqual({ value: 59 })
    expect(queue.length).toBeLessThanOrEqual(50)
  })
})
