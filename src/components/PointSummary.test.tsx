import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PointSummary from './PointSummary'

describe('PointSummary', () => {
  it('aggregates deltas per player and sorts by points', () => {
    render(
      <PointSummary
        awards={[
          { participantId: 'a', participantName: 'Ana', delta: 10 },
          { participantId: 'b', participantName: 'Bruno', delta: -5 },
          { participantId: 'a', participantName: 'Ana', delta: 5 },
        ]}
      />,
    )

    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('+15')).toBeInTheDocument()
    expect(screen.getByText('Bruno')).toBeInTheDocument()
    expect(screen.getByText('-5')).toBeInTheDocument()
  })

  it('shows a message when no points were awarded', () => {
    render(<PointSummary awards={[]} />)
    expect(screen.getByText('No points were awarded in this game.')).toBeInTheDocument()
  })
})
