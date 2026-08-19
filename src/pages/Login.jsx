import { Dumbbell, LogIn } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { LanguageToggle } from '../components/LanguageToggle'
import { useT } from '../i18n'

export function Login({ onSwitch }) {
  const { signIn } = useAuth()
  const t = useT()
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
      setMessage(error.message || t('auth.login.failed'))
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
          {t('brand.name')}
        </div>
        {/* The sign-in screens are the first thing a new visitor sees, and
            Settings is behind them, so the picker travels with them. */}
        <LanguageToggle variant="segmented" className="auth-language" />
        <h1>{t('auth.login.title')}</h1>
        <p className="auth-subtitle">{t('auth.login.subtitle')}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            {t('auth.email')}
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="auth-field">
            {t('auth.password')}
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
            {status === 'loading'
              ? t('auth.login.submitting')
              : t('auth.login.submit')}
          </button>
        </form>

        <div className="auth-links">
          <button onClick={() => onSwitch('forgot')} type="button">
            {t('auth.login.forgot')}
          </button>
          <span>
            {t('auth.login.newHere')}{' '}
            <button onClick={() => onSwitch('register')} type="button">
              {t('auth.login.createAccount')}
            </button>
          </span>
        </div>
      </div>
    </div>
  )
}
