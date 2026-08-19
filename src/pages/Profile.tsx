import { CalendarDays, Dumbbell, Settings as SettingsIcon } from 'lucide-react'
import { useMemo } from 'react'
import { ProfileAvatar } from '../components/ProfileAvatar'
import { useT, type TranslateFn } from '../i18n'
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
  const t = useT()
  const settings = useMemo(() => getUserProfileSettings(), [])
  const program = useMemo(() => getActiveWorkoutProgram(), [])
  const sessions = useMemo(() => getWorkoutSessions(), [])
  const streak = useMemo(() => getCurrentWorkoutStreak(sessions), [sessions])
  const profile = settings.profile

  const rows: ProfileRow[] = [
    { label: t('profile.height'), value: unit(profile.heightCm, t('unit.cm'), t) },
    {
      label: t('profile.weight'),
      value: unit(profile.currentWeightKg, t('unit.kg'), t),
    },
    { label: t('profile.goalWeight'), value: goalWeight(profile, t) },
    { label: t('profile.trainingGoal'), value: text(profile.trainingGoal, t) },
    { label: t('profile.mainFocus'), value: text(profile.mainFocus, t) },
    { label: t('profile.experience'), value: text(profile.experienceLevel, t) },
    {
      label: t('profile.timePerDay'),
      value: text(profile.trainingTimePerDay, t),
    },
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
        <h1>{name || t('profile.title')}</h1>
        <p>{t('profile.subtitle')}</p>
      </header>

      <div className="profile-stats">
        <div className="profile-stat">
          <Dumbbell size={18} strokeWidth={2.2} aria-hidden="true" />
          <strong>{sessions.length}</strong>
          <span>{t('profile.workouts')}</span>
        </div>
        <div className="profile-stat">
          <CalendarDays size={18} strokeWidth={2.2} aria-hidden="true" />
          <strong>{streak}</strong>
          <span>{t('profile.dayStreak')}</span>
        </div>
      </div>

      <article className="profile-card">
        <p className="eyebrow">{t('profile.currentPlan')}</p>
        <h2>{program.programName}</h2>
        <p className="profile-card__meta">
          {[
            program.programVersion
              ? t('profile.planVersion', { version: program.programVersion })
              : '',
            program.durationWeeks
              ? t('profile.planWeeks', { count: program.durationWeeks })
              : '',
            t('profile.planDays', { count: program.days.length }),
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </article>

      <article className="profile-card">
        <p className="eyebrow">{t('profile.details')}</p>
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
        {t('profile.editInSettings')}
      </button>
    </section>
  )
}

function unit(value: unknown, suffix: string, t: TranslateFn): string {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0
    ? t('profile.valueWithUnit', { value: parsed, unit: suffix })
    : t('state.notSet')
}

function goalWeight(
  profile: {
    goalWeightMinKg?: unknown
    goalWeightMaxKg?: unknown
  },
  t: TranslateFn,
): string {
  const min = Number(profile.goalWeightMinKg)
  const max = Number(profile.goalWeightMaxKg)
  const hasMin = Number.isFinite(min) && min > 0
  const hasMax = Number.isFinite(max) && max > 0
  const kg = t('unit.kg')

  if (hasMin && hasMax) {
    return min === max
      ? t('profile.valueWithUnit', { value: min, unit: kg })
      : t('profile.goalWeightRange', { min, max })
  }
  if (hasMin) return t('profile.valueWithUnit', { value: min, unit: kg })
  if (hasMax) return t('profile.valueWithUnit', { value: max, unit: kg })
  return t('state.notSet')
}

function text(value: unknown, t: TranslateFn): string {
  return typeof value === 'string' && value.trim()
    ? value.trim()
    : t('state.notSet')
}
