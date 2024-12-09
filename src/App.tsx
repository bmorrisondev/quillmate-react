import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './views/home'
import AppView from './views/app'

function AppRoot() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<AppView />} />
      </Routes>
    </Router>
  )
}

export default AppRoot
