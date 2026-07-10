import { CalendarCheck2 } from 'lucide-react'
import type { BodyCheckIn, PhotoSlot } from '../data/bodyCheckIns'
import {
  checkInHasPhotos,
  formatCheckInDate,
  getArmAverage,
} from '../utils/bodyCheckInUtils'
import { CheckInPhotoTile } from './CheckInPhotoTile'

const photoSlots: { slot: PhotoSlot; label: string }[] = [
  { slot: 'front', label: 'Front' },
  { slot: 'side', label: 'Side' },
  { slot: 'back', label: 'Back' },
]

interface LatestCheckInCardProps {
  checkIn: BodyCheckIn
}

export function LatestCheckInCard({ checkIn }: LatestCheckInCardProps) {
  const armAverage = getArmAverage(checkIn)
  const hasPhotos = checkInHasPhotos(checkIn)

  const metrics = [
    { label: 'Weight', value: formatMetric(checkIn.bodyWeightKg, 'kg') },
    { label: 'Waist', value: formatMetric(checkIn.waistCm, 'cm') },
    { label: 'Belly', value: formatMetric(checkIn.bellyCm, 'cm') },
    { label: 'Chest', value: formatMetric(checkIn.chestCm, 'cm') },
    { label: 'Shoulders', value: formatMetric(checkIn.shouldersCm, 'cm') },
    { label: 'Arms (avg)', value: formatMetric(armAverage, 'cm') },
    { label: 'Posture', value: formatRating(checkIn.postureRating) },
    { label: 'Abs', value: formatRating(checkIn.absVisibilityRating) },
  ]

  return (
    <article className="dashboard-card">
      <div className="card-heading">
        <div>
          <p className="eyebrow">Latest Check-in</p>
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
              label={photo.label}
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

function formatRating(value: number | null): string {
  return value === null ? '—' : `${value}/10`
}
