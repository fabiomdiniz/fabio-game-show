import { useState } from 'react'
import type { ParticipantKind } from '../types'

interface Props {
  onAddPlayer: (name: string) => void
  onAddTeam: (name: string, members: string[]) => void
}

export default function ParticipantForm({ onAddPlayer, onAddTeam }: Props) {
  const [name, setName] = useState('')
  const [kind, setKind] = useState<ParticipantKind>('individual')
  const [members, setMembers] = useState('')

  function submit() {
    const trimmed = name.trim()
    if (!trimmed) return
    if (kind === 'individual') {
      onAddPlayer(trimmed)
    } else {
      onAddTeam(
        trimmed,
        members
          .split(',')
          .map((m) => m.trim())
          .filter(Boolean),
      )
    }
    setName('')
    setMembers('')
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
      <select
        value={kind}
        onChange={(e) => setKind(e.target.value as ParticipantKind)}
        aria-label="Kind"
      >
        <option value="individual">Player</option>
        <option value="team">Team</option>
      </select>
      {kind === 'team' && (
        <input
          value={members}
          onChange={(e) => setMembers(e.target.value)}
          placeholder="Members (comma-separated)"
          aria-label="Members"
        />
      )}
      <button type="submit" disabled={!name.trim()}>
        Add
      </button>
    </form>
  )
}
