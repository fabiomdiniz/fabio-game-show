import { describe, it, expect } from 'vitest'
import { buildBracket, advance, nextPowerOfTwo, championOf } from './bracket'

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

  it('advances winners and determines champion/runner-up', () => {
    let rounds = buildBracket(['a', 'b', 'c', 'd'])
    rounds = advance(rounds, 'm-0-0', 'a')
    rounds = advance(rounds, 'm-0-1', 'd')
    rounds = advance(rounds, 'm-1-0', 'a')
    expect(championOf(rounds)).toEqual({ champion: 'a', runnerUp: 'd' })
  })
})
