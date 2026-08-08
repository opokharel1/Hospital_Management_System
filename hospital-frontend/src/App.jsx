import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import PatientDashboard from './pages/PatientDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import {
  clearStoredAuth,
  decodeJwtPayload,
  getStoredAuth,
  setStoredAuth,
} from './api'

function buildAuthState() {
  const storedAuth = getStoredAuth()
  const payload = storedAuth.token ? decodeJwtPayload(storedAuth.token) : null

  return {
    token: storedAuth.token,
    role: storedAuth.role,
    userId: payload?.sub ? Number(payload.sub) : null,
  }
}

function roleHome(role) {
  return role === 'patient' ? '/patient' : '/doctor'
}

function App() {
  const [auth, setAuth] = useState(buildAuthState)

  function handleLogin(session) {
    const token = session.access_token || session.token
    const role = session.role || 'patient'
    const payload = decodeJwtPayload(token)
    const nextAuth = {
      token,
      role,
      userId: payload?.sub ? Number(payload.sub) : null,
    }

    setStoredAuth(token, role)
    setAuth(nextAuth)

    return nextAuth
  }

  function handleLogout() {
    clearStoredAuth()
    setAuth({ token: null, role: null, userId: null })
    navigate('/login', { replace: true });
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar auth={auth} onLogout={handleLogout} />

        <Routes>
          <Route
            path="/"
            element={<Navigate to={auth?.token ? roleHome(auth.role) : '/login'} replace />}
          />
          <Route path="/login" element={<Login auth={auth} onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/patient"
            element={
              <ProtectedRoute auth={auth} allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor"
            element={
              <ProtectedRoute auth={auth} allowedRoles={['doctor', 'admin']}>
                <DoctorDashboard auth={auth} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              auth?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="*"
            element={<Navigate to={auth?.token ? roleHome(auth.role) : '/login'} replace />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App