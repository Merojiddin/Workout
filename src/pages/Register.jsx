import { Dumbbell, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export function Register({ onSwitch }) {
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | error | done
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    if (password.length < 6) {
      setStatus('error')
      setMessage('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setStatus('error')
      setMessage('Passwords do not match.')
      return
    }

    setStatus('loading')
    const { data, error } = await signUp(email.trim(), password, name.trim())
    if (error) {
      setStatus('error')
      setMessage(error.message || 'Could not create the account.')
      return
    }

    // If email confirmation is on, there is no session yet.
    if (!data?.session) {
      setStatus('done')
      setMessage('Account created. Check your email to confirm, then sign in.')
      return
    }
    // Otherwise the auth listener swaps to the app automatically.
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
        <h1>Create your account</h1>
        <p className="auth-subtitle">Your training, backed up and synced.</p>

        {status === 'done' ? (
          <div className="auth-success" role="status">
            <p>{message}</p>
            <button
              className="workout-primary-button"
              onClick={() => onSwitch('login')}
              type="button"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-field">
                Name
                <input
                  autoComplete="name"
                  onChange={(event) => setName(event.target.value)}
                  type="text"
                  value={name}
                />
              </label>
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
                  autoComplete="new-password"
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </label>
              <label className="auth-field">
                Confirm password
                <input
                  autoComplete="new-password"
                  onChange={(event) => setConfirm(event.target.value)}
                  required
                  type="password"
                  value={confirm}
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
                <UserPlus size={19} strokeWidth={2.4} aria-hidden="true" />
                {status === 'loading' ? 'Creating...' : 'Register'}
              </button>
            </form>

            <div className="auth-links">
              <span>
                Already have an account?{' '}
                <button onClick={() => onSwitch('login')} type="button">
                  Sign in
                </button>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
