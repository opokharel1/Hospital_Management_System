import { NavLink, Link } from 'react-router-dom'

function Navbar({ auth, onLogout }) {
  const isAuthenticated = Boolean(auth?.token)
  const dashboardPath = auth?.role === 'patient' ? '/patient' : '/doctor'

  return (
    <header className="navbar">
      <Link className="brand" to={isAuthenticated ? dashboardPath : '/login'}>
        <span className="brand-mark">HMS</span>
        <span className="brand-text">Hospital Management System</span>
      </Link>

      <nav className="nav-links">
        {isAuthenticated ? (
          <>
            {auth.role === 'patient' ? <NavLink to="/patient">Patient Dashboard</NavLink> : null}
            {auth.role === 'doctor' ? <NavLink to="/doctor">Doctor Dashboard</NavLink> : null}
            {auth.role === 'admin' ? <NavLink to="/admin">Admin Dashboard</NavLink> : null}

            <button className="nav-button" type="button" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </nav>
    </header>
  )
}

export default Navbar