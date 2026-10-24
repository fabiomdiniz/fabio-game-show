import type { AppState, GameInstance, ParticipantKind, Session } from '../types'
import { CURRENT_VERSION } from '../types'
import { emptyState } from './state'
import { referencedParticipantIds } from './reducer'
import { findFeudQuestion } from '../content/feud'
import { findJeopardyCategory } from '../content/jeopardy'

export const STORAGE_KEY = 'game-show:state'

export function serialize(state: AppState): string {
  return JSON.stringify(state)
}

export function parse(json: string): AppState | null {
  try {
    const value: unknown = JSON.parse(json)
    return validateState(value) === null ? (value as AppState) : null
  } catch {
    return null
  }
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

function validateGame(
  g: GameInstance,
  kinds: Map<string, ParticipantKind>,
  resolveIds: boolean,
): string | null {
  switch (g.kind) {
    case 'boardGame': {
      const c = g.config
      if (typeof c.pointValue !== 'number' || !Number.isInteger(c.pointValue) || c.pointValue <= 0) {
        return 'boardGame pointValue must be a positive integer'
      }
      if (resolveIds) {
        for (const w of g.state.winners) {
          if (!kinds.has(w)) return `boardGame winner id missing: ${w}`
        }
      }
      return null
    }
    case 'fighting': {
      const c = g.config
      if (typeof c.firstPlacePoints !== 'number' || !Number.isInteger(c.firstPlacePoints) || c.firstPlacePoints <= 0) {
        return 'fighting firstPlacePoints must be a positive integer'
      }
      if (typeof c.secondPlacePoints !== 'number' || !Number.isInteger(c.secondPlacePoints) || c.secondPlacePoints <= 0) {
        return 'fighting secondPlacePoints must be a positive integer'
      }
      if (c.secondPlacePoints > c.firstPlacePoints) {
        return 'fighting secondPlacePoints must be <= firstPlacePoints'
      }
      if (resolveIds) {
        for (const e of c.entrants) {
          if (kinds.get(e) !== 'individual') return `fighting entrant must be an existing individual: ${e}`
        }
      }
      return null
    }
    case 'feud': {
      const c = g.config
      const validTeam = (t: unknown): t is { name: string; playerIds: string[] } =>
        isObj(t) &&
        typeof t.name === 'string' &&
        t.name.trim() !== '' &&
        Array.isArray(t.playerIds) &&
        t.playerIds.length > 0 &&
        t.playerIds.every((id) => typeof id === 'string')
      if (!validTeam(c.teamA) || !validTeam(c.teamB)) return 'feud requires two teams with names and players'
      if (c.teamA.playerIds.some((id) => c.teamB.playerIds.includes(id))) return 'feud teams must be distinct'
      if (!Array.isArray(c.questionIds) || c.questionIds.length === 0) return 'feud questionIds must be non-empty'
      for (const q of c.questionIds) {
        if (!findFeudQuestion(q)) return `feud question id not found: ${q}`
      }
      if (resolveIds) {
        for (const pid of [...c.teamA.playerIds, ...c.teamB.playerIds]) {
          if (kinds.get(pid) !== 'individual') return `feud player must be an existing individual: ${pid}`
        }
      }
      return null
    }
    case 'jeopardy': {
      const c = g.config
      if (!Array.isArray(c.participantIds) || c.participantIds.length === 0) return 'jeopardy participantIds must be non-empty'
      if (new Set(c.participantIds).size !== c.participantIds.length) return 'jeopardy participantIds must be distinct'
      if (!Array.isArray(c.categoryIds) || c.categoryIds.length === 0) return 'jeopardy categoryIds must be non-empty'
      for (const cid of c.categoryIds) {
        if (!findJeopardyCategory(cid)) return `jeopardy category id not found: ${cid}`
      }
      if (resolveIds) {
        for (const pid of c.participantIds) {
          if (!kinds.has(pid)) return `jeopardy participant id missing: ${pid}`
        }
      }
      return null
    }
    default:
      return 'unknown game kind'
  }
}

export function validateSession(value: unknown): string | null {
  if (!isObj(value)) return 'session must be an object'
  if (typeof value.id !== 'string' || value.id.trim() === '') return 'session id must be non-empty'
  if (typeof value.name !== 'string' || value.name.trim() === '') return 'session name must be non-empty'
  if (!Array.isArray(value.participants)) return 'participants must be an array'

  const kinds = new Map<string, ParticipantKind>()
  for (const p of value.participants as unknown[]) {
    if (!isObj(p)) return 'participant must be an object'
    if (typeof p.id !== 'string' || p.id.trim() === '') return 'participant id must be non-empty'
    if (kinds.has(p.id)) return `duplicate participant id: ${p.id}`
    if (typeof p.name !== 'string' || p.name.trim() === '') return 'participant name must be non-empty'
    if (p.kind !== 'individual' && p.kind !== 'team') return 'invalid participant kind'
    if (typeof p.points !== 'number' || !Number.isFinite(p.points)) return 'participant points must be a finite number'
    kinds.set(p.id, p.kind as ParticipantKind)
  }

  if (!Array.isArray(value.games)) return 'games must be an array'
  const gameIds = new Set<string>()
  for (const g of value.games as unknown[]) {
    if (!isObj(g)) return 'game must be an object'
    if (typeof g.id !== 'string' || g.id.trim() === '') return 'game id must be non-empty'
    if (gameIds.has(g.id)) return `duplicate game id: ${g.id}`
    gameIds.add(g.id)
    if (g.status !== 'setup' && g.status !== 'inProgress' && g.status !== 'finished') return 'invalid game status'
    if (!Array.isArray(g.appliedDeltas)) return 'game appliedDeltas must be an array'

    const resolveIds = g.status !== 'finished'
    const game = g as unknown as GameInstance
    const err = validateGame(game, kinds, resolveIds)
    if (err) return err

    if (resolveIds) {
      for (const pid of referencedParticipantIds(game)) {
        if (!kinds.has(pid)) return `game references missing participant: ${pid}`
      }
      for (const d of game.appliedDeltas) {
        if (!kinds.has(d.participantId)) return `game delta references missing participant: ${d.participantId}`
      }
    }
  }

  return null
}

export function validateState(value: unknown): string | null {
  try {
    if (!isObj(value)) return 'state is not an object'
    if (value.version !== CURRENT_VERSION) return `unsupported version: expected ${CURRENT_VERSION}`
    if (!Array.isArray(value.sessions)) return 'sessions must be an array'

    const sessionIds = new Set<string>()
    for (const s of value.sessions as unknown[]) {
      const err = validateSession(s)
      if (err) return err
      const sid = (s as { id: string }).id
      if (sessionIds.has(sid)) return `duplicate session id: ${sid}`
      sessionIds.add(sid)
    }

    const active = value.activeSessionId
    if (active !== null && (typeof active !== 'string' || !sessionIds.has(active))) {
      return 'activeSessionId must be null or an existing session'
    }
    return null
  } catch {
    return 'state is malformed'
  }
}

export interface LoadResult {
  state: AppState
  preservedRaw?: string
}

export function loadState(): LoadResult {
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return { state: emptyState() }
  }
  if (raw === null) return { state: emptyState() }
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return { state: emptyState(), preservedRaw: raw }
  }
  if (validateState(value) === null) return { state: value as AppState }
  return { state: emptyState(), preservedRaw: raw }
}

export function saveState(state: AppState): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, serialize(state))
    return true
  } catch {
    return false
  }
}

export function exportState(state: AppState): void {
  const json = serialize(state)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `game-show-state-${date}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

export async function importFile(file: File): Promise<{ state: AppState | null; error: string | null }> {
  try {
    const text = await readFileText(file)
    const value: unknown = JSON.parse(text)
    const err = validateState(value)
    if (err) return { state: null, error: err }
    return { state: value as AppState, error: null }
  } catch {
    return { state: null, error: 'Could not read file' }
  }
}

export async function importSessionFile(file: File): Promise<{ session: Session | null; error: string | null }> {
  try {
    const text = await readFileText(file)
    const value: unknown = JSON.parse(text)
    const err = validateSession(value)
    if (err) return { session: null, error: err }
    return { session: value as Session, error: null }
  } catch {
    return { session: null, error: 'Could not read file' }
  }
}
