import type { PointDelta } from '../types'

export default function PointSummary({ awards }: { awards: PointDelta[] }) {
  const totals = new Map<string, { name: string; points: number }>()
  for (const award of awards) {
    const entry = totals.get(award.participantId) ?? { name: award.participantName, points: 0 }
    entry.points += award.delta
    totals.set(award.participantId, entry)
  }

  const rows = [...totals.values()].sort((a, b) => b.points - a.points)
  if (rows.length === 0) {
    return <p>No points were awarded in this game.</p>
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Player</th>
          <th>Points earned</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.name}>
            <td>{row.name}</td>
            <td>{row.points > 0 ? `+${row.points}` : row.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
