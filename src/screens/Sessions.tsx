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
    } else if (res.sessions && res.sessions.length > 0) {
      setImportError(null)
      for (const session of res.sessions) {
        dispatch({ type: 'importSession', session })
      }
    }
    e.target.value = ''
  }

  return (
    <div className="page">
      <h1>Sessions</h1>
      <form
        className="create-bar"
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
      <div className="toolbar">
        <button className="btn-ghost" onClick={() => fileRef.current?.click()}>
          Import session
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={onImportFile}
        />
      </div>
      {importError && <p className="error">Import error: {importError}</p>}
      {state.sessions.length === 0 ? (
        <p className="empty">No sessions yet.</p>
      ) : (
        <ul className="session-list">
          {state.sessions.map((s) => (
            <li key={s.id} className="session-card">
              <Link to={`/session/${s.id}`}>{s.name}</Link>
              <button
                className="btn-danger"
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
      )}
    </div>
  )
}
