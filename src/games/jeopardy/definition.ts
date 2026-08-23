import type {
  GameDefinition,
  JeopardyAction,
  JeopardyCategory,
  JeopardyConfig,
  JeopardyPhase,
  JeopardyState,
} from '../../types'
import { findJeopardyCategory, jeopardyBoard } from '../../content/jeopardy'

function findClue(categories: JeopardyCategory[], clueId: string) {
  for (const cat of categories) {
    const clue = cat.clues.find((c) => c.id === clueId)
    if (clue) return clue
  }
  return undefined
}

function allClues(categories: JeopardyCategory[]) {
  return categories.flatMap((c) => c.clues.map((cl) => cl.id))
}

function highestClueValue(categories: JeopardyCategory[]): number {
  return Math.max(0, ...categories.flatMap((c) => c.clues.map((cl) => cl.value)))
}

export const jeopardyDefinition: GameDefinition<
  'jeopardy',
  JeopardyConfig,
  JeopardyState,
  JeopardyAction
> = {
  kind: 'jeopardy',
  title: 'What is… Panda?',
  acceptedKinds: ['individual', 'team'],
  initialConfig: () => ({ participantIds: [], categoryIds: [] }),
  initialState: (c) => {
    const categories = c.categoryIds.map((id) => findJeopardyCategory(id)!).filter(Boolean)
    const scores: Record<string, number> = {}
    for (const pid of c.participantIds) scores[pid] = 0
    return {
      categories,
      finalJeopardy: jeopardyBoard.finalJeopardy,
      scores,
      revealedClues: [],
      activeClueId: null,
      phase: 'board',
    }
  },
  validateConfig: (c) => {
    if (!Array.isArray(c.participantIds) || c.participantIds.length === 0) return 'At least one participant is required'
    if (new Set(c.participantIds).size !== c.participantIds.length) return 'Participants must be distinct'
    if (!Array.isArray(c.categoryIds) || c.categoryIds.length === 0) return 'At least one category is required'
    for (const id of c.categoryIds) {
      if (!findJeopardyCategory(id)) return `Unknown category id: ${id}`
    }
    return null
  },
  applyAction: (s, a) => {
    if (s.phase === 'finished') return { state: s, deltas: [] }

    switch (a.type) {
      case 'revealClue': {
        const clue = findClue(s.categories, a.clueId)
        if (!clue || s.revealedClues.includes(a.clueId)) return { state: s, deltas: [] }
        return reveal(s, a.clueId, a.responderId, a.correct ? clue.value : -clue.value)
      }

      case 'dailyDoubleWager': {
        const clue = findClue(s.categories, a.clueId)
        if (!clue || s.revealedClues.includes(a.clueId)) return { state: s, deltas: [] }
        const current = s.scores[a.responderId] ?? 0
        const bound = Math.max(current, highestClueValue(s.categories))
        if (a.wager < 0 || a.wager > bound) return { state: s, deltas: [] }
        return reveal(s, a.clueId, a.responderId, a.correct ? a.wager : -a.wager)
      }

      case 'finalWager': {
        if (s.phase !== 'finalJeopardy') return { state: s, deltas: [] }
        const current = s.scores[a.responderId] ?? 0
        if (current <= 0 || a.wager < 0 || a.wager > current) return { state: s, deltas: [] }
        const delta = a.correct ? a.wager : -a.wager
        return { state: { ...s, scores: { ...s.scores, [a.responderId]: current + delta } }, deltas: [{ participantId: a.responderId, delta }] }
      }

      case 'finishFinal': {
        if (s.phase !== 'finalJeopardy') return { state: s, deltas: [] }
        return { state: { ...s, phase: 'finished' }, deltas: [] }
      }

      default:
        return { state: s, deltas: [] }
    }
  },
  isFinished: (s) => s.phase === 'finished',
}

function reveal(state: JeopardyState, clueId: string, responderId: string, delta: number) {
  const current = state.scores[responderId] ?? 0
  const scores = { ...state.scores, [responderId]: current + delta }
  const revealedClues = [...state.revealedClues, clueId]
  const done = revealedClues.length === allClues(state.categories).length
  const hasEligible = Object.values(scores).some((v) => v > 0)
  const phase: JeopardyPhase = done ? (hasEligible ? 'finalJeopardy' : 'finished') : 'board'
  return {
    state: { ...state, scores, revealedClues, activeClueId: null, phase },
    deltas: [{ participantId: responderId, delta }],
  }
}
