import { describe, it, expect } from 'vitest'
import { emptyState } from './state'
import { reducer, referencedParticipantIds } from './reducer'
import type { GameInstance } from '../types'

function sessionWithPlayers() {
  let state = emptyState()
  state = reducer(state, { type: 'createSession', name: 'Show' })
  const sid = state.activeSessionId!
  state = reducer(state, { type: 'addParticipant', sessionId: sid, name: 'Ana', kind: 'individual' })
  const ana = state.sessions[0].participants[0]
  state = reducer(state, { type: 'addParticipant', sessionId: sid, name: 'Bruno', kind: 'individual' })
  const bruno = state.sessions[0].participants[1]
  return { state, sid, ana, bruno }
}

function boardGameInstance(winners: string[]): GameInstance {
  return {
    id: 'g1',
    kind: 'boardGame',
    status: 'setup',
    config: { name: 'Catan', pointValue: 5 },
    state: { winners },
    initialPoints: {},
    appliedDeltas: [],
  }
}

describe('reducer', () => {
  it('creates, switches, and deletes sessions', () => {
    let state = emptyState()
    state = reducer(state, { type: 'createSession', name: 'A' })
    state = reducer(state, { type: 'createSession', name: 'B' })
    expect(state.sessions).toHaveLength(2)
    const idA = state.sessions[0].id

    state = reducer(state, { type: 'deleteSession', sessionId: idA })
    expect(state.sessions.map((s) => s.name)).toEqual(['B'])
    expect(state.activeSessionId).toBe(state.sessions[0].id)

    state = reducer(state, { type: 'deleteSession', sessionId: state.sessions[0].id })
    expect(state.sessions).toHaveLength(0)
    expect(state.activeSessionId).toBeNull()
  })

  it('adds participants and overrides points', () => {
    const { state, sid, ana } = sessionWithPlayers()
    let s = reducer(state, { type: 'overridePoints', sessionId: sid, participantId: ana.id, points: 50 })
    expect(s.sessions[0].participants.find((p) => p.id === ana.id)?.points).toBe(50)
  })

  it('guards deletion of a participant referenced by a non-finished game', () => {
    const { state, sid, ana } = sessionWithPlayers()
    let s = reducer(state, {
      type: 'startGame',
      sessionId: sid,
      instance: boardGameInstance([ana.id]),
    })
    s = reducer(s, { type: 'deleteParticipant', sessionId: sid, participantId: ana.id })
    expect(s.sessions[0].participants.some((p) => p.id === ana.id)).toBe(true)
  })

  it('starts a game, applies a delta, finishes, and records history', () => {
    const { state, sid, ana, bruno } = sessionWithPlayers()
    let s = reducer(state, {
      type: 'startGame',
      sessionId: sid,
      instance: boardGameInstance([ana.id]),
    })
    expect(s.sessions[0].games[0].initialPoints[ana.id]).toBe(0)

    s = reducer(s, {
      type: 'applyGameAction',
      gameId: 'g1',
      state: { winners: [ana.id, bruno.id] },
      deltas: [
        { participantId: ana.id, participantName: 'Ana', delta: 5 },
        { participantId: bruno.id, participantName: 'Bruno', delta: 5 },
      ],
    })
    expect(s.sessions[0].participants.find((p) => p.id === ana.id)?.points).toBe(5)

    s = reducer(s, { type: 'finishGame', gameId: 'g1' })
    expect(s.sessions[0].games[0].status).toBe('finished')
    expect(s.sessions[0].games[0].result?.awards).toHaveLength(2)
  })

  it('rejects starting a second in-progress game', () => {
    const { state, sid } = sessionWithPlayers()
    let s = reducer(state, { type: 'startGame', sessionId: sid, instance: boardGameInstance([]) })
    const second: GameInstance = { ...boardGameInstance([]), id: 'g2' }
    s = reducer(s, { type: 'startGame', sessionId: sid, instance: second })
    expect(s.sessions[0].games).toHaveLength(1)
  })

  it('abandons a game, restoring pre-game points', () => {
    const { state, sid, ana } = sessionWithPlayers()
    let s = reducer(state, { type: 'startGame', sessionId: sid, instance: boardGameInstance([ana.id]) })
    s = reducer(s, {
      type: 'applyGameAction',
      gameId: 'g1',
      state: { winners: [ana.id] },
      deltas: [{ participantId: ana.id, participantName: 'Ana', delta: 5 }],
    })
    expect(s.sessions[0].participants.find((p) => p.id === ana.id)?.points).toBe(5)
    s = reducer(s, { type: 'abandonGame', gameId: 'g1' })
    expect(s.sessions[0].participants.find((p) => p.id === ana.id)?.points).toBe(0)
    expect(s.sessions[0].games).toHaveLength(0)
  })

  it('exposes referenced participant ids per kind', () => {
    expect(referencedParticipantIds(boardGameInstance(['x']))).toEqual(['x'])
  })
})
