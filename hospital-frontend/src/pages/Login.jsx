import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../api'

function Login() {
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await loginUser(credentials)
      
      // Store the token and user role/info
      localStorage.setItem('token', data.access_token)
      if (data.role) {
        localStorage.setItem('role', data.role)
      }

      // Redirect based on user role or default to patient dashboard
      const userRole = data.role || 'patient'
      if (userRole === 'doctor') {
        navigate('/doctor-dashboard', { replace: true })
      } else if (userRole === 'admin') {
        navigate('/admin-dashboard', { replace: true })
      } else {
        navigate('/patient-dashboard', { replace: true })
      }
    } catch (requestError) {
      const detail = requestError?.response?.data?.detail
      if (typeof detail === 'string') {
        setError(detail)
      } else {
        setError('Invalid username or password.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-layout">
      <section className="hero-card">
        <p className="eyebrow">Welcome back</p>
        <h1>Log in to your account</h1>
        <p className="lead">
          Access your medical dashboard, appointments, and records.
        </p>
      </section>

      <section className="form-card">
        <h2>Log In</h2>
        <form onSubmit={handleSubmit} className="stacked-form">
          <label>
            Username
            <input
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              type="text"
              autoComplete="username"
              required
            />
          </label>

          <label>
            Password
            <input
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              type="password"
              autoComplete="current-password"
              required
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="form-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </section>
    </main>
  )
}

export default Login