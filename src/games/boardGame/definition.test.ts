import { describe, it, expect } from 'vitest'
import { boardGameDefinition as def } from './definition'

describe('boardGame definition', () => {
  it('validates config', () => {
    expect(def.validateConfig({ name: 'Catan', pointValue: 5 })).toBeNull()
    expect(def.validateConfig({ name: '', pointValue: 5 })).toMatch(/Name/)
    expect(def.validateConfig({ name: 'Catan', pointValue: 0 })).toMatch(/Point/)
  })

  it('awards points to winners and finishes', () => {
    const s = def.initialState({ name: 'Catan', pointValue: 5 })
    const r = def.applyAction(s, { type: 'award', winnerIds: ['a', 'b'] })
    expect(r.deltas).toEqual([
      { participantId: 'a', delta: 5 },
      { participantId: 'b', delta: 5 },
    ])
    expect(def.isFinished(r.state)).toBe(true)
  })
})
