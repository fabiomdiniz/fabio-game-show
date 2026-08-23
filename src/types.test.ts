import { describe, it, expect } from 'vitest'
import type { GameInstance } from './types'

// Exhaustive narrowing helper: if a new GameKind is added without a case here,
// TypeScript errors on the never assignment (compile-time check).
function gameTitle(instance: GameInstance): string {
  switch (instance.kind) {
    case 'boardGame':
      return instance.config.name
    case 'fighting':
      return 'Fighting Game'
    case 'feud':
      return 'Fábio-ly Feud'
    case 'jeopardy':
      return 'What is… Panda?'
    default: {
      const _exhaustive: never = instance
      return _exhaustive
    }
  }
}

describe('GameInstance discriminated union', () => {
  it('narrows config by kind', () => {
    const inst: GameInstance = {
      id: 'g1',
      kind: 'boardGame',
      status: 'setup',
      config: { name: 'Catan', pointValue: 5 },
      state: { winners: [] },
      initialPoints: {},
      appliedDeltas: [],
    }
    expect(gameTitle(inst)).toBe('Catan')
  })

  it('narrows fighting state to rounds', () => {
    const inst: GameInstance = {
      id: 'g2',
      kind: 'fighting',
      status: 'inProgress',
      config: { firstPlacePoints: 10, secondPlacePoints: 5, entrants: ['a', 'b'] },
      state: { rounds: [] },
      initialPoints: { a: 0, b: 0 },
      appliedDeltas: [],
    }
    expect(gameTitle(inst)).toBe('Fighting Game')
    expect(Array.isArray(inst.state.rounds)).toBe(true)
  })
})
