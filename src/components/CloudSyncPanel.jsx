import {
  CheckCircle2,
  Cloud,
  CloudOff,
  Database,
  Download,
  Images,
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
import { useT } from '../i18n'

const SUMMARY_ROWS = [
  ['workoutSessions', 'cloudPanel.row.workoutSessions'],
  ['bodyCheckIns', 'cloudPanel.row.bodyCheckIns'],
  ['nutritionLogs', 'cloudPanel.row.nutritionLogs'],
  ['settings', 'cloudPanel.row.settings'],
  ['customPlan', 'cloudPanel.row.customPlan'],
  ['customLibrary', 'cloudPanel.row.customLibrary'],
]

export function CloudSyncPanel() {
  const t = useT()
  const { isSupabaseConfigured, user } = useAuth()
  const cloudActive = isSupabaseConfigured && Boolean(user)

  const [busy, setBusy] = useState('') // '', 'up', 'down', 'local', 'cloud'
  const [status, setStatus] = useState(null) // { tone, text }
  const [localSummary, setLocalSummary] = useState(null)
  const [cloudSummary, setCloudSummary] = useState(null)

  function announce(tone, text) {
    setStatus({ tone, text })
  }

  async function handleSyncUp() {
    const ok = window.confirm(
      t('cloudPanel.uploadConfirm'),
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
          ? t('cloudPanel.uploadedWithIssues', {
              count: uploaded,
              issues: result.errors.length,
            })
          : t('cloudPanel.uploaded', { count: uploaded }),
      )
    } catch (error) {
      announce('error', errorText(error, t('cloudPanel.unavailable')))
    } finally {
      setBusy('')
    }
  }

  async function handleSyncDown() {
    const ok = window.confirm(
      t('cloudPanel.downloadConfirm'),
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
        t('cloudPanel.downloaded', { count: downloaded }),
      )
    } catch (error) {
      announce('error', errorText(error, t('cloudPanel.unavailable')))
    } finally {
      setBusy('')
    }
  }

  function handleLocalSummary() {
    setLocalSummary(getLocalDataSummary())
    announce('info', t('cloudPanel.localRefreshed'))
  }

  async function handleCloudSummary() {
    setBusy('cloud')
    setStatus(null)
    try {
      setCloudSummary(await getCloudDataSummary(user))
      announce('info', t('cloudPanel.cloudRefreshed'))
    } catch (error) {
      announce('error', errorText(error, t('cloudPanel.unreachable')))
    } finally {
      setBusy('')
    }
  }

  async function handleMigratePhotos() {
    const ok = window.confirm(
      t('cloudPanel.photosConfirm'),
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
        announce('info', t('cloudPanel.noPhotos'))
      } else {
        announce(
          result.errors.length > 0 ? 'warn' : 'success',
          result.errors.length > 0
            ? t('cloudPanel.photosUploadedWithIssues', {
                photos: result.photosUploaded,
                checkIns: result.checkInsUpdated,
                issues: result.errors.length,
              })
            : t('cloudPanel.photosUploaded', {
                photos: result.photosUploaded,
                checkIns: result.checkInsUpdated,
              }),
        )
      }
    } catch (error) {
      announce('error', errorText(error, t('cloudPanel.photoMigrationFailed')))
    } finally {
      setBusy('')
    }
  }

  return (
    <article className="dashboard-card settings-panel cloud-panel">
      <div className="card-heading">
        <div>
          <p className="eyebrow">{t('cloudPanel.eyebrow')}</p>
          <h2>{t('cloudPanel.title')}</h2>
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
            ? t('env.notConfigured')
            : t('cloudPanel.notConfiguredDev')}
        </div>
      ) : null}

      <div className="cloud-status-grid">
        <div>
          <span>{t('cloudPanel.mode')}</span>
          <strong>
            {cloudActive ? t('cloudPanel.cloudMode') : t('cloudPanel.localMode')}
          </strong>
        </div>
        <div>
          <span>{t('cloudPanel.supabaseConfigured')}</span>
          <strong>{isSupabaseConfigured ? t('state.yes') : t('state.no')}</strong>
        </div>
        <div>
          <span>{t('cloudPanel.signedInAs')}</span>
          <strong>{user?.email ?? t('cloudPanel.notSignedIn')}</strong>
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
              {busy === 'up'
                ? t('cloudPanel.uploading')
                : t('cloudPanel.syncUp')}
            </button>
            <button
              className="workout-secondary-button"
              disabled={busy !== ''}
              onClick={handleSyncDown}
              type="button"
            >
              <Download size={18} strokeWidth={2.4} aria-hidden="true" />
              {busy === 'down'
                ? t('cloudPanel.downloading')
                : t('cloudPanel.syncDown')}
            </button>
            <button
              className="workout-secondary-button"
              disabled={busy !== ''}
              onClick={handleMigratePhotos}
              type="button"
            >
              <Images size={18} strokeWidth={2.4} aria-hidden="true" />
              {busy === 'photos'
                ? t('cloudPanel.uploadingPhotos')
                : t('cloudPanel.migratePhotos')}
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
          {t('cloudPanel.localSummary')}
        </button>

        {cloudActive ? (
          <button
            className="workout-secondary-button"
            disabled={busy !== ''}
            onClick={handleCloudSummary}
            type="button"
          >
            <RefreshCw size={18} strokeWidth={2.4} aria-hidden="true" />
            {busy === 'cloud'
              ? t('cloudPanel.checking')
              : t('cloudPanel.cloudSummary')}
          </button>
        ) : null}
      </div>

      {localSummary || cloudSummary ? (
        <div className="cloud-summary-grid">
          {localSummary ? (
            <SummaryCard
              title={t('cloudPanel.localBrowser')}
              summary={localSummary}
            />
          ) : null}
          {cloudSummary ? (
            <SummaryCard
              title={t('cloudPanel.cloudAccount')}
              summary={cloudSummary}
            />
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

function SummaryCard({ title, summary }) {
  const t = useT()

  return (
    <div className="cloud-summary-card">
      <p className="eyebrow">{title}</p>
      <ul>
        {SUMMARY_ROWS.map(([key, labelKey]) => (
          <li key={key}>
            <span>{t(labelKey)}</span>
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
