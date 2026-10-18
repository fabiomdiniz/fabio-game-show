import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Admin from './Admin'
import { StoreProvider } from '../store/StoreContext'
import { saveState } from '../store/persistence'
import { reducer } from '../store/reducer'
import { emptyState } from '../store/state'

function seed() {
  let s = emptyState()
  s = reducer(s, { type: 'createSession', name: 'Show' })
  const sid = s.activeSessionId!
  s = reducer(s, { type: 'addParticipant', sessionId: sid, name: 'Ana', kind: 'individual' })
  s = reducer(s, { type: 'overridePoints', sessionId: sid, participantId: s.sessions[0].participants[0].id, points: 10 })
  return { s, sid }
}

function renderAdmin(sid: string) {
  return render(
    <MemoryRouter initialEntries={[`/session/${sid}/admin`]}>
      <StoreProvider>
        <Routes>
          <Route path="/session/:id/admin" element={<Admin />} />
        </Routes>
      </StoreProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('Admin', () => {
  it('renames a participant', () => {
    const { s, sid } = seed()
    saveState(s)
    renderAdmin(sid)
    fireEvent.change(screen.getByLabelText('rename-Ana'), { target: { value: 'Ana B.' } })
    fireEvent.click(screen.getByText('Save'))
    expect(screen.getByLabelText('rename-Ana B.')).toBeInTheDocument()
  })

  it('overrides points', () => {
    const { s, sid } = seed()
    saveState(s)
    renderAdmin(sid)
    fireEvent.change(screen.getByLabelText('override-Ana'), { target: { value: '50' } })
    fireEvent.click(screen.getByText('Set'))
    expect(screen.getByTestId('points-Ana').textContent).toBe('50')
  })

  it('adds a participant', () => {
    const { s, sid } = seed()
    saveState(s)
    renderAdmin(sid)
    fireEvent.change(screen.getByLabelText('Participant name'), { target: { value: 'Bruno' } })
    fireEvent.click(screen.getByText('Add'))
    expect(screen.getByLabelText('rename-Bruno')).toBeInTheDocument()
  })

  it('does not show a Kind column', () => {
    const { s, sid } = seed()
    saveState(s)
    renderAdmin(sid)
    expect(screen.queryByText('Kind')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Kind')).not.toBeInTheDocument()
  })

  it('shows an import error for invalid state', async () => {
    const { s, sid } = seed()
    saveState(s)
    renderAdmin(sid)
    const file = new File(['{"version": 99}'], 'state.json', { type: 'application/json' })
    const fileInput = document.querySelector('input[type=file]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })
    await waitFor(() => expect(screen.getByText(/Import error/)).toBeInTheDocument())
  })
})
