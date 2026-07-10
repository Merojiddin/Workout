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

/**
 * Step 20 - manual pre-deploy checklist.
 *
 * Checked state persists per-browser in localStorage (preDeployChecklist)
 * so progress survives reloads while working through a release.
 */

const CHECKLIST_GROUPS = [
  {
    id: 'build',
    title: 'Build',
    icon: Hammer,
    items: [
      { id: 'build-install', label: 'npm install completed without errors' },
      { id: 'build-build', label: 'npm run build passes' },
      { id: 'build-preview', label: 'npm run preview works locally' },
    ],
  },
  {
    id: 'routing',
    title: 'Routing',
    icon: Route,
    items: [
      { id: 'route-dashboard', label: 'Refresh /dashboard works (no 404)' },
      { id: 'route-progress', label: 'Refresh /progress works (no 404)' },
      { id: 'route-nutrition', label: 'Refresh /nutrition works (no 404)' },
      { id: 'route-settings', label: 'Refresh /settings works (no 404)' },
    ],
  },
  {
    id: 'supabase',
    title: 'Supabase',
    icon: Cloud,
    items: [
      { id: 'supabase-login', label: 'Login works' },
      { id: 'supabase-register', label: 'Register works' },
      { id: 'supabase-workout-sync', label: 'Workout sync works' },
      { id: 'supabase-checkin-sync', label: 'Body check-in sync works' },
      { id: 'supabase-nutrition-sync', label: 'Nutrition sync works' },
      { id: 'supabase-photo-upload', label: 'Photo upload works' },
    ],
  },
  {
    id: 'pwa',
    title: 'PWA',
    icon: Smartphone,
    items: [
      { id: 'pwa-install', label: 'App install works' },
      { id: 'pwa-offline-dashboard', label: 'Offline dashboard works' },
      { id: 'pwa-offline-logging', label: 'Offline workout logging works' },
    ],
  },
  {
    id: 'data',
    title: 'Data',
    icon: Database,
    items: [
      { id: 'data-export-json', label: 'Export JSON backup works' },
      { id: 'data-import', label: 'Import backup works' },
      { id: 'data-export-csv', label: 'CSV export works' },
      { id: 'data-print-plan', label: 'Print weekly plan works' },
    ],
  },
  {
    id: 'mobile',
    title: 'Mobile',
    icon: TabletSmartphone,
    items: [
      { id: 'mobile-today-workout', label: 'TodayWorkout usable on phone' },
      { id: 'mobile-video-inline', label: 'Exercise video opens inline' },
      { id: 'mobile-bottom-nav', label: 'Bottom nav works' },
      { id: 'mobile-forms', label: 'Forms readable on small screens' },
    ],
  },
]

const TOTAL_ITEMS = CHECKLIST_GROUPS.reduce(
  (total, group) => total + group.items.length,
  0,
)

export function PreDeployChecklist() {
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
    if (!window.confirm('Reset the whole pre-deploy checklist?')) {
      return
    }
    safeSetJSON(PRE_DEPLOY_CHECKLIST_KEY, {})
    setChecked({})
  }

  return (
    <section className="predeploy-page">
      <header className="progress-hero">
        <div>
          <p className="eyebrow">Deployment</p>
          <h1>Pre-deploy checklist</h1>
          <p>
            Work through every item before shipping to production. Progress is
            saved in this browser.
          </p>
        </div>
        <button
          className="workout-secondary-button"
          onClick={resetChecklist}
          type="button"
        >
          <RotateCcw size={19} strokeWidth={2.4} aria-hidden="true" />
          Reset Checklist
        </button>
      </header>

      <div
        className={`settings-notice${allDone ? ' predeploy-notice--done' : ''}`}
        role="status"
      >
        <ClipboardCheck size={18} strokeWidth={2.4} aria-hidden="true" />
        {allDone
          ? `All ${TOTAL_ITEMS} checks complete. Ready to deploy.`
          : `${checkedCount} of ${TOTAL_ITEMS} checks complete.`}
      </div>

      <div className="predeploy-grid">
        {CHECKLIST_GROUPS.map((group) => {
          const Icon = group.icon
          const groupDone = group.items.filter((item) => checked[item.id]).length
          return (
            <article className="dashboard-card predeploy-card" key={group.id}>
              <div className="card-heading">
                <div>
                  <p className="eyebrow">{group.title}</p>
                  <h2>
                    {groupDone}/{group.items.length} checked
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
                        <span>{item.label}</span>
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
