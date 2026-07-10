import { Camera, ChevronRight } from 'lucide-react'
import type { BodyCheckIn, PhotoSlot } from '../data/bodyCheckIns'
import { formatCheckInDate } from '../utils/bodyCheckInUtils'
import { CheckInPhotoTile } from './CheckInPhotoTile'

const photoSlots: { slot: PhotoSlot; label: string }[] = [
  { slot: 'front', label: 'Front' },
  { slot: 'side', label: 'Side' },
  { slot: 'back', label: 'Back' },
]

interface ProgressPhotosCardProps {
  checkIn: BodyCheckIn
  onViewCheckIns: () => void
}

/** Compact "Progress Photos" panel for the Progress page (latest check-in). */
export function ProgressPhotosCard({
  checkIn,
  onViewCheckIns,
}: ProgressPhotosCardProps) {
  return (
    <article className="dashboard-card progress-photos-card">
      <div className="card-heading">
        <div>
          <p className="eyebrow">Progress Photos</p>
          <h2>Latest — {formatCheckInDate(checkIn.date)}</h2>
        </div>
        <Camera size={22} strokeWidth={2.4} aria-hidden="true" />
      </div>

      <div className="progress-photos-grid">
        {photoSlots.map((photo) => (
          <CheckInPhotoTile
            checkIn={checkIn}
            key={photo.slot}
            label={photo.label}
            slot={photo.slot}
            variant="progress"
          />
        ))}
      </div>

      <button
        className="workout-secondary-button progress-photos-button"
        onClick={onViewCheckIns}
        type="button"
      >
        View Body Check-ins
        <ChevronRight size={17} strokeWidth={2.4} aria-hidden="true" />
      </button>
    </article>
  )
}
