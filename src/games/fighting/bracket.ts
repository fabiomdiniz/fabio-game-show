import type { FightingMatch } from '../../types'

export function nextPowerOfTwo(n: number): number {
  let p = 1
  while (p < n) p *= 2
  return p
}

export function buildBracket(entrants: string[]): FightingMatch[][] {
  const n = entrants.length
  if (n < 2) return []
  const size = nextPowerOfTwo(n)
  const slots: (string | null)[] = [...entrants]
  while (slots.length < size) slots.push(null)

  const first: FightingMatch[] = []
  for (let i = 0; i < size; i += 2) {
    const a = slots[i]
    const b = slots[i + 1]
    const bye = a === null || b === null
    first.push({
      id: `m-0-${i / 2}`,
      playerA: a,
      playerB: b,
      winnerId: bye ? (a ?? b) : null,
      bye,
    })
  }

  const rounds: FightingMatch[][] = [first]
  let matchCount = size / 2
  let roundIndex = 1
  while (matchCount > 1) {
    matchCount = matchCount / 2
    const round: FightingMatch[] = []
    for (let i = 0; i < matchCount; i++) {
      round.push({ id: `m-${roundIndex}-${i}`, playerA: null, playerB: null, winnerId: null, bye: false })
    }
    rounds.push(round)
    roundIndex++
  }

  // Propagate bye winners into the next round.
  let result = rounds
  first.forEach((m) => {
    if (m.bye && m.winnerId) {
      result = advance(result, m.id, m.winnerId)
    }
  })
  return result
}

export function advance(
  rounds: FightingMatch[][],
  matchId: string,
  winnerId: string,
): FightingMatch[][] {
  const next = rounds.map((round) =>
    round.map((m) => (m.id === matchId ? { ...m, winnerId } : m)),
  )
  for (let r = 0; r < next.length - 1; r++) {
    const idx = next[r].findIndex((m) => m.id === matchId)
    if (idx === -1) continue
    const targetIdx = Math.floor(idx / 2)
    const target = next[r + 1][targetIdx]
    if (!target) break
    const slot: 'playerA' | 'playerB' = idx % 2 === 0 ? 'playerA' : 'playerB'
    next[r + 1][targetIdx] = { ...target, [slot]: winnerId }
    break
  }
  return next
}

export function championOf(rounds: FightingMatch[][]): { champion: string | null; runnerUp: string | null } {
  const finalMatch = rounds[rounds.length - 1]?.[0]
  if (!finalMatch?.winnerId) return { champion: null, runnerUp: null }
  const champion = finalMatch.winnerId
  const runnerUp = finalMatch.playerA === champion ? finalMatch.playerB : finalMatch.playerA
  return { champion, runnerUp }
}
