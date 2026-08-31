import type { AppState, GameInstance, Session } from '../types'
import { emptyState } from './state'
import type { StoreAction } from './actions'

export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// Participant ids referenced by a game's config/state (used by the deletion guard
// and, later, import validation).
export function referencedParticipantIds(instance: GameInstance): string[] {
  switch (instance.kind) {
    case 'boardGame':
      return [...instance.state.winners]
    case 'fighting':
      return [...instance.config.entrants]
    case 'feud':
      return [...instance.config.teamA.playerIds, ...instance.config.teamB.playerIds]
    case 'jeopardy':
      return [...instance.config.participantIds]
  }
}

function updateSession(state: AppState, sessionId: string, fn: (s: Session) => Session): AppState {
  return { ...state, sessions: state.sessions.map((s) => (s.id === sessionId ? fn(s) : s)) }
}

export function reducer(state: AppState, action: StoreAction): AppState {
  switch (action.type) {
    case 'createSession': {
      const session: Session = { id: newId(), name: action.name, participants: [], games: [] }
      return { ...state, sessions: [...state.sessions, session], activeSessionId: state.activeSessionId ?? session.id }
    }

    case 'renameSession':
      return updateSession(state, action.sessionId, (s) => ({ ...s, name: action.name }))

    case 'deleteSession': {
      const sessions = state.sessions.filter((s) => s.id !== action.sessionId)
      const activeSessionId =
        state.activeSessionId === action.sessionId ? (sessions[0]?.id ?? null) : state.activeSessionId
      return { ...state, sessions, activeSessionId }
    }

    case 'setActiveSession':
      return { ...state, activeSessionId: action.sessionId }

    case 'addParticipant':
      return updateSession(state, action.sessionId, (s) => ({
        ...s,
        participants: [
          ...s.participants,
          { id: newId(), kind: action.kind, name: action.name, members: action.members, points: 0 },
        ],
      }))

    case 'renameParticipant':
      return updateSession(state, action.sessionId, (s) => ({
        ...s,
        participants: s.participants.map((p) =>
          p.id === action.participantId ? { ...p, name: action.name } : p,
        ),
      }))

    case 'deleteParticipant':
      return updateSession(state, action.sessionId, (s) => {
        const blocked = s.games.some(
          (g) => g.status !== 'finished' && referencedParticipantIds(g).includes(action.participantId),
        )
        if (blocked) return s
        return { ...s, participants: s.participants.filter((p) => p.id !== action.participantId) }
      })

    case 'overridePoints':
      return updateSession(state, action.sessionId, (s) => ({
        ...s,
        participants: s.participants.map((p) =>
          p.id === action.participantId ? { ...p, points: action.points } : p,
        ),
      }))

    case 'startGame':
      return updateSession(state, action.sessionId, (s) => {
        if (s.games.some((g) => g.status === 'inProgress')) return s
        const initialPoints: Record<string, number> = {}
        for (const pid of referencedParticipantIds(action.instance)) {
          const p = s.participants.find((pp) => pp.id === pid)
          if (p) initialPoints[pid] = p.points
        }
        const instance = { ...action.instance, status: 'inProgress', initialPoints } as GameInstance
        return { ...s, games: [...s.games, instance] }
      })

    case 'applyGameAction':
      return {
        ...state,
        sessions: state.sessions.map((s) => {
          const idx = s.games.findIndex((g) => g.id === action.gameId)
          if (idx === -1) return s
          const game = s.games[idx]
          const updatedGame = {
            ...game,
            state: action.state,
            appliedDeltas: [...game.appliedDeltas, ...action.deltas],
          } as GameInstance
          let participants = s.participants
          for (const d of action.deltas) {
            participants = participants.map((p) =>
              p.id === d.participantId ? { ...p, points: p.points + d.delta } : p,
            )
          }
          return { ...s, participants, games: s.games.map((g, i) => (i === idx ? updatedGame : g)) }
        }),
      }

    case 'finishGame':
      return {
        ...state,
        sessions: state.sessions.map((s) => ({
          ...s,
          games: s.games.map((g) =>
            g.id === action.gameId && g.status === 'inProgress'
              ? ({ ...g, status: 'finished', result: { awards: g.appliedDeltas } } as GameInstance)
              : g,
          ),
        })),
      }

    case 'abandonGame':
      return {
        ...state,
        sessions: state.sessions.map((s) => {
          const game = s.games.find((g) => g.id === action.gameId)
          if (!game) return s
          let participants = s.participants
          for (const [pid, pts] of Object.entries(game.initialPoints)) {
            participants = participants.map((p) => (p.id === pid ? { ...p, points: pts } : p))
          }
          return { ...s, participants, games: s.games.filter((g) => g.id !== action.gameId) }
        }),
      }

    case 'clearState':
      return emptyState()

    case 'importState':
      return action.state

    default:
      return state
  }
}
