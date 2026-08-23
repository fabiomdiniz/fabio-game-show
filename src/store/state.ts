import { CURRENT_VERSION, type AppState } from '../types'

export function emptyState(): AppState {
  return { version: CURRENT_VERSION, sessions: [], activeSessionId: null }
}
