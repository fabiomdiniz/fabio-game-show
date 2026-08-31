import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '../register'
import FeudScreen from './FeudScreen'
import { StoreProvider } from '../../store/StoreContext'
import { saveState } from '../../store/persistence'
import { reducer } from '../../store/reducer'
import { emptyState } from '../../store/state'
import { feudCategories } from '../../content/feud'
import type { GameInstance } from '../../types'

function seed() {
  let s = emptyState()
  s = reducer(s, { type: 'createSession', name: 'Show' })
  const sid = s.activeSessionId!
  s = reducer(s, { type: 'addParticipant', sessionId: sid, name: 'Ana', kind: 'individual' })
  s = reducer(s, { type: 'addParticipant', sessionId: sid, name: 'Bruno', kind: 'individual' })
  return { s, sid }
}

function seedFinishedFeud() {
  const { s, sid } = seed()
  const [ana, bruno] = s.sessions[0].participants
  const q = feudCategories[0].questions[0]
  const game: GameInstance = {
    id: 'g1',
    kind: 'feud',
    status: 'finished',
    config: {
      teamA: { name: 'Team A', playerIds: [ana.id] },
      teamB: { name: 'Team B', playerIds: [bruno.id] },
      questionIds: [q.id],
    },
    state: {
      teamA: { name: 'Team A', playerIds: [ana.id] },
      teamB: { name: 'Team B', playerIds: [bruno.id] },
      questions: [q],
      questionIndex: 1,
      round: { phase: 'faceOff', controllingTeam: null, revealed: [], strikes: 0, roundTotal: 0 },
      finished: true,
    },
    initialPoints: { [ana.id]: 0, [bruno.id]: 0 },
    appliedDeltas: [
      { participantId: ana.id, participantName: 'Ana', delta: 40 },
      { participantId: bruno.id, participantName: 'Bruno', delta: 25 },
    ],
    result: {
      awards: [
        { participantId: ana.id, participantName: 'Ana', delta: 40 },
        { participantId: bruno.id, participantName: 'Bruno', delta: 25 },
      ],
    },
  }
  s.sessions[0].games.push(game)
  return { s, sid }
}

function renderFeud(sid: string) {
  return render(
    <MemoryRouter initialEntries={[`/session/${sid}/game/feud`]}>
      <StoreProvider>
        <Routes>
          <Route path="/session/:id/game/feud" element={<FeudScreen />} />
        </Routes>
      </StoreProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('FeudScreen', () => {
  it('starts a game after assigning players to teams', () => {
    const { s, sid } = seed()
    saveState(s)
    renderFeud(sid)

    expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled()

    fireEvent.click(screen.getByLabelText('assign-Ana-A'))
    fireEvent.click(screen.getByLabelText('assign-Bruno-B'))
    fireEvent.click(screen.getByLabelText(/Name a social media app/))

    expect(screen.getByRole('button', { name: 'Start' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))

    expect(screen.getByText(/Question 1 of 1/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Team A' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Team B' })).toBeInTheDocument()
  })

  it('shows points earned on the final screen', () => {
    const { s, sid } = seedFinishedFeud()
    saveState(s)
    renderFeud(sid)

    expect(screen.getByText('Fábio-ly Feud — done')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Points earned' })).toBeInTheDocument()
    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('+40')).toBeInTheDocument()
    expect(screen.getByText('Bruno')).toBeInTheDocument()
    expect(screen.getByText('+25')).toBeInTheDocument()
  })
})
