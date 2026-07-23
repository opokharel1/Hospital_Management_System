import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { loginUser } from '../api'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fromPath = location.state?.from?.pathname

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await loginUser(form.username, form.password)
      const session = onLogin(data)

      if (fromPath) {
        navigate(fromPath, { replace: true })
      } else {
        navigate(session.role === 'patient' ? '/patient' : '/doctor', {
          replace: true,
        })
      }
    } catch (requestError) {
      setError(
        requestError?.response?.data?.detail || 'Unable to log in with those credentials.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-layout">
      <section className="hero-card">
        <p className="eyebrow">Secure access</p>
        <h1>Sign in to manage appointments</h1>
        <p className="lead">
          Patients can book visits and review their schedule. Doctors and admins can
          review and update appointment status.
        </p>
      </section>

      <section className="form-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className="stacked-form">
          <label>
            Username
            <input
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
              type="text"
              autoComplete="username"
              required
            />
          </label>

          <label>
            Password
            <input
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              type="password"
              autoComplete="current-password"
              required
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="form-footer">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  )
}

export default Login