import { Link } from 'react-router-dom'

// Catalogues every corner mascot image, registered the same way CornerMascot
// picks from them. This page shows the full pool the mascot can draw from.
const cornerArt = import.meta.glob('../content/corner/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

function prettyName(fileName: string): string {
  return fileName
    .replace(/\.png$/i, '')
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
}

const entries = Object.entries(cornerArt)
  .map(([path, url]) => {
    const fileName = path.split('/').pop() ?? path
    return { url, name: prettyName(fileName) }
  })
  .sort((a, b) => a.name.localeCompare(b.name))

export default function ImageAdmin() {
  return (
    <div className="page">
      <div className="page-head">
        <h1>Image Admin</h1>
        <Link className="btn-link" to="/">← Sessions</Link>
      </div>
      <p className="muted-hint">{entries.length} corner images</p>
      <div className="image-grid">
        {entries.map(({ url, name }) => (
          <figure key={name} className="image-card">
            <img src={url} alt={name} draggable={false} loading="lazy" />
            <figcaption>{name}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
