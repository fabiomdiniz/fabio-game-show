import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { feudCategories } from '../../content/feud'

export default function FeudScreen() {
  const { id: sessionId } = useParams()
  const { state, beginGame, act } = useStore()
  const session = state.sessions.find((s) => s.id === sessionId)

  const [teamAId, setTeamAId] = useState('')
  const [teamBId, setTeamBId] = useState('')
  const [questionIds, setQuestionIds] = useState<string[]>([])

  if (!session) return <p style={{ padding: 16 }}>Session not found.</p>

  const rawGame = session.games.find((g) => g.kind === 'feud' && g.status !== 'finished')
  const game = rawGame?.kind === 'feud' ? rawGame : undefined

  const teams = session.participants.filter((p) => p.kind === 'team')
  const nameOf = (id: string) => session.participants.find((p) => p.id === id)?.name ?? id

  if (!game) {
    const toggleQ = (qid: string) =>
      setQuestionIds((ids) => (ids.includes(qid) ? ids.filter((x) => x !== qid) : [...ids, qid]))
    return (
      <div style={{ padding: 16 }}>
        <h1>Fábio-ly Feud</h1>
        <label>
          Team A{' '}
          <select value={teamAId} onChange={(e) => setTeamAId(e.target.value)}>
            <option value="">…</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>{' '}
        <label>
          Team B{' '}
          <select value={teamBId} onChange={(e) => setTeamBId(e.target.value)}>
            <option value="">…</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
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
          disabled={!teamAId || !teamBId || teamAId === teamBId || questionIds.length === 0}
          onClick={() => beginGame(sessionId!, 'feud', { teamAId, teamBId, questionIds })}
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
    const q = game.state.questions[game.state.questionIndex]
    const round = game.state.round
    const otherTeamId =
      round.controllingTeamId === game.state.teamAId ? game.state.teamBId : game.state.teamAId

    return (
      <div style={{ padding: 16 }}>
        <h1>Fábio-ly Feud</h1>
        <p>
          Question {game.state.questionIndex + 1} of {game.state.questions.length}: {q.question}
        </p>

        {round.phase === 'faceOff' && (
          <div>
            <p>Who won the face-off?</p>
            <button onClick={() => act(game.id, { type: 'faceOffWinner', teamId: game.state.teamAId })}>
              {nameOf(game.state.teamAId)}
            </button>{' '}
            <button onClick={() => act(game.id, { type: 'faceOffWinner', teamId: game.state.teamBId })}>
              {nameOf(game.state.teamBId)}
            </button>
          </div>
        )}

        {(round.phase === 'board' || round.phase === 'steal') && (
          <div>
            <p>
              Round total: {round.roundTotal} — controlling: {nameOf(round.controllingTeamId!)} —
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
                <p>Steal by {nameOf(otherTeamId)}:</p>
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
    <div style={{ padding: 16 }}>
      <h1>Fábio-ly Feud — done</h1>
      <p>
        <Link to={`/session/${sessionId}`}>Back to session</Link>
      </p>
    </div>
  )
}
