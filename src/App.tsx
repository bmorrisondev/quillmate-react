import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from '@/views/home'
import AppView from '@/views/app'
import { AuthProvider } from '@/hooks/use-auth'
import SignIn from '@/views/auth/sign-in'
import SignUp from '@/views/auth/sign-up'
import { ProtectedRoute } from '@/components/protected-route'

function AppRoot() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppView />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default AppRoot
