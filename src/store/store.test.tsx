import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StoreProvider, useStore } from './StoreContext'
import { registerGame } from './gameRegistry'
import type { GameDefinition } from '../types'

// A minimal fake game: each 'tick' adds 1 point to a target participant.
const fakeDef: GameDefinition<
  'boardGame',
  { targetId: string; pointValue: number },
  { winners: string[]; count: number },
  { type: 'tick' }
> = {
  kind: 'boardGame',
  title: 'Fake',
  acceptedKinds: ['individual'],
  initialConfig: () => ({ targetId: '', pointValue: 1 }),
  initialState: (c) => ({ winners: [c.targetId], count: 0 }),
  validateConfig: () => null,
  applyAction: (s, a) => {
    if (a.type === 'tick') {
      return { state: { ...s, count: s.count + 1 }, deltas: [{ participantId: s.winners[0], delta: 1 }] }
    }
    return { state: s, deltas: [] }
  },
  isFinished: (s) => s.count >= 1,
}

registerGame(fakeDef)

function Harness() {
  const store = useStore()
  const active = store.state.sessions.find((s) => s.id === store.state.activeSessionId)
  const pid = active?.participants[0]?.id
  const gid = active?.games[0]?.id
  return (
    <div>
      <button data-testid="create" onClick={() => store.dispatch({ type: 'createSession', name: 'Show' })} />
      <button
        data-testid="add"
        onClick={() =>
          store.dispatch({
            type: 'addParticipant',
            sessionId: store.state.activeSessionId!,
            name: 'Ana',
            kind: 'individual',
          })
        }
      />
      <button
        data-testid="begin"
        onClick={() => store.beginGame(store.state.activeSessionId!, 'boardGame', { targetId: pid, pointValue: 1 })}
      />
      <button data-testid="tick" onClick={() => store.act(gid!, { type: 'tick' } as never)} />
      <button data-testid="finish" onClick={() => store.finishGame(gid!)} />
      <button data-testid="abandon" onClick={() => store.abandonGame(gid!)} />
      <div data-testid="points">{active?.participants[0]?.points ?? 'none'}</div>
      <div data-testid="status">{active?.games[0]?.status ?? 'none'}</div>
      <div data-testid="awards">{active?.games[0]?.result?.awards.length ?? 0}</div>
    </div>
  )
}

function renderHarness() {
  return render(
    <StoreProvider>
      <Harness />
    </StoreProvider>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('StoreContext orchestration', () => {
  it('begins a game, commits a delta, and finishes with a result', () => {
    renderHarness()
    fireEvent.click(screen.getByTestId('create'))
    fireEvent.click(screen.getByTestId('add'))
    fireEvent.click(screen.getByTestId('begin'))
    expect(screen.getByTestId('status').textContent).toBe('inProgress')

    fireEvent.click(screen.getByTestId('tick'))
    expect(screen.getByTestId('points').textContent).toBe('1')

    fireEvent.click(screen.getByTestId('finish'))
    expect(screen.getByTestId('status').textContent).toBe('finished')
    expect(screen.getByTestId('awards').textContent).toBe('1')
  })

  it('abandons a game, restoring pre-game points', () => {
    renderHarness()
    fireEvent.click(screen.getByTestId('create'))
    fireEvent.click(screen.getByTestId('add'))
    fireEvent.click(screen.getByTestId('begin'))
    fireEvent.click(screen.getByTestId('tick'))
    expect(screen.getByTestId('points').textContent).toBe('1')

    fireEvent.click(screen.getByTestId('abandon'))
    expect(screen.getByTestId('points').textContent).toBe('0')
    expect(screen.getByTestId('status').textContent).toBe('none')
  })
})
