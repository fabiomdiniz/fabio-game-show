import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '../games/register'
import History from './History'
import { StoreProvider } from '../store/StoreContext'
import { saveState } from '../store/persistence'
import { reducer } from '../store/reducer'
import { emptyState } from '../store/state'
import type { GameInstance } from '../types'

function seed() {
  let s = emptyState()
  s = reducer(s, { type: 'createSession', name: 'Show' })
  const sid = s.activeSessionId!
  s = reducer(s, { type: 'addParticipant', sessionId: sid, name: 'Ana', kind: 'individual' })
  s = reducer(s, { type: 'addParticipant', sessionId: sid, name: 'Bruno', kind: 'individual' })
  const [ana, bruno] = s.sessions[0].participants
  const boardGame: GameInstance = {
    id: 'g1',
    kind: 'boardGame',
    status: 'finished',
    config: { name: 'Catan', pointValue: 12 },
    state: { winners: [ana.id], pointValue: 12 },
    initialPoints: { [ana.id]: 0 },
    appliedDeltas: [{ participantId: ana.id, participantName: 'Ana', delta: 12 }],
    result: { awards: [{ participantId: ana.id, participantName: 'Ana', delta: 12 }] },
  }
  const fighting: GameInstance = {
    id: 'g2',
    kind: 'fighting',
    status: 'finished',
    config: { firstPlacePoints: 10, secondPlacePoints: 5, entrants: [ana.id, bruno.id] },
    state: { rounds: [], firstPlacePoints: 10, secondPlacePoints: 5 },
    initialPoints: { [ana.id]: 0, [bruno.id]: 0 },
    appliedDeltas: [
      { participantId: ana.id, participantName: 'Ana', delta: 10 },
      { participantId: bruno.id, participantName: 'Bruno', delta: 5 },
    ],
    result: {
      awards: [
        { participantId: ana.id, participantName: 'Ana', delta: 10 },
        { participantId: bruno.id, participantName: 'Bruno', delta: 5 },
      ],
    },
  }
  s.sessions[0].games.push(boardGame, fighting)
  return { s, sid }
}

function renderHistory(sid: string) {
  return render(
    <MemoryRouter initialEntries={[`/session/${sid}/history`]}>
      <StoreProvider>
        <Routes>
          <Route path="/session/:id/history" element={<History />} />
        </Routes>
      </StoreProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('History', () => {
  it('lists finished games with their titles and points', () => {
    const { s, sid } = seed()
    saveState(s)
    renderHistory(sid)

    expect(screen.getByRole('heading', { name: /History/ })).toBeInTheDocument()
    expect(screen.getByText('Catan')).toBeInTheDocument()
    expect(screen.getByText('Fighting Game')).toBeInTheDocument()
    expect(screen.getAllByText('Finished').length).toBe(2)
    expect(screen.getByText('+12')).toBeInTheDocument()
    expect(screen.getByText('+10')).toBeInTheDocument()
    expect(screen.getByText('+5')).toBeInTheDocument()
  })

  it('shows a hint when no games have been played', () => {
    let s = emptyState()
    s = reducer(s, { type: 'createSession', name: 'Empty' })
    const sid = s.activeSessionId!
    saveState(s)
    renderHistory(sid)
    expect(screen.getByText(/No games have been played/)).toBeInTheDocument()
  })
})
