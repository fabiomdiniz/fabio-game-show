export type ParticipantKind = 'individual' | 'team'

export interface Participant {
  id: string
  kind: ParticipantKind
  name: string
  members?: string[] // team member display names (teams only)
  points: number // running session score
}

export type GameKind = 'boardGame' | 'fighting' | 'feud' | 'jeopardy'

export interface PointDelta {
  participantId: string
  participantName: string // snapshot, so history survives participant deletion
  delta: number // signed change applied to Participant.points
}

export interface GameResult {
  awards: PointDelta[] // accumulated deltas earned during the game
}

// Forward-declared to break the circular reference; refined below.
export type GameInstance =
  | GameInstanceBase<'boardGame', BoardGameConfig, BoardGameState>
  | GameInstanceBase<'fighting', FightingConfig, FightingState>
  | GameInstanceBase<'feud', FeudConfig, FeudState>
  | GameInstanceBase<'jeopardy', JeopardyConfig, JeopardyState>

export interface Session {
  id: string
  name: string
  participants: Participant[]
  games: GameInstance[]
}

export interface AppState {
  version: number
  sessions: Session[]
  activeSessionId: string | null
}

export const CURRENT_VERSION = 1

export interface GameDefinition<K extends GameKind, C, S, A> {
  kind: K
  title: string
  acceptedKinds: ParticipantKind[]
  initialConfig: () => C
  initialState: (c: C) => S
  validateConfig: (c: C) => string | null
  applyAction: (s: S, a: A) => { state: S; deltas: { participantId: string; delta: number }[] }
  isFinished: (s: S) => boolean
}

export type GameAction = BoardGameAction | FightingAction | FeudAction | JeopardyAction

export interface GameInstanceBase<K extends GameKind, C, S> {
  id: string
  kind: K
  status: 'setup' | 'inProgress' | 'finished'
  config: C
  state: S
  initialPoints: Record<string, number> // each participant's points at game start (for abandon)
  appliedDeltas: PointDelta[] // log of deltas already committed to session scores
  result?: GameResult // = { awards: appliedDeltas } once finished
}

// ---- Board Game ----
export interface BoardGameConfig {
  name: string
  pointValue: number
}
export interface BoardGameState {
  winners: string[]
}
export type BoardGameAction = { type: 'award'; winnerIds: string[] }

// ---- Fighting Game ----
export interface FightingConfig {
  firstPlacePoints: number
  secondPlacePoints: number
  entrants: string[]
}
export interface FightingMatch {
  id: string
  playerA: string | null
  playerB: string | null
  winnerId: string | null
  bye: boolean
}
export interface FightingState {
  rounds: FightingMatch[][]
}
export type FightingAction = { type: 'advance'; matchId: string; winnerId: string }

// ---- Feud ----
export interface FeudConfig {
  teamAId: string
  teamBId: string
  questionIds: string[]
}
export interface FeudAnswer {
  text: string
  points: number
}
export interface FeudQuestion {
  id: string
  question: string
  answers: FeudAnswer[]
}
export interface FeudCategory {
  id: string
  name: string
  questions: FeudQuestion[]
}
export type FeudPhase = 'faceOff' | 'board' | 'steal' | 'done'
export interface FeudRoundState {
  phase: FeudPhase
  controllingTeamId: string | null
  revealed: number[]
  strikes: number
  roundTotal: number
}
export interface FeudState {
  teamAId: string
  teamBId: string
  questions: FeudQuestion[]
  questionIndex: number
  round: FeudRoundState
  finished: boolean
}
export type FeudAction =
  | { type: 'faceOffWinner'; teamId: string }
  | { type: 'reveal'; answerIndex: number }
  | { type: 'strike' }
  | { type: 'stealResult'; correct: boolean }

// ---- Jeopardy ----
export interface JeopardyConfig {
  participantIds: string[]
  categoryIds: string[]
}
export interface JeopardyClue {
  id: string
  value: number
  clue: string
  response: string
  dailyDouble?: boolean
}
export interface JeopardyCategory {
  id: string
  name: string
  clues: JeopardyClue[]
}
export interface JeopardyFinal {
  category: string
  clue: string
  response: string
}
export interface JeopardyBoard {
  categories: JeopardyCategory[]
  finalJeopardy: JeopardyFinal
}
export type JeopardyPhase = 'board' | 'finalJeopardy' | 'finished'
export interface JeopardyState {
  categories: JeopardyCategory[]
  finalJeopardy: JeopardyFinal
  scores: Record<string, number>
  revealedClues: string[]
  activeClueId: string | null
  phase: JeopardyPhase
}
export type JeopardyAction =
  | { type: 'revealClue'; clueId: string; responderId: string; correct: boolean }
  | { type: 'dailyDoubleWager'; clueId: string; responderId: string; wager: number; correct: boolean }
  | { type: 'finalWager'; responderId: string; wager: number; correct: boolean }
  | { type: 'finishFinal' }
