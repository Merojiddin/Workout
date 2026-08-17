import type { PropsWithChildren } from 'react'
import { ArrowLeft } from 'lucide-react'
import { BottomNav } from './BottomNav'
import { NotificationCenter } from './NotificationCenter'
import { OfflineBanner } from './OfflineBanner'
import { Sidebar } from './Sidebar'
import type { PageId } from '../types/navigation'

interface LayoutProps extends PropsWithChildren {
  activePage: PageId
  canGoBack: boolean
  onBack: () => void
  onNavigate: (page: PageId) => void
  syncMessage?: string | null
  syncTone?: string
}

export function Layout({
  activePage,
  canGoBack,
  children,
  onBack,
  onNavigate,
  syncMessage,
  syncTone,
}: LayoutProps) {
  return (
    <div className={`app-shell app-shell--${activePage}`}>
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <main className="app-main">
        <OfflineBanner syncMessage={syncMessage} syncTone={syncTone} />
        {/* Local/cloud storage mode used to sit here as a permanent pill. It is
            status, not an action, so it now lives in Settings > Cloud Sync. */}
        <div className="app-main__topbar">
          {canGoBack ? (
            <button
              aria-label="Go back to the previous page"
              className="app-back-button"
              onClick={onBack}
              type="button"
            >
              <ArrowLeft size={17} strokeWidth={2.4} aria-hidden="true" />
              <span>Back</span>
            </button>
          ) : null}
          <NotificationCenter />
        </div>
        {children}
      </main>
      <BottomNav activePage={activePage} onNavigate={onNavigate} />
    </div>
  )
}
