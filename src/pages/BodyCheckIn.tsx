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
import { useLanguage, type MessageKey } from '../i18n'
import * as bodyCheckInService from '../services/bodyCheckInService'
import { isCloudPhotoEnabled } from '../services/photoService'
import { exportBodyCheckInsCSV } from '../utils/exportUtils'
import { printElement } from '../utils/printUtils'
import { SHOW_DEMO_DATA } from '../utils/devFlags'
import {
  addDemoCheckIns,
  formatCheckInDate,
  getBodyCheckIns,
  getBodyTrendSummary,
  getLatestCheckIn,
  getMeasurementProgress,
  type MeasurementKey,
} from '../utils/bodyCheckInUtils'
import { getUserProfileSettings } from '../utils/settingsUtils'

const chartConfigs: {
  key: MeasurementKey
  titleKey: MessageKey
  unitKey: MessageKey
}[] = [
  { key: 'bodyWeightKg', titleKey: 'measure.bodyWeightKg', unitKey: 'unit.kg' },
  { key: 'waistCm', titleKey: 'measure.waistCm', unitKey: 'unit.cm' },
  { key: 'bellyCm', titleKey: 'measure.bellyCm', unitKey: 'unit.cm' },
  { key: 'chestCm', titleKey: 'measure.chestCm', unitKey: 'unit.cm' },
  { key: 'shouldersCm', titleKey: 'measure.shouldersCm', unitKey: 'unit.cm' },
  { key: 'armAverage', titleKey: 'measure.armsAverage', unitKey: 'unit.cm' },
  {
    key: 'postureRating',
    titleKey: 'measure.postureRating',
    unitKey: 'measure.ratingUnit',
  },
  {
    key: 'absVisibilityRating',
    titleKey: 'measure.absVisibilityRating',
    unitKey: 'measure.ratingUnit',
  },
]

type SaveStatus = '' | 'saving' | 'uploading' | 'saved' | 'error'

export function BodyCheckIn() {
  const { user } = useAuth()
  const { language, t } = useLanguage()
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
  const profileSettings = getUserProfileSettings()
  // The profile starts empty for a new account, so every line of the goal card
  // has to read as "not set yet" rather than as a measurement of 0 kg.
  const { currentWeightKg, goalWeightMinKg, goalWeightMaxKg } =
    profileSettings.profile
  const currentWeightLabel =
    latest?.bodyWeightKg != null
      ? `${latest.bodyWeightKg} ${t('unit.kg')}`
      : currentWeightKg
        ? `${currentWeightKg} ${t('unit.kg')}`
        : t('state.notSet')
  const goalWeightLabel =
    goalWeightMinKg && goalWeightMaxKg
      ? t('checkin.goalWeightRange', {
          min: goalWeightMinKg,
          max: goalWeightMaxKg,
        })
      : goalWeightMinKg || goalWeightMaxKg
        ? t('checkin.goalWeightSingle', {
            value: goalWeightMinKg ?? goalWeightMaxKg,
          })
        : t('state.notSet')
  // The heading is whatever this user said they are training for. No preset
  // goal stands in for it -- a goal nobody chose is someone else's.
  const bodyGoalLabel =
    profileSettings.goals.bodyGoal ||
    profileSettings.profile.trainingGoal ||
    t('checkin.noGoal')
  const hasProfileGoal = Boolean(
    currentWeightKg ||
      goalWeightMinKg ||
      goalWeightMaxKg ||
      profileSettings.profile.trainingGoal,
  )
  // Trend chips are built as sentences in the active language.
  const trends = useMemo(
    () => getBodyTrendSummary(checkIns),
    // The language is a real dependency: these helpers read it from the
    // i18n store rather than taking it as an argument, so the linter
    // cannot see it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [checkIns, language],
  )
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
        hadFiles ? t('checkin.syncFailedPhotos') : t('checkin.syncFailed'),
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
          <p className="eyebrow">{t('checkin.eyebrow')}</p>
          <h1>{t('checkin.title')}</h1>
          <p>{t('checkin.subtitle')}</p>
        </div>
        <div className="progress-hero-actions">
          <button
            className="demo-data-button demo-data-button--secondary"
            onClick={() => exportBodyCheckInsCSV(checkIns)}
            type="button"
          >
            <FileSpreadsheet size={19} strokeWidth={2.4} aria-hidden="true" />
            {t('checkin.exportCsv')}
          </button>
          <button
            className="demo-data-button demo-data-button--secondary"
            onClick={() => printElement('body-progress-print-source')}
            type="button"
          >
            <Printer size={19} strokeWidth={2.4} aria-hidden="true" />
            {t('checkin.print')}
          </button>
          {SHOW_DEMO_DATA && !hasCheckIns ? (
            <button
              className="demo-data-button"
              onClick={handleAddDemo}
              type="button"
            >
              <PlusCircle size={19} strokeWidth={2.4} aria-hidden="true" />
              {t('checkin.addDemo')}
            </button>
          ) : null}
        </div>
      </header>

      <div className="checkin-top-grid">
        <article className="dashboard-card goal-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">{t('checkin.goalEyebrow')}</p>
              <h2>{bodyGoalLabel}</h2>
            </div>
            <Target size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>
          <div className="goal-list">
            <div className="goal-line">
              <span>{t('checkin.currentWeight')}</span>
              <strong>{currentWeightLabel}</strong>
            </div>
            <div className="goal-line">
              <span>{t('checkin.goal')}</span>
              <strong>{goalWeightLabel}</strong>
            </div>
            <div className="goal-line">
              <span>{t('checkin.mainFocus')}</span>
              <strong>
                {profileSettings.profile.trainingGoal || t('state.notSet')}
              </strong>
            </div>
            {hasProfileGoal ? null : (
              <p className="goal-empty-hint">{t('checkin.goalHint')}</p>
            )}
          </div>
          <p className="card-copy">{t('checkin.weightReminder')}</p>
        </article>

        <article className="dashboard-card recomp-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">{t('checkin.readEyebrow')}</p>
              <h2>{t('checkin.readTitle')}</h2>
            </div>
            <Info size={22} strokeWidth={2.4} aria-hidden="true" />
          </div>
          <p className="card-copy">{t('checkin.readCopy')}</p>
        </article>
      </div>

      {trends.length > 0 ? (
        <article className="dashboard-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">{t('checkin.trendEyebrow')}</p>
              <h2>{t('checkin.trendTitle')}</h2>
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
          {t('checkin.uploading')}
        </div>
      ) : null}
      {saveStatus === 'saving' ? (
        <div className="checkin-save-status checkin-save-status--info" role="status">
          <Loader2 size={18} strokeWidth={2.4} aria-hidden="true" />
          {t('checkin.saving')}
        </div>
      ) : null}
      {saveStatus === 'saved' ? (
        <div
          className="checkin-save-status checkin-save-status--success"
          role="status"
        >
          <CheckCircle2 size={18} strokeWidth={2.4} aria-hidden="true" />
          {t('checkin.saved')}
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
            <h2>{t('checkin.emptyTitle')}</h2>
            <p>
              {SHOW_DEMO_DATA
                ? t('checkin.emptyCopyDemo')
                : t('checkin.emptyCopy')}
            </p>
          </div>
          {SHOW_DEMO_DATA ? (
            <button
              className="workout-primary-button"
              onClick={handleAddDemo}
              type="button"
            >
              {t('checkin.addDemo')}
            </button>
          ) : null}
        </article>
      )}

      <section className="progress-section">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">{t('checkin.chartsEyebrow')}</p>
            <h2>{t('checkin.chartsTitle')}</h2>
          </div>
        </div>
        <div className="chart-grid">
          {chartConfigs.map((config) => (
            <MeasurementChart
              data={getMeasurementProgress(checkIns, config.key)}
              dataKey="value"
              emptyMessage={t('checkin.chartEmpty', {
                measurement: t(config.titleKey).toLowerCase(),
              })}
              key={config.key}
              title={t(config.titleKey)}
              unit={t(config.unitKey)}
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
            <p className="eyebrow">{t('checkin.deleteEyebrow')}</p>
            <h2 id="delete-checkin-title">
              {t('checkin.deleteTitle', {
                date: formatCheckInDate(deletingCheckIn.date),
              })}
            </h2>
            <p>{t('checkin.deleteCopy')}</p>
            <div className="confirm-actions">
              <button
                className="workout-secondary-button"
                onClick={() => setDeletingCheckIn(null)}
                type="button"
              >
                {t('action.cancel')}
              </button>
              <button
                className="confirm-delete-button"
                onClick={handleConfirmDelete}
                type="button"
              >
                {t('action.delete')}
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
