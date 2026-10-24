import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { feudCategories } from '../../content/feud'
import PointSummary from '../../components/PointSummary'

export default function FeudScreen() {
  const { id: sessionId } = useParams()
  const navigate = useNavigate()
  const { state, beginGame, act } = useStore()
  const session = state.sessions.find((s) => s.id === sessionId)

  const [teamAPlayers, setTeamAPlayers] = useState<string[]>([])
  const [teamBPlayers, setTeamBPlayers] = useState<string[]>([])
  const [teamAName, setTeamAName] = useState('Team A')
  const [teamBName, setTeamBName] = useState('Team B')
  const [questionIds, setQuestionIds] = useState<string[]>([])
  const [dismissFinished, setDismissFinished] = useState(false)

  const activeGame = session?.games.find((g) => g.kind === 'feud' && g.status !== 'finished')

  useEffect(() => {
    if (activeGame) setDismissFinished(false)
  }, [activeGame?.id])

  if (!session) return <p className="page">Session not found.</p>

  const lastFinishedGame = [...session.games]
    .reverse()
    .find((g) => g.kind === 'feud' && g.status === 'finished')
  const game =
    activeGame?.kind === 'feud'
      ? activeGame
      : !dismissFinished && lastFinishedGame?.kind === 'feud'
        ? lastFinishedGame
        : undefined

  if (!game) {
    const individuals = session.participants.filter((p) => p.kind === 'individual')
    const toggleQ = (qid: string) =>
      setQuestionIds((ids) => (ids.includes(qid) ? ids.filter((x) => x !== qid) : [...ids, qid]))
    const toggleA = (pid: string) => {
      setTeamAPlayers((ids) => (ids.includes(pid) ? ids.filter((x) => x !== pid) : [...ids, pid]))
      setTeamBPlayers((ids) => ids.filter((x) => x !== pid))
    }
    const toggleB = (pid: string) => {
      setTeamBPlayers((ids) => (ids.includes(pid) ? ids.filter((x) => x !== pid) : [...ids, pid]))
      setTeamAPlayers((ids) => ids.filter((x) => x !== pid))
    }
    const canStart =
      teamAPlayers.length > 0 &&
      teamBPlayers.length > 0 &&
      teamAName.trim() !== '' &&
      teamBName.trim() !== '' &&
      questionIds.length > 0

    return (
      <div className="page">
        <h1>Fábio-ly Feud</h1>
        <div style={{ display: 'flex', gap: 16 }}>
          <label>
            Team A name{' '}
            <input value={teamAName} onChange={(e) => setTeamAName(e.target.value)} aria-label="Team A name" />
          </label>
          <label>
            Team B name{' '}
            <input value={teamBName} onChange={(e) => setTeamBName(e.target.value)} aria-label="Team B name" />
          </label>
        </div>
        <p>Assign players to teams:</p>
        <div style={{ display: 'flex', gap: 24 }}>
          <fieldset>
            <legend>Team A players</legend>
            {individuals.map((p) => (
              <label key={p.id} style={{ display: 'block' }}>
                <input
                  type="checkbox"
                  checked={teamAPlayers.includes(p.id)}
                  onChange={() => toggleA(p.id)}
                  aria-label={`assign-${p.name}-A`}
                />{' '}
                {p.name}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Team B players</legend>
            {individuals.map((p) => (
              <label key={p.id} style={{ display: 'block' }}>
                <input
                  type="checkbox"
                  checked={teamBPlayers.includes(p.id)}
                  onChange={() => toggleB(p.id)}
                  aria-label={`assign-${p.name}-B`}
                />{' '}
                {p.name}
              </label>
            ))}
          </fieldset>
        </div>
        <p>Select questions:</p>
        {feudCategories.map((cat) => (
          <div key={cat.id}>
            <strong>{cat.name}</strong>
            {cat.questions.map((q) => (
              <label key={q.id} style={{ display: 'block' }}>
                <input
                  type="checkbox"
                  checked={questionIds.includes(q.id)}
                  onChange={() => toggleQ(q.id)}
                />{' '}
                {q.question}
              </label>
            ))}
          </div>
        ))}
        <button
          disabled={!canStart}
          onClick={() =>
            beginGame(sessionId!, 'feud', {
              teamA: { name: teamAName.trim(), playerIds: teamAPlayers },
              teamB: { name: teamBName.trim(), playerIds: teamBPlayers },
              questionIds,
            })
          }
        >
          Start
        </button>
        <p>
          <Link className="btn-link" to={`/session/${sessionId}`}>Back</Link>
        </p>
      </div>
    )
  }

  if (game.status === 'inProgress') {
    const q = game.state.questions[game.state.questionIndex]
    const round = game.state.round
    const controllingTeam =
      round.controllingTeam === 'A'
        ? game.state.teamA
        : round.controllingTeam === 'B'
          ? game.state.teamB
          : null
    const otherTeam =
      round.controllingTeam === 'A'
        ? game.state.teamB
        : round.controllingTeam === 'B'
          ? game.state.teamA
          : null

    return (
      <div className="page">
        <h1>Fábio-ly Feud</h1>
        <p>
          Question {game.state.questionIndex + 1} of {game.state.questions.length}: {q.question}
        </p>

        {round.phase === 'faceOff' && (
          <div>
            <p>Who won the face-off?</p>
            <button onClick={() => act(game.id, { type: 'faceOffWinner', team: 'A' })}>
              {game.state.teamA.name}
            </button>{' '}
            <button onClick={() => act(game.id, { type: 'faceOffWinner', team: 'B' })}>
              {game.state.teamB.name}
            </button>
          </div>
        )}

        {(round.phase === 'board' || round.phase === 'steal') && (
          <div>
            <p>
              Round total: {round.roundTotal} — controlling: {controllingTeam!.name} —
              strikes: {round.strikes}/3
            </p>
            <ul>
              {q.answers.map((a, i) => (
                <li key={i}>
                  {round.revealed.includes(i) ? `${a.text} — ${a.points}` : '???'}{' '}
                  {round.phase === 'board' && !round.revealed.includes(i) && (
                    <button onClick={() => act(game.id, { type: 'reveal', answerIndex: i })}>Reveal</button>
                  )}
                </li>
              ))}
            </ul>
            {round.phase === 'board' && (
              <button onClick={() => act(game.id, { type: 'strike' })}>Strike</button>
            )}
            {round.phase === 'steal' && (
              <div>
                <p>Steal by {otherTeam!.name}:</p>
                <button onClick={() => act(game.id, { type: 'stealResult', correct: true })}>Correct</button>{' '}
                <button onClick={() => act(game.id, { type: 'stealResult', correct: false })}>Incorrect</button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Fábio-ly Feud — done</h1>
      <h2>Points earned</h2>
      <PointSummary awards={game.result?.awards ?? []} />
      <p>
        <button onClick={() => navigate(`/session/${sessionId}`)}>Back to main screen</button>{' '}
        <button onClick={() => setDismissFinished(true)}>Start a new game</button>
      </p>
    </div>
  )
}
