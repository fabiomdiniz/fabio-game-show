import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PointGuidance from './PointGuidance'

describe('PointGuidance', () => {
  it('shows per-game points and guidance for 7, 8 and 9 players', () => {
    render(
      <MemoryRouter>
        <PointGuidance />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Point Guidance' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Per game' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'By player count' })).toBeInTheDocument()
    expect(screen.getByText('3 v 4')).toBeInTheDocument()
    expect(screen.getByText('4 v 4')).toBeInTheDocument()
    expect(screen.getByText('4 v 5')).toBeInTheDocument()
  })
})
