import { Navigate, useLocation } from 'react-router-dom'

function ProtectedRoute({ auth, allowedRoles = [], children }) {
  const location = useLocation()

  if (!auth?.token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(auth.role)) {
    const fallbackPath = auth.role === 'patient' ? '/patient' : '/doctor'
    return <Navigate to={fallbackPath} replace />
  }

  return children
}

export default ProtectedRoute