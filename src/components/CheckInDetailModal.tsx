import { X } from 'lucide-react'
import type { BodyCheckIn, PhotoSlot } from '../data/bodyCheckIns'
import {
  checkInHasPhotos,
  formatCheckInDate,
  getArmAverage,
} from '../utils/bodyCheckInUtils'
import { useT, type MessageKey, type TranslateFn } from '../i18n'
import { CheckInPhotoTile } from './CheckInPhotoTile'

const photoSlots: { slot: PhotoSlot; labelKey: MessageKey }[] = [
  { slot: 'front', labelKey: 'checkin.photo.front' },
  { slot: 'side', labelKey: 'checkin.photo.side' },
  { slot: 'back', labelKey: 'checkin.photo.back' },
]

interface CheckInDetailModalProps {
  checkIn: BodyCheckIn
  onClose: () => void
}

export function CheckInDetailModal({ checkIn, onClose }: CheckInDetailModalProps) {
  const t = useT()
  const kg = t('unit.kg')
  const cm = t('unit.cm')
  const metrics = [
    { label: t('measure.bodyWeightKg'), value: formatMetric(checkIn.bodyWeightKg, kg) },
    { label: t('measure.waistCm'), value: formatMetric(checkIn.waistCm, cm) },
    { label: t('measure.bellyCm'), value: formatMetric(checkIn.bellyCm, cm) },
    { label: t('measure.chestCm'), value: formatMetric(checkIn.chestCm, cm) },
    { label: t('measure.shouldersCm'), value: formatMetric(checkIn.shouldersCm, cm) },
    { label: t('measure.leftArmCm'), value: formatMetric(checkIn.leftArmCm, cm) },
    { label: t('measure.rightArmCm'), value: formatMetric(checkIn.rightArmCm, cm) },
    { label: t('measure.armsAverage'), value: formatMetric(getArmAverage(checkIn), cm) },
    { label: t('measure.hipsCm'), value: formatMetric(checkIn.hipsCm, cm) },
    { label: t('measure.posture'), value: formatRating(checkIn.postureRating, t) },
    {
      label: t('measure.absVisibilityRating'),
      value: formatRating(checkIn.absVisibilityRating, t),
    },
    { label: t('measure.energy'), value: formatRating(checkIn.energyLevel, t) },
    { label: t('measure.sleep'), value: formatRating(checkIn.sleepQuality, t) },
  ]

  const hasPhotos = checkInHasPhotos(checkIn)

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="checkin-detail-title"
        aria-modal="true"
        className="workout-detail-modal"
        role="dialog"
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">{t('checkin.detailEyebrow')}</p>
            <h2 id="checkin-detail-title">{formatCheckInDate(checkIn.date)}</h2>
          </div>
          <button
            aria-label={t('checkin.detailClose')}
            className="modal-close-button"
            onClick={onClose}
            type="button"
          >
            <X size={20} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </header>

        <div className="checkin-detail-metrics">
          {metrics.map((metric) => (
            <div className="checkin-metric" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
        </div>

        {checkIn.notes ? (
          <div className="checkin-detail-notes">
            <p className="eyebrow">{t('checkinForm.notes')}</p>
            <p>{checkIn.notes}</p>
          </div>
        ) : null}

        {hasPhotos ? (
          <div className="checkin-detail-photos">
            {photoSlots.map((photo) => (
              <CheckInPhotoTile
                allowFullSize
                checkIn={checkIn}
                key={photo.slot}
                label={t(photo.labelKey)}
                slot={photo.slot}
                variant="detail"
              />
            ))}
          </div>
        ) : (
          <p className="checkin-detail-empty">
            {t('checkin.detailNoPhotos')}
          </p>
        )}
      </section>
    </div>
  )
}

function formatMetric(value: number | null, unit: string): string {
  return value === null ? '—' : `${value} ${unit}`
}

function formatRating(value: number | null, t: TranslateFn): string {
  return value === null ? '—' : t('checkin.rating', { value })
}
