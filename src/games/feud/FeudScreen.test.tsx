import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '../register'
import FeudScreen from './FeudScreen'
import { StoreProvider } from '../../store/StoreContext'
import { saveState } from '../../store/persistence'
import { reducer } from '../../store/reducer'
import { emptyState } from '../../store/state'
import { feudQuestions } from '../../content/feud'
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
  const q = feudQuestions[0]
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
    fireEvent.click(screen.getByLabelText(/Favorite Pokemons/))

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

  it('selects all questions when clicked', () => {
    const { s, sid } = seed()
    saveState(s)
    renderFeud(sid)

    fireEvent.click(screen.getByRole('button', { name: 'Select all questions' }))

    const totalQuestions = feudQuestions.length
    const checked = screen.getAllByRole('checkbox').filter((cb) => (cb as HTMLInputElement).checked)
    expect(checked.length).toBe(totalQuestions)
  })

  it('randomly balances teams when clicked', () => {
    let s = emptyState()
    s = reducer(s, { type: 'createSession', name: 'Show' })
    const sid = s.activeSessionId!
    for (const name of ['Ana', 'Bruno', 'Carla', 'Diego']) {
      s = reducer(s, { type: 'addParticipant', sessionId: sid, name, kind: 'individual' })
    }
    saveState(s)
    renderFeud(sid)

    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.999999)
    fireEvent.click(screen.getByRole('button', { name: 'Randomly balance teams' }))
    spy.mockRestore()

    // rng just under 1 is an identity shuffle, so the split is first half / second half
    expect(screen.getByLabelText('assign-Ana-A')).toBeChecked()
    expect(screen.getByLabelText('assign-Bruno-A')).toBeChecked()
    expect(screen.getByLabelText('assign-Carla-B')).toBeChecked()
    expect(screen.getByLabelText('assign-Diego-B')).toBeChecked()
  })

  it('reveals a typed answer and always shows the ranking', () => {
    const { s, sid } = seed()
    saveState(s)
    renderFeud(sid)

    fireEvent.click(screen.getByLabelText('assign-Ana-A'))
    fireEvent.click(screen.getByLabelText('assign-Bruno-B'))
    fireEvent.click(screen.getByLabelText(/Favorite Pokemons/))
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))

    // ranking is always visible: points shown, every answer hidden
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getAllByText('???').length).toBe(10)

    // face-off: pick Team A, then type the winning answer
    fireEvent.click(screen.getByRole('button', { name: 'Team A' }))
    fireEvent.change(screen.getByLabelText('answer'), { target: { value: 'Wartortle' } })
    fireEvent.click(screen.getByRole('button', { name: 'Reveal answer' }))

    expect(screen.getByText('Wartortle')).toBeInTheDocument()
    expect(screen.getAllByText('???').length).toBe(9)
  })

  it('starts a new game from the in-progress view', () => {
    const { s, sid } = seed()
    saveState(s)
    renderFeud(sid)

    fireEvent.click(screen.getByLabelText('assign-Ana-A'))
    fireEvent.click(screen.getByLabelText('assign-Bruno-B'))
    fireEvent.click(screen.getByLabelText(/Favorite Pokemons/))
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))

    expect(screen.getByText(/Question 1 of 1/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Start a new game' }))

    expect(screen.getByLabelText('Team A name')).toBeInTheDocument()
  })

  it('reveals answers during the face-off before choosing control', () => {
    const { s, sid } = seed()
    saveState(s)
    renderFeud(sid)

    fireEvent.click(screen.getByLabelText('assign-Ana-A'))
    fireEvent.click(screen.getByLabelText('assign-Bruno-B'))
    fireEvent.click(screen.getByLabelText(/Favorite Pokemons/))
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))

    // still in face-off: type the top answer directly
    fireEvent.change(screen.getByLabelText('answer'), { target: { value: 'Wartortle' } })
    fireEvent.click(screen.getByRole('button', { name: 'Reveal answer' }))

    expect(screen.getByText('Wartortle')).toBeInTheDocument()
    expect(screen.getAllByText('???').length).toBe(9)

    // then choose which team controls
    fireEvent.click(screen.getByRole('button', { name: 'Team B' }))
    expect(screen.getByText(/controlling: Team B/)).toBeInTheDocument()
  })

  it('steal uses a typed answer to decide the outcome', () => {
    const { s, sid } = seed()
    saveState(s)
    renderFeud(sid)

    fireEvent.click(screen.getByLabelText('assign-Ana-A'))
    fireEvent.click(screen.getByLabelText('assign-Bruno-B'))
    fireEvent.click(screen.getByLabelText(/Favorite Pokemons/))
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))

    // into board phase, then three strikes -> steal
    fireEvent.click(screen.getByRole('button', { name: 'Team A' }))
    fireEvent.click(screen.getByRole('button', { name: 'Strike' }))
    fireEvent.click(screen.getByRole('button', { name: 'Strike' }))
    fireEvent.click(screen.getByRole('button', { name: 'Strike' }))

    expect(screen.getByText(/Steal by Team B/)).toBeInTheDocument()

    // type a correct (unrevealed) answer -> the steal succeeds, round-end screen shows
    fireEvent.change(screen.getByLabelText('answer'), { target: { value: 'Wartortle' } })
    fireEvent.click(screen.getByRole('button', { name: 'Check' }))

    expect(screen.getByRole('heading', { name: 'Round over' })).toBeInTheDocument()
    expect(screen.getByText(/Steal successful/)).toBeInTheDocument()
    expect(screen.getByText('Points awarded to Team B')).toBeInTheDocument()

    // finish the last question -> final screen
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }))
    expect(screen.getByText('Fábio-ly Feud — done')).toBeInTheDocument()
  })

  it('shows "Steal failed" when the stealing team misses', () => {
    const { s, sid } = seed()
    saveState(s)
    renderFeud(sid)

    fireEvent.click(screen.getByLabelText('assign-Ana-A'))
    fireEvent.click(screen.getByLabelText('assign-Bruno-B'))
    fireEvent.click(screen.getByLabelText(/Favorite Pokemons/))
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))

    fireEvent.click(screen.getByRole('button', { name: 'Team A' }))
    fireEvent.click(screen.getByRole('button', { name: 'Strike' }))
    fireEvent.click(screen.getByRole('button', { name: 'Strike' }))
    fireEvent.click(screen.getByRole('button', { name: 'Strike' }))

    // type a wrong answer -> the steal fails, controlling team keeps the round
    fireEvent.change(screen.getByLabelText('answer'), { target: { value: 'Not a real answer' } })
    fireEvent.click(screen.getByRole('button', { name: 'Check' }))

    expect(screen.getByRole('heading', { name: 'Round over' })).toBeInTheDocument()
    expect(screen.getByText(/Steal failed/)).toBeInTheDocument()
    expect(screen.getByText('Points awarded to Team A')).toBeInTheDocument()
  })

  it('shows big strike Xs that fill as strikes accumulate', () => {
    const { s, sid } = seed()
    saveState(s)
    renderFeud(sid)

    fireEvent.click(screen.getByLabelText('assign-Ana-A'))
    fireEvent.click(screen.getByLabelText('assign-Bruno-B'))
    fireEvent.click(screen.getByLabelText(/Favorite Pokemons/))
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))

    // into board phase
    fireEvent.click(screen.getByRole('button', { name: 'Team A' }))
    expect(screen.getByTestId('strikes')).toHaveAttribute('aria-label', '0 of 3 strikes')

    fireEvent.click(screen.getByRole('button', { name: 'Strike' }))
    expect(screen.getByTestId('strikes')).toHaveAttribute('aria-label', '1 of 3 strikes')

    fireEvent.click(screen.getByRole('button', { name: 'Strike' }))
    expect(screen.getByTestId('strikes')).toHaveAttribute('aria-label', '2 of 3 strikes')
  })

  it("always shows each team's total points", () => {
    const { s, sid } = seed()
    saveState(s)
    renderFeud(sid)

    fireEvent.click(screen.getByLabelText('assign-Ana-A'))
    fireEvent.click(screen.getByLabelText('assign-Bruno-B'))
    fireEvent.click(screen.getByLabelText(/Favorite Pokemons/))
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))

    expect(screen.getByTestId('team-a-score')).toHaveTextContent(/Team A/)
    expect(screen.getByTestId('team-a-score')).toHaveTextContent(/0 points/)
    expect(screen.getByTestId('team-b-score')).toHaveTextContent(/Team B/)
  })

  it('team score is the round total, not multiplied by team size', () => {
    let s = emptyState()
    s = reducer(s, { type: 'createSession', name: 'Show' })
    const sid = s.activeSessionId!
    for (const name of ['Ana', 'Bruno', 'Carla']) {
      s = reducer(s, { type: 'addParticipant', sessionId: sid, name, kind: 'individual' })
    }
    saveState(s)
    renderFeud(sid)

    fireEvent.click(screen.getByLabelText('assign-Ana-A'))
    fireEvent.click(screen.getByLabelText('assign-Bruno-A'))
    fireEvent.click(screen.getByLabelText('assign-Carla-B'))
    fireEvent.click(screen.getByLabelText(/Favorite Pokemons/))
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))

    // Team A (2 players) controls and reveals every answer -> round over
    fireEvent.click(screen.getByRole('button', { name: 'Team A' }))
    for (const answer of feudQuestions[0].answers.map((a) => a.text)) {
      fireEvent.change(screen.getByLabelText('answer'), { target: { value: answer } })
      fireEvent.click(screen.getByRole('button', { name: 'Reveal answer' }))
    }

    const roundTotal = feudQuestions[0].answers.reduce((sum, a) => sum + a.points, 0)
    // Team A has 2 players; the score must be roundTotal (not 2x roundTotal)
    expect(screen.getByTestId('team-a-score')).toHaveTextContent(new RegExp(`${roundTotal} points`))
    expect(screen.getByTestId('team-b-score')).toHaveTextContent(/0 points/)
  })

  it('ends the game early and declares the leading team the winner', () => {
    let s = emptyState()
    s = reducer(s, { type: 'createSession', name: 'Show' })
    const sid = s.activeSessionId!
    s = reducer(s, { type: 'addParticipant', sessionId: sid, name: 'Ana', kind: 'individual' })
    s = reducer(s, { type: 'addParticipant', sessionId: sid, name: 'Bruno', kind: 'individual' })
    saveState(s)
    renderFeud(sid)

    fireEvent.click(screen.getByLabelText('assign-Ana-A'))
    fireEvent.click(screen.getByLabelText('assign-Bruno-B'))
    fireEvent.click(screen.getByLabelText(/Favorite Pokemons/))
    fireEvent.click(screen.getByLabelText(/Favorite Movies/))
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))

    // round 1: Team A controls and reveals every answer
    fireEvent.click(screen.getByRole('button', { name: 'Team A' }))
    for (const answer of feudQuestions[0].answers.map((a) => a.text)) {
      fireEvent.change(screen.getByLabelText('answer'), { target: { value: answer } })
      fireEvent.click(screen.getByRole('button', { name: 'Reveal answer' }))
    }
    expect(screen.getByRole('heading', { name: 'Round over' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Next question' }))

    // on the second question, end the game early
    fireEvent.click(screen.getByRole('button', { name: 'End game' }))

    expect(screen.getByText('Fábio-ly Feud — done')).toBeInTheDocument()
    expect(screen.getByTestId('winner')).toHaveTextContent(/Team A/)
  })
})
