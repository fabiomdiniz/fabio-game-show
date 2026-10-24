import { useState, type FormEvent, type ReactNode } from 'react'

const STORAGE_KEY = 'game-show:unlocked'
const PASSWORD = 'boi'

export default function PasswordGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'yes',
  )
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  if (unlocked) return <>{children}</>

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (value === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'yes')
      setUnlocked(true)
    } else {
      setError(true)
      setValue('')
    }
  }

  return (
    <div className="gate">
      <form className="gate-card" onSubmit={submit}>
        <h1 className="gate-title">
          FÁBIO<span className="dot">·</span>GAME SHOW
        </h1>
        <p className="gate-sub">Enter the password to continue</p>
        <input
          type="password"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            if (error) setError(false)
          }}
          placeholder="Password"
          aria-label="Password"
          autoFocus
        />
        {error && (
          <p className="gate-error" role="alert">
            Incorrect password, try again.
          </p>
        )}
        <button type="submit">Enter</button>
      </form>
    </div>
  )
}
