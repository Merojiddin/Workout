import { navigationItems } from '../data/navigation'
import { useProfileIdentity } from '../hooks/useProfileIdentity'
import { ProfileAvatar } from './ProfileAvatar'
import type { PageId } from '../types/navigation'

interface BottomNavProps {
  activePage: PageId
  onNavigate: (page: PageId) => void
}

export function BottomNav({ activePage, onNavigate }: BottomNavProps) {
  const { avatarDataUrl, firstName, initials, name } = useProfileIdentity()

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
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
            <span>{item.shortLabel ?? item.label}</span>
          </button>
        )
      })}

      {/* The account tab: photo and name, the way every other app puts it, and
          it opens Settings. */}
      <button
        aria-current={activePage === 'settings' ? 'page' : undefined}
        aria-label={`${name || 'Profile'} - open settings`}
        className="bottom-nav__button bottom-nav__button--profile"
        onClick={() => onNavigate('settings')}
        type="button"
      >
        <ProfileAvatar
          avatarDataUrl={avatarDataUrl}
          className="profile-avatar--nav"
          initials={initials}
          size={22}
        />
        <span>{firstName || 'Profile'}</span>
      </button>
    </nav>
  )
}
