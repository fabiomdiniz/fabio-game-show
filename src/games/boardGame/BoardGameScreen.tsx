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
  const [pointValue, setPointValue] = useState('1')
  const [winners, setWinners] = useState<string[]>([])
  const [dismissFinished, setDismissFinished] = useState(false)

  const activeGame = session?.games.find((g) => g.kind === 'boardGame' && g.status !== 'finished')

  useEffect(() => {
    if (activeGame) setDismissFinished(false)
  }, [activeGame?.id])

  if (!session) return <p className="page">Session not found.</p>

  // Keep showing the finished game's summary until the user asks for a new one.
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
        <h1>Board Game</h1>
        <label>
          Name{' '}
          <input value={name} onChange={(e) => setName(e.target.value)} aria-label="Game name" />
        </label>{' '}
        <label>
          Points per winner{' '}
          <input
            type="number"
            min={1}
            value={pointValue}
            onChange={(e) => setPointValue(e.target.value)}
            aria-label="Points"
          />
        </label>{' '}
        <button
          disabled={!name.trim() || !(Number(pointValue) > 0)}
          onClick={() =>
            beginGame(sessionId!, 'boardGame', { name: name.trim(), pointValue: Number(pointValue) })
          }
        >
          Start
        </button>
        <p>
          <Link to={`/session/${sessionId}`}>Back</Link>
        </p>
      </div>
    )
  }

  if (game.status === 'inProgress') {
    const toggle = (pid: string) =>
      setWinners((ws) => (ws.includes(pid) ? ws.filter((x) => x !== pid) : [...ws, pid]))
    return (
      <div className="page">
        <p>
          <button
            onClick={() => {
              abandonGame(game.id)
              navigate(`/session/${sessionId}`)
            }}
          >
            Abandon game
          </button>
        </p>
        <h1>{game.config.name} is being played…</h1>
        <h2>Select winners</h2>
        {session.participants.map((p) => (
          <label key={p.id} style={{ display: 'block' }}>
            <input
              type="checkbox"
              checked={winners.includes(p.id)}
              onChange={() => toggle(p.id)}
            />{' '}
            {p.name}
          </label>
        ))}
        <button
          disabled={winners.length === 0}
          onClick={() => {
            // `act` finishes the game itself once the definition reports winners.
            act(game.id, { type: 'award', winnerIds: winners })
          }}
        >
          Award
        </button>
      </div>
    )
  }

  const winnersIds = game.state.winners
  const awards = game.result?.awards ?? []
  // Participants can be deleted after a game finishes, so don't call them TBD here.
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

      <p>
        <Link to={`/session/${sessionId}`}>Back to main screen</Link>{' '}
        <button onClick={() => setDismissFinished(true)}>Start a new game</button>
      </p>
    </div>
  )
}
