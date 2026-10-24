import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import FeudAdmin from './FeudAdmin'
import { feudCategories } from '../../content/feud'

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
    const allQuestions = feudCategories.flatMap((c) => c.questions)
    for (const q of allQuestions) {
      expect(screen.getByText(q.question)).toBeInTheDocument()
    }
  })

  it('lists answers and points for a question', () => {
    renderAdmin()
    const first = feudCategories[0].questions[0]
    for (const a of first.answers) {
      expect(screen.getByText(a.text)).toBeInTheDocument()
      expect(screen.getAllByText(String(a.points)).length).toBeGreaterThan(0)
    }
  })
})
