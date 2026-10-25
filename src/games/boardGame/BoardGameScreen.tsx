import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import PointSummary from '../../components/PointSummary'

export default function BoardGameScreen() {
  const { id: sessionId } = useParams()
  const navigate = useNavigate()
  const { state, beginGame, act, abandonGame } = useStore()
  const session = state.sessions.find((s) => s.id === sessionId)

  const [name, setName] = useState('Board Game')
  const [pointValue, setPointValue] = useState('12')
  const [winners, setWinners] = useState<string[]>([])
  const [dismissFinished, setDismissFinished] = useState(false)

  const activeGame = session?.games.find((g) => g.kind === 'boardGame' && g.status !== 'finished')

  useEffect(() => {
    if (activeGame) setDismissFinished(false)
  }, [activeGame?.id])

  if (!session) return <p className="page">Session not found.</p>

  const lastFinishedGame = [...session.games]
    .reverse()
    .find((g) => g.kind === 'boardGame' && g.status === 'finished')
  const game =
    activeGame?.kind === 'boardGame'
      ? activeGame
      : !dismissFinished && lastFinishedGame?.kind === 'boardGame'
        ? lastFinishedGame
        : undefined

  if (!game) {
    return (
      <div className="page">
        <div className="page-head">
          <h1>Board Game</h1>
          <Link className="btn-link" to={`/session/${sessionId}`}>Back</Link>
        </div>
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault()
            if (!name.trim() || !(Number(pointValue) > 0)) return
            beginGame(sessionId!, 'boardGame', { name: name.trim(), pointValue: Number(pointValue) })
          }}
        >
          <div className="form-grid">
            <label className="field">
              <span>Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} aria-label="Game name" />
            </label>
            <label className="field">
              <span>Points per winner</span>
              <input
                type="number"
                min={1}
                value={pointValue}
                onChange={(e) => setPointValue(e.target.value)}
                aria-label="Points"
              />
            </label>
          </div>
          <div className="btn-row">
            <button type="submit" disabled={!name.trim() || !(Number(pointValue) > 0)}>
              Start
            </button>
          </div>
        </form>
      </div>
    )
  }

  if (game.status === 'inProgress') {
    const toggle = (pid: string) =>
      setWinners((ws) => (ws.includes(pid) ? ws.filter((x) => x !== pid) : [...ws, pid]))
    return (
      <div className="page">
        <div className="page-head">
          <h1>{game.config.name} is being played…</h1>
          <button
            onClick={() => {
              abandonGame(game.id)
              navigate(`/session/${sessionId}`)
            }}
          >
            Abandon game
          </button>
        </div>
        <h2>Select winners</h2>
        <div className="check-list">
          {session.participants.map((p) => (
            <label key={p.id} className="check-row">
              <input
                type="checkbox"
                checked={winners.includes(p.id)}
                onChange={() => toggle(p.id)}
              />{' '}
              {p.name}
            </label>
          ))}
        </div>
        <div className="btn-row">
          <button
            disabled={winners.length === 0}
            onClick={() => {
              act(game.id, { type: 'award', winnerIds: winners })
            }}
          >
            Award
          </button>
        </div>
      </div>
    )
  }

  const winnersIds = game.state.winners
  const awards = game.result?.awards ?? []
  const displayName = (id: string) =>
    session.participants.find((p) => p.id === id)?.name || 'Unknown player'
  const awarded = (pid: string) =>
    awards.filter((a) => a.participantId === pid).reduce((n, a) => n + a.delta, 0)

  return (
    <div className="page">
      <h1>{game.config.name} — final</h1>

      <h2>Final decision</h2>
      {winnersIds.length === 0 ? (
        <p>No winners were recorded.</p>
      ) : (
        <ul>
          {winnersIds.map((pid) => (
            <li key={pid} data-testid="board-game-winner">
              <strong>{displayName(pid)}</strong> (+{awarded(pid)} points)
            </li>
          ))}
        </ul>
      )}

      <h2>Points earned</h2>
      <PointSummary awards={awards} />

      <div className="btn-row">
        <button onClick={() => navigate(`/session/${sessionId}`)}>Back to main screen</button>
        <button onClick={() => setDismissFinished(true)}>Start a new game</button>
      </div>
    </div>
  )
}
