import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import FeudAdmin from './FeudAdmin'
import { feudQuestions } from '../../content/feud'

function renderAdmin() {
  return render(
    <MemoryRouter>
      <FeudAdmin />
    </MemoryRouter>,
  )
}

describe('FeudAdmin', () => {
  it('lists every stored question', () => {
    renderAdmin()
    expect(screen.getByRole('heading', { name: 'Feud Admin' })).toBeInTheDocument()
    const allQuestions = feudQuestions
    for (const q of allQuestions) {
      expect(screen.getByText(q.question)).toBeInTheDocument()
    }
  })

  it('lists answers and points for a question', () => {
    renderAdmin()
    const first = feudQuestions[0]
    for (const a of first.answers) {
      expect(screen.getByText(a.text)).toBeInTheDocument()
      expect(screen.getAllByText(String(a.points)).length).toBeGreaterThan(0)
    }
  })
})
