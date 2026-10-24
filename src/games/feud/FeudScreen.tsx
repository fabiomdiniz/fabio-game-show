import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'
import { feudQuestions } from '../../content/feud'
import { matchAnswerIndex } from './definition'
import PointSummary from '../../components/PointSummary'
import wrongAnswerSound from './assets/wrong-answer-sound-effect.mp3'

function playStrikeSound() {
  try {
    const audio = new Audio(wrongAnswerSound)
    void audio.play().catch(() => {})
  } catch {
    // audio unavailable (e.g. test environment) — ignore
  }
}

export default function FeudScreen() {
  const { id: sessionId } = useParams()
  const navigate = useNavigate()
  const { state, beginGame, act, abandonGame } = useStore()
  const session = state.sessions.find((s) => s.id === sessionId)

  const [teamAPlayers, setTeamAPlayers] = useState<string[]>([])
  const [teamBPlayers, setTeamBPlayers] = useState<string[]>([])
  const [teamAName, setTeamAName] = useState('Team A')
  const [teamBName, setTeamBName] = useState('Team B')
  const [questionIds, setQuestionIds] = useState<string[]>([])
  const [dismissFinished, setDismissFinished] = useState(false)
  const [guess, setGuess] = useState('')
  const [wrongGuess, setWrongGuess] = useState(false)

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
    const selectAllQuestions = () => {
      setQuestionIds(feudQuestions.map((q) => q.id))
    }
    const shuffle = (ids: string[]) => {
      const a = [...ids]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const tmp = a[i]
        a[i] = a[j]
        a[j] = tmp
      }
      return a
    }
    const randomlyBalanceTeams = () => {
      const shuffled = shuffle(individuals.map((p) => p.id))
      const mid = Math.ceil(shuffled.length / 2)
      setTeamAPlayers(shuffled.slice(0, mid))
      setTeamBPlayers(shuffled.slice(mid))
    }
    const canStart =
      teamAPlayers.length > 0 &&
      teamBPlayers.length > 0 &&
      teamAName.trim() !== '' &&
      teamBName.trim() !== '' &&
      questionIds.length > 0

    return (
      <div className="page">
        <div className="page-head">
          <h1>Fábio-ly Feud</h1>
          <Link className="btn-link" to={`/session/${sessionId}`}>Back</Link>
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Team A name</span>
            <input value={teamAName} onChange={(e) => setTeamAName(e.target.value)} aria-label="Team A name" />
          </label>
          <label className="field">
            <span>Team B name</span>
            <input value={teamBName} onChange={(e) => setTeamBName(e.target.value)} aria-label="Team B name" />
          </label>
        </div>
        <div className="section-row">
          <h2>Teams</h2>
          <button type="button" onClick={randomlyBalanceTeams}>
            Randomly balance teams
          </button>
        </div>
        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <fieldset>
            <legend>Team A players</legend>
            <div className="check-list">
              {individuals.map((p) => (
                <label key={p.id} className="check-row">
                  <input
                    type="checkbox"
                    checked={teamAPlayers.includes(p.id)}
                    onChange={() => toggleA(p.id)}
                    aria-label={`assign-${p.name}-A`}
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Team B players</legend>
            <div className="check-list">
              {individuals.map((p) => (
                <label key={p.id} className="check-row">
                  <input
                    type="checkbox"
                    checked={teamBPlayers.includes(p.id)}
                    onChange={() => toggleB(p.id)}
                    aria-label={`assign-${p.name}-B`}
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="section-row">
          <h2>Questions</h2>
          <button type="button" onClick={selectAllQuestions}>
            Select all questions
          </button>
        </div>
        <div className="check-list check-list--grid">
          {feudQuestions.map((q) => (
            <label key={q.id} className="check-row">
              <input
                type="checkbox"
                checked={questionIds.includes(q.id)}
                onChange={() => toggleQ(q.id)}
              />
              {q.question}
            </label>
          ))}
        </div>

        <div className="btn-row">
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
        </div>
      </div>
    )
  }

  // Points earned in THIS feud game only (appliedDeltas). Each round's total is
  // split evenly across the winning team's players (see deltasFor), so summing a
  // team's players gives its score — and every new game starts at 0.
  const teamPoints = (playerIds: string[]) =>
    playerIds.reduce(
      (sum, pid) =>
        sum + game.appliedDeltas.filter((d) => d.participantId === pid).reduce((n, d) => n + d.delta, 0),
      0,
    )
  const teamAPoints = teamPoints(game.state.teamA.playerIds)
  const teamBPoints = teamPoints(game.state.teamB.playerIds)

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
    const winnerTeamName =
      round.winner === 'A' ? game.state.teamA.name : round.winner === 'B' ? game.state.teamB.name : null
    const isLastQuestion = game.state.questionIndex + 1 >= game.state.questions.length
    // A steal is the only path that ends a round with 3 strikes (all-revealed caps at 2).
    const wasSteal = round.strikes === 3

    const submitGuess = () => {
      const idx = matchAnswerIndex(q, guess)
      if (round.phase === 'steal') {
        // Steal: correct only if the typed answer is an unrevealed board answer.
        const stolen = idx >= 0 && !round.revealed.includes(idx)
        act(game.id, { type: 'stealResult', correct: stolen })
      } else if (idx >= 0 && !round.revealed.includes(idx)) {
        // face-off / board: reveal the matching answer, or flag a miss.
        act(game.id, { type: 'reveal', answerIndex: idx })
        setWrongGuess(false)
      } else {
        setWrongGuess(true)
      }
      setGuess('')
    }

    const startNewGame = () => {
      abandonGame(game.id)
      setDismissFinished(true)
    }

    return (
      <div className="page">
        <div className="page-head">
          <h1>Fábio-ly Feud</h1>
          <div className="btn-row">
            <button onClick={() => act(game.id, { type: 'endGame' })}>End game</button>
            <button onClick={startNewGame}>Start a new game</button>
          </div>
        </div>

        <div className="feud-scorebar">
          <span data-testid="team-a-score">
            <strong>{game.state.teamA.name}</strong> — {teamAPoints} points
          </span>
          <span data-testid="team-b-score">
            <strong>{game.state.teamB.name}</strong> — {teamBPoints} points
          </span>
        </div>

        <div className="feud-board">
          <div className="feud-board-main">
            <p>
              Question {game.state.questionIndex + 1} of {game.state.questions.length}: {q.question}
            </p>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Answer</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {q.answers.map((a, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{round.revealed.includes(i) ? a.text : '???'}</td>
                    <td>{a.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="feud-controls">
            {round.phase === 'faceOff' && (
              <div className="stack">
                <p>Face-off: type each team's answer below, then choose who controls (higher answer wins).</p>
                <p>Who controls the board?</p>
                <div className="btn-row">
                  <button
                    onClick={() => {
                      act(game.id, { type: 'faceOffWinner', team: 'A' })
                      setGuess('')
                      setWrongGuess(false)
                    }}
                  >
                    {game.state.teamA.name}
                  </button>
                  <button
                    onClick={() => {
                      act(game.id, { type: 'faceOffWinner', team: 'B' })
                      setGuess('')
                      setWrongGuess(false)
                    }}
                  >
                    {game.state.teamB.name}
                  </button>
                </div>
              </div>
            )}

            {(round.phase === 'faceOff' || round.phase === 'board' || round.phase === 'steal') && (
              <div className="stack">
                {round.phase === 'board' && (
                  <p>
                    Round total: {round.roundTotal} — controlling: {controllingTeam!.name}
                  </p>
                )}
                {round.phase === 'steal' && (
                  <p>Steal by {otherTeam!.name}: type their answer — if it's on the board, they steal.</p>
                )}
                {(round.phase === 'board' || round.phase === 'steal') && (
                  <div
                    style={{
                      display: 'flex',
                      gap: 14,
                      fontSize: '2.75rem',
                      lineHeight: 1,
                      margin: '4px 0 12px',
                    }}
                    role="img"
                    aria-label={`${round.strikes} of 3 strikes`}
                    data-testid="strikes"
                  >
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        aria-hidden="true"
                        style={{
                          color: i < round.strikes ? '#b00020' : '#d9d9d9',
                          fontWeight: 900,
                          textShadow: i < round.strikes ? '0 2px 6px rgba(176, 0, 32, 0.45)' : 'none',
                        }}
                      >
                        ✕
                      </span>
                    ))}
                  </div>
                )}
                <input
                  value={guess}
                  onChange={(e) => {
                    setGuess(e.target.value)
                    setWrongGuess(false)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitGuess()
                  }}
                  placeholder="Type the answer…"
                  aria-label="answer"
                />
                <div className="btn-row">
                  <button onClick={submitGuess}>{round.phase === 'steal' ? 'Check' : 'Reveal answer'}</button>
                  {round.phase === 'board' && (
                    <button
                      onClick={() => {
                        act(game.id, { type: 'strike' })
                        playStrikeSound()
                      }}
                    >
                      Strike
                    </button>
                  )}
                </div>
                {wrongGuess && <p style={{ color: '#b00020' }}>Not on the board</p>}
              </div>
            )}

            {round.phase === 'done' && (
              <div>
                <h2>Round over</h2>
                {wasSteal && (
                  <p>
                    {round.winner !== round.controllingTeam
                      ? 'Steal successful — the stealing team takes the round.'
                      : 'Steal failed — the controlling team keeps the round.'}
                  </p>
                )}
                <p>Round total: {round.roundTotal} points</p>
                {winnerTeamName && <p>Points awarded to {winnerTeamName}</p>}
                <button onClick={() => act(game.id, { type: 'nextQuestion' })}>
                  {isLastQuestion ? 'Finish' : 'Next question'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const champion =
    teamAPoints === teamBPoints ? null : teamAPoints > teamBPoints ? game.state.teamA : game.state.teamB

  return (
    <div className="page">
      <h1>Fábio-ly Feud — done</h1>
      {champion ? (
        <p data-testid="winner">
          Winner: <strong>{champion.name}</strong>
        </p>
      ) : (
        <p data-testid="winner">It's a tie!</p>
      )}
      <h2>Points earned</h2>
      <PointSummary awards={game.result?.awards ?? []} />
      <div className="btn-row">
        <button onClick={() => navigate(`/session/${sessionId}`)}>Back to main screen</button>
        <button onClick={() => setDismissFinished(true)}>Start a new game</button>
      </div>
    </div>
  )
}
