import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from '@/views/home'
import AppView from '@/views/app'

function AppRoot() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<AppView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default AppRoot
