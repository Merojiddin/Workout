import { Dumbbell } from 'lucide-react'
import { navigationItems } from '../data/navigation'
import { useProfileIdentity } from '../hooks/useProfileIdentity'
import { useT } from '../i18n'
import { ProfileAvatar } from './ProfileAvatar'
import type { PageId } from '../types/navigation'

interface SidebarProps {
  activePage: PageId
  onNavigate: (page: PageId) => void
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { avatarDataUrl, initials, name } = useProfileIdentity()
  const t = useT()
  const profileLabel = t('nav.profile')

  return (
    <aside className="sidebar" aria-label={t('nav.main')}>
      <div className="brand-mark">
        <span className="brand-mark__icon" aria-hidden="true">
          <Dumbbell size={22} strokeWidth={2.4} />
        </span>
        <span>{t('brand.name')}</span>
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
              <span>{t(item.labelKey)}</span>
            </button>
          )
        })}

        {/* Same account entry as the mobile bar, so both navs agree. */}
        <button
          aria-current={activePage === 'profile' ? 'page' : undefined}
          aria-label={t('nav.openProfile', { name: name || profileLabel })}
          className="nav-button nav-button--profile"
          onClick={() => onNavigate('profile')}
          type="button"
        >
          <ProfileAvatar
            avatarDataUrl={avatarDataUrl}
            initials={initials}
            size={26}
          />
          <span>{name || profileLabel}</span>
        </button>
      </nav>
    </aside>
  )
}
