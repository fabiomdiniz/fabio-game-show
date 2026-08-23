import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from './store/StoreContext'
import Sessions from './screens/Sessions'

function ComingSoon({ title }: { title: string }) {
  return <h1 style={{ padding: 16 }}>{title}</h1>
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Sessions />} />
          <Route path="/session/:id" element={<ComingSoon title="Session" />} />
          <Route path="/admin" element={<ComingSoon title="Admin" />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}
