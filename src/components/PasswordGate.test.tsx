import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PasswordGate from './PasswordGate'

beforeEach(() => {
  window.localStorage.clear()
})

describe('PasswordGate', () => {
  it('shows the password form and hides children when locked', () => {
    render(
      <PasswordGate>
        <div>secret content</div>
      </PasswordGate>,
    )
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.queryByText('secret content')).not.toBeInTheDocument()
  })

  it('re-asks on a wrong password', async () => {
    const user = userEvent.setup()
    render(
      <PasswordGate>
        <div>secret content</div>
      </PasswordGate>,
    )
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Enter' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Incorrect password')
    expect(screen.queryByText('secret content')).not.toBeInTheDocument()
    expect(window.localStorage.getItem('game-show:unlocked')).toBeNull()
  })

  it('unlocks on the correct password and remembers it', async () => {
    const user = userEvent.setup()
    render(
      <PasswordGate>
        <div>secret content</div>
      </PasswordGate>,
    )
    await user.type(screen.getByLabelText('Password'), 'boi')
    await user.click(screen.getByRole('button', { name: 'Enter' }))
    expect(screen.getByText('secret content')).toBeInTheDocument()
    expect(window.localStorage.getItem('game-show:unlocked')).toBe('yes')
  })

  it('skips the gate when already unlocked', () => {
    window.localStorage.setItem('game-show:unlocked', 'yes')
    render(
      <PasswordGate>
        <div>secret content</div>
      </PasswordGate>,
    )
    expect(screen.getByText('secret content')).toBeInTheDocument()
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument()
  })
})
