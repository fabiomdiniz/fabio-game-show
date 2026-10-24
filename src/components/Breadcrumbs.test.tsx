import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Breadcrumbs from './Breadcrumbs'
import { StoreProvider } from '../store/StoreContext'
import { saveState } from '../store/persistence'
import { reducer } from '../store/reducer'
import { emptyState } from '../store/state'
import '../games/register'

function seed() {
  let s = emptyState()
  s = reducer(s, { type: 'createSession', name: 'Show' })
  return { s, sid: s.activeSessionId! }
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <StoreProvider>
        <Breadcrumbs />
      </StoreProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('Breadcrumbs', () => {
  it('shows Sessions on the root', () => {
    renderAt('/')
    expect(screen.getByText('Sessions')).toBeInTheDocument()
  })

  it('shows the session name on the session page', () => {
    const { s, sid } = seed()
    saveState(s)
    renderAt(`/session/${sid}`)
    expect(screen.getByText('Sessions')).toBeInTheDocument()
    expect(screen.getByText('Show')).toBeInTheDocument()
  })

  it('shows Admin as the final crumb', () => {
    const { s, sid } = seed()
    saveState(s)
    renderAt(`/session/${sid}/admin`)
    expect(screen.getByText('Show')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('shows the game title on the game screen', () => {
    const { s, sid } = seed()
    saveState(s)
    renderAt(`/session/${sid}/game/boardGame`)
    expect(screen.getByText('Show')).toBeInTheDocument()
    expect(screen.getByText('Board Game')).toBeInTheDocument()
  })
})
