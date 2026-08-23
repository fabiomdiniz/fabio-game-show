import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { AppState, GameAction, GameKind, PointDelta } from '../types'
import { newId, reducer } from './reducer'
import { loadState, saveState } from './persistence'
import { getGameDefinition } from './gameRegistry'
import type { StoreAction } from './actions'

export interface StoreContextValue {
  state: AppState
  dispatch: (action: StoreAction) => void
  beginGame: (sessionId: string, kind: GameKind, config: unknown) => string | null
  act: (gameId: string, action: GameAction) => void
  finishGame: (gameId: string) => void
  abandonGame: (gameId: string) => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

function findGame(state: AppState, gameId: string) {
  for (const session of state.sessions) {
    const game = session.games.find((g) => g.id === gameId)
    if (game) return { session, game }
  }
  return null
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadState().state)

  useEffect(() => {
    saveState(state)
  }, [state])

  const value = useMemo<StoreContextValue>(
    () => ({
      state,
      dispatch,
      beginGame(sessionId, kind, config) {
        const def = getGameDefinition(kind)
        if (!def) return null
        const id = newId()
        const instance = {
          id,
          kind,
          status: 'setup' as const,
          config,
          state: def.initialState(config),
          initialPoints: {},
          appliedDeltas: [],
        }
        dispatch({ type: 'startGame', sessionId, instance: instance as never })
        return id
      },
      act(gameId, action) {
        const found = findGame(state, gameId)
        if (!found) return
        const def = getGameDefinition(found.game.kind)
        if (!def) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = (def.applyAction as any)(found.game.state, action)
        const deltas: PointDelta[] = (result.deltas as { participantId: string; delta: number }[]).map((d) => ({
          participantId: d.participantId,
          participantName:
            found.session.participants.find((p) => p.id === d.participantId)?.name ?? d.participantId,
          delta: d.delta,
        }))
        dispatch({ type: 'applyGameAction', gameId, state: result.state, deltas })
      },
      finishGame(gameId) {
        dispatch({ type: 'finishGame', gameId })
      },
      abandonGame(gameId) {
        dispatch({ type: 'abandonGame', gameId })
      },
    }),
    [state],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
