import {
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Cloud,
  Database,
  Hammer,
  RotateCcw,
  Route,
  Smartphone,
  TabletSmartphone,
} from 'lucide-react'
import { useState } from 'react'
import {
  PRE_DEPLOY_CHECKLIST_KEY,
  safeGetJSON,
  safeSetJSON,
} from '../utils/storageUtils'
import { useT } from '../i18n'

/**
 * Step 20 - manual pre-deploy checklist.
 *
 * Checked state persists per-browser in localStorage (preDeployChecklist)
 * so progress survives reloads while working through a release.
 */

const CHECKLIST_GROUPS = [
  {
    id: 'build',
    titleKey: 'checklist.group.build',
    icon: Hammer,
    items: [
      { id: 'build-install', labelKey: 'checklist.item.build-install' },
      { id: 'build-build', labelKey: 'checklist.item.build-build' },
      { id: 'build-preview', labelKey: 'checklist.item.build-preview' },
    ],
  },
  {
    id: 'routing',
    titleKey: 'checklist.group.routing',
    icon: Route,
    items: [
      { id: 'route-dashboard', labelKey: 'checklist.item.route-dashboard' },
      { id: 'route-progress', labelKey: 'checklist.item.route-progress' },
      { id: 'route-nutrition', labelKey: 'checklist.item.route-nutrition' },
      { id: 'route-settings', labelKey: 'checklist.item.route-settings' },
    ],
  },
  {
    id: 'supabase',
    titleKey: 'checklist.group.supabase',
    icon: Cloud,
    items: [
      { id: 'supabase-login', labelKey: 'checklist.item.supabase-login' },
      { id: 'supabase-register', labelKey: 'checklist.item.supabase-register' },
      { id: 'supabase-workout-sync', labelKey: 'checklist.item.supabase-workout-sync' },
      { id: 'supabase-checkin-sync', labelKey: 'checklist.item.supabase-checkin-sync' },
      { id: 'supabase-nutrition-sync', labelKey: 'checklist.item.supabase-nutrition-sync' },
      { id: 'supabase-photo-upload', labelKey: 'checklist.item.supabase-photo-upload' },
    ],
  },
  {
    id: 'pwa',
    titleKey: 'checklist.group.pwa',
    icon: Smartphone,
    items: [
      { id: 'pwa-install', labelKey: 'checklist.item.pwa-install' },
      { id: 'pwa-offline-dashboard', labelKey: 'checklist.item.pwa-offline-dashboard' },
      { id: 'pwa-offline-logging', labelKey: 'checklist.item.pwa-offline-logging' },
    ],
  },
  {
    id: 'data',
    titleKey: 'checklist.group.data',
    icon: Database,
    items: [
      { id: 'data-export-json', labelKey: 'checklist.item.data-export-json' },
      { id: 'data-import', labelKey: 'checklist.item.data-import' },
      { id: 'data-export-csv', labelKey: 'checklist.item.data-export-csv' },
      { id: 'data-print-plan', labelKey: 'checklist.item.data-print-plan' },
    ],
  },
  {
    id: 'mobile',
    titleKey: 'checklist.group.mobile',
    icon: TabletSmartphone,
    items: [
      { id: 'mobile-today-workout', labelKey: 'checklist.item.mobile-today-workout' },
      { id: 'mobile-video-inline', labelKey: 'checklist.item.mobile-video-inline' },
      { id: 'mobile-bottom-nav', labelKey: 'checklist.item.mobile-bottom-nav' },
      { id: 'mobile-forms', labelKey: 'checklist.item.mobile-forms' },
    ],
  },
]

const TOTAL_ITEMS = CHECKLIST_GROUPS.reduce(
  (total, group) => total + group.items.length,
  0,
)

export function PreDeployChecklist() {
  const t = useT()
  const [checked, setChecked] = useState(() => readCheckedState())
  const checkedCount = Object.values(checked).filter(Boolean).length
  const allDone = checkedCount === TOTAL_ITEMS

  function toggleItem(itemId) {
    setChecked((current) => {
      const next = { ...current, [itemId]: !current[itemId] }
      safeSetJSON(PRE_DEPLOY_CHECKLIST_KEY, next)
      return next
    })
  }

  function resetChecklist() {
    if (!window.confirm(t('checklist.resetConfirm'))) {
      return
    }
    safeSetJSON(PRE_DEPLOY_CHECKLIST_KEY, {})
    setChecked({})
  }

  return (
    <section className="predeploy-page">
      <header className="progress-hero">
        <div>
          <p className="eyebrow">{t('checklist.eyebrow')}</p>
          <h1>{t('checklist.title')}</h1>
          <p>{t('checklist.subtitle')}</p>
        </div>
        <button
          className="workout-secondary-button"
          onClick={resetChecklist}
          type="button"
        >
          <RotateCcw size={19} strokeWidth={2.4} aria-hidden="true" />
          {t('checklist.reset')}
        </button>
      </header>

      <div
        className={`settings-notice${allDone ? ' predeploy-notice--done' : ''}`}
        role="status"
      >
        <ClipboardCheck size={18} strokeWidth={2.4} aria-hidden="true" />
        {allDone
          ? t('checklist.allDone', { total: TOTAL_ITEMS })
          : t('checklist.progress', {
              done: checkedCount,
              total: TOTAL_ITEMS,
            })}
      </div>

      <div className="predeploy-grid">
        {CHECKLIST_GROUPS.map((group) => {
          const Icon = group.icon
          const groupDone = group.items.filter((item) => checked[item.id]).length
          return (
            <article className="dashboard-card predeploy-card" key={group.id}>
              <div className="card-heading">
                <div>
                  <p className="eyebrow">{t(group.titleKey)}</p>
                  <h2>
                    {t('checklist.groupChecked', {
                      done: groupDone,
                      total: group.items.length,
                    })}
                  </h2>
                </div>
                <Icon size={22} strokeWidth={2.4} aria-hidden="true" />
              </div>

              <ul className="predeploy-items">
                {group.items.map((item) => {
                  const isChecked = Boolean(checked[item.id])
                  return (
                    <li key={item.id}>
                      <button
                        aria-pressed={isChecked}
                        className={`predeploy-item${
                          isChecked ? ' predeploy-item--checked' : ''
                        }`}
                        onClick={() => toggleItem(item.id)}
                        type="button"
                      >
                        {isChecked ? (
                          <CheckCircle2 size={19} strokeWidth={2.4} aria-hidden="true" />
                        ) : (
                          <Circle size={19} strokeWidth={2.4} aria-hidden="true" />
                        )}
                        <span>{t(item.labelKey)}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function readCheckedState() {
  const stored = safeGetJSON(PRE_DEPLOY_CHECKLIST_KEY, {})
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
    return {}
  }
  return stored
}
