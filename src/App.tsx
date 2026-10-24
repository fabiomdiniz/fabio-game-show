import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { StoreProvider } from './store/StoreContext'
import './games/register'
import Sessions from './screens/Sessions'
import Session from './screens/Session'
import GameScreen from './screens/GameScreen'
import Admin from './screens/Admin'

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <div className="app-shell">
          <header className="topbar wrap">
            <span className="wordmark">
              FÁBIO<span className="dot">·</span>GAME SHOW
            </span>
            <nav className="topnav" aria-label="Primary">
              <Link to="/">Sessions</Link>
            </nav>
          </header>
          <div className="checker" aria-hidden="true"></div>
          <main>
            <Routes>
              <Route path="/" element={<Sessions />} />
              <Route path="/session/:id" element={<Session />} />
              <Route path="/session/:id/game/:kind" element={<GameScreen />} />
              <Route path="/session/:id/admin" element={<Admin />} />
            </Routes>
          </main>
          <footer className="site-footer">
            <span>Fábio Game Show</span>
          </footer>
        </div>
      </BrowserRouter>
    </StoreProvider>
  )
}
