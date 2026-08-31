import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { jeopardyBoard } from '../../content/jeopardy'
import PointSummary from '../../components/PointSummary'

export default function JeopardyScreen() {
  const { id: sessionId } = useParams()
  const navigate = useNavigate()
  const { state, beginGame, act, abandonGame } = useStore()
  const session = state.sessions.find((s) => s.id === sessionId)

  const [participantIds, setParticipantIds] = useState<string[]>([])
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [activeClueId, setActiveClueId] = useState<string | null>(null)
  const [responderId, setResponderId] = useState('')
  const [wager, setWager] = useState('0')
  const [dismissFinished, setDismissFinished] = useState(false)

  const activeGame = session?.games.find((g) => g.kind === 'jeopardy' && g.status !== 'finished')

  useEffect(() => {
    if (activeGame) setDismissFinished(false)
  }, [activeGame?.id])

  if (!session) return <p style={{ padding: 16 }}>Session not found.</p>

  const lastFinishedGame = [...session.games]
    .reverse()
    .find((g) => g.kind === 'jeopardy' && g.status === 'finished')
  const game =
    activeGame?.kind === 'jeopardy'
      ? activeGame
      : !dismissFinished && lastFinishedGame?.kind === 'jeopardy'
        ? lastFinishedGame
        : undefined

  const nameOf = (id: string) => session.participants.find((p) => p.id === id)?.name ?? id

  if (!game) {
    const toggleP = (pid: string) =>
      setParticipantIds((ids) => (ids.includes(pid) ? ids.filter((x) => x !== pid) : [...ids, pid]))
    const toggleC = (cid: string) =>
      setCategoryIds((ids) => (ids.includes(cid) ? ids.filter((x) => x !== cid) : [...ids, cid]))
    return (
      <div style={{ padding: 16 }}>
        <h1>What is… Panda?</h1>
        <p>Participants:</p>
        {session.participants.map((p) => (
          <label key={p.id} style={{ display: 'block' }}>
            <input type="checkbox" checked={participantIds.includes(p.id)} onChange={() => toggleP(p.id)} /> {p.name}
          </label>
        ))}
        <p>Categories:</p>
        {jeopardyBoard.categories.map((c) => (
          <label key={c.id} style={{ display: 'block' }}>
            <input type="checkbox" checked={categoryIds.includes(c.id)} onChange={() => toggleC(c.id)} /> {c.name}
          </label>
        ))}
        <button
          disabled={participantIds.length === 0 || categoryIds.length === 0}
          onClick={() => beginGame(sessionId!, 'jeopardy', { participantIds, categoryIds })}
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
    const activeClue = activeClueId ? game.state.categories.flatMap((c) => c.clues).find((c) => c.id === activeClueId) : undefined

    if (game.state.phase === 'board') {
      return (
        <div style={{ padding: 16 }}>
          <p>
            <button onClick={() => navigate(`/session/${sessionId}`)}>Back to main screen</button>{' '}
            <button onClick={() => abandonGame(game.id)}>Abandon game</button>
          </p>
          <h1>What is… Panda?</h1>
          {activeClue && (
            <div>
              <p>
                <strong>{activeClue.clue}</strong> (value {activeClue.value})
              </p>
              {activeClue.dailyDouble ? (
                <div>
                  <label>
                    Wager{' '}
                    <input type="number" min={0} value={wager} onChange={(e) => setWager(e.target.value)} />
                  </label>{' '}
                </div>
              ) : null}
              <select value={responderId} onChange={(e) => setResponderId(e.target.value)} aria-label="Responder">
                <option value="">…</option>
                {game.state.categories && session.participants
                  .filter((p) => participantIds.includes(p.id) || game.config.participantIds.includes(p.id))
                  .map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
              </select>{' '}
              <button
                disabled={!responderId}
                onClick={() => {
                  if (activeClue.dailyDouble) {
                    act(game.id, { type: 'dailyDoubleWager', clueId: activeClue.id, responderId, wager: Number(wager), correct: true })
                  } else {
                    act(game.id, { type: 'revealClue', clueId: activeClue.id, responderId, correct: true })
                  }
                  setActiveClueId(null)
                }}
              >
                Correct
              </button>{' '}
              <button
                disabled={!responderId}
                onClick={() => {
                  if (activeClue.dailyDouble) {
                    act(game.id, { type: 'dailyDoubleWager', clueId: activeClue.id, responderId, wager: Number(wager), correct: false })
                  } else {
                    act(game.id, { type: 'revealClue', clueId: activeClue.id, responderId, correct: false })
                  }
                  setActiveClueId(null)
                }}
              >
                Incorrect
              </button>
            </div>
          )}
          <table>
            <thead>
              <tr>
                <th>Score</th>
                {game.state.categories.map((c) => (
                  <th key={c.id}>{c.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {game.config.participantIds.map((pid) => (
                <tr key={pid}>
                  <td>
                    {nameOf(pid)}: {game.state.scores[pid] ?? 0}
                  </td>
                  {game.state.categories.map((c) => (
                    <td key={c.id}>
                      {c.clues.map((cl) => (
                        <button
                          key={cl.id}
                          disabled={game.state.revealedClues.includes(cl.id)}
                          onClick={() => {
                            setActiveClueId(cl.id)
                            setResponderId(pid)
                          }}
                        >
                          {game.state.revealedClues.includes(cl.id) ? '—' : cl.value}
                        </button>
                      ))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (game.state.phase === 'finalJeopardy') {
      const eligible = game.config.participantIds.filter((pid) => (game.state.scores[pid] ?? 0) > 0)
      return (
        <div style={{ padding: 16 }}>
          <p>
            <button onClick={() => navigate(`/session/${sessionId}`)}>Back to main screen</button>{' '}
            <button onClick={() => abandonGame(game.id)}>Abandon game</button>
          </p>
          <h1>Final Jeopardy</h1>
          <p>
            <strong>{game.state.finalJeopardy.category}:</strong> {game.state.finalJeopardy.clue}
          </p>
          {eligible.length === 0 && (
            <button onClick={() => act(game.id, { type: 'finishFinal' })}>Finish</button>
          )}
          {eligible.map((pid) => (
            <div key={pid}>
              <span>
                {nameOf(pid)} (score {game.state.scores[pid]})
              </span>{' '}
              <label>
                Wager{' '}
                <input type="number" min={0} value={wager} onChange={(e) => setWager(e.target.value)} />
              </label>{' '}
              <button onClick={() => act(game.id, { type: 'finalWager', responderId: pid, wager: Number(wager), correct: true })}>
                Correct
              </button>{' '}
              <button onClick={() => act(game.id, { type: 'finalWager', responderId: pid, wager: Number(wager), correct: false })}>
                Incorrect
              </button>
            </div>
          ))}
          <p>
            <button onClick={() => act(game.id, { type: 'finishFinal' })}>Finish game</button>
          </p>
        </div>
      )
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>What is… Panda? — done</h1>
      <h2>Points earned</h2>
      <PointSummary awards={game.result?.awards ?? []} />
      <p>
        <Link to={`/session/${sessionId}`}>Back to main screen</Link>{' '}
        <button onClick={() => setDismissFinished(true)}>Start a new game</button>
      </p>
    </div>
  )
}
