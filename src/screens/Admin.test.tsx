import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
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
  return s
}

function renderAdmin() {
  return render(
    <MemoryRouter>
      <StoreProvider>
        <Admin />
      </StoreProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('Admin', () => {
  it('renames a participant', () => {
    saveState(seed())
    renderAdmin()
    fireEvent.change(screen.getByLabelText('rename-Ana'), { target: { value: 'Ana B.' } })
    fireEvent.click(screen.getByText('Save'))
    expect(screen.getByLabelText('rename-Ana B.')).toBeInTheDocument()
  })

  it('overrides points', () => {
    saveState(seed())
    renderAdmin()
    fireEvent.change(screen.getByLabelText('override-Ana'), { target: { value: '50' } })
    fireEvent.click(screen.getByText('Set'))
    expect(screen.getByTestId('points-Ana').textContent).toBe('50')
  })

  it('adds a participant', () => {
    saveState(seed())
    renderAdmin()
    fireEvent.change(screen.getByLabelText('Participant name'), { target: { value: 'Bruno' } })
    fireEvent.click(screen.getByText('Add'))
    expect(screen.getByLabelText('rename-Bruno')).toBeInTheDocument()
  })

  it('shows an import error for invalid state', async () => {
    saveState(seed())
    renderAdmin()
    const file = new File(['{"version": 99}'], 'state.json', { type: 'application/json' })
    const fileInput = document.querySelector('input[type=file]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })
    await waitFor(() => expect(screen.getByText(/Import error/)).toBeInTheDocument())
  })
})
