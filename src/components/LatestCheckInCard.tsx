import { CalendarCheck2 } from 'lucide-react'
import { useT, type MessageKey, type TranslateFn } from '../i18n'
import type { BodyCheckIn, PhotoSlot } from '../data/bodyCheckIns'
import {
  checkInHasPhotos,
  formatCheckInDate,
  getArmAverage,
} from '../utils/bodyCheckInUtils'
import { CheckInPhotoTile } from './CheckInPhotoTile'

const photoSlots: { slot: PhotoSlot; labelKey: MessageKey }[] = [
  { slot: 'front', labelKey: 'checkin.photo.front' },
  { slot: 'side', labelKey: 'checkin.photo.side' },
  { slot: 'back', labelKey: 'checkin.photo.back' },
]

interface LatestCheckInCardProps {
  checkIn: BodyCheckIn
}

export function LatestCheckInCard({ checkIn }: LatestCheckInCardProps) {
  const t = useT()
  const armAverage = getArmAverage(checkIn)
  const hasPhotos = checkInHasPhotos(checkIn)

  const kg = t('unit.kg')
  const cm = t('unit.cm')
  const metrics = [
    { label: t('measure.weight'), value: formatMetric(checkIn.bodyWeightKg, kg) },
    { label: t('measure.waistCm'), value: formatMetric(checkIn.waistCm, cm) },
    { label: t('measure.bellyCm'), value: formatMetric(checkIn.bellyCm, cm) },
    { label: t('measure.chestCm'), value: formatMetric(checkIn.chestCm, cm) },
    {
      label: t('measure.shouldersCm'),
      value: formatMetric(checkIn.shouldersCm, cm),
    },
    { label: t('measure.armsAverage'), value: formatMetric(armAverage, cm) },
    {
      label: t('measure.posture'),
      value: formatRating(checkIn.postureRating, t),
    },
    {
      label: t('measure.abs'),
      value: formatRating(checkIn.absVisibilityRating, t),
    },
  ]

  return (
    <article className="dashboard-card">
      <div className="card-heading">
        <div>
          <p className="eyebrow">{t('checkin.latestEyebrow')}</p>
          <h2>{formatCheckInDate(checkIn.date)}</h2>
        </div>
        <CalendarCheck2 size={22} strokeWidth={2.4} aria-hidden="true" />
      </div>

      <div className="checkin-metric-grid">
        {metrics.map((metric) => (
          <div className="checkin-metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>

      {checkIn.notes ? (
        <p className="checkin-notes">“{checkIn.notes}”</p>
      ) : null}

      {hasPhotos ? (
        <div className="checkin-photo-thumbs">
          {photoSlots.map((photo) => (
            <CheckInPhotoTile
              checkIn={checkIn}
              key={photo.slot}
              label={t(photo.labelKey)}
              slot={photo.slot}
              variant="thumb"
            />
          ))}
        </div>
      ) : null}
    </article>
  )
}

function formatMetric(value: number | null, unit: string): string {
  return value === null ? '—' : `${value} ${unit}`
}

function formatRating(value: number | null, t: TranslateFn): string {
  return value === null ? '—' : t('checkin.rating', { value })
}
