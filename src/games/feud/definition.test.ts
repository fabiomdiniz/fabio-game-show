import { describe, it, expect } from 'vitest'
import { feudDefinition as def } from './definition'
import { feudCategories } from '../../content/feud'

const q = feudCategories[0].questions[0] // 4 answers, first worth 40
const config = { teamAId: 'teamA', teamBId: 'teamB', questionIds: [q.id] }

function start() {
  return def.initialState(config)
}

describe('feud definition', () => {
  it('validates config', () => {
    expect(def.validateConfig(config)).toBeNull()
    expect(def.validateConfig({ teamAId: 't', teamBId: 't', questionIds: [q.id] })).toMatch(/distinct/)
    expect(def.validateConfig({ teamAId: 'a', teamBId: 'b', questionIds: [] })).toMatch(/question/)
  })

  it('face-off reveals the top answer', () => {
    const s = start()
    const r = def.applyAction(s, { type: 'faceOffWinner', teamId: 'teamA' })
    expect(r.state.round.phase).toBe('board')
    expect(r.state.round.controllingTeamId).toBe('teamA')
    expect(r.state.round.revealed).toEqual([0])
    expect(r.state.round.roundTotal).toBe(q.answers[0].points)
  })

  it('a correct steal credits the stealing team', () => {
    let s = start()
    s = def.applyAction(s, { type: 'faceOffWinner', teamId: 'teamA' }).state
    s = def.applyAction(s, { type: 'reveal', answerIndex: 1 }).state
    s = def.applyAction(s, { type: 'strike' }).state
    s = def.applyAction(s, { type: 'strike' }).state
    s = def.applyAction(s, { type: 'strike' }).state
    expect(s.round.phase).toBe('steal')
    const r = def.applyAction(s, { type: 'stealResult', correct: true })
    expect(r.deltas).toEqual([{ participantId: 'teamB', delta: s.round.roundTotal }])
    expect(r.state.finished).toBe(true)
  })

  it('a failed steal credits the controlling team and finishes the round', () => {
    let s = start()
    s = def.applyAction(s, { type: 'faceOffWinner', teamId: 'teamA' }).state
    s = def.applyAction(s, { type: 'strike' }).state
    s = def.applyAction(s, { type: 'strike' }).state
    s = def.applyAction(s, { type: 'strike' }).state
    const r = def.applyAction(s, { type: 'stealResult', correct: false })
    expect(r.deltas).toEqual([{ participantId: 'teamA', delta: s.round.roundTotal }])
    expect(r.state.finished).toBe(true)
  })

  it('credits the controlling team when all answers are revealed', () => {
    let s = start()
    s = def.applyAction(s, { type: 'faceOffWinner', teamId: 'teamA' }).state
    s = def.applyAction(s, { type: 'reveal', answerIndex: 1 }).state
    s = def.applyAction(s, { type: 'reveal', answerIndex: 2 }).state
    const r = def.applyAction(s, { type: 'reveal', answerIndex: 3 })
    expect(r.deltas).toEqual([{ participantId: 'teamA', delta: q.answers.reduce((sum, a) => sum + a.points, 0) }])
    expect(r.state.finished).toBe(true)
  })
})
