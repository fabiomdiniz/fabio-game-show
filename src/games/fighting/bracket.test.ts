import { describe, it, expect } from 'vitest'
import type { FightingMatch } from '../../types'
import { buildBracket, advance, nextPowerOfTwo, championOf, undoWinner } from './bracket'

// Deterministic RNG (mulberry32) for shuffle tests.
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('bracket', () => {
  it('rounds up to the nearest power of two', () => {
    expect(nextPowerOfTwo(3)).toBe(4)
    expect(nextPowerOfTwo(4)).toBe(4)
    expect(nextPowerOfTwo(5)).toBe(8)
    expect(nextPowerOfTwo(1)).toBe(1)
  })

  it('builds a balanced bracket with byes for non-power-of-2', () => {
    const rounds = buildBracket(['a', 'b', 'c'])
    expect(rounds).toHaveLength(2)
    expect(rounds[0].filter((m) => m.bye)).toHaveLength(1)
    expect(rounds[rounds.length - 1]).toHaveLength(1)
  })

  it('shuffles entrants but preserves the full set', () => {
    const entrants = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    const rounds = buildBracket(entrants, mulberry32(42))
    const placed = rounds[0]
      .flatMap((m) => [m.playerA, m.playerB].filter((x): x is string => x !== null))
      .sort()
    expect(placed).toEqual([...entrants].sort())
  })

  it('is deterministic for the same rng seed', () => {
    const entrants = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    expect(buildBracket(entrants, mulberry32(7))).toEqual(buildBracket(entrants, mulberry32(7)))
  })

  it('advances winners and determines champion/runner-up', () => {
    const rounds: FightingMatch[][] = [
      [
        { id: 'm-0-0', playerA: 'a', playerB: 'b', winnerId: null, bye: false },
        { id: 'm-0-1', playerA: 'c', playerB: 'd', winnerId: null, bye: false },
      ],
      [{ id: 'm-1-0', playerA: null, playerB: null, winnerId: null, bye: false }],
    ]
    let r = advance(rounds, 'm-0-0', 'a')
    r = advance(r, 'm-0-1', 'd')
    r = advance(r, 'm-1-0', 'a')
    expect(championOf(r)).toEqual({ champion: 'a', runnerUp: 'd' })
  })

  it('undoes a winner and clears the slot it fed into the next round', () => {
    const rounds: FightingMatch[][] = [
      [
        { id: 'm-0-0', playerA: 'a', playerB: 'b', winnerId: 'a', bye: false },
        { id: 'm-0-1', playerA: 'c', playerB: 'd', winnerId: null, bye: false },
      ],
      [{ id: 'm-1-0', playerA: 'a', playerB: null, winnerId: null, bye: false }],
    ]
    const r = undoWinner(rounds, 'm-0-0')
    expect(r[0][0].winnerId).toBeNull()
    expect(r[1][0].playerA).toBeNull()
  })

  it('blocks undo when the downstream match is already decided', () => {
    const rounds: FightingMatch[][] = [
      [
        { id: 'm-0-0', playerA: 'a', playerB: 'b', winnerId: 'a', bye: false },
        { id: 'm-0-1', playerA: 'c', playerB: 'd', winnerId: 'c', bye: false },
      ],
      [{ id: 'm-1-0', playerA: 'a', playerB: 'c', winnerId: 'a', bye: false }],
    ]
    expect(undoWinner(rounds, 'm-0-0')).toEqual(rounds)
  })

  it('does not undo a structural bye', () => {
    const rounds: FightingMatch[][] = [
      [
        { id: 'm-0-0', playerA: 'a', playerB: null, winnerId: 'a', bye: true },
        { id: 'm-0-1', playerA: 'c', playerB: 'd', winnerId: null, bye: false },
      ],
      [{ id: 'm-1-0', playerA: 'a', playerB: null, winnerId: null, bye: false }],
    ]
    expect(undoWinner(rounds, 'm-0-0')).toEqual(rounds)
  })
})
