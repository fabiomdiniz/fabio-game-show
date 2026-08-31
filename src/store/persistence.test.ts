import { describe, it, expect, beforeEach } from 'vitest'
import {
  serialize,
  parse,
  validateState,
  loadState,
  saveState,
  STORAGE_KEY,
} from './persistence'
import { emptyState } from './state'
import { reducer } from './reducer'
import type { AppState, GameInstance } from '../types'

function sampleState(): AppState {
  let s = emptyState()
  s = reducer(s, { type: 'createSession', name: 'Show' })
  const sid = s.activeSessionId!
  s = reducer(s, { type: 'addParticipant', sessionId: sid, name: 'Ana', kind: 'individual' })
  return s
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('persistence', () => {
  it('round-trips serialize/parse', () => {
    const state = sampleState()
    const parsed = parse(serialize(state))
    expect(parsed).toEqual(state)
  })

  it('rejects a wrong version', () => {
    const state = { ...sampleState(), version: 99 }
    expect(validateState(state)).toMatch(/version/)
  })

  it('rejects a dangling activeSessionId', () => {
    const state = { ...sampleState(), activeSessionId: 'ghost' }
    expect(validateState(state)).toMatch(/activeSessionId/)
  })

  it('rejects duplicate session ids and empty names', () => {
    const state = sampleState()
    state.sessions.push({ ...state.sessions[0] })
    expect(validateState(state)).toMatch(/duplicate session id/)
    const empty = { ...sampleState(), sessions: [{ ...sampleState().sessions[0], name: '  ' }] }
    expect(validateState(empty)).toMatch(/session name/)
  })

  it('rejects a non-finished game referencing a missing participant', () => {
    const state = sampleState()
    const game: GameInstance = {
      id: 'g1',
      kind: 'boardGame',
      status: 'inProgress',
      config: { name: 'Catan', pointValue: 5 },
      state: { winners: ['missing-id'], pointValue: 5 },
      initialPoints: {},
      appliedDeltas: [],
    }
    state.sessions[0].games.push(game)
    expect(validateState(state)).toMatch(/missing/)
  })

  it('rejects config invariants (pointValue, second>first, same feud teams)', () => {
    const base = sampleState()
    const mk = (game: GameInstance) => {
      const s = structuredClone(base)
      s.sessions[0].games.push(game)
      return s
    }
    expect(
      validateState(
        mk({ id: 'a', kind: 'boardGame', status: 'inProgress', config: { name: 'X', pointValue: 0 }, state: { winners: [], pointValue: 0 }, initialPoints: {}, appliedDeltas: [] }),
      ),
    ).toMatch(/pointValue/)

    expect(
      validateState(
        mk({ id: 'b', kind: 'fighting', status: 'inProgress', config: { firstPlacePoints: 5, secondPlacePoints: 10, entrants: [] }, state: { rounds: [], firstPlacePoints: 5, secondPlacePoints: 10 }, initialPoints: {}, appliedDeltas: [] }),
      ),
    ).toMatch(/secondPlacePoints/)

    expect(
      validateState(
        mk({ id: 'c', kind: 'feud', status: 'inProgress', config: { teamA: { name: 'A', playerIds: ['p1'] }, teamB: { name: 'B', playerIds: ['p1'] }, questionIds: [] }, state: { teamA: { name: 'A', playerIds: ['p1'] }, teamB: { name: 'B', playerIds: ['p1'] }, questions: [], questionIndex: 0, round: { phase: 'faceOff', controllingTeam: null, revealed: [], strikes: 0, roundTotal: 0 }, finished: false }, initialPoints: {}, appliedDeltas: [] }),
      ),
    ).toMatch(/distinct/)
  })

  it('accepts a finished game whose result references a deleted participant', () => {
    const state = sampleState()
    const finished: GameInstance = {
      id: 'g1',
      kind: 'boardGame',
      status: 'finished',
      config: { name: 'Catan', pointValue: 5 },
      state: { winners: ['deleted-id'], pointValue: 5 },
      initialPoints: {},
      appliedDeltas: [{ participantId: 'deleted-id', participantName: 'Old Player', delta: 5 }],
      result: { awards: [{ participantId: 'deleted-id', participantName: 'Old Player', delta: 5 }] },
    }
    state.sessions[0].games.push(finished)
    expect(validateState(state)).toBeNull()
  })

  it('loadState falls back to fresh state and preserves corrupt raw', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not json')
    const res = loadState()
    expect(res.state.sessions).toHaveLength(0)
    expect(res.preservedRaw).toBe('{not json')
  })

  it('saveState returns false on write failure and loadState hydrates valid state', () => {
    const state = sampleState()
    expect(saveState(state)).toBe(true)
    expect(loadState().state).toEqual(state)
  })
})
