import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ImageAdmin from './ImageAdmin'

describe('ImageAdmin', () => {
  it('renders every corner image with a caption', () => {
    const { container } = render(
      <MemoryRouter>
        <ImageAdmin />
      </MemoryRouter>,
    )
    const imgs = container.querySelectorAll('img')
    expect(imgs.length).toBeGreaterThan(0)
    imgs.forEach((img) => expect(img.getAttribute('alt')).toBeTruthy())
  })
})
