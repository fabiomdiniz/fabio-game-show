import type { Participant } from '../types'

interface Props {
  participants: Participant[]
  title?: string
}

export default function Scoreboard({ participants, title = 'Leaderboard' }: Props) {
  const sorted = [...participants].sort((a, b) => b.points - a.points)
  return (
    <section className="lboard" aria-label="Leaderboard">
      <h2 className="lboard-title">Leaderboards</h2>
      <div className="lboard-banner">
        <div className="lboard-thumb" aria-hidden="true"></div>
        <div className="lboard-banner-body">
          <span className="lboard-banner-name">{title}</span>
          <div className="lboard-banner-strip" aria-hidden="true">
            <span>Players</span>
            <span>Points</span>
            <span>Live</span>
          </div>
        </div>
      </div>
      <ol className="lboard-list">
        {sorted.map((p, i) => {
          const medal = i === 0 ? 'first' : i === 1 ? 'second' : i === 2 ? 'third' : ''
          return (
            <li key={p.id} className={`lboard-row${medal ? ` rank-${medal}` : ''}`}>
              <span className={`lboard-rank${medal ? ` ${medal}` : ''}`}>{i + 1}</span>
              <span className="lboard-name">
                {p.name}
                {p.members && p.members.length > 0 ? ` (${p.members.join(', ')})` : ''}
              </span>
              <span className="lboard-value">{p.points}</span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
