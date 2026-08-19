import { Dumbbell, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { LanguageToggle } from '../components/LanguageToggle'
import { useT } from '../i18n'

export function Register({ onSwitch }) {
  const { signUp } = useAuth()
  const t = useT()
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
      setMessage(t('auth.register.tooShort'))
      return
    }
    if (password !== confirm) {
      setStatus('error')
      setMessage(t('auth.register.mismatch'))
      return
    }

    setStatus('loading')
    const { data, error } = await signUp(email.trim(), password, name.trim())
    if (error) {
      setStatus('error')
      setMessage(error.message || t('auth.register.failed'))
      return
    }

    // If email confirmation is on, there is no session yet.
    if (!data?.session) {
      setStatus('done')
      setMessage(t('auth.register.confirmEmail'))
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
          {t('brand.name')}
        </div>
        {/* The sign-in screens are the first thing a new visitor sees, and
            Settings is behind them, so the picker travels with them. */}
        <LanguageToggle variant="segmented" className="auth-language" />
        <h1>{t('auth.register.title')}</h1>
        <p className="auth-subtitle">{t('auth.register.subtitle')}</p>

        {status === 'done' ? (
          <div className="auth-success" role="status">
            <p>{message}</p>
            <button
              className="workout-primary-button"
              onClick={() => onSwitch('login')}
              type="button"
            >
              {t('auth.backToSignIn')}
            </button>
          </div>
        ) : (
          <>
            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-field">
                {t('auth.name')}
                <input
                  autoComplete="name"
                  onChange={(event) => setName(event.target.value)}
                  type="text"
                  value={name}
                />
              </label>
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
                  autoComplete="new-password"
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </label>
              <label className="auth-field">
                {t('auth.confirmPassword')}
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
                {status === 'loading'
                  ? t('auth.register.submitting')
                  : t('auth.register.submit')}
              </button>
            </form>

            <div className="auth-links">
              <span>
                {t('auth.register.haveAccount')}{' '}
                <button onClick={() => onSwitch('login')} type="button">
                  {t('auth.login.submit')}
                </button>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
