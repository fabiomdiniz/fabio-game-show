import type {
  FeudAction,
  FeudConfig,
  FeudRoundState,
  FeudState,
  GameDefinition,
} from '../../types'
import { findFeudQuestion } from '../../content/feud'

function otherTeam(state: FeudState, teamId: string): string {
  return state.teamAId === teamId ? state.teamBId : state.teamAId
}

function freshRound(): FeudRoundState {
  return { phase: 'faceOff', controllingTeamId: null, revealed: [], strikes: 0, roundTotal: 0 }
}

function advanceQuestion(state: FeudState): FeudState {
  const nextIndex = state.questionIndex + 1
  if (nextIndex >= state.questions.length) {
    return { ...state, questionIndex: nextIndex, finished: true, round: freshRound() }
  }
  return { ...state, questionIndex: nextIndex, round: freshRound() }
}

export const feudDefinition: GameDefinition<'feud', FeudConfig, FeudState, FeudAction> = {
  kind: 'feud',
  title: 'Fábio-ly Feud',
  acceptedKinds: ['team'],
  initialConfig: () => ({ teamAId: '', teamBId: '', questionIds: [] }),
  initialState: (c) => ({
    teamAId: c.teamAId,
    teamBId: c.teamBId,
    questions: c.questionIds.map((id) => findFeudQuestion(id)!).filter(Boolean),
    questionIndex: 0,
    round: freshRound(),
    finished: false,
  }),
  validateConfig: (c) => {
    if (c.teamAId === c.teamBId) return 'Teams must be distinct'
    if (!c.teamAId || !c.teamBId) return 'Two teams are required'
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
        const topPoints = q.answers[0]?.points ?? 0
        return {
          state: {
            ...s,
            round: { phase: 'board', controllingTeamId: a.teamId, revealed: [0], strikes: 0, roundTotal: topPoints },
          },
          deltas: [],
        }
      }

      case 'reveal': {
        if (s.round.phase !== 'board') return { state: s, deltas: [] }
        if (s.round.revealed.includes(a.answerIndex)) return { state: s, deltas: [] }
        const answer = q.answers[a.answerIndex]
        if (!answer) return { state: s, deltas: [] }
        const revealed = [...s.round.revealed, a.answerIndex]
        const roundTotal = s.round.roundTotal + answer.points
        if (revealed.length === q.answers.length) {
          const controlling = s.round.controllingTeamId!
          return {
            state: advanceQuestion({ ...s, round: { ...s.round, revealed, roundTotal, phase: 'done' } }),
            deltas: [{ participantId: controlling, delta: roundTotal }],
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
        const controlling = s.round.controllingTeamId!
        const winner = a.correct ? otherTeam(s, controlling) : controlling
        const revealedAll = q.answers.map((_, i) => i)
        return {
          state: advanceQuestion({ ...s, round: { ...s.round, phase: 'done', revealed: revealedAll } }),
          deltas: [{ participantId: winner, delta: s.round.roundTotal }],
        }
      }

      default:
        return { state: s, deltas: [] }
    }
  },
  isFinished: (s) => s.finished,
}
