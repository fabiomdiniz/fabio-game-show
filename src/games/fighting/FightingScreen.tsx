import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import PointSummary from '../../components/PointSummary'
import { championOf } from './bracket'
import Bracket from './BracketTree'

export default function FightingScreen() {
  const { id: sessionId } = useParams()
  const { state, beginGame, act } = useStore()
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

  // Keep showing the finished game's summary until the user asks for a new one.
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
  // Slots not yet decided (later rounds, or a bye's empty side) read as TBD.
  const nameOf = (id: string | null) => session.participants.find((p) => p.id === id)?.name ?? 'TBD'

  if (!game) {
    const toggle = (pid: string) =>
      setEntrants((es) => (es.includes(pid) ? es.filter((x) => x !== pid) : [...es, pid]))
    return (
      <div className="page">
        <h1>Fighting Game</h1>
        <p>Select fighters (individual players only):</p>
        <p>
          <button type="button" onClick={() => setEntrants(individuals.map((p) => p.id))}>
            Select all
          </button>{' '}
          <button type="button" onClick={() => setEntrants([])}>
            Clear
          </button>
        </p>
        {individuals.map((p) => (
          <label key={p.id} style={{ display: 'block' }}>
            <input type="checkbox" checked={entrants.includes(p.id)} onChange={() => toggle(p.id)} />{' '}
            {p.name}
          </label>
        ))}
        <label>
          1st place{' '}
          <input type="number" min={1} value={firstPlace} onChange={(e) => setFirstPlace(e.target.value)} />
        </label>{' '}
        <label>
          2nd place{' '}
          <input type="number" min={1} value={secondPlace} onChange={(e) => setSecondPlace(e.target.value)} />
        </label>{' '}
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
        <p>
          <Link to={`/session/${sessionId}`}>Back</Link>
        </p>
      </div>
    )
  }

  if (game.status === 'inProgress') {
    // `act` marks the game finished itself once the definition reports a champion.
    const win = (matchId: string, winnerId: string) => {
      act(game.id, { type: 'advance', matchId, winnerId })
    }
    const undo = (matchId: string) => {
      act(game.id, { type: 'undo', matchId })
    }
    return (
      <div className="page">
        <h1>Fighting Game</h1>
        <p className="muted-hint">Tap a fighter to advance them — or tap a winner again to undo it.</p>
        <Bracket rounds={game.state.rounds} nameOf={nameOf} onPick={win} onUndo={undo} />
        <p>
          <Link to={`/session/${sessionId}`}>Back</Link>
        </p>
      </div>
    )
  }

  const { champion, runnerUp } = championOf(game.state.rounds)
  const awards = game.result?.awards ?? []
  const awarded = (pid: string | null) =>
    awards.filter((a) => a.participantId === pid).reduce((n, a) => n + a.delta, 0)
  // Participants can be deleted after a game finishes, so don't call them TBD here.
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

      <p>
        <Link to={`/session/${sessionId}`}>Back to main screen</Link>{' '}
        <button onClick={() => setDismissFinished(true)}>Start a new game</button>
      </p>
    </div>
  )
}
