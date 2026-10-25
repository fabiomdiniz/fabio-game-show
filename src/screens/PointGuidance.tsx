import { Link } from 'react-router-dom'

// Session point reference: how to set points for a balanced session of
// 3 fighting tournaments + 3 board games + 1 family feud.
const byPlayerCount = [
  { players: 7, feudTeams: '3 v 4', boardHalf: '3–4' },
  { players: 8, feudTeams: '4 v 4', boardHalf: '4' },
  { players: 9, feudTeams: '4 v 5', boardHalf: '4–5' },
]

export default function PointGuidance() {
  return (
    <div className="page">
      <div className="page-head">
        <h1>Point Guidance</h1>
        <Link className="btn-link" to="/">← Sessions</Link>
      </div>

      <p className="muted-hint">
        Balanced so each game category caps a dominant player near 30 points; the
        feud is the swing finale.
      </p>

      <h2>Per game</h2>
      <table>
        <thead>
          <tr>
            <th>Game</th>
            <th>How to set it</th>
            <th className="num">Points</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Fighting (×3)</td>
            <td>1st / 2nd place</td>
            <td className="num">10 / 5 each</td>
          </tr>
          <tr>
            <td>Board game (×3)</td>
            <td>2 winner-only games · 1 half-the-players game</td>
            <td className="num">12 winner · 6 each (half)</td>
          </tr>
          <tr>
            <td>Family feud (×1)</td>
            <td>two teams · answer values fixed</td>
            <td className="num">10 → 1 (full board 55)</td>
          </tr>
        </tbody>
      </table>

      <h2>By player count</h2>
      <table>
        <thead>
          <tr>
            <th className="num">Players</th>
            <th>Feud teams</th>
            <th className="num">Board "half"</th>
          </tr>
        </thead>
        <tbody>
          {byPlayerCount.map((r) => (
            <tr key={r.players}>
              <td className="num">{r.players}</td>
              <td>{r.feudTeams}</td>
              <td className="num">{r.boardHalf}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="muted-hint">
        Feud full board = 55 points, split evenly among the winning team (team of
        3 ~ 18 each, 4 ~ 14, 5 = 11). Board "half" = pick that many winners in the
        half-the-players game at 6 points each.
      </p>
    </div>
  )
}
