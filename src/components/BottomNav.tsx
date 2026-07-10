import { mobileNavigationItems } from '../data/navigation'
import type { PageId } from '../types/navigation'

interface BottomNavProps {
  activePage: PageId
  onNavigate: (page: PageId) => void
}

export function BottomNav({ activePage, onNavigate }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {mobileNavigationItems.map((item) => {
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
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
