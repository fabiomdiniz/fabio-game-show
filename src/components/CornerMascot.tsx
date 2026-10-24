import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

// Mascot art for the bottom-right page corner. Every transparent PNG dropped
// into src/content/corner/ is registered at build time; one is shown at random
// and re-picked (never repeating the same image twice in a row) on every route
// change. Add more art without touching code.
const cornerArt = import.meta.glob('../content/corner/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const artUrls = Object.values(cornerArt)

export function pickCornerArt(
  rng: () => number = Math.random,
  exclude?: string,
): string | undefined {
  const pool = exclude ? artUrls.filter((u) => u !== exclude) : artUrls
  const source = pool.length > 0 ? pool : artUrls
  if (source.length === 0) return undefined
  const i = Math.min(Math.floor(rng() * source.length), source.length - 1)
  return source[i]
}

export default function CornerMascot() {
  const { pathname } = useLocation()
  const [src, setSrc] = useState<string | undefined>()

  useEffect(() => {
    setSrc((prev) => pickCornerArt(Math.random, prev))
  }, [pathname])

  if (!src) return null

  return (
    <img
      className="corner-mascot"
      src={src}
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  )
}
