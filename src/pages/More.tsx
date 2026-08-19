import { ChevronRight } from 'lucide-react'
import { moreNavigationItems } from '../data/navigation'
import { useT } from '../i18n'
import type { PageId } from '../types/navigation'

interface MoreProps {
  onNavigate: (page: PageId) => void
}

/**
 * A plain list of the reference pages. Deliberately has no cards, stats or
 * charts of its own: everything here is a destination, not information.
 */
export function More({ onNavigate }: MoreProps) {
  const t = useT()

  return (
    <section className="more-page">
      <header className="more-page__head">
        <h1>{t('more.title')}</h1>
        <p>{t('more.subtitle')}</p>
      </header>

      <nav className="more-list" aria-label={t('nav.morePages')}>
        {moreNavigationItems.map((item) => {
          const Icon = item.icon

          return (
            <button
              className="more-list__item"
              key={item.id}
              onClick={() => onNavigate(item.id)}
              type="button"
            >
              <span className="more-list__icon" aria-hidden="true">
                <Icon size={19} strokeWidth={2.3} />
              </span>
              <span className="more-list__text">
                <strong>{t(item.labelKey)}</strong>
                {item.descriptionKey ? <small>{t(item.descriptionKey)}</small> : null}
              </span>
              <ChevronRight
                size={18}
                strokeWidth={2.4}
                aria-hidden="true"
                className="more-list__chevron"
              />
            </button>
          )
        })}
      </nav>
    </section>
  )
}
