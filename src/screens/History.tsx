import { useParams, Link } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { getGameDefinition } from '../store/gameRegistry'
import PointSummary from '../components/PointSummary'
import type { GameInstance } from '../types'

function titleOf(game: GameInstance): string {
  if (game.kind === 'boardGame') {
    const name = game.config.name.trim()
    if (name && name.toLowerCase() !== 'board game') return name
  }
  return getGameDefinition(game.kind)?.title ?? game.kind
}

const STATUS_LABEL: Record<GameInstance['status'], string> = {
  setup: 'Not started',
  inProgress: 'In progress',
  finished: 'Finished',
}

const STATUS_SUFFIX: Record<GameInstance['status'], string> = {
  setup: 'setup',
  inProgress: 'in-progress',
  finished: 'finished',
}

export default function History() {
  const { id } = useParams()
  const { state } = useStore()
  const session = state.sessions.find((s) => s.id === id)

  if (!session) return <p className="page">Session not found.</p>

  return (
    <div className="page">
      <div className="page-head">
        <h1>History — {session.name}</h1>
        <Link className="btn-link" to={`/session/${session.id}`}>← Session</Link>
      </div>

      {session.games.length === 0 ? (
        <p className="muted-hint">No games have been played in this session yet.</p>
      ) : (
        <ol className="history-list">
          {session.games.map((game, i) => (
            <li key={game.id} className="history-entry">
              <div className="history-head">
                <span className="history-index">#{i + 1}</span>
                <h2 className="history-title">{titleOf(game)}</h2>
                <span className={`history-status history-status--${STATUS_SUFFIX[game.status]}`}>
                  {STATUS_LABEL[game.status]}
                </span>
              </div>
              {game.status === 'finished' ? (
                <PointSummary awards={game.result?.awards ?? []} />
              ) : (
                <p className="muted-hint">
                  {game.status === 'inProgress'
                    ? 'This game is still being played.'
                    : 'This game has not been started yet.'}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
