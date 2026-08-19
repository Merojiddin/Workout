import {
  Activity,
  CheckCircle2,
  HeartPulse,
  MinusCircle,
  TriangleAlert,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import {
  getLastHealthCheck,
  runCloudHealthCheck,
} from '../services/healthService'
import { getEnvConfig, getEnvironmentLabel, validateEnv } from '../utils/envUtils'
import { formatDate, t, useT } from '../i18n'

/**
 * Step 20 - Settings > Cloud Health.
 *
 * Environment badge + on-demand Supabase health check (config, auth,
 * database, storage). Results persist so the "last checked" time survives
 * reloads.
 */
export function CloudHealthPanel() {
  // Shadows the module-level `t` so this component re-renders on a language
  // change; the helpers below stay on the module-level one.
  const t = useT()
  const [result, setResult] = useState(() => getLastHealthCheck())
  const [running, setRunning] = useState(false)

  const { runtime, mode } = getEnvironmentLabel()
  const { isProduction, isSupabaseConfigured: isCloudMode } = getEnvConfig()
  const envWarnings = validateEnv()

  async function handleRunCheck() {
    setRunning(true)
    try {
      setResult(await runCloudHealthCheck())
    } finally {
      setRunning(false)
    }
  }

  return (
    <article className="dashboard-card settings-panel cloud-health-panel">
      <div className="card-heading">
        <div>
          <p className="eyebrow">{t('health.eyebrow')}</p>
          <h2>{t('health.title')}</h2>
        </div>
        <HeartPulse size={22} strokeWidth={2.4} aria-hidden="true" />
      </div>

      <div className="env-badge-row">
        <span
          className={`env-badge ${
            isProduction ? 'env-badge--production' : 'env-badge--development'
          }`}
        >
          {runtime}
        </span>
        <span
          className={`env-badge ${
            isCloudMode ? 'env-badge--cloud' : 'env-badge--local'
          }`}
        >
          {mode}
        </span>
      </div>

      {envWarnings.map((warning) => (
        <div
          className={`cloud-message cloud-message--${
            warning.level === 'warn' ? 'warn' : 'info'
          }`}
          key={warning.message}
          role="status"
        >
          <TriangleAlert size={17} strokeWidth={2.4} aria-hidden="true" />
          {warning.message}
        </div>
      ))}

      <div className="cloud-status-grid">
        <HealthRow
          label={t('health.supabaseConfigured')}
          state={boolState(result?.supabaseConfigured)}
        />
        <HealthRow
          label={t('health.loggedIn')}
          state={boolState(result?.loggedIn)}
        />
        <HealthRow
          label={t('health.databaseReachableLabel')}
          state={boolState(result?.databaseReachable)}
        />
        <HealthRow
          label={t('health.storageAvailable')}
          state={
            result?.storageSkipped ? 'skipped' : boolState(result?.storageAvailable)
          }
        />
        <div>
          <span>{t('health.lastChecked')}</span>
          <strong>
            {result?.checkedAt
              ? formatCheckedAt(result.checkedAt)
              : t('state.never')}
          </strong>
        </div>
      </div>

      {result?.messages ? (
        <ul className="cloud-health-messages">
          <li>{result.messages.connection}</li>
          <li>{result.messages.auth}</li>
          <li>{result.messages.storage}</li>
        </ul>
      ) : null}

      <div className="settings-actions">
        <button
          className="workout-primary-button"
          disabled={running}
          onClick={handleRunCheck}
          type="button"
        >
          <Activity size={19} strokeWidth={2.4} aria-hidden="true" />
          {running ? t('health.checking') : t('health.runCheck')}
        </button>
      </div>
    </article>
  )
}

function HealthRow({ label, state }) {
  const t = useT()

  return (
    <div>
      <span>{label}</span>
      <strong className={`cloud-health-value cloud-health-value--${state}`}>
        {state === 'yes' ? (
          <CheckCircle2 size={15} strokeWidth={2.6} aria-hidden="true" />
        ) : state === 'no' ? (
          <XCircle size={15} strokeWidth={2.6} aria-hidden="true" />
        ) : (
          <MinusCircle size={15} strokeWidth={2.6} aria-hidden="true" />
        )}
        {state === 'yes'
          ? t('state.yes')
          : state === 'no'
            ? t('state.no')
            : state === 'skipped'
              ? t('health.skipped')
              : t('health.notChecked')}
      </strong>
    </div>
  )
}

function boolState(value) {
  if (value === true) return 'yes'
  if (value === false) return 'no'
  return 'unknown'
}

function formatCheckedAt(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return t('state.unknown')
  }
  return formatDate(date, { dateStyle: 'medium', timeStyle: 'short' })
}
