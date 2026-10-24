import { useRef, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { importSessionFile } from '../store/persistence'

export default function Sessions() {
  const { state, dispatch } = useStore()
  const [name, setName] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function create() {
    const trimmed = name.trim()
    if (!trimmed) return
    dispatch({ type: 'createSession', name: trimmed })
    setName('')
  }

  async function onImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const res = await importSessionFile(file)
    if (res.error) {
      setImportError(res.error)
    } else if (res.session) {
      setImportError(null)
      dispatch({ type: 'importSession', session: res.session })
    }
    e.target.value = ''
  }

  return (
    <div className="page">
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
      <div>
        <button onClick={() => fileRef.current?.click()}>Import session</button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={onImportFile}
        />
      </div>
      {importError && <p style={{ color: 'red' }}>Import error: {importError}</p>}
      <ul>
        {state.sessions.map((s) => (
          <li key={s.id}>
            <Link className="btn-link" to={`/session/${s.id}`}>
              {s.name}
            </Link>{' '}
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
