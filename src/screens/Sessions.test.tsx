import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Sessions from './Sessions'
import { StoreProvider } from '../store/StoreContext'

function renderSessions() {
  return render(
    <MemoryRouter>
      <StoreProvider>
        <Sessions />
      </StoreProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('Sessions', () => {
  it('creates a session', () => {
    renderSessions()
    fireEvent.change(screen.getByLabelText('Session name'), { target: { value: 'Saturday Show' } })
    fireEvent.click(screen.getByText('New session'))
    expect(screen.getByText('Saturday Show')).toBeInTheDocument()
  })

  it('deletes a session after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderSessions()
    fireEvent.change(screen.getByLabelText('Session name'), { target: { value: 'A' } })
    fireEvent.click(screen.getByText('New session'))
    fireEvent.click(screen.getByText('Delete'))
    expect(screen.queryByText('A')).not.toBeInTheDocument()
  })

  it('imports a session from a JSON file', async () => {
    renderSessions()
    const session = { id: 's-imported', name: 'Imported Show', participants: [], games: [] }
    const file = new File([JSON.stringify(session)], 'session.json', { type: 'application/json' })
    const fileInput = document.querySelector('input[type=file]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })
    await waitFor(() => expect(screen.getByText('Imported Show')).toBeInTheDocument())
  })

  it('imports every session from a full-state export', async () => {
    renderSessions()
    const fullState = {
      version: 1,
      sessions: [
        { id: 's-a', name: 'Show A', participants: [], games: [] },
        { id: 's-b', name: 'Show B', participants: [], games: [] },
      ],
      activeSessionId: 's-a',
    }
    const file = new File([JSON.stringify(fullState)], 'state.json', { type: 'application/json' })
    const fileInput = document.querySelector('input[type=file]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })
    await waitFor(() => expect(screen.getByText('Show A')).toBeInTheDocument())
    expect(screen.getByText('Show B')).toBeInTheDocument()
  })

  it('shows an import error for an invalid session file', async () => {
    renderSessions()
    const file = new File(['{"name": "No id"}'], 'session.json', { type: 'application/json' })
    const fileInput = document.querySelector('input[type=file]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })
    await waitFor(() => expect(screen.getByText(/Import error/)).toBeInTheDocument())
  })
})
