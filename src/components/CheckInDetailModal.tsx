import { X } from 'lucide-react'
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

interface CheckInDetailModalProps {
  checkIn: BodyCheckIn
  onClose: () => void
}

export function CheckInDetailModal({ checkIn, onClose }: CheckInDetailModalProps) {
  const metrics = [
    { label: 'Body weight', value: formatMetric(checkIn.bodyWeightKg, 'kg') },
    { label: 'Waist', value: formatMetric(checkIn.waistCm, 'cm') },
    { label: 'Belly', value: formatMetric(checkIn.bellyCm, 'cm') },
    { label: 'Chest', value: formatMetric(checkIn.chestCm, 'cm') },
    { label: 'Shoulders', value: formatMetric(checkIn.shouldersCm, 'cm') },
    { label: 'Left arm', value: formatMetric(checkIn.leftArmCm, 'cm') },
    { label: 'Right arm', value: formatMetric(checkIn.rightArmCm, 'cm') },
    { label: 'Arms (avg)', value: formatMetric(getArmAverage(checkIn), 'cm') },
    { label: 'Hips', value: formatMetric(checkIn.hipsCm, 'cm') },
    { label: 'Posture', value: formatRating(checkIn.postureRating) },
    { label: 'Abs visibility', value: formatRating(checkIn.absVisibilityRating) },
    { label: 'Energy', value: formatRating(checkIn.energyLevel) },
    { label: 'Sleep', value: formatRating(checkIn.sleepQuality) },
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
            <p className="eyebrow">Check-in Details</p>
            <h2 id="checkin-detail-title">{formatCheckInDate(checkIn.date)}</h2>
          </div>
          <button
            aria-label="Close check-in details"
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
            <p className="eyebrow">Notes</p>
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
                label={photo.label}
                slot={photo.slot}
                variant="detail"
              />
            ))}
          </div>
        ) : (
          <p className="checkin-detail-empty">No photos saved for this check-in.</p>
        )}
      </section>
    </div>
  )
}

function formatMetric(value: number | null, unit: string): string {
  return value === null ? '—' : `${value} ${unit}`
}

function formatRating(value: number | null): string {
  return value === null ? '—' : `${value}/10`
}
