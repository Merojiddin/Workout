import { UserRound } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { nicknameFromEmail } from '../hooks/useProfileIdentity'
import {
  getUserProfileSettings,
  markProfileOnboardingCompleted,
  saveUserProfileSettings,
} from '../utils/settingsUtils'

interface ProfileSetupProps {
  onDone: () => void
}

/** Only what the app actually uses to show progress. Everything else lives in Settings. */
const fields = [
  { id: 'heightCm', label: 'Height', unit: 'cm', step: '1' },
  { id: 'currentWeightKg', label: 'Current weight', unit: 'kg', step: '0.1' },
  { id: 'goalWeightMinKg', label: 'Goal weight from', unit: 'kg', step: '0.1' },
  { id: 'goalWeightMaxKg', label: 'Goal weight to', unit: 'kg', step: '0.1' },
] as const

/**
 * Second step of first-run setup, shown once per account after a program is
 * installed.
 *
 * The profile ships empty - no name, no measurements - because the app never
 * shows one person's data to another. That leaves Body Check-in with nothing
 * to compare against, so this asks for the few numbers those screens use. It
 * is skippable on purpose: the app works without them and Settings > Profile
 * can fill them in later.
 */
export function ProfileSetup({ onDone }: ProfileSetupProps) {
  const { user } = useAuth()
  // Skipping is fine: the email's local part becomes the nickname until a name
  // is entered, so the placeholder shows the person what they will be called.
  const emailNickname = nicknameFromEmail(user?.email)
  const [name, setName] = useState('')
  const [values, setValues] = useState<Record<string, string>>({})

  function finish(save: boolean) {
    if (save) {
      const current = getUserProfileSettings()
      saveUserProfileSettings({
        ...current,
        profile: {
          ...current.profile,
          name: name.trim(),
          // Blanks stay blank: the normalizer turns '' into null rather than
          // into a claimed measurement of 0.
          ...Object.fromEntries(
            fields.map((field) => [field.id, values[field.id] ?? '']),
          ),
        },
      })
    }

    markProfileOnboardingCompleted()
    onDone()
  }

  const hasAnything =
    name.trim() !== '' || fields.some((field) => (values[field.id] ?? '') !== '')

  return (
    <div className="program-setup profile-setup">
      <div className="program-setup__brand" aria-hidden="true">
        <UserRound size={26} strokeWidth={2.4} />
      </div>
      <p className="profile-setup__step">Step 2 of 2</p>
      <h1>A little about you</h1>
      <p className="program-setup__subtitle">
        Body Check-in and your printed plan use these to show progress against a
        goal. Nothing here is shared, and you can change or add it any time in
        Settings &rsaquo; Profile.
      </p>

      <label className="settings-field">
        Name
        <input
          autoComplete="name"
          className="settings-input"
          onChange={(event) => setName(event.target.value)}
          placeholder={emailNickname || 'What should we call you?'}
          type="text"
          value={name}
        />
      </label>

      <div className="profile-setup__grid">
        {fields.map((field) => (
          <label className="settings-field" key={field.id}>
            {`${field.label} ${field.unit}`}
            <input
              className="settings-input"
              min={0}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [field.id]: event.target.value,
                }))
              }
              step={field.step}
              type="number"
              value={values[field.id] ?? ''}
            />
          </label>
        ))}
      </div>

      <button
        className="workout-primary-button program-setup__install"
        onClick={() => finish(true)}
        type="button"
      >
        {hasAnything ? 'Save and continue' : 'Continue'}
      </button>
      <button
        className="profile-setup__skip"
        onClick={() => finish(false)}
        type="button"
      >
        Skip for now
      </button>
    </div>
  )
}
