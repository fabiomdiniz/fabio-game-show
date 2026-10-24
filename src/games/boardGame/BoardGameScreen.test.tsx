import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '../register'
import BoardGameScreen from './BoardGameScreen'
import { StoreProvider } from '../../store/StoreContext'
import { saveState, loadState } from '../../store/persistence'
import { reducer } from '../../store/reducer'
import { emptyState } from '../../store/state'
import type { AppState } from '../../types'

function seed(participantPoints = 0) {
  let s = emptyState()
  s = reducer(s, { type: 'createSession', name: 'Show' })
  const sid = s.activeSessionId!
  s = reducer(s, { type: 'addParticipant', sessionId: sid, name: 'Ana', kind: 'individual' })
  const pid = s.sessions[0].participants[0].id
  s = reducer(s, { type: 'overridePoints', sessionId: sid, participantId: pid, points: participantPoints })
  s = reducer(s, {
    type: 'startGame',
    sessionId: sid,
    instance: {
      id: 'g1',
      kind: 'boardGame',
      status: 'setup',
      config: { name: 'Board Game', pointValue: 5 },
      state: { winners: [], pointValue: 5 },
      initialPoints: {},
      appliedDeltas: [],
    },
  })
  return { s, sid, pid }
}

function renderScreen(sid: string) {
  return render(
    <MemoryRouter initialEntries={[`/session/${sid}/game/boardGame`]}>
      <StoreProvider>
        <Routes>
          <Route path="/session/:id/game/:kind" element={<BoardGameScreen />} />
          <Route path="/session/:id" element={<p>session screen</p>} />
        </Routes>
      </StoreProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('BoardGameScreen', () => {
  it('shows an abandon button while selecting winners', () => {
    const { s, sid } = seed()
    saveState(s)
    renderScreen(sid)
    expect(screen.getByText('Select winners')).toBeInTheDocument()
    expect(screen.getByText('Abandon game')).toBeInTheDocument()
  })

  it('abandons the game, restores points and returns to the session', () => {
    const { s, sid, pid } = seed(10)
    saveState(s)
    renderScreen(sid)
    fireEvent.click(screen.getByText('Abandon game'))

    expect(screen.getByText('session screen')).toBeInTheDocument()
    const reloaded: AppState = loadState().state as AppState
    expect(reloaded.sessions[0].games).toHaveLength(0)
    expect(reloaded.sessions[0].participants[0].id).toBe(pid)
    expect(reloaded.sessions[0].participants[0].points).toBe(10)
  })

  it('shows a final summary once winners are awarded', () => {
    const { s, sid } = seed()
    saveState(s)
    renderScreen(sid)

    fireEvent.click(screen.getByLabelText('Ana'))
    fireEvent.click(screen.getByText('Award'))

    // Stays on the finished game instead of dropping back to the setup form.
    expect(screen.queryByLabelText('Game name')).not.toBeInTheDocument()
    expect(screen.getByText('Board Game — final')).toBeInTheDocument()
    expect(screen.getByTestId('board-game-winner').textContent).toContain('Ana')
    expect(screen.getByTestId('board-game-winner').textContent).toContain('+5')
    expect(screen.getByRole('heading', { name: 'Points earned' })).toBeInTheDocument()

    fireEvent.click(screen.getByText('Start a new game'))
    expect(screen.getByLabelText('Game name')).toBeInTheDocument()
  })
})
