import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useStore } from '../../store/StoreContext'

export default function FightingScreen() {
  const { id: sessionId } = useParams()
  const { state, beginGame, act, finishGame } = useStore()
  const session = state.sessions.find((s) => s.id === sessionId)

  const [firstPlace, setFirstPlace] = useState('10')
  const [secondPlace, setSecondPlace] = useState('5')
  const [entrants, setEntrants] = useState<string[]>([])

  if (!session) return <p style={{ padding: 16 }}>Session not found.</p>

  const rawGame = session.games.find((g) => g.kind === 'fighting' && g.status !== 'finished')
  const game = rawGame?.kind === 'fighting' ? rawGame : undefined

  const individuals = session.participants.filter((p) => p.kind === 'individual')
  const nameOf = (id: string | null) => session.participants.find((p) => p.id === id)?.name ?? 'BYE'

  if (!game) {
    const toggle = (pid: string) =>
      setEntrants((es) => (es.includes(pid) ? es.filter((x) => x !== pid) : [...es, pid]))
    return (
      <div style={{ padding: 16 }}>
        <h1>Fighting Game</h1>
        <p>Select fighters (individual players only):</p>
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
    const finalMatchId = game.state.rounds[game.state.rounds.length - 1][0].id
    const win = (matchId: string, winnerId: string) => {
      act(game.id, { type: 'advance', matchId, winnerId })
      if (matchId === finalMatchId) finishGame(game.id)
    }
    return (
      <div style={{ padding: 16 }}>
        <h1>Fighting Game</h1>
        {game.state.rounds.map((round, ri) => (
          <div key={ri}>
            <h2>Round {ri + 1}</h2>
            {round.map((m) => {
              if (m.bye) {
                return (
                  <div key={m.id}>
                    {nameOf(m.winnerId)} — bye
                  </div>
                )
              }
              return (
                <div key={m.id}>
                  <button disabled={!!m.winnerId} onClick={() => win(m.id, m.playerA!)}>
                    {nameOf(m.playerA)}
                  </button>{' '}
                  vs{' '}
                  <button disabled={!!m.winnerId} onClick={() => win(m.id, m.playerB!)}>
                    {nameOf(m.playerB)}
                  </button>
                  {m.winnerId && <span> → {nameOf(m.winnerId)}</span>}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Fighting Game — done</h1>
      <p>
        <Link to={`/session/${sessionId}`}>Back to session</Link>
      </p>
    </div>
  )
}
