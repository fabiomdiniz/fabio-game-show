import { useState } from 'react'

interface Props {
  onAddPlayer: (name: string) => void
}

export default function ParticipantForm({ onAddPlayer }: Props) {
  const [name, setName] = useState('')

  function submit() {
    const trimmed = name.trim()
    if (!trimmed) return
    onAddPlayer(trimmed)
    setName('')
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        aria-label="Participant name"
      />
      <button type="submit" disabled={!name.trim()}>
        Add
      </button>
    </form>
  )
}
