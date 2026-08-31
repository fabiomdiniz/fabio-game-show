import type { Participant } from '../types'

export default function Scoreboard({ participants }: { participants: Participant[] }) {
  const sorted = [...participants].sort((a, b) => b.points - a.points)
  return (
    <table>
      <thead>
        <tr>
          <th>Participant</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((p) => (
          <tr key={p.id}>
            <td>
              {p.name}
              {p.members && p.members.length > 0 ? ` (${p.members.join(', ')})` : ''}
            </td>
            <td>{p.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
