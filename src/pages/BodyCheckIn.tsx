import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  FileSpreadsheet,
  Info,
  Loader2,
  PlusCircle,
  Printer,
  Target,
  TriangleAlert,
  UploadCloud,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { BodyCheckInForm, type PhotoFiles } from '../components/BodyCheckInForm'
import { CheckInDetailModal } from '../components/CheckInDetailModal'
import { CheckInHistoryTable } from '../components/CheckInHistoryTable'
import { LatestCheckInCard } from '../components/LatestCheckInCard'
import { MeasurementChart } from '../components/MeasurementChart'
import { PrintableBodyProgress } from '../print/PrintableBodyProgress'
import type { BodyCheckIn, PhotoSlot } from '../data/bodyCheckIns'
import { useAuth } from '../context/AuthContext'
import * as bodyCheckInService from '../services/bodyCheckInService'
import { isCloudPhotoEnabled } from '../services/photoService'
import { exportBodyCheckInsCSV } from '../utils/exportUtils'
import { printElement } from '../utils/printUtils'
import {
  addDemoCheckIns,
  formatCheckInDate,
  getBodyCheckIns,
  getBodyTrendSummary,
  getLatestCheckIn,
  getMeasurementProgress,
  type MeasurementKey,
} from '../utils/bodyCheckInUtils'

const chartConfigs: { key: MeasurementKey; title: string; unit: string }[] = [
  { key: 'bodyWeightKg', title: 'Body weight', unit: 'kg' },
  { key: 'waistCm', title: 'Waist', unit: 'cm' },
  { key: 'bellyCm', title: 'Belly', unit: 'cm' },
  { key: 'chestCm', title: 'Chest', unit: 'cm' },
  { key: 'shouldersCm', title: 'Shoulders', unit: 'cm' },
  { key: 'armAverage', title: 'Arms (avg)', unit: 'cm' },
  { key: 'postureRating', title: 'Posture rating', unit: '/10' },
  { key: 'absVisibilityRating', title: 'Abs visibility', unit: '/10' },
]

type SaveStatus = '' | 'saving' | 'uploading' | 'saved' | 'error'

export function BodyCheckIn() {
  const { user } = useAuth()
  const [checkIns, setCheckIns] = useState<BodyCheckIn[]>(() => getBodyCheckIns())
  const [editingCheckIn, setEditingCheckIn] = useState<BodyCheckIn | null>(null)
  const [viewingCheckIn, setViewingCheckIn] = useState<BodyCheckIn | null>(null)
  const [deletingCheckIn, setDeletingCheckIn] = useState<BodyCheckIn | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('')
  const [uploadingSlots, setUploadingSlots] = useState<
    Partial<Record<PhotoSlot, boolean>>
  >({})
  const formRef = useRef<HTMLDivElement>(null)

  const latest = useMemo(() => getLatestCheckIn(checkIns), [checkIns])
  const trends = useMemo(() => getBodyTrendSummary(checkIns), [checkIns])
  const hasCheckIns = checkIns.length > 0

  // In cloud mode, refresh the list so photos get fresh signed URLs. The local
  // mirror (seeded above) shows instantly; this swaps in resolved cloud URLs.
  useEffect(() => {
    if (!isCloudPhotoEnabled(user)) {
      return
    }

    let active = true
    bodyCheckInService
      .getBodyCheckIns(user)
      .then((list: BodyCheckIn[]) => {
        if (active && Array.isArray(list)) {
          setCheckIns(list)
        }
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [user])

  // Auto-clear the "Saved successfully" confirmation.
  useEffect(() => {
    if (saveStatus !== 'saved') {
      return
    }
    const timer = window.setTimeout(() => setSaveStatus(''), 2600)
    return () => window.clearTimeout(timer)
  }, [saveStatus])

  async function handleSave(
    checkIn: BodyCheckIn,
    photoFiles: PhotoFiles,
  ): Promise<boolean> {
    const fileSlots: Partial<Record<PhotoSlot, boolean>> = {
      front: Boolean(photoFiles.front),
      side: Boolean(photoFiles.side),
      back: Boolean(photoFiles.back),
    }
    const hadFiles = Object.values(fileSlots).some(Boolean)

    setSaveError(null)
    setSaveStatus('saving')
    setUploadingSlots(hadFiles ? fileSlots : {})

    function handleStatus(status: string) {
      if (status === 'uploading') {
        setSaveStatus('uploading')
      } else if (status === 'saving') {
        setSaveStatus('saving')
      }
    }

    try {
      const next = editingCheckIn
        ? await bodyCheckInService.updateBodyCheckIn(
            user,
            editingCheckIn.id,
            checkIn,
            photoFiles,
            handleStatus,
          )
        : await bodyCheckInService.saveBodyCheckIn(
            user,
            checkIn,
            photoFiles,
            handleStatus,
          )
      setCheckIns(next)
      setEditingCheckIn(null)
      setUploadingSlots({})
      setSaveStatus('saved')
      return true
    } catch {
      // The local write may have succeeded even if the cloud upload failed.
      setCheckIns(getBodyCheckIns())
      setUploadingSlots({})
      setSaveStatus('error')
      setSaveError(
        hadFiles
          ? 'Saved locally. Cloud sync failed. Photo upload will need to retry when you are online.'
          : 'Saved locally. Cloud sync failed.',
      )
      return false
    }
  }

  function handleAddDemo() {
    setCheckIns(addDemoCheckIns())
    setSaveError(null)
  }

  function handleEdit(checkIn: BodyCheckIn) {
    setEditingCheckIn(checkIn)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleCancelEdit() {
    setEditingCheckIn(null)
  }

  async function handleConfirmDelete() {
    if (!deletingCheckIn) {
      return
    }

    const targetId = deletingCheckIn.id
    try {
      const next = await bodyCheckInService.deleteBodyCheckIn(user, targetId)
      setCheckIns(next)
    } catch {
      setCheckIns(getBodyCheckIns())
    }
    if (editingCheckIn?.id === targetId) {
      setEditingCheckIn(null)
    }
    setDeletingCheckIn(null)
  }

  return (
    <section className="body-check-in">
      <header className="progress-hero">
        <div>
          <p className="eyebrow">Body Check-in</p>
          <h1>Body Check-in</h1>
          <p>
            Track weight, waist, chest, shoulders, abs, and posture once per week.
          </p>
        </div>
        <div className="progress-hero-actions">
          <button
            className="demo-data-button demo-data-button--secondary"
            onClick={() => exportBodyCheckInsCSV(checkIns)}
            type="button"
          >
            <FileSpreadsheet size={19} strokeWidth={2.4} aria-hidden="true" />
            Export Body CSV
          </button>
          <button
            className="demo-data-button demo-data-button--secondary"
            onClick={() => printElement('body-progress-print-source')}
            type="button"
          >
            <Printer size={19} strokeWidth={2.4} aria-hidden="true" />
            Print Body Progress
          </button>
          {!hasCheckIns ? (
            <button
              className="demo-data-button"
              onClick={handleAddDemo}
              type="button"
            >
              <PlusCircle size={19} strokeWidth={2.4} aria-hidden="true" />
              Add Demo Check-ins
            </button>
          ) : null}
        </div>
      </header>

      <div className="checkin-top-grid">
        <article className="dashboard-card goal-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Current Goal</p>
              <h2>Lean recomposition</h2>
            </div>
            <Target size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>
          <div className="goal-list">
            <div className="goal-line">
              <span>Current weight</span>
              <strong>76 kg</strong>
            </div>
            <div className="goal-line">
              <span>Goal</span>
              <strong>78–82 kg lean</strong>
            </div>
            <div className="goal-line">
              <span>Main focus</span>
              <strong>Bigger upper body, visible abs, controlled waist</strong>
            </div>
          </div>
          <p className="card-copy">
            Reminder: do not judge progress by weight only.
          </p>
        </article>

        <article className="dashboard-card recomp-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">How to read progress</p>
              <h2>Recomposition</h2>
            </div>
            <Info size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>
          <p className="card-copy">
            Your goal is recomposition: bigger upper body while keeping waist
            controlled. Weight may go up if muscle increases. The best signs are:
            chest/shoulders increasing, waist/belly stable or decreasing, strength
            improving, and abs rating improving.
          </p>
        </article>
      </div>

      {trends.length > 0 ? (
        <article className="dashboard-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Trend</p>
              <h2>Since your first check-in</h2>
            </div>
          </div>
          <div className="trend-grid">
            {trends.map((trend) => (
              <span
                className={`trend-chip trend-chip--${trend.tone}`}
                key={trend.key}
              >
                <TrendIcon direction={trend.direction} />
                {trend.message}
              </span>
            ))}
          </div>
        </article>
      ) : null}

      <div ref={formRef}>
        <BodyCheckInForm
          initialData={editingCheckIn}
          key={editingCheckIn?.id ?? 'new'}
          mode={editingCheckIn ? 'edit' : 'create'}
          onCancel={handleCancelEdit}
          onSave={handleSave}
          uploadingSlots={uploadingSlots}
        />
      </div>

      {saveStatus === 'uploading' ? (
        <div className="checkin-save-status checkin-save-status--info" role="status">
          <UploadCloud size={18} strokeWidth={2.4} aria-hidden="true" />
          Uploading photos…
        </div>
      ) : null}
      {saveStatus === 'saving' ? (
        <div className="checkin-save-status checkin-save-status--info" role="status">
          <Loader2 size={18} strokeWidth={2.4} aria-hidden="true" />
          Saving check-in…
        </div>
      ) : null}
      {saveStatus === 'saved' ? (
        <div
          className="checkin-save-status checkin-save-status--success"
          role="status"
        >
          <CheckCircle2 size={18} strokeWidth={2.4} aria-hidden="true" />
          Saved successfully
        </div>
      ) : null}
      {saveStatus === 'error' && saveError ? (
        <div className="checkin-save-error" role="status">
          <TriangleAlert size={18} strokeWidth={2.4} aria-hidden="true" />
          {saveError}
        </div>
      ) : null}

      {latest ? (
        <LatestCheckInCard checkIn={latest} />
      ) : (
        <article className="progress-empty-card">
          <Target size={26} strokeWidth={2.4} aria-hidden="true" />
          <div>
            <h2>No body check-in yet</h2>
            <p>Save your first check-in above, or load demo check-ins to explore.</p>
          </div>
          <button
            className="workout-primary-button"
            onClick={handleAddDemo}
            type="button"
          >
            Add Demo Check-ins
          </button>
        </article>
      )}

      <section className="progress-section">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Measurement Progress</p>
            <h2>Charts over time</h2>
          </div>
        </div>
        <div className="chart-grid">
          {chartConfigs.map((config) => (
            <MeasurementChart
              data={getMeasurementProgress(checkIns, config.key)}
              dataKey="value"
              emptyMessage={`No ${config.title.toLowerCase()} data yet.`}
              key={config.key}
              title={config.title}
              unit={config.unit}
            />
          ))}
        </div>
      </section>

      <CheckInHistoryTable
        checkIns={checkIns}
        onDelete={setDeletingCheckIn}
        onEdit={handleEdit}
        onView={setViewingCheckIn}
      />

      <div className="print-source" id="body-progress-print-source" aria-hidden="true">
        <PrintableBodyProgress checkIns={checkIns} />
      </div>

      {viewingCheckIn ? (
        <CheckInDetailModal
          checkIn={viewingCheckIn}
          onClose={() => setViewingCheckIn(null)}
        />
      ) : null}

      {deletingCheckIn ? (
        <div className="modal-backdrop" role="presentation">
          <section
            aria-labelledby="delete-checkin-title"
            aria-modal="true"
            className="confirm-modal"
            role="dialog"
          >
            <p className="eyebrow">Delete check-in</p>
            <h2 id="delete-checkin-title">
              Delete {formatCheckInDate(deletingCheckIn.date)}?
            </h2>
            <p>This removes the check-in and its photos. This cannot be undone.</p>
            <div className="confirm-actions">
              <button
                className="workout-secondary-button"
                onClick={() => setDeletingCheckIn(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="confirm-delete-button"
                onClick={handleConfirmDelete}
                type="button"
              >
                Delete
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  )
}

function TrendIcon({ direction }: { direction: 'up' | 'down' | 'flat' }) {
  if (direction === 'up') {
    return <ArrowUpRight size={15} strokeWidth={2.6} aria-hidden="true" />
  }

  if (direction === 'down') {
    return <ArrowDownRight size={15} strokeWidth={2.6} aria-hidden="true" />
  }

  return <ArrowRight size={15} strokeWidth={2.6} aria-hidden="true" />
}
