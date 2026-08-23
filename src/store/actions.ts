import type { AppState, GameInstance, ParticipantKind, PointDelta } from '../types'

export type StoreAction =
  | { type: 'createSession'; name: string }
  | { type: 'renameSession'; sessionId: string; name: string }
  | { type: 'deleteSession'; sessionId: string }
  | { type: 'setActiveSession'; sessionId: string }
  | { type: 'addParticipant'; sessionId: string; name: string; kind: ParticipantKind; members?: string[] }
  | { type: 'renameParticipant'; sessionId: string; participantId: string; name: string }
  | { type: 'deleteParticipant'; sessionId: string; participantId: string }
  | { type: 'overridePoints'; sessionId: string; participantId: string; points: number }
  | { type: 'startGame'; sessionId: string; instance: GameInstance }
  | { type: 'applyGameAction'; gameId: string; state: unknown; deltas: PointDelta[] }
  | { type: 'finishGame'; gameId: string }
  | { type: 'abandonGame'; gameId: string }
  | { type: 'clearState' }
  | { type: 'importState'; state: AppState }
