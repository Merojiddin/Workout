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
import { getEnvironmentLabel, validateEnv } from '../utils/envUtils'

/**
 * Step 20 - Settings > Cloud Health.
 *
 * Environment badge + on-demand Supabase health check (config, auth,
 * database, storage). Results persist so the "last checked" time survives
 * reloads.
 */
export function CloudHealthPanel() {
  const [result, setResult] = useState(() => getLastHealthCheck())
  const [running, setRunning] = useState(false)

  const { runtime, mode } = getEnvironmentLabel()
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
          <p className="eyebrow">Cloud Health</p>
          <h2>Deployment &amp; connection status</h2>
        </div>
        <HeartPulse size={22} strokeWidth={2.4} aria-hidden="true" />
      </div>

      <div className="env-badge-row">
        <span
          className={`env-badge ${
            runtime === 'Production' ? 'env-badge--production' : 'env-badge--development'
          }`}
        >
          {runtime}
        </span>
        <span
          className={`env-badge ${
            mode === 'Cloud Mode' ? 'env-badge--cloud' : 'env-badge--local'
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
          label="Supabase configured"
          state={boolState(result?.supabaseConfigured)}
        />
        <HealthRow label="User logged in" state={boolState(result?.loggedIn)} />
        <HealthRow
          label="Database reachable"
          state={boolState(result?.databaseReachable)}
        />
        <HealthRow
          label="Storage available"
          state={
            result?.storageSkipped ? 'skipped' : boolState(result?.storageAvailable)
          }
        />
        <div>
          <span>Last checked</span>
          <strong>
            {result?.checkedAt ? formatCheckedAt(result.checkedAt) : 'Never'}
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
          {running ? 'Checking...' : 'Run Health Check'}
        </button>
      </div>
    </article>
  )
}

function HealthRow({ label, state }) {
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
        {state === 'yes' ? 'Yes' : state === 'no' ? 'No' : state === 'skipped' ? 'Skipped' : 'Not checked'}
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
    return 'Unknown'
  }
  return date.toLocaleString()
}
