import { Link, useLocation } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { getGameDefinition } from '../store/gameRegistry'
import type { GameKind } from '../types'

interface Crumb {
  label: string
  to?: string
}

export default function Breadcrumbs() {
  const { state } = useStore()
  const { pathname } = useLocation()

  const crumbs: Crumb[] = [{ label: 'Sessions', to: pathname === '/' ? undefined : '/' }]

  const m = pathname.match(/^\/session\/([^/]+)(?:\/(game|admin)(?:\/([^/]+))?)?$/)
  if (m) {
    const sessionId = m[1]
    const section = m[2]
    const kind = m[3]
    const session = state.sessions.find((s) => s.id === sessionId)
    const sessionLabel = session?.name ?? 'Session'

    if (section === 'admin') {
      crumbs.push({ label: sessionLabel, to: `/session/${sessionId}` }, { label: 'Admin' })
    } else if (section === 'game' && kind) {
      crumbs.push(
        { label: sessionLabel, to: `/session/${sessionId}` },
        { label: getGameDefinition(kind as GameKind)?.title ?? 'Game' },
      )
    } else if (section === undefined) {
      crumbs.push({ label: sessionLabel })
    }
  }

  return (
    <nav className="crumbs wrap" aria-label="Breadcrumb">
      {crumbs.map((c, i) => (
        <span key={`${c.label}-${i}`} className="crumb">
          {c.to ? <Link to={c.to}>{c.label}</Link> : <span className="crumb-current">{c.label}</span>}
          {i < crumbs.length - 1 && (
            <span className="crumb-sep" aria-hidden="true">
              /
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
