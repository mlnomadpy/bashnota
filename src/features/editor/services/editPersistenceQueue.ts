export interface PersistedEditOperation<TContent = unknown> {
  id: string
  type: 'insert' | 'delete' | 'update'
  position: number
  content?: TContent
  timestamp: number
  applied: boolean
}

/**
 * Editor transactions contain a complete document snapshot. When the queue is
 * saturated, keeping the newest snapshot is therefore sufficient to preserve
 * the user's latest document without allowing the queue to grow forever.
 */
export function enqueuePersistedEdit<TContent>(
  queue: PersistedEditOperation<TContent>[],
  operation: PersistedEditOperation<TContent>,
  maximumSize = 50,
): PersistedEditOperation<TContent>[] {
  if (maximumSize < 1) throw new Error('Edit queue capacity must be at least one.')
  if (queue.length < maximumSize) return [...queue, operation]
  return [operation]
}
