import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'

export default function BoardGameScreen() {
  const { id: sessionId } = useParams()
  const { state, beginGame, act, finishGame } = useStore()
  const session = state.sessions.find((s) => s.id === sessionId)

  const [name, setName] = useState('Board Game')
  const [pointValue, setPointValue] = useState('1')
  const [winners, setWinners] = useState<string[]>([])

  if (!session) return <p className="page">Session not found.</p>

  const rawGame = session.games.find((g) => g.kind === 'boardGame' && g.status !== 'finished')
  const game = rawGame?.kind === 'boardGame' ? rawGame : undefined

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
            act(game.id, { type: 'award', winnerIds: winners })
            finishGame(game.id)
          }}
        >
          Award
        </button>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>{game.config.name} — done</h1>
      <p>
        <Link to={`/session/${sessionId}`}>Back to session</Link>
      </p>
    </div>
  )
}
