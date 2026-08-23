import { describe, it, expect } from 'vitest'
import { fightingDefinition as def } from './definition'

describe('fighting definition', () => {
  it('validates config', () => {
    expect(def.validateConfig({ firstPlacePoints: 10, secondPlacePoints: 5, entrants: ['a', 'b'] })).toBeNull()
    expect(def.validateConfig({ firstPlacePoints: 5, secondPlacePoints: 10, entrants: ['a', 'b'] })).toMatch(/<=/)
    expect(def.validateConfig({ firstPlacePoints: 10, secondPlacePoints: 5, entrants: ['a'] })).toMatch(/entrants/)
  })

  it('scores champion and runner-up at the final', () => {
    const s = def.initialState({ firstPlacePoints: 10, secondPlacePoints: 5, entrants: ['a', 'b'] })
    const final = s.rounds[0][0]
    const r = def.applyAction(s, { type: 'advance', matchId: final.id, winnerId: 'a' })
    expect(r.deltas).toEqual([
      { participantId: 'a', delta: 10 },
      { participantId: 'b', delta: 5 },
    ])
    expect(def.isFinished(r.state)).toBe(true)
  })
})
