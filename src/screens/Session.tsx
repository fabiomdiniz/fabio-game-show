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

  if (!session) return <p style={{ padding: 16 }}>Session not found.</p>

  const inProgress = session.games.some((g) => g.status === 'inProgress')

  return (
    <div style={{ padding: 16 }}>
      <h1>{session.name}</h1>
      <Link to="/">← Sessions</Link> <Link to="/admin">Admin</Link>

      <h2>Scoreboard</h2>
      <Scoreboard participants={session.participants} />

      <h2>Add participant</h2>
      <ParticipantForm
        onAddPlayer={(name) =>
          dispatch({ type: 'addParticipant', sessionId: session.id, name, kind: 'individual' })
        }
      />

      <h2>Play a game</h2>
      {inProgress && <p>A game is already in progress.</p>}
      <ul>
        {CATALOG.map((g) => (
          <li key={g.kind}>
            <Link to={`/session/${session.id}/game/${g.kind}`} aria-disabled={inProgress}>
              {g.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
