import { Dumbbell } from 'lucide-react'
import { navigationItems } from '../data/navigation'
import { useProfileIdentity } from '../hooks/useProfileIdentity'
import { ProfileAvatar } from './ProfileAvatar'
import type { PageId } from '../types/navigation'

interface SidebarProps {
  activePage: PageId
  onNavigate: (page: PageId) => void
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { avatarDataUrl, initials, name } = useProfileIdentity()

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <div className="brand-mark">
        <span className="brand-mark__icon" aria-hidden="true">
          <Dumbbell size={22} strokeWidth={2.4} />
        </span>
        <span>Workout OS</span>
      </div>

      <nav className="nav-list">
        {navigationItems.map((item) => {
          const Icon = item.icon

          return (
            <button
              aria-current={activePage === item.id ? 'page' : undefined}
              className="nav-button"
              key={item.id}
              onClick={() => onNavigate(item.id)}
              type="button"
            >
              <Icon size={18} strokeWidth={2.2} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          )
        })}

        {/* Same account entry as the mobile bar, so both navs agree. */}
        <button
          aria-current={activePage === 'profile' ? 'page' : undefined}
          aria-label={`${name || 'Profile'} - open your profile`}
          className="nav-button nav-button--profile"
          onClick={() => onNavigate('profile')}
          type="button"
        >
          <ProfileAvatar
            avatarDataUrl={avatarDataUrl}
            initials={initials}
            size={26}
          />
          <span>{name || 'Profile'}</span>
        </button>
      </nav>
    </aside>
  )
}
