import { describe, it, expect } from 'vitest'
import { feudDefinition as def } from './definition'
import { feudQuestions } from '../../content/feud'

const q = feudQuestions[0] // 10 answers, first worth 10
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

  it('face-off sets the controlling team without revealing an answer', () => {
    const s = start()
    const r = def.applyAction(s, { type: 'faceOffWinner', team: 'A' })
    expect(r.state.round.phase).toBe('board')
    expect(r.state.round.controllingTeam).toBe('A')
    expect(r.state.round.revealed).toEqual([])
    expect(r.state.round.roundTotal).toBe(0)
  })

  it('face-off guesses reveal answers and control carries them to the board', () => {
    let s = start()
    s = def.applyAction(s, { type: 'reveal', answerIndex: 0 }).state
    expect(s.round.phase).toBe('faceOff')
    expect(s.round.revealed).toEqual([0])
    expect(s.round.roundTotal).toBe(q.answers[0].points)

    const r = def.applyAction(s, { type: 'faceOffWinner', team: 'B' })
    expect(r.state.round.phase).toBe('board')
    expect(r.state.round.controllingTeam).toBe('B')
    expect(r.state.round.revealed).toEqual([0])
    expect(r.state.round.roundTotal).toBe(q.answers[0].points)
  })

  it('a correct steal credits the stealing team, including the stolen answer', () => {
    let s = start()
    s = def.applyAction(s, { type: 'faceOffWinner', team: 'A' }).state
    s = def.applyAction(s, { type: 'reveal', answerIndex: 1 }).state // Psyduck: 45
    s = def.applyAction(s, { type: 'strike' }).state
    s = def.applyAction(s, { type: 'strike' }).state
    s = def.applyAction(s, { type: 'strike' }).state
    expect(s.round.phase).toBe('steal')
    // Team B steals Wartortle (10) -> round total 9 + 10 = 19
    const r = def.applyAction(s, { type: 'stealResult', correct: true, answerIndex: 0 })
    expect(r.deltas).toEqual(
      config.teamB.playerIds.map((participantId) => ({ participantId, delta: q.answers[1].points + q.answers[0].points })),
    )
    expect(r.state.round.roundTotal).toBe(q.answers[1].points + q.answers[0].points)
    expect(r.state.round.phase).toBe('done')
    expect(r.state.round.winner).toBe('B')
    expect(r.state.finished).toBe(false)
    const advanced = def.applyAction(r.state, { type: 'nextQuestion' })
    expect(advanced.state.finished).toBe(true)
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
    expect(r.state.round.phase).toBe('done')
    expect(r.state.round.winner).toBe('A')
    expect(r.state.finished).toBe(false)
  })

  it('credits every player on the controlling team when all answers are revealed', () => {
    let s = start()
    s = def.applyAction(s, { type: 'faceOffWinner', team: 'A' }).state
    for (let i = 0; i < q.answers.length - 1; i++) {
      s = def.applyAction(s, { type: 'reveal', answerIndex: i }).state
    }
    const r = def.applyAction(s, { type: 'reveal', answerIndex: q.answers.length - 1 })
    const total = q.answers.reduce((sum, a) => sum + a.points, 0)
    // round total is split evenly across the 2 controlling players (55 -> 28 + 27)
    expect(r.deltas).toEqual([
      { participantId: 'a1', delta: Math.ceil(total / 2) },
      { participantId: 'a2', delta: Math.floor(total / 2) },
    ])
    expect(r.state.round.phase).toBe('done')
    expect(r.state.round.winner).toBe('A')
    expect(r.state.finished).toBe(false)
  })

  it('endGame finishes immediately without extra deltas', () => {
    const s = start()
    const r = def.applyAction(s, { type: 'endGame' })
    expect(r.state.finished).toBe(true)
    expect(r.deltas).toEqual([])
  })
})
