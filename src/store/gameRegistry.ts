import type { GameDefinition, GameKind } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyGameDefinition = GameDefinition<GameKind, any, any, any>

const registry = new Map<GameKind, AnyGameDefinition>()

export function registerGame<K extends GameKind, C, S, A>(def: GameDefinition<K, C, S, A>): void {
  registry.set(def.kind, def as AnyGameDefinition)
}

export function getGameDefinition(kind: GameKind): AnyGameDefinition | undefined {
  return registry.get(kind)
}

export function listGames(): AnyGameDefinition[] {
  return Array.from(registry.values())
}
