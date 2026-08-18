import { CalendarDays, Dumbbell, Settings as SettingsIcon } from 'lucide-react'
import { useMemo } from 'react'
import { ProfileAvatar } from '../components/ProfileAvatar'
import { useProfileIdentity } from '../hooks/useProfileIdentity'
import { getActiveWorkoutProgram } from '../utils/activeWorkoutProgram'
import { getCurrentWorkoutStreak, getWorkoutSessions } from '../utils/progressUtils'
import { getUserProfileSettings } from '../utils/settingsUtils'
import type { PageId } from '../types/navigation'

interface ProfileProps {
  onNavigate: (page: PageId) => void
}

interface ProfileRow {
  label: string
  value: string
}

/**
 * Who the app thinks you are, read-only.
 *
 * Settings is where these are edited; this is the page you open to check what
 * is on file without walking through a form.
 */
export function Profile({ onNavigate }: ProfileProps) {
  const { avatarDataUrl, initials, name } = useProfileIdentity()
  const settings = useMemo(() => getUserProfileSettings(), [])
  const program = useMemo(() => getActiveWorkoutProgram(), [])
  const sessions = useMemo(() => getWorkoutSessions(), [])
  const streak = useMemo(() => getCurrentWorkoutStreak(sessions), [sessions])
  const profile = settings.profile

  const rows: ProfileRow[] = [
    { label: 'Height', value: unit(profile.heightCm, 'cm') },
    { label: 'Weight', value: unit(profile.currentWeightKg, 'kg') },
    { label: 'Goal weight', value: goalWeight(profile) },
    { label: 'Training goal', value: text(profile.trainingGoal) },
    { label: 'Main focus', value: text(profile.mainFocus) },
    { label: 'Experience', value: text(profile.experienceLevel) },
    { label: 'Time per day', value: text(profile.trainingTimePerDay) },
  ]

  return (
    <section className="profile-page">
      <header className="profile-page__head">
        <ProfileAvatar
          avatarDataUrl={avatarDataUrl}
          className="profile-avatar--page"
          initials={initials}
          size={84}
        />
        <h1>{name || 'Your profile'}</h1>
        <p>Personal workout profile</p>
      </header>

      <div className="profile-stats">
        <div className="profile-stat">
          <Dumbbell size={18} strokeWidth={2.2} aria-hidden="true" />
          <strong>{sessions.length}</strong>
          <span>workouts</span>
        </div>
        <div className="profile-stat">
          <CalendarDays size={18} strokeWidth={2.2} aria-hidden="true" />
          <strong>{streak}</strong>
          <span>day streak</span>
        </div>
      </div>

      <article className="profile-card">
        <p className="eyebrow">Current plan</p>
        <h2>{program.programName}</h2>
        <p className="profile-card__meta">
          {[
            program.programVersion ? `Version ${program.programVersion}` : '',
            program.durationWeeks ? `${program.durationWeeks} weeks` : '',
            `${program.days.length} days`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </article>

      <article className="profile-card">
        <p className="eyebrow">Details</p>
        <dl className="profile-rows">
          {rows.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </article>

      <button
        className="workout-primary-button"
        onClick={() => onNavigate('settings')}
        type="button"
      >
        <SettingsIcon size={18} strokeWidth={2.4} aria-hidden="true" />
        Edit in settings
      </button>
    </section>
  )
}

function unit(value: unknown, suffix: string): string {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? `${parsed} ${suffix}` : 'Not set'
}

function goalWeight(profile: {
  goalWeightMinKg?: unknown
  goalWeightMaxKg?: unknown
}): string {
  const min = Number(profile.goalWeightMinKg)
  const max = Number(profile.goalWeightMaxKg)
  const hasMin = Number.isFinite(min) && min > 0
  const hasMax = Number.isFinite(max) && max > 0

  if (hasMin && hasMax) {
    return min === max ? `${min} kg` : `${min}-${max} kg`
  }
  if (hasMin) return `${min} kg`
  if (hasMax) return `${max} kg`
  return 'Not set'
}

function text(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value.trim() : 'Not set'
}
