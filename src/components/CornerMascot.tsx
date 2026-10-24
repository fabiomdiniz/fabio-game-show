import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

// Mascot art for the bottom page corners. Every transparent PNG dropped into
// src/content/corner/ is registered at build time; two are shown at random
// (bottom-left and bottom-right) and both re-pick on every route change,
// never repeating the same image back-to-back and never matching each other.
const cornerArt = import.meta.glob('../content/corner/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const artUrls = Object.values(cornerArt)

export function pickCornerArt(
  rng: () => number = Math.random,
  exclude?: string | string[],
): string | undefined {
  const excludes = exclude ? (Array.isArray(exclude) ? exclude : [exclude]) : []
  const pool = artUrls.filter((u) => !excludes.includes(u))
  const source = pool.length > 0 ? pool : artUrls
  if (source.length === 0) return undefined
  const i = Math.min(Math.floor(rng() * source.length), source.length - 1)
  return source[i]
}

export default function CornerMascot() {
  const { pathname } = useLocation()
  const [pair, setPair] = useState<{ right?: string; left?: string }>({})

  useEffect(() => {
    setPair((prev) => {
      const nextRight = pickCornerArt(Math.random, prev.right)
      const nextLeft = pickCornerArt(
        Math.random,
        [prev.left, nextRight].filter((x): x is string => Boolean(x)),
      )
      return { right: nextRight, left: nextLeft }
    })
  }, [pathname])

  return (
    <>
      {pair.right && (
        <img className="corner-mascot" src={pair.right} alt="" aria-hidden="true" draggable={false} />
      )}
      {pair.left && (
        <img
          className="corner-mascot corner-mascot--left"
          src={pair.left}
          alt=""
          aria-hidden="true"
          draggable={false}
        />
      )}
    </>
  )
}
