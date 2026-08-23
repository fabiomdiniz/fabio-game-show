import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from './store/StoreContext'
import './games/register'
import Sessions from './screens/Sessions'
import Session from './screens/Session'
import GameScreen from './screens/GameScreen'

function ComingSoon({ title }: { title: string }) {
  return <h1 style={{ padding: 16 }}>{title}</h1>
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Sessions />} />
          <Route path="/session/:id" element={<Session />} />
          <Route path="/session/:id/game/:kind" element={<GameScreen />} />
          <Route path="/admin" element={<ComingSoon title="Admin" />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}
