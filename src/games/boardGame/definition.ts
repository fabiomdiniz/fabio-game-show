import type {
  BoardGameAction,
  BoardGameConfig,
  BoardGameState,
  GameDefinition,
} from '../../types'

export const boardGameDefinition: GameDefinition<
  'boardGame',
  BoardGameConfig,
  BoardGameState,
  BoardGameAction
> = {
  kind: 'boardGame',
  title: 'Board Game',
  acceptedKinds: ['individual', 'team'],
  initialConfig: () => ({ name: 'Board Game', pointValue: 12 }),
  initialState: (c) => ({ winners: [], pointValue: c.pointValue }),
  validateConfig: (c) => {
    if (typeof c.name !== 'string' || c.name.trim() === '') return 'Name is required'
    if (!Number.isInteger(c.pointValue) || c.pointValue <= 0) return 'Point value must be a positive integer'
    return null
  },
  applyAction: (s, a) => {
    if (a.type === 'award') {
      return {
        state: { ...s, winners: a.winnerIds },
        deltas: a.winnerIds.map((participantId) => ({ participantId, delta: s.pointValue })),
      }
    }
    return { state: s, deltas: [] }
  },
  isFinished: (s) => s.winners.length > 0,
}
