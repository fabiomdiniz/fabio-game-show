import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { exportState, importFile } from '../store/persistence'
import { referencedParticipantIds } from '../store/reducer'
import ParticipantForm from '../components/ParticipantForm'
import type { Participant } from '../types'

function ParticipantRow({
  sessionId,
  participant,
  blocked,
}: {
  sessionId: string
  participant: Participant
  blocked: boolean
}) {
  const { dispatch } = useStore()
  const [name, setName] = useState(participant.name)
  const [points, setPoints] = useState(String(participant.points))

  return (
    <tr>
      <td>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label={`rename-${participant.name}`}
        />{' '}
        <button
          onClick={() => {
            const v = name.trim()
            if (v && v !== participant.name) {
              dispatch({ type: 'renameParticipant', sessionId, participantId: participant.id, name: v })
            }
          }}
        >
          Save
        </button>
      </td>
      <td data-testid={`points-${participant.name}`}>{participant.points}</td>
      <td>
        <input
          type="number"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          aria-label={`override-${participant.name}`}
        />{' '}
        <button
          onClick={() =>
            dispatch({
              type: 'overridePoints',
              sessionId,
              participantId: participant.id,
              points: Number(points) || 0,
            })
          }
        >
          Set
        </button>
      </td>
      <td>
        <button
          disabled={blocked}
          onClick={() => {
            if (window.confirm(`Delete ${participant.name}?`)) {
              dispatch({ type: 'deleteParticipant', sessionId, participantId: participant.id })
            }
          }}
        >
          Delete
        </button>
      </td>
    </tr>
  )
}

export default function Admin() {
  const { id } = useParams()
  const { state, dispatch } = useStore()
  const session = state.sessions.find((s) => s.id === id)
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  if (!session) {
    return (
      <div className="page">
        <h1>Admin</h1>
        <p>Session not found.</p>
        <Link className="btn-link" to="/">← Sessions</Link>
      </div>
    )
  }

  const blockedIds = new Set(
    session.games.filter((g) => g.status !== 'finished').flatMap((g) => referencedParticipantIds(g)),
  )

  return (
    <div className="page">
      <h1>Admin — {session.name}</h1>
      <Link className="btn-link" to={`/session/${session.id}`}>← Session</Link>

      <h2>Participants</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Points</th>
            <th>Override</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {session.participants.map((p) => (
            <ParticipantRow
              key={p.id}
              sessionId={session.id}
              participant={p}
              blocked={blockedIds.has(p.id)}
            />
          ))}
        </tbody>
      </table>

      <h2>Add participant</h2>
      <ParticipantForm
        onAddPlayer={(name) =>
          dispatch({ type: 'addParticipant', sessionId: session.id, name, kind: 'individual' })
        }
      />

      <h2>Storage</h2>
      <button onClick={() => exportState(state)}>Export state</button>{' '}
      <button onClick={() => fileRef.current?.click()}>Import state</button>{' '}
      <button
        onClick={() => {
          if (window.confirm('Clear all state?')) dispatch({ type: 'clearState' })
        }}
      >
        Clear all
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (!file) return
          const res = await importFile(file)
          if (res.error) {
            setError(res.error)
          } else {
            setError(null)
            if (res.state) dispatch({ type: 'importState', state: res.state })
          }
          e.target.value = ''
        }}
      />
      {error && <p style={{ color: 'red' }}>Import error: {error}</p>}
    </div>
  )
}
