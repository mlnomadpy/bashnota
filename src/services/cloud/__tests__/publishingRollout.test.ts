import { describe, expect, it } from 'vitest'
import { resolvePublishingRollout } from '../publishingRollout'

describe('publishing rollout gate', () => {
  it('defaults to Firebase and fails closed for incomplete reconciliation', () => {
    expect(resolvePublishingRollout({}).version).toBe('firebase-v1')
    expect(resolvePublishingRollout({ version: 'supabase-v1', enabled: 'true', marker: 'publishing-c5-test' }).version)
      .toBe('firebase-v1')
  })
})
