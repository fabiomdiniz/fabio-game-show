import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom'
import CornerMascot, { pickCornerArt } from './CornerMascot'

describe('pickCornerArt', () => {
  it('has a non-empty art pool', () => {
    expect(pickCornerArt(() => 0)).toBeDefined()
  })

  it('picks deterministically for a given rng', () => {
    expect(pickCornerArt(() => 0)).toBe(pickCornerArt(() => 0))
  })

  it('avoids the excluded image when alternatives exist', () => {
    const first = pickCornerArt(() => 0)
    const second = pickCornerArt(() => 0, first)
    expect(second).toBeDefined()
    expect(second).not.toBe(first)
  })
})

describe('CornerMascot', () => {
  it('renders a decorative image with no accessible text', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/a']}>
        <CornerMascot />
      </MemoryRouter>,
    )
    const img = container.querySelector('img.corner-mascot')
    expect(img).not.toBeNull()
    expect(img).toHaveAttribute('aria-hidden', 'true')
    expect(img).toHaveAttribute('alt', '')
    expect(img?.getAttribute('src')).toBeTruthy()
  })

  it('changes the image on navigation', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/a']}>
        <CornerMascot />
        <Routes>
          <Route path="/a" element={<Link to="/b">next</Link>} />
          <Route path="/b" element={<Link to="/a">back</Link>} />
        </Routes>
      </MemoryRouter>,
    )
    const first = container.querySelector('img.corner-mascot')?.getAttribute('src')
    fireEvent.click(screen.getByRole('link', { name: 'next' }))
    const second = container.querySelector('img.corner-mascot')?.getAttribute('src')
    expect(first).toBeTruthy()
    expect(second).toBeTruthy()
    expect(second).not.toBe(first)
  })
})
