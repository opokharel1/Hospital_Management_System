import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api'

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'patient',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await registerUser(form)
      setSuccess('Account created. You can now log in.')
      setTimeout(() => navigate('/login', { replace: true }), 800)
    } catch (requestError) {
      const detail = requestError?.response?.data?.detail
      if (Array.isArray(detail)) {
        // If FastAPI returns a list of validation errors
        setError(detail.map((err) => err.msg).join(', '))
      } else if (typeof detail === 'string') {
        setError(detail)
      } else {
        setError('Could not create the account right now.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-layout">
      <section className="hero-card">
        <p className="eyebrow">Join the system</p>
        <h1>Create your hospital account</h1>
        <p className="lead">
          Start as a patient, or register with a staff role when you are setting up
          a clinical workflow.
        </p>
      </section>

      <section className="form-card">
        <h2>Register</h2>
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
            Email
            <input
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              type="email"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              type="password"
              autoComplete="new-password"
              required
            />
          </label>

          <label>
            Role
            <select
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p className="form-success">{success}</p> : null}

          <button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="form-footer">
          Already registered? <Link to="/login">Back to login</Link>
        </p>
      </section>
    </main>
  )
}

export default Register