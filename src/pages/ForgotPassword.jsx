import { Dumbbell, Mail } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { LanguageToggle } from '../components/LanguageToggle'
import { useT } from '../i18n'

export function ForgotPassword({ onSwitch }) {
  const { resetPassword } = useAuth()
  const t = useT()
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
      setMessage(error.message || t('auth.forgot.failed'))
      return
    }

    setStatus('done')
    setMessage(t('auth.forgot.sent'))
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
        <LanguageToggle variant="segmented" className="auth-language" />
        <h1>{t('auth.forgot.title')}</h1>
        <p className="auth-subtitle">{t('auth.forgot.subtitle')}</p>

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
                {t('auth.email')}
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
                {status === 'loading'
                  ? t('auth.forgot.submitting')
                  : t('auth.forgot.submit')}
              </button>
            </form>

            <div className="auth-links">
              <button onClick={() => onSwitch('login')} type="button">
                {t('auth.backToSignIn')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
