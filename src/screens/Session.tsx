import { useParams, Link } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import Scoreboard from '../components/Scoreboard'
import ParticipantForm from '../components/ParticipantForm'
import type { GameKind } from '../types'

const CATALOG: { kind: GameKind; title: string; blurb: string }[] = [
  { kind: 'boardGame', title: 'Board Game', blurb: 'Pick your winners and hand out points.' },
  { kind: 'fighting', title: 'Fighting Game', blurb: 'A knockout bracket — last one standing.' },
  { kind: 'feud', title: 'Fábio-ly Feud', blurb: 'Two teams face off over survey answers.' },
  { kind: 'jeopardy', title: 'What is… Panda?', blurb: 'A trivia board of clues and wagers.' },
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
      <div className="page-head">
        <h1>{session.name}</h1>
        <div className="btn-row">
          <Link className="btn-link" to="/">← Sessions</Link>
          <Link className="btn-link" to={`/session/${session.id}/admin`}>Admin</Link>
        </div>
      </div>

      <Scoreboard participants={session.participants} />

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
      <div className="menu-grid">
        {CATALOG.map((g) => (
          <Link
            key={g.kind}
            className={`menu-card${inProgress ? ' disabled' : ''}`}
            to={`/session/${session.id}/game/${g.kind}`}
            aria-disabled={inProgress}
          >
            <span className="menu-card-title">{g.title}</span>
            <span className="menu-card-blurb">{g.blurb}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
