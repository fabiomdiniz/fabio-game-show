import { useParams, Link } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import Scoreboard from '../components/Scoreboard'
import ParticipantForm from '../components/ParticipantForm'
import type { GameKind } from '../types'

const CATALOG: { kind: GameKind; title: string }[] = [
  { kind: 'boardGame', title: 'Board Game' },
  { kind: 'fighting', title: 'Fighting Game' },
  { kind: 'feud', title: 'Fábio-ly Feud' },
  { kind: 'jeopardy', title: 'What is… Panda?' },
]

export default function Session() {
  const { id } = useParams()
  const { state, dispatch } = useStore()
  const session = state.sessions.find((s) => s.id === id)

  if (!session) return <p className="page">Session not found.</p>

  const inProgress = session.games.some((g) => g.status === 'inProgress')
  const activeGame = session.games.find((g) => g.status === 'inProgress')

  return (
    <div className="page">
      <h1>{session.name}</h1>
      <Link className="btn-link" to="/">← Sessions</Link>{' '}
      <Link className="btn-link" to={`/session/${session.id}/admin`}>Admin</Link>

      <Scoreboard participants={session.participants} title={session.name} />

      <h2>Add participant</h2>
      <ParticipantForm
        onAddPlayer={(name) =>
          dispatch({ type: 'addParticipant', sessionId: session.id, name, kind: 'individual' })
        }
      />

      <h2 className="menu-title">Main Menu</h2>
      {activeGame && (
        <p>
          A game is already in progress.{' '}
          <Link to={`/session/${session.id}/game/${activeGame.kind}`}>Resume game</Link>
        </p>
      )}
      <div className="menu-body">
        <div className="menu-preview" aria-hidden="true"></div>
        <ol className="menu-list">
          {CATALOG.map((g) => (
            <li key={g.kind} className={`menu-item${inProgress ? ' disabled' : ''}`}>
              <Link to={`/session/${session.id}/game/${g.kind}`} aria-disabled={inProgress}>
                {g.title}
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
