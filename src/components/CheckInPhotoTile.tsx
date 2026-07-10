import { Expand, ImageOff, Maximize2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { BodyCheckIn, PhotoSlot } from '../data/bodyCheckIns'
import {
  getCheckInPhotoPath,
  getCheckInPhotoSrc,
} from '../utils/bodyCheckInUtils'
import { getProgressPhotoUrl } from '../services/photoService'

interface CheckInPhotoTileProps {
  checkIn: BodyCheckIn
  slot: PhotoSlot
  label: string
  variant?: 'detail' | 'thumb' | 'progress'
  allowFullSize?: boolean
}

/**
 * Renders a single check-in photo from any source:
 *  - resolved/base64 URL (shown instantly), or
 *  - a Storage path that we resolve to a signed URL on mount.
 * Returns null when the slot has no photo. Never crashes if a URL 404s/expires.
 */
export function CheckInPhotoTile({
  checkIn,
  slot,
  label,
  variant = 'detail',
  allowFullSize = false,
}: CheckInPhotoTileProps) {
  const directSrc = getCheckInPhotoSrc(checkIn, slot)
  const path = getCheckInPhotoPath(checkIn, slot)

  const [src, setSrc] = useState<string | null>(directSrc)
  const [failed, setFailed] = useState(false)
  const [fullSize, setFullSize] = useState(false)

  useEffect(() => {
    setSrc(directSrc)
    setFailed(false)

    if (directSrc || !path) {
      return
    }

    let active = true
    getProgressPhotoUrl(path)
      .then((resolved: string | null) => {
        if (active && resolved) {
          setSrc(resolved)
        }
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [directSrc, path])

  // Nothing stored for this slot at all.
  if (!directSrc && !path) {
    return null
  }

  return (
    <figure className={`checkin-photo-tile checkin-photo-tile--${variant}`}>
      <div className="checkin-photo-tile__frame">
        {src && !failed ? (
          <img
            alt={`${label} check-in photo`}
            onError={() => setFailed(true)}
            src={src}
          />
        ) : (
          <div className="checkin-photo-tile__fallback">
            <ImageOff size={20} strokeWidth={2.2} aria-hidden="true" />
            <span>{failed ? 'Unavailable' : 'Loading…'}</span>
          </div>
        )}

        {allowFullSize && src && !failed ? (
          <button
            aria-label={`Open ${label} photo full size`}
            className="checkin-photo-tile__expand"
            onClick={() => setFullSize(true)}
            type="button"
          >
            <Expand size={15} strokeWidth={2.6} aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <figcaption>{label}</figcaption>

      {allowFullSize ? (
        <div className="checkin-photo-actions">
          <button
            className="checkin-photo-fullsize-button"
            disabled={!src || failed}
            onClick={() => setFullSize(true)}
            type="button"
          >
            <Maximize2 size={15} strokeWidth={2.4} aria-hidden="true" />
            Open full size
          </button>
        </div>
      ) : null}

      {fullSize && src && !failed ? (
        <div
          className="photo-lightbox"
          onClick={() => setFullSize(false)}
          role="presentation"
        >
          <button
            aria-label="Close full size photo"
            className="photo-lightbox__close"
            onClick={() => setFullSize(false)}
            type="button"
          >
            <X size={22} strokeWidth={2.4} aria-hidden="true" />
          </button>
          <img
            alt={`${label} check-in photo, full size`}
            className="photo-lightbox__image"
            onClick={(event) => event.stopPropagation()}
            src={src}
          />
          <span className="photo-lightbox__caption">{label}</span>
        </div>
      ) : null}
    </figure>
  )
}
