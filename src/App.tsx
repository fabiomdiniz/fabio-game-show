import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
        <Routes>
          <Route path="/" element={<Sessions />} />
          <Route path="/session/:id" element={<Session />} />
          <Route path="/session/:id/game/:kind" element={<GameScreen />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}
