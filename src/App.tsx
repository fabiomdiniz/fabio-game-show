import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { StoreProvider } from './store/StoreContext'
import './games/register'
import PasswordGate from './components/PasswordGate'
import Breadcrumbs from './components/Breadcrumbs'
import CornerMascot from './components/CornerMascot'
import Sessions from './screens/Sessions'
import Session from './screens/Session'
import GameScreen from './screens/GameScreen'
import Admin from './screens/Admin'
import FeudAdmin from './games/feud/FeudAdmin'
import ImageAdmin from './screens/ImageAdmin'
import PointGuidance from './screens/PointGuidance'

export default function App() {
  return (
    <PasswordGate>
      <StoreProvider>
        <BrowserRouter>
          <div className="app-shell">
            <CornerMascot />
            <header className="topbar">
              <div className="wrap topbar-inner">
                <span className="wordmark">
                  <Link to="/">
                    FÁBIO<span className="dot">·</span>GAME SHOW
                  </Link>
                </span>
                <nav className="topnav" aria-label="Primary">
                  <Link to="/">Sessions</Link>
                  <Link to="/feud-admin">Feud Admin</Link>
                  <Link to="/image-admin">Image Admin</Link>
                  <Link to="/point-guidance">Point Guidance</Link>
                </nav>
              </div>
            </header>
            <main>
              <Breadcrumbs />
              <Routes>
                <Route path="/" element={<Sessions />} />
                <Route path="/session/:id" element={<Session />} />
                <Route path="/session/:id/game/:kind" element={<GameScreen />} />
                <Route path="/session/:id/admin" element={<Admin />} />
                <Route path="/feud-admin" element={<FeudAdmin />} />
                <Route path="/image-admin" element={<ImageAdmin />} />
              <Route path="/point-guidance" element={<PointGuidance />} />
              </Routes>
            </main>
            <footer className="site-footer">
              <span>Fábio Game Show</span>
            </footer>
          </div>
        </BrowserRouter>
      </StoreProvider>
    </PasswordGate>
  )
}
