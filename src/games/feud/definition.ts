import type {
  FeudAction,
  FeudConfig,
  FeudQuestion,
  FeudRoundState,
  FeudState,
  FeudTeam,
  FeudTeamKey,
  GameDefinition,
} from '../../types'
import { findFeudQuestion } from '../../content/feud'

function otherTeamKey(key: FeudTeamKey): FeudTeamKey {
  return key === 'A' ? 'B' : 'A'
}

function teamOf(state: FeudState, key: FeudTeamKey): FeudTeam {
  return key === 'A' ? state.teamA : state.teamB
}

function deltasFor(team: FeudTeam, roundTotal: number) {
  const n = team.playerIds.length
  if (n === 0) return []
  // Split the round total evenly; give any remainder to the first players.
  const base = Math.floor(roundTotal / n)
  const remainder = roundTotal % n
  return team.playerIds.map((participantId, i) => ({
    participantId,
    delta: base + (i < remainder ? 1 : 0),
  }))
}

function freshRound(): FeudRoundState {
  return { phase: 'faceOff', controllingTeam: null, revealed: [], strikes: 0, roundTotal: 0, winner: null }
}

function advanceQuestion(state: FeudState): FeudState {
  const nextIndex = state.questionIndex + 1
  if (nextIndex >= state.questions.length) {
    return { ...state, questionIndex: nextIndex, finished: true, round: freshRound() }
  }
  return { ...state, questionIndex: nextIndex, round: freshRound() }
}

// Match a host-typed guess against a question's answers (case-insensitive, whitespace-tolerant).
export function matchAnswerIndex(q: FeudQuestion, guess: string): number {
  const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ')
  const g = normalize(guess)
  if (!g) return -1
  return q.answers.findIndex((a) => normalize(a.text) === g)
}

export const feudDefinition: GameDefinition<'feud', FeudConfig, FeudState, FeudAction> = {
  kind: 'feud',
  title: 'Fábio-ly Feud',
  acceptedKinds: ['individual'],
  initialConfig: () => ({
    teamA: { name: 'Team A', playerIds: [] },
    teamB: { name: 'Team B', playerIds: [] },
    questionIds: [],
  }),
  initialState: (c) => ({
    teamA: c.teamA,
    teamB: c.teamB,
    questions: c.questionIds.map((id) => findFeudQuestion(id)!).filter(Boolean),
    questionIndex: 0,
    round: freshRound(),
    finished: false,
  }),
  validateConfig: (c) => {
    if (!c.teamA?.name?.trim() || !c.teamB?.name?.trim()) return 'Team names are required'
    if (!Array.isArray(c.teamA?.playerIds) || c.teamA.playerIds.length === 0) return 'Team A needs players'
    if (!Array.isArray(c.teamB?.playerIds) || c.teamB.playerIds.length === 0) return 'Team B needs players'
    if (c.teamA.playerIds.some((id) => c.teamB.playerIds.includes(id))) return 'Teams must be distinct'
    if (!Array.isArray(c.questionIds) || c.questionIds.length === 0) return 'At least one question is required'
    for (const id of c.questionIds) {
      if (!findFeudQuestion(id)) return `Unknown question id: ${id}`
    }
    return null
  },
  applyAction: (s, a) => {
    if (s.finished) return { state: s, deltas: [] }
    const q = s.questions[s.questionIndex]
    if (!q) return { state: s, deltas: [] }

    switch (a.type) {
      case 'faceOffWinner': {
        if (s.round.phase !== 'faceOff') return { state: s, deltas: [] }
        if (a.team !== 'A' && a.team !== 'B') return { state: s, deltas: [] }
        return {
          state: { ...s, round: { ...s.round, phase: 'board', controllingTeam: a.team } },
          deltas: [],
        }
      }

      case 'reveal': {
        if (s.round.phase !== 'board' && s.round.phase !== 'faceOff') return { state: s, deltas: [] }
        if (s.round.revealed.includes(a.answerIndex)) return { state: s, deltas: [] }
        const answer = q.answers[a.answerIndex]
        if (!answer) return { state: s, deltas: [] }
        const revealed = [...s.round.revealed, a.answerIndex]
        const roundTotal = s.round.roundTotal + answer.points
        if (s.round.phase === 'board' && revealed.length === q.answers.length) {
          const controlling = s.round.controllingTeam!
          return {
            state: { ...s, round: { ...s.round, revealed, roundTotal, phase: 'done', winner: controlling } },
            deltas: deltasFor(teamOf(s, controlling), roundTotal),
          }
        }
        return { state: { ...s, round: { ...s.round, revealed, roundTotal } }, deltas: [] }
      }

      case 'strike': {
        if (s.round.phase !== 'board') return { state: s, deltas: [] }
        const strikes = s.round.strikes + 1
        const phase = strikes >= 3 ? 'steal' : 'board'
        return { state: { ...s, round: { ...s.round, strikes, phase } }, deltas: [] }
      }

      case 'stealResult': {
        if (s.round.phase !== 'steal') return { state: s, deltas: [] }
        const controlling = s.round.controllingTeam!
        const winner = a.correct ? otherTeamKey(controlling) : controlling
        // A successful steal reveals one more answer; fold its points into the round.
        const stolenPoints =
          a.correct && a.answerIndex != null ? (q.answers[a.answerIndex]?.points ?? 0) : 0
        const roundTotal = s.round.roundTotal + stolenPoints
        const revealedAll = q.answers.map((_, i) => i)
        return {
          state: { ...s, round: { ...s.round, phase: 'done', revealed: revealedAll, winner, roundTotal } },
          deltas: deltasFor(teamOf(s, winner), roundTotal),
        }
      }

      case 'nextQuestion': {
        if (s.round.phase !== 'done') return { state: s, deltas: [] }
        return { state: advanceQuestion(s), deltas: [] }
      }

      case 'endGame': {
        return { state: { ...s, finished: true }, deltas: [] }
      }

      default:
        return { state: s, deltas: [] }
    }
  },
  isFinished: (s) => s.finished,
}
