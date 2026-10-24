import type {
  FightingAction,
  FightingConfig,
  FightingState,
  GameDefinition,
} from '../../types'
import { advance, buildBracket, championOf, undoWinner } from './bracket'

export const fightingDefinition: GameDefinition<
  'fighting',
  FightingConfig,
  FightingState,
  FightingAction
> = {
  kind: 'fighting',
  title: 'Fighting Game',
  acceptedKinds: ['individual'],
  initialConfig: () => ({ firstPlacePoints: 10, secondPlacePoints: 5, entrants: [] }),
  initialState: (c) => ({
    rounds: buildBracket(c.entrants),
    firstPlacePoints: c.firstPlacePoints,
    secondPlacePoints: c.secondPlacePoints,
  }),
  validateConfig: (c) => {
    if (!Number.isInteger(c.firstPlacePoints) || c.firstPlacePoints <= 0) return '1st place points must be a positive integer'
    if (!Number.isInteger(c.secondPlacePoints) || c.secondPlacePoints <= 0) return '2nd place points must be a positive integer'
    if (c.secondPlacePoints > c.firstPlacePoints) return '2nd place points must be <= 1st place points'
    if (!Array.isArray(c.entrants) || c.entrants.length < 2) return 'At least 2 entrants are required'
    return null
  },
  applyAction: (s, a) => {
    if (a.type === 'undo') {
      return { state: { ...s, rounds: undoWinner(s.rounds, a.matchId) }, deltas: [] }
    }
    const rounds = advance(s.rounds, a.matchId, a.winnerId)
    const { champion, runnerUp } = championOf(rounds)
    if (champion && runnerUp) {
      return {
        state: { ...s, rounds },
        deltas: [
          { participantId: champion, delta: s.firstPlacePoints },
          { participantId: runnerUp, delta: s.secondPlacePoints },
        ],
      }
    }
    return { state: { ...s, rounds }, deltas: [] }
  },
  isFinished: (s) => championOf(s.rounds).champion !== null,
}
