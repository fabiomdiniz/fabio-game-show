import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '../register'
import JeopardyScreen from './JeopardyScreen'
import { StoreProvider } from '../../store/StoreContext'
import { saveState } from '../../store/persistence'
import { reducer } from '../../store/reducer'
import { emptyState } from '../../store/state'
import { jeopardyBoard } from '../../content/jeopardy'
import type { GameInstance } from '../../types'

function seedFinishedJeopardy() {
  let s = emptyState()
  s = reducer(s, { type: 'createSession', name: 'Show' })
  const sid = s.activeSessionId!
  s = reducer(s, { type: 'addParticipant', sessionId: sid, name: 'Ana', kind: 'individual' })
  s = reducer(s, { type: 'addParticipant', sessionId: sid, name: 'Bruno', kind: 'individual' })
  const [ana, bruno] = s.sessions[0].participants
  const cat = jeopardyBoard.categories[0]
  const game: GameInstance = {
    id: 'g1',
    kind: 'jeopardy',
    status: 'finished',
    config: { participantIds: [ana.id, bruno.id], categoryIds: [cat.id] },
    state: {
      categories: [cat],
      finalJeopardy: jeopardyBoard.finalJeopardy,
      scores: { [ana.id]: 10, [bruno.id]: -5 },
      revealedClues: cat.clues.map((c) => c.id),
      activeClueId: null,
      phase: 'finished',
    },
    initialPoints: { [ana.id]: 0, [bruno.id]: 0 },
    appliedDeltas: [
      { participantId: ana.id, participantName: 'Ana', delta: 10 },
      { participantId: bruno.id, participantName: 'Bruno', delta: -5 },
    ],
    result: {
      awards: [
        { participantId: ana.id, participantName: 'Ana', delta: 10 },
        { participantId: bruno.id, participantName: 'Bruno', delta: -5 },
      ],
    },
  }
  s.sessions[0].games.push(game)
  return { s, sid }
}

function seedSessionWithParticipants() {
  let s = emptyState()
  s = reducer(s, { type: 'createSession', name: 'Show' })
  const sid = s.activeSessionId!
  s = reducer(s, { type: 'addParticipant', sessionId: sid, name: 'Ana', kind: 'individual' })
  s = reducer(s, { type: 'addParticipant', sessionId: sid, name: 'Bruno', kind: 'individual' })
  return { s, sid }
}

function renderJeopardy(sid: string) {
  return render(
    <MemoryRouter initialEntries={[`/session/${sid}/game/jeopardy`]}>
      <StoreProvider>
        <Routes>
          <Route path="/session/:id/game/jeopardy" element={<JeopardyScreen />} />
        </Routes>
      </StoreProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('JeopardyScreen', () => {
  it('shows points earned on the final screen', () => {
    const { s, sid } = seedFinishedJeopardy()
    saveState(s)
    renderJeopardy(sid)

    expect(screen.getByText('What is… Panda? — done')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Points earned' })).toBeInTheDocument()
    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('+10')).toBeInTheDocument()
    expect(screen.getByText('Bruno')).toBeInTheDocument()
    expect(screen.getByText('-5')).toBeInTheDocument()
  })

  it('select all and clear buttons toggle participants and categories', () => {
    const { s, sid } = seedSessionWithParticipants()
    saveState(s)
    renderJeopardy(sid)

    const participantCheckboxes = screen.getAllByRole('checkbox').slice(0, 2)
    const categoryCheckboxes = screen.getAllByRole('checkbox').slice(2)
    const selectAllButtons = screen.getAllByRole('button', { name: 'Select all' })
    const clearButtons = screen.getAllByRole('button', { name: 'Clear' })

    expect(participantCheckboxes.every((c) => !(c as HTMLInputElement).checked)).toBe(true)
    expect(categoryCheckboxes.every((c) => !(c as HTMLInputElement).checked)).toBe(true)

    fireEvent.click(selectAllButtons[0])
    fireEvent.click(selectAllButtons[1])

    expect(participantCheckboxes.every((c) => (c as HTMLInputElement).checked)).toBe(true)
    expect(categoryCheckboxes.every((c) => (c as HTMLInputElement).checked)).toBe(true)

    fireEvent.click(clearButtons[0])
    fireEvent.click(clearButtons[1])

    expect(participantCheckboxes.every((c) => !(c as HTMLInputElement).checked)).toBe(true)
    expect(categoryCheckboxes.every((c) => !(c as HTMLInputElement).checked)).toBe(true)
  })
})
