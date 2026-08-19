import { Dumbbell, KeyRound } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { LanguageToggle } from '../components/LanguageToggle'
import { useT } from '../i18n'

const MIN_PASSWORD_LENGTH = 8

/**
 * Shown after the user opens a password-reset link. Supabase has already
 * signed them in with a recovery session at that point, so this screen only
 * has to set the new password.
 */
export function UpdatePassword() {
  const { updatePassword } = useAuth()
  const t = useT()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | error | done
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    if (password.length < MIN_PASSWORD_LENGTH) {
      setStatus('error')
      setMessage(t('auth.update.tooShort', { count: MIN_PASSWORD_LENGTH }))
      return
    }
    if (password !== confirmPassword) {
      setStatus('error')
      setMessage(t('auth.update.mismatch'))
      return
    }

    setStatus('loading')
    setMessage('')

    const { error } = await updatePassword(password)
    if (error) {
      setStatus('error')
      setMessage(error.message || t('auth.update.failed'))
      return
    }

    setStatus('done')
    setMessage(t('auth.update.done'))
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
        <h1>{t('auth.update.title')}</h1>
        <p className="auth-subtitle">{t('auth.update.subtitle')}</p>

        {status === 'done' ? (
          <div className="auth-success" role="status">
            <p>{message}</p>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              {t('auth.newPassword')}
              <input
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </label>

            <label className="auth-field">
              {t('auth.confirmNewPassword')}
              <input
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                type="password"
                value={confirmPassword}
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
              <KeyRound size={19} strokeWidth={2.4} aria-hidden="true" />
              {status === 'loading'
                ? t('auth.update.submitting')
                : t('auth.update.submit')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
