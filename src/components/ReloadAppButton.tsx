import { RotateCw } from 'lucide-react'
import { useState } from 'react'
import { useT } from '../i18n'
import { reloadWithLatestBuild } from '../utils/appUpdates'

/**
 * Restarts the app on the newest build.
 *
 * The app already updates itself in the background, but only when it is put
 * down or resumed. This sits next to the language picker for the moment
 * someone knows a change has shipped and wants it on screen now, rather than
 * closing the app or reinstalling it to force the issue.
 *
 * The press is one-way - the page is about to be replaced - so the button
 * spins and disables itself instead of pretending it can be taken back. An
 * in-progress workout is written to storage as it is logged, so nothing on
 * screen is lost by reloading over it.
 */
export function ReloadAppButton({ className = '' }: { className?: string }) {
  const t = useT()
  const [reloading, setReloading] = useState(false)

  return (
    <button
      aria-label={t('appReload.label')}
      className={`app-reload-button ${className}`.trim()}
      data-reloading={reloading ? 'true' : undefined}
      disabled={reloading}
      onClick={() => {
        setReloading(true)
        void reloadWithLatestBuild()
      }}
      title={t('appReload.title')}
      type="button"
    >
      <RotateCw size={17} strokeWidth={2.5} aria-hidden="true" />
    </button>
  )
}
