import { Dumbbell, LogIn } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export function Login({ onSwitch }) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('loading')
    setMessage('')

    const { error } = await signIn(email.trim(), password)
    if (error) {
      setStatus('error')
      setMessage(error.message || 'Could not sign in.')
      return
    }
    // On success the auth listener swaps to the app automatically.
    setStatus('idle')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand__icon" aria-hidden="true">
            <Dumbbell size={22} strokeWidth={2.4} />
          </span>
          Workout OS
        </div>
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Sign in to sync your training to the cloud.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            Email
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="auth-field">
            Password
            <input
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {status === 'error' ? (
            <p className="auth-error" role="alert">
              {message}
            </p>
          ) : null}

          <button
            className="workout-primary-button"
            disabled={status === 'loading'}
            type="submit"
          >
            <LogIn size={19} strokeWidth={2.4} aria-hidden="true" />
            {status === 'loading' ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="auth-links">
          <button onClick={() => onSwitch('forgot')} type="button">
            Forgot password?
          </button>
          <span>
            New here?{' '}
            <button onClick={() => onSwitch('register')} type="button">
              Create an account
            </button>
          </span>
        </div>
      </div>
    </div>
  )
}
