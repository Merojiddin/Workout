import { Dumbbell, Mail } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export function ForgotPassword({ onSwitch }) {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | error | done
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('loading')
    setMessage('')

    const { error } = await resetPassword(email.trim())
    if (error) {
      setStatus('error')
      setMessage(error.message || 'Could not send the reset link.')
      return
    }

    setStatus('done')
    setMessage('If that email exists, a password reset link is on its way.')
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
        <h1>Reset password</h1>
        <p className="auth-subtitle">
          Enter your email and we'll send a reset link.
        </p>

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
                Email
                <input
                  autoComplete="email"
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  value={email}
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
                <Mail size={19} strokeWidth={2.4} aria-hidden="true" />
                {status === 'loading' ? 'Sending...' : 'Send reset link'}
              </button>
            </form>

            <div className="auth-links">
              <button onClick={() => onSwitch('login')} type="button">
                Back to sign in
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
