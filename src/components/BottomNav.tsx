import { navigationItems } from '../data/navigation'
import { useProfileIdentity } from '../hooks/useProfileIdentity'
import { useT } from '../i18n'
import { ProfileAvatar } from './ProfileAvatar'
import type { PageId } from '../types/navigation'

interface BottomNavProps {
  activePage: PageId
  onNavigate: (page: PageId) => void
}

export function BottomNav({ activePage, onNavigate }: BottomNavProps) {
  const { avatarDataUrl, firstName, initials, name } = useProfileIdentity()
  const t = useT()
  const profileLabel = t('nav.profile')

  return (
    <nav className="bottom-nav" aria-label={t('nav.mobile')}>
      {navigationItems.map((item) => {
        const Icon = item.icon

        return (
          <button
            aria-current={activePage === item.id ? 'page' : undefined}
            className="bottom-nav__button"
            key={item.id}
            onClick={() => onNavigate(item.id)}
            type="button"
          >
            <Icon size={19} strokeWidth={2.3} aria-hidden="true" />
            <span>{t(item.shortLabelKey ?? item.labelKey)}</span>
          </button>
        )
      })}

      {/* The account tab: photo and name, the way every other app puts it. */}
      <button
        aria-current={activePage === 'profile' ? 'page' : undefined}
        aria-label={t('nav.openProfile', { name: name || profileLabel })}
        className="bottom-nav__button bottom-nav__button--profile"
        onClick={() => onNavigate('profile')}
        type="button"
      >
        <ProfileAvatar
          avatarDataUrl={avatarDataUrl}
          className="profile-avatar--nav"
          initials={initials}
          size={22}
        />
        <span>{firstName || profileLabel}</span>
      </button>
    </nav>
  )
}
