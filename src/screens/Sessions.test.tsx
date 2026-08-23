import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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
})
