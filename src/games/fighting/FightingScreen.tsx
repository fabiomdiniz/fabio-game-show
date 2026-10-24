import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import PointSummary from '../../components/PointSummary'
import { championOf } from './bracket'
import Bracket from './BracketTree'

export default function FightingScreen() {
  const { id: sessionId } = useParams()
  const navigate = useNavigate()
  const { state, beginGame, act, abandonGame } = useStore()
  const session = state.sessions.find((s) => s.id === sessionId)

  const [firstPlace, setFirstPlace] = useState('10')
  const [secondPlace, setSecondPlace] = useState('5')
  const [entrants, setEntrants] = useState<string[]>([])
  const [dismissFinished, setDismissFinished] = useState(false)

  const activeGame = session?.games.find((g) => g.kind === 'fighting' && g.status !== 'finished')

  useEffect(() => {
    if (activeGame) setDismissFinished(false)
  }, [activeGame?.id])

  if (!session) return <p className="page">Session not found.</p>

  const lastFinishedGame = [...session.games]
    .reverse()
    .find((g) => g.kind === 'fighting' && g.status === 'finished')
  const game =
    activeGame?.kind === 'fighting'
      ? activeGame
      : !dismissFinished && lastFinishedGame?.kind === 'fighting'
        ? lastFinishedGame
        : undefined

  const individuals = session.participants.filter((p) => p.kind === 'individual')
  const nameOf = (id: string | null) => session.participants.find((p) => p.id === id)?.name ?? 'TBD'

  if (!game) {
    const toggle = (pid: string) =>
      setEntrants((es) => (es.includes(pid) ? es.filter((x) => x !== pid) : [...es, pid]))
    return (
      <div className="page">
        <div className="page-head">
          <h1>Fighting Game</h1>
          <Link className="btn-link" to={`/session/${sessionId}`}>Back</Link>
        </div>
        <h2>Select fighters</h2>
        <p className="section-hint">Select fighters (individual players only):</p>
        <div className="btn-row">
          <button type="button" onClick={() => setEntrants(individuals.map((p) => p.id))}>
            Select all
          </button>
          <button type="button" onClick={() => setEntrants([])}>
            Clear
          </button>
        </div>
        <div className="check-list">
          {individuals.map((p) => (
            <label key={p.id} className="check-row">
              <input type="checkbox" checked={entrants.includes(p.id)} onChange={() => toggle(p.id)} />{' '}
              {p.name}
            </label>
          ))}
        </div>
        <div className="form-grid">
          <label className="field">
            <span>1st place</span>
            <input type="number" min={1} value={firstPlace} onChange={(e) => setFirstPlace(e.target.value)} />
          </label>
          <label className="field">
            <span>2nd place</span>
            <input type="number" min={1} value={secondPlace} onChange={(e) => setSecondPlace(e.target.value)} />
          </label>
        </div>
        <div className="btn-row">
          <button
            disabled={entrants.length < 2 || !(Number(firstPlace) > 0) || !(Number(secondPlace) > 0)}
            onClick={() =>
              beginGame(sessionId!, 'fighting', {
                firstPlacePoints: Number(firstPlace),
                secondPlacePoints: Number(secondPlace),
                entrants,
              })
            }
          >
            Start
          </button>
        </div>
      </div>
    )
  }

  if (game.status === 'inProgress') {
    const win = (matchId: string, winnerId: string) => {
      act(game.id, { type: 'advance', matchId, winnerId })
    }
    const undo = (matchId: string) => {
      act(game.id, { type: 'undo', matchId })
    }
    // Discard progress, then start fresh with the same fighters and a new shuffle.
    const restartSamePlayers = () => {
      abandonGame(game.id)
      beginGame(sessionId!, 'fighting', {
        firstPlacePoints: game.config.firstPlacePoints,
        secondPlacePoints: game.config.secondPlacePoints,
        entrants: game.config.entrants,
      })
    }
    // Abandon the running game and go back to fighter select.
    const startNewGame = () => {
      abandonGame(game.id)
      setDismissFinished(true)
    }
    return (
      <div className="page">
        <div className="page-head">
          <h1>Fighting Game</h1>
          <Link className="btn-link" to={`/session/${sessionId}`}>Back</Link>
        </div>
        <p className="muted-hint">Tap a fighter to advance them — or tap a winner again to undo it.</p>
        <Bracket rounds={game.state.rounds} nameOf={nameOf} onPick={win} onUndo={undo} />
        <div className="btn-row">
          <button onClick={restartSamePlayers}>Restart with same players</button>
          <button onClick={startNewGame}>Start a new game</button>
        </div>
      </div>
    )
  }

  const { champion, runnerUp } = championOf(game.state.rounds)
  // Same fighters, same points, fresh shuffled pairings (buildBracket uses Math.random).
  const restartSamePlayers = () => {
    beginGame(sessionId!, 'fighting', {
      firstPlacePoints: game.config.firstPlacePoints,
      secondPlacePoints: game.config.secondPlacePoints,
      entrants: game.config.entrants,
    })
  }
  const awards = game.result?.awards ?? []
  const awarded = (pid: string | null) =>
    awards.filter((a) => a.participantId === pid).reduce((n, a) => n + a.delta, 0)
  const displayName = (id: string | null) =>
    (id && session.participants.find((p) => p.id === id)?.name) || 'Unknown player'

  return (
    <div className="page">
      <h1>Fighting Game — final</h1>

      <h2>Final decision</h2>
      <p data-testid="champion">
        Winner: <strong>{displayName(champion)}</strong> (+{awarded(champion)} points)
      </p>
      <p data-testid="runner-up">
        Runner-up: <strong>{displayName(runnerUp)}</strong> (+{awarded(runnerUp)} points)
      </p>

      <h2>Points earned</h2>
      <PointSummary awards={awards} />

      <h2>Tournament bracket</h2>
      <Bracket rounds={game.state.rounds} nameOf={displayName} />

      <div className="btn-row">
        <button onClick={() => navigate(`/session/${sessionId}`)}>Back to main screen</button>
        <button onClick={restartSamePlayers}>Restart with same players</button>
        <button onClick={() => setDismissFinished(true)}>Start a new game</button>
      </div>
    </div>
  )
}
