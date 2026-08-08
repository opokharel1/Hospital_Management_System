import { useState, useEffect } from 'react'   // creates dynamic memory state to keep track of user input, error messages and loading status in the component
import { Link, useNavigate } from 'react-router-dom'  // creates clickable links (without full browser page refreshes) and allows navigation between pages
import { loginUser } from '../api'   // imports the loginUser (custom) function from the api module to handle user authentication

function Login({ auth, onLogin }) {
  const navigate = useNavigate()  //intialize navigation function to redirect users to different pages after login
  const [credentials, setCredentials] = useState({  //state object created to hold the user's login credentials (username and password)
    username: '',
    password: '',
  })
  const [error, setError] = useState('')   //state for storing error messages related to login attempts, initialized as an empty string
  const [loading, setLoading] = useState(false)   //state to track the loading status of the login process, initialized as false

  useEffect(() => {
    // If the user lands on the login page but already has a valid token...
    if (auth?.token) {
      const userRole = auth.role || 'patient';
      // Bounce them immediately forward back to their dashboard!
      if (userRole === 'doctor' ) {
        navigate('/doctor', { replace: true });
      } 
      else if (userRole === 'admin') {
        navigate('/admin', { replace: true });
      }
      else {
        navigate('/patient', { replace: true });
      }
    }
  }, [auth, navigate]); // This triggers anytime the auth state changes
  
  async function handleSubmit(event) {  // defining an asynchronous function to handle the form submission event when the user attempts to log in
    event.preventDefault()   // prevents the default form submission behavior of HTML (which would cause a page reload), so that the login process can be handled via JavaScript instead
    setLoading(true)  // login buton disable itself and says "logging in..." to indicate that the login process is in progress
    setError('')  // clears any previous error messages before attempting a new login

    try {
      const data = await loginUser(credentials)   // calls the loginUser function with the user's credentials and waits for the response, which is expected to contain an access token and user role information
                                                  // pauses execution until FastAPI responds with the login result, which is then stored in the data variable
      //CALL THE ONLOGIN PROP HERE instead of writing to localStorage manually!
      // This tells App.jsx to update BOTH localStorage and the global auth state simultaneously.
      onLogin(data)
      // Redirect based on user role or default to patient dashboard
      const userRole = data.role || 'patient'  // extracts role string from data.role, and if role is missing, defaults to 'patient' 
      if (userRole === 'doctor') {
        navigate('/doctor', { replace: true })   // checks the userRole and redirects user to matching dashboard page 
        // replace:true, replaces /login route in the broser's history stack
      } else if (userRole === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/patient', { replace: true })
      }
    } // catch (requestError) {  // catches any error thrown during the request (e.g., HTTP 401 Unauthorized from FastAPI)
      // const detail = requestError?.response?.data?.detail   // Safely extracts detail from Axios's error response structure
      // if (typeof detail === 'string') {
      //   setError(detail)
      // } else {
      //   setError('Invalid username or password.')
      // }  // if string error message is returned from FastAPI, it is displayed to the user. Otherwise, a generic error message is shown.
    catch (err) {
      // If the backend actually returns a 401/400 error, show this:
      console.error("Login component caught an error:", err);
      setError('Invalid username or password.');
    } finally {   // this block always runs whether the login succeeded or failed
      setLoading(false)  // re-enables button
    }
  }

  return (
    <main className="auth-layout">     {/* root wrapper element */}
      <section className="hero-card">
        <p className="eyebrow">Welcome back</p>
        <h1>Log in to your account</h1>
        <p className="lead">
          Access your medical dashboard, appointments, and records.
        </p>
      </section>

      <section className="form-card">
        <h2>Log In</h2>
        <form onSubmit={handleSubmit} className="stacked-form">  {/* not a function call, but just providing reference; if the user clicks  submit button, then go ahead and fire it */}
          <label>  {/* Controlled components */}
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

