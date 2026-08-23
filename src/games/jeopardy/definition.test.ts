import { describe, it, expect } from 'vitest'
import { jeopardyDefinition as def } from './definition'
import { jeopardyBoard } from '../../content/jeopardy'

const catId = jeopardyBoard.categories[0].id // 5 clues, first value 100
const config = { participantIds: ['p1', 'p2'], categoryIds: [catId] }

function start() {
  return def.initialState(config)
}

describe('jeopardy definition', () => {
  it('validates config', () => {
    expect(def.validateConfig(config)).toBeNull()
    expect(def.validateConfig({ participantIds: [], categoryIds: [catId] })).toMatch(/participant/)
    expect(def.validateConfig({ participantIds: ['p1'], categoryIds: ['nope'] })).toMatch(/category/)
  })

  it('applies correct/incorrect deltas', () => {
    let s = start()
    const clue = s.categories[0].clues[0]
    s = def.applyAction(s, { type: 'revealClue', clueId: clue.id, responderId: 'p1', correct: true }).state
    expect(s.scores.p1).toBe(clue.value)
    s = def.applyAction(s, { type: 'revealClue', clueId: s.categories[0].clues[1].id, responderId: 'p2', correct: false }).state
    expect(s.scores.p2).toBe(-s.categories[0].clues[1].value)
  })

  it('enforces the Daily Double wager bound', () => {
    let s = start()
    const dd = s.categories[0].clues.find((c) => c.dailyDouble) ?? s.categories[0].clues[0]
    const r = def.applyAction(s, { type: 'dailyDoubleWager', clueId: dd.id, responderId: 'p1', wager: 999999, correct: true })
    expect(r.state).toBe(s) // rejected, no change
    const ok = def.applyAction(s, { type: 'dailyDoubleWager', clueId: dd.id, responderId: 'p1', wager: 300, correct: true })
    expect(ok.state.scores.p1).toBe(300)
  })

  it('finishes directly when no participant has a positive score', () => {
    // Reveal all 5 clues incorrectly so every score is negative.
    let s = start()
    for (const clue of s.categories[0].clues) {
      s = def.applyAction(s, { type: 'revealClue', clueId: clue.id, responderId: 'p1', correct: false }).state
    }
    expect(s.phase).toBe('finished')
  })
})
