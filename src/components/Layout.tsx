import type { PropsWithChildren } from 'react'
import { BottomNav } from './BottomNav'
import { DataModeIndicator } from './DataModeIndicator'
import { NotificationCenter } from './NotificationCenter'
import { OfflineBanner } from './OfflineBanner'
import { Sidebar } from './Sidebar'
import type { PageId } from '../types/navigation'

interface LayoutProps extends PropsWithChildren {
  activePage: PageId
  onNavigate: (page: PageId) => void
  syncMessage?: string | null
  syncTone?: string
}

export function Layout({
  activePage,
  children,
  onNavigate,
  syncMessage,
  syncTone,
}: LayoutProps) {
  return (
    <div className={`app-shell app-shell--${activePage}`}>
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <main className="app-main">
        <OfflineBanner syncMessage={syncMessage} syncTone={syncTone} />
        <div className="app-main__topbar">
          <NotificationCenter />
          <DataModeIndicator />
        </div>
        {children}
      </main>
      <BottomNav activePage={activePage} onNavigate={onNavigate} />
    </div>
  )
}
