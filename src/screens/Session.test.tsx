import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Session from './Session'
import { StoreProvider } from '../store/StoreContext'
import { saveState } from '../store/persistence'
import { reducer } from '../store/reducer'
import { emptyState } from '../store/state'

function seed() {
  let s = emptyState()
  s = reducer(s, { type: 'createSession', name: 'Show' })
  const sid = s.activeSessionId!
  s = reducer(s, { type: 'addParticipant', sessionId: sid, name: 'Ana', kind: 'individual' })
  return { s, sid }
}

function renderSession(sid: string) {
  return render(
    <MemoryRouter initialEntries={[`/session/${sid}`]}>
      <StoreProvider>
        <Routes>
          <Route path="/session/:id" element={<Session />} />
        </Routes>
      </StoreProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('Session', () => {
  it('renders the scoreboard and adds a participant', () => {
    const { s, sid } = seed()
    saveState(s)
    renderSession(sid)

    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('individual')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Participant name'), { target: { value: 'Bruno' } })
    fireEvent.click(screen.getByText('Add'))
    expect(screen.getByText('Bruno')).toBeInTheDocument()
  })

  it('adds a team with members', () => {
    const { s, sid } = seed()
    saveState(s)
    renderSession(sid)

    fireEvent.change(screen.getByLabelText('Participant name'), { target: { value: 'Team Red' } })
    fireEvent.change(screen.getByLabelText('Kind'), { target: { value: 'team' } })
    fireEvent.change(screen.getByLabelText('Members'), { target: { value: 'Ana, Bruno' } })
    fireEvent.click(screen.getByText('Add'))
    expect(screen.getByText(/Team Red/)).toBeInTheDocument()
    expect(screen.getByText(/Ana, Bruno/)).toBeInTheDocument()
  })
})
