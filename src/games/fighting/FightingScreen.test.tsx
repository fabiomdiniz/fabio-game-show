import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '../register'
import FightingScreen from './FightingScreen'
import { StoreProvider } from '../../store/StoreContext'
import { saveState } from '../../store/persistence'
import { reducer } from '../../store/reducer'
import { emptyState } from '../../store/state'
import { fightingDefinition } from './definition'

function seedParticipants() {
  let s = emptyState()
  s = reducer(s, { type: 'createSession', name: 'Show' })
  const sid = s.activeSessionId!
  for (const name of ['Ana', 'Bruno', 'Carla']) {
    s = reducer(s, { type: 'addParticipant', sessionId: sid, name, kind: 'individual' })
  }
  return { s, sid }
}

function seed() {
  const { s: base, sid } = seedParticipants()
  let s = base
  const entrants = s.sessions[0].participants.map((p) => p.id)
  const config = { firstPlacePoints: 10, secondPlacePoints: 5, entrants }
  // Identity rng keeps the bracket order deterministic for the click-flow test.
  const spy = vi.spyOn(Math, 'random').mockReturnValue(0.999999)
  const state = fightingDefinition.initialState(config)
  spy.mockRestore()
  s = reducer(s, {
    type: 'startGame',
    sessionId: sid,
    instance: {
      id: 'g1',
      kind: 'fighting',
      status: 'setup',
      config,
      state,
      initialPoints: {},
      appliedDeltas: [],
    },
  })
  return { s, sid }
}

function renderScreen(sid: string) {
  return render(
    <MemoryRouter initialEntries={[`/session/${sid}/game/fighting`]}>
      <StoreProvider>
        <Routes>
          <Route path="/session/:id/game/:kind" element={<FightingScreen />} />
        </Routes>
      </StoreProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('FightingScreen', () => {
  it('shows TBD for slots whose fighter is not decided yet', () => {
    const { s, sid } = seed()
    saveState(s)
    renderScreen(sid)

    // 3 entrants in a 4-slot bracket: one bye (auto-advanced) and one open slot.
    expect(screen.getByText('Semifinals')).toBeInTheDocument()
    expect(screen.getByText('Grand Final')).toBeInTheDocument()
    expect(screen.getByText('Bye')).toBeInTheDocument()
    expect(screen.getAllByText('TBD')).toHaveLength(1)
  })

  it('selects all fighters from the setup form', () => {
    const { s, sid } = seedParticipants()
    saveState(s)
    renderScreen(sid)

    fireEvent.click(screen.getByRole('button', { name: 'Select all' }))
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(3)
    checkboxes.forEach((cb) => expect(cb).toBeChecked())
  })

  it('undoes a selected winner', () => {
    const { s, sid } = seed()
    saveState(s)
    renderScreen(sid)

    fireEvent.click(screen.getByRole('button', { name: 'Ana' }))
    fireEvent.click(screen.getByRole('button', { name: /Undo/ }))

    expect(screen.getByRole('button', { name: 'Ana' })).toBeInTheDocument()
    expect(screen.getAllByText('TBD')).toHaveLength(1)
  })

  it('shows a final summary with fights, winner and points once the bracket is decided', () => {
    const { s, sid } = seed()
    saveState(s)
    renderScreen(sid)

    // Round 1: Ana beats Bruno; round 2: Ana vs Carla; Carla wins the final.
    fireEvent.click(screen.getByRole('button', { name: 'Ana' }))
    fireEvent.click(screen.getByRole('button', { name: 'Carla' }))

    expect(screen.queryByText('Select fighters (individual players only):')).not.toBeInTheDocument()

    expect(screen.getByTestId('champion').textContent).toContain('Carla')
    expect(screen.getByTestId('champion').textContent).toContain('+10')
    expect(screen.getByTestId('runner-up').textContent).toContain('Ana')
    expect(screen.getByTestId('runner-up').textContent).toContain('+5')

    // The finished bracket still shows the bye and the decided champion.
    expect(screen.getByText('Bye')).toBeInTheDocument()
    expect(screen.getByTestId('bracket-champion').textContent).toContain('Carla')

    // Only an explicit request goes back to fighter select.
    fireEvent.click(screen.getByText('Start a new game'))
    expect(screen.getByText('Select fighters (individual players only):')).toBeInTheDocument()
  })
})
