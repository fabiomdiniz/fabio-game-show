import type { CSSProperties } from 'react'
import type { FightingMatch } from '../../types'

// Fixed geometry so connector lines and match cards share one coordinate space
// (px), which keeps the bracket a true single-elimination tree without any DOM
// measuring. The whole thing sits inside a horizontally scrollable frame.
const MATCH_W = 210
const MATCH_H = 96
const ROW_GAP = 44 // vertical gap between first-round matches
const COL_GAP = 56 // horizontal gap between columns (room for the elbow connectors)
const HEADER_H = 30 // round labels sit above the tree
const CHAMP_W = 230

function roundLabel(entrantCount: number): string {
  switch (entrantCount) {
    case 2:
      return 'Grand Final'
    case 4:
      return 'Semifinals'
    case 8:
      return 'Quarterfinals'
    case 16:
      return 'Round of 16'
    case 32:
      return 'Round of 32'
    case 64:
      return 'Round of 64'
    default:
      return `Round of ${entrantCount}`
  }
}

interface SlotProps {
  id: string | null
  winnerId: string | null
  nameOf: (id: string | null) => string
  onPick?: () => void
  onUndo?: () => void
}

function Slot({ id, winnerId, nameOf, onPick, onUndo }: SlotProps) {
  const name = id ? nameOf(id) : 'TBD'
  const decided = winnerId !== null
  const isWinner = decided && winnerId === id
  const classes = [
    'slot',
    isWinner ? 'winner' : '',
    decided && !isWinner && id ? 'lost' : '',
    id ? '' : 'tbd',
  ]
    .filter(Boolean)
    .join(' ')

  if (id && !decided && onPick) {
    return (
      <button type="button" className={classes} onClick={onPick}>
        <span className="pname">{name}</span>
      </button>
    )
  }

  if (isWinner && onUndo) {
    return (
      <button type="button" className={classes} onClick={onUndo} title="Undo this result">
        <span className="pname">{name}</span>
        <span className="tag undo">↺ Undo</span>
      </button>
    )
  }

  return (
    <div className={classes}>
      <span className="pname">{name}</span>
      {isWinner && <span className="tag win">Win</span>}
    </div>
  )
}

interface BracketProps {
  rounds: FightingMatch[][]
  nameOf: (id: string | null) => string
  onPick?: (matchId: string, winnerId: string) => void
  onUndo?: (matchId: string) => void
}

export default function Bracket({ rounds, nameOf, onPick, onUndo }: BracketProps) {
  const R = rounds.length
  if (R === 0) return null

  const firstRoundCount = rounds[0].length
  const step = MATCH_H + ROW_GAP
  const cardsH = (firstRoundCount - 1) * step + MATCH_H
  const totalW = R * (MATCH_W + COL_GAP) + CHAMP_W
  const totalH = HEADER_H + cardsH

  const xOf = (r: number) => r * (MATCH_W + COL_GAP)
  const centerY = (r: number, i: number) =>
    HEADER_H + (((2 * i + 1) * 2 ** r - 1) * step) / 2 + MATCH_H / 2

  const canUndo = (r: number, i: number) => {
    const m = rounds[r][i]
    if (!m.winnerId || m.bye) return false
    if (r >= rounds.length - 1) return false
    return !rounds[r + 1][Math.floor(i / 2)]?.winnerId
  }

  // Elbow connectors: right edge of each match -> midpoint -> target match.
  const links: { d: string; lit: boolean }[] = []
  for (let r = 0; r < R - 1; r++) {
    rounds[r].forEach((m, i) => {
      const x1 = xOf(r) + MATCH_W
      const x2 = xOf(r + 1)
      const xm = x1 + COL_GAP / 2
      const y1 = centerY(r, i)
      const y2 = centerY(r + 1, Math.floor(i / 2))
      links.push({ d: `M ${x1} ${y1} H ${xm} V ${y2} H ${x2}`, lit: !!m.winnerId })
    })
  }

  const champion = rounds[R - 1][0]?.winnerId ?? null
  const finalY = centerY(R - 1, 0)
  const champX = xOf(R - 1) + MATCH_W + COL_GAP
  links.push({ d: `M ${xOf(R - 1) + MATCH_W} ${finalY} H ${champX}`, lit: champion !== null })

  const style: CSSProperties = { width: totalW, height: totalH }

  return (
    <div className="bracket-scroll">
      <div className="bracket" style={style}>
        <svg
          className="bracket-lines"
          width={totalW}
          height={totalH}
          viewBox={`0 0 ${totalW} ${totalH}`}
          aria-hidden="true"
        >
          {links.map((l, i) => (
            <path key={i} d={l.d} className={l.lit ? 'lit' : ''} />
          ))}
        </svg>

        {rounds.map((_, r) => (
          <div key={r} className="bracket-rlabel" style={{ left: xOf(r), width: MATCH_W, top: 0 }}>
            {roundLabel(2 ** (R - r))}
          </div>
        ))}

        {rounds.map((round, r) =>
          round.map((m, i) => {
            const top = centerY(r, i) - MATCH_H / 2
            return (
              <div
                key={m.id}
                className={`bracket-match${m.bye ? ' bye' : ''}${m.winnerId ? ' decided' : ''}`}
                style={{ left: xOf(r), top, width: MATCH_W, height: MATCH_H }}
              >
                {m.bye ? (
                  <>
                    <div className="slot winner">
                      <span className="pname">{nameOf(m.winnerId)}</span>
                      <span className="tag">Bye</span>
                    </div>
                    <div className="vs">Advanced</div>
                  </>
                ) : (
                  <>
                    <Slot
                      id={m.playerA}
                      winnerId={m.winnerId}
                      nameOf={nameOf}
                      onPick={onPick && !m.winnerId && m.playerA ? () => onPick(m.id, m.playerA!) : undefined}
                      onUndo={onUndo && canUndo(r, i) ? () => onUndo(m.id) : undefined}
                    />
                    <div className="vs">VS</div>
                    <Slot
                      id={m.playerB}
                      winnerId={m.winnerId}
                      nameOf={nameOf}
                      onPick={onPick && !m.winnerId && m.playerB ? () => onPick(m.id, m.playerB!) : undefined}
                      onUndo={onUndo && canUndo(r, i) ? () => onUndo(m.id) : undefined}
                    />
                  </>
                )}
              </div>
            )
          }),
        )}

        <div
          className="bracket-champ"
          style={{ left: champX, top: finalY - MATCH_H / 2, width: CHAMP_W, height: MATCH_H }}
        >
          <div className="crown" aria-hidden="true">
            👑
          </div>
          <div className="cname" data-testid="bracket-champion">
            {champion ? nameOf(champion) : '—'}
          </div>
          <div className="clabel">Champion</div>
        </div>
      </div>
    </div>
  )
}
