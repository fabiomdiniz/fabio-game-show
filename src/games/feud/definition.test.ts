import { describe, it, expect } from 'vitest'
import { feudDefinition as def } from './definition'
import { feudCategories } from '../../content/feud'

const q = feudCategories[0].questions[0] // 4 answers, first worth 40
const config = {
  teamA: { name: 'Team A', playerIds: ['a1', 'a2'] },
  teamB: { name: 'Team B', playerIds: ['b1'] },
  questionIds: [q.id],
}

function start() {
  return def.initialState(config)
}

describe('feud definition', () => {
  it('validates config', () => {
    expect(def.validateConfig(config)).toBeNull()
    expect(
      def.validateConfig({
        teamA: { name: 'A', playerIds: ['p1'] },
        teamB: { name: 'B', playerIds: ['p1'] },
        questionIds: [q.id],
      }),
    ).toMatch(/distinct/)
    expect(
      def.validateConfig({
        teamA: { name: 'A', playerIds: ['p1'] },
        teamB: { name: 'B', playerIds: ['p2'] },
        questionIds: [],
      }),
    ).toMatch(/question/)
  })

  it('face-off reveals the top answer', () => {
    const s = start()
    const r = def.applyAction(s, { type: 'faceOffWinner', team: 'A' })
    expect(r.state.round.phase).toBe('board')
    expect(r.state.round.controllingTeam).toBe('A')
    expect(r.state.round.revealed).toEqual([0])
    expect(r.state.round.roundTotal).toBe(q.answers[0].points)
  })

  it('a correct steal credits every player on the stealing team', () => {
    let s = start()
    s = def.applyAction(s, { type: 'faceOffWinner', team: 'A' }).state
    s = def.applyAction(s, { type: 'reveal', answerIndex: 1 }).state
    s = def.applyAction(s, { type: 'strike' }).state
    s = def.applyAction(s, { type: 'strike' }).state
    s = def.applyAction(s, { type: 'strike' }).state
    expect(s.round.phase).toBe('steal')
    const r = def.applyAction(s, { type: 'stealResult', correct: true })
    expect(r.deltas).toEqual(
      config.teamB.playerIds.map((participantId) => ({ participantId, delta: s.round.roundTotal })),
    )
    expect(r.state.finished).toBe(true)
  })

  it('a failed steal credits every player on the controlling team and finishes the round', () => {
    let s = start()
    s = def.applyAction(s, { type: 'faceOffWinner', team: 'A' }).state
    s = def.applyAction(s, { type: 'strike' }).state
    s = def.applyAction(s, { type: 'strike' }).state
    s = def.applyAction(s, { type: 'strike' }).state
    const r = def.applyAction(s, { type: 'stealResult', correct: false })
    expect(r.deltas).toEqual(
      config.teamA.playerIds.map((participantId) => ({ participantId, delta: s.round.roundTotal })),
    )
    expect(r.state.finished).toBe(true)
  })

  it('credits every player on the controlling team when all answers are revealed', () => {
    let s = start()
    s = def.applyAction(s, { type: 'faceOffWinner', team: 'A' }).state
    s = def.applyAction(s, { type: 'reveal', answerIndex: 1 }).state
    s = def.applyAction(s, { type: 'reveal', answerIndex: 2 }).state
    const r = def.applyAction(s, { type: 'reveal', answerIndex: 3 })
    const total = q.answers.reduce((sum, a) => sum + a.points, 0)
    expect(r.deltas).toEqual(
      config.teamA.playerIds.map((participantId) => ({ participantId, delta: total })),
    )
    expect(r.state.finished).toBe(true)
  })
})
