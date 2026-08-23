import { BrowserRouter, Routes, Route } from 'react-router-dom'

function Sessions() {
  return <h1>Sessions</h1>
}

function Session() {
  return <h1>Session</h1>
}

function Admin() {
  return <h1>Admin</h1>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Sessions />} />
        <Route path="/session/:id" element={<Session />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
