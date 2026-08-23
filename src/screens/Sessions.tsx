import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/StoreContext'

export default function Sessions() {
  const { state, dispatch } = useStore()
  const [name, setName] = useState('')

  function create() {
    const trimmed = name.trim()
    if (!trimmed) return
    dispatch({ type: 'createSession', name: trimmed })
    setName('')
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Sessions</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          create()
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Session name"
          aria-label="Session name"
        />
        <button type="submit" disabled={!name.trim()}>
          New session
        </button>
      </form>
      <ul>
        {state.sessions.map((s) => (
          <li key={s.id}>
            <Link to={`/session/${s.id}`}>{s.name}</Link>{' '}
            <button
              onClick={() => {
                if (window.confirm(`Delete "${s.name}"?`)) {
                  dispatch({ type: 'deleteSession', sessionId: s.id })
                }
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      {state.sessions.length === 0 && <p>No sessions yet.</p>}
    </div>
  )
}
