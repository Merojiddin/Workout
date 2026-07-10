import {
  CheckCircle2,
  Cloud,
  CloudOff,
  Database,
  Download,
  Images,
  LogOut,
  RefreshCw,
  TriangleAlert,
  Upload,
} from 'lucide-react'
import { useState } from 'react'
import { BODY_CHECK_INS_KEY } from '../data/bodyCheckIns'
import { useAuth } from '../context/AuthContext'
import { pushBodyCheckInToCloud } from '../services/bodyCheckInService'
import { migrateLocalBase64PhotosToCloud } from '../services/photoService'
import { readArrayKey, writeArrayKey } from '../services/serviceUtils'
import {
  getCloudDataSummary,
  getLocalDataSummary,
  syncCloudToLocal,
  syncLocalToCloud,
} from '../services/syncService'
import { getEnvConfig } from '../utils/envUtils'

const SUMMARY_ROWS = [
  ['workoutSessions', 'Workout sessions'],
  ['bodyCheckIns', 'Body check-ins'],
  ['nutritionLogs', 'Nutrition logs'],
  ['settings', 'Settings'],
  ['customPlan', 'Custom plan'],
  ['customLibrary', 'Custom library'],
]

export function CloudSyncPanel() {
  const { isSupabaseConfigured, user, signOut } = useAuth()
  const cloudActive = isSupabaseConfigured && Boolean(user)

  const [busy, setBusy] = useState('') // '', 'up', 'down', 'local', 'cloud', 'logout'
  const [status, setStatus] = useState(null) // { tone, text }
  const [localSummary, setLocalSummary] = useState(null)
  const [cloudSummary, setCloudSummary] = useState(null)

  function announce(tone, text) {
    setStatus({ tone, text })
  }

  async function handleSyncUp() {
    const ok = window.confirm(
      'This will upload your local browser data to your cloud account.',
    )
    if (!ok) return

    setBusy('up')
    setStatus(null)
    try {
      const result = await syncLocalToCloud(user)
      setCloudSummary(await getCloudDataSummary(user))
      const uploaded =
        result.workoutSessions + result.bodyCheckIns + result.nutritionLogs
      announce(
        result.errors.length > 0 ? 'warn' : 'success',
        result.errors.length > 0
          ? `Uploaded ${uploaded} records with ${result.errors.length} issue(s).`
          : `Uploaded ${uploaded} records to the cloud.`,
      )
    } catch (error) {
      announce('error', errorText(error, 'Cloud sync unavailable.'))
    } finally {
      setBusy('')
    }
  }

  async function handleSyncDown() {
    const ok = window.confirm(
      'This may overwrite local display data. Export a backup first if unsure.',
    )
    if (!ok) return

    setBusy('down')
    setStatus(null)
    try {
      const result = await syncCloudToLocal(user)
      setLocalSummary(getLocalDataSummary())
      const downloaded =
        result.workoutSessions + result.bodyCheckIns + result.nutritionLogs
      announce(
        'success',
        `Downloaded ${downloaded} records. Reopen a page to see them.`,
      )
    } catch (error) {
      announce('error', errorText(error, 'Cloud sync unavailable.'))
    } finally {
      setBusy('')
    }
  }

  function handleLocalSummary() {
    setLocalSummary(getLocalDataSummary())
    announce('info', 'Local data summary refreshed.')
  }

  async function handleCloudSummary() {
    setBusy('cloud')
    setStatus(null)
    try {
      setCloudSummary(await getCloudDataSummary(user))
      announce('info', 'Cloud data summary refreshed.')
    } catch (error) {
      announce('error', errorText(error, 'Could not reach the cloud.'))
    } finally {
      setBusy('')
    }
  }

  async function handleMigratePhotos() {
    const ok = window.confirm(
      'This uploads local progress photos to your Supabase account. Keep a JSON backup first.',
    )
    if (!ok) return

    setBusy('photos')
    setStatus(null)
    try {
      const result = await migrateLocalBase64PhotosToCloud(user, {
        readCheckIns: () => readArrayKey(BODY_CHECK_INS_KEY),
        writeCheckIns: (list) => writeArrayKey(BODY_CHECK_INS_KEY, list),
        pushToCloud: pushBodyCheckInToCloud,
      })
      setCloudSummary(await getCloudDataSummary(user))
      if (result.photosUploaded === 0 && result.errors.length === 0) {
        announce('info', 'No local base64 photos needed migrating.')
      } else {
        announce(
          result.errors.length > 0 ? 'warn' : 'success',
          `Uploaded ${result.photosUploaded} photo(s) from ${result.checkInsUpdated} check-in(s)` +
            (result.errors.length > 0
              ? ` with ${result.errors.length} issue(s).`
              : '.'),
        )
      }
    } catch (error) {
      announce('error', errorText(error, 'Photo migration failed.'))
    } finally {
      setBusy('')
    }
  }

  async function handleLogout() {
    setBusy('logout')
    await signOut()
    setBusy('')
  }

  return (
    <article className="dashboard-card settings-panel cloud-panel">
      <div className="card-heading">
        <div>
          <p className="eyebrow">Cloud Sync</p>
          <h2>Login &amp; cloud database</h2>
        </div>
        {cloudActive ? (
          <Cloud size={22} strokeWidth={2.4} aria-hidden="true" />
        ) : (
          <CloudOff size={22} strokeWidth={2.4} aria-hidden="true" />
        )}
      </div>

      {!isSupabaseConfigured ? (
        <div className="cloud-warning" role="status">
          <TriangleAlert size={18} strokeWidth={2.4} aria-hidden="true" />
          {getEnvConfig().isProduction
            ? 'Cloud sync is not configured. This deployment is using local browser storage only.'
            : 'Cloud sync not configured. App is using local browser storage.'}
        </div>
      ) : null}

      <div className="cloud-status-grid">
        <div>
          <span>Mode</span>
          <strong>{cloudActive ? 'Cloud mode' : 'Local mode'}</strong>
        </div>
        <div>
          <span>Supabase configured</span>
          <strong>{isSupabaseConfigured ? 'Yes' : 'No'}</strong>
        </div>
        <div>
          <span>Signed in as</span>
          <strong>{user?.email ?? 'Not signed in'}</strong>
        </div>
      </div>

      {status ? (
        <div className={`cloud-message cloud-message--${status.tone}`} role="status">
          {status.tone === 'success' ? (
            <CheckCircle2 size={17} strokeWidth={2.4} aria-hidden="true" />
          ) : (
            <TriangleAlert size={17} strokeWidth={2.4} aria-hidden="true" />
          )}
          {status.text}
        </div>
      ) : null}

      <div className="cloud-actions">
        {cloudActive ? (
          <>
            <button
              className="workout-primary-button"
              disabled={busy !== ''}
              onClick={handleSyncUp}
              type="button"
            >
              <Upload size={18} strokeWidth={2.4} aria-hidden="true" />
              {busy === 'up' ? 'Uploading...' : 'Sync Local Data to Cloud'}
            </button>
            <button
              className="workout-secondary-button"
              disabled={busy !== ''}
              onClick={handleSyncDown}
              type="button"
            >
              <Download size={18} strokeWidth={2.4} aria-hidden="true" />
              {busy === 'down' ? 'Downloading...' : 'Download Cloud Data to This Browser'}
            </button>
            <button
              className="workout-secondary-button"
              disabled={busy !== ''}
              onClick={handleMigratePhotos}
              type="button"
            >
              <Images size={18} strokeWidth={2.4} aria-hidden="true" />
              {busy === 'photos'
                ? 'Uploading photos...'
                : 'Migrate Local Photos to Cloud'}
            </button>
          </>
        ) : null}

        <button
          className="workout-secondary-button"
          disabled={busy !== ''}
          onClick={handleLocalSummary}
          type="button"
        >
          <Database size={18} strokeWidth={2.4} aria-hidden="true" />
          View Local Data Summary
        </button>

        {cloudActive ? (
          <button
            className="workout-secondary-button"
            disabled={busy !== ''}
            onClick={handleCloudSummary}
            type="button"
          >
            <RefreshCw size={18} strokeWidth={2.4} aria-hidden="true" />
            {busy === 'cloud' ? 'Checking...' : 'View Cloud Data Summary'}
          </button>
        ) : null}

        {cloudActive ? (
          <button
            className="workout-secondary-button workout-secondary-button--danger"
            disabled={busy !== ''}
            onClick={handleLogout}
            type="button"
          >
            <LogOut size={18} strokeWidth={2.4} aria-hidden="true" />
            {busy === 'logout' ? 'Signing out...' : 'Logout'}
          </button>
        ) : null}
      </div>

      {localSummary || cloudSummary ? (
        <div className="cloud-summary-grid">
          {localSummary ? (
            <SummaryCard title="Local browser" summary={localSummary} />
          ) : null}
          {cloudSummary ? (
            <SummaryCard title="Cloud account" summary={cloudSummary} />
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

function SummaryCard({ title, summary }) {
  return (
    <div className="cloud-summary-card">
      <p className="eyebrow">{title}</p>
      <ul>
        {SUMMARY_ROWS.map(([key, label]) => (
          <li key={key}>
            <span>{label}</span>
            <strong>{summary?.[key] ?? 0}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

function errorText(error, fallback) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  return fallback
}
