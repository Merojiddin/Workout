import { Loader2, RotateCcw, Save, X } from 'lucide-react'
import { useState } from 'react'
import type { BodyCheckIn, PhotoSlot } from '../data/bodyCheckIns'
import { useAuth } from '../context/AuthContext'
import { isCloudPhotoEnabled } from '../services/photoService'
import { fileToBase64 } from '../utils/imageUtils'
import { generateCheckInId, todayIso } from '../utils/bodyCheckInUtils'
import { ImageUploadPreview } from './ImageUploadPreview'

type NumericKey =
  | 'bodyWeightKg'
  | 'waistCm'
  | 'bellyCm'
  | 'chestCm'
  | 'shouldersCm'
  | 'leftArmCm'
  | 'rightArmCm'
  | 'hipsCm'
  | 'postureRating'
  | 'absVisibilityRating'
  | 'energyLevel'
  | 'sleepQuality'

/** Files the user picked this session, to be uploaded on save (cloud mode). */
export type PhotoFiles = Partial<Record<PhotoSlot, File>>

type PhotoState = {
  /** Displayable preview src: base64, object URL, or an existing signed URL. */
  preview: string | null
  /** Existing Storage path carried over from initialData (unchanged photos). */
  path: string | null
  /** Existing display URL carried over from initialData. */
  url: string | null
}

type CheckInDraft = {
  date: string
  notes: string
} & Record<NumericKey, string>

interface BodyCheckInFormProps {
  /**
   * Returns false when the save failed so the form keeps the user's data.
   * Anything else (including void/undefined for local mode) counts as success.
   */
  onSave: (
    checkIn: BodyCheckIn,
    photoFiles: PhotoFiles,
  ) => Promise<boolean> | boolean | void
  initialData?: BodyCheckIn | null
  mode?: 'create' | 'edit'
  onCancel?: () => void
  /** Which photo slots are currently uploading (for the busy indicator). */
  uploadingSlots?: Partial<Record<PhotoSlot, boolean>>
}

const measurementInputs: { key: NumericKey; label: string; unit: string }[] = [
  { key: 'bodyWeightKg', label: 'Body weight', unit: 'kg' },
  { key: 'waistCm', label: 'Waist', unit: 'cm' },
  { key: 'bellyCm', label: 'Belly', unit: 'cm' },
  { key: 'chestCm', label: 'Chest', unit: 'cm' },
  { key: 'shouldersCm', label: 'Shoulders', unit: 'cm' },
  { key: 'leftArmCm', label: 'Left arm', unit: 'cm' },
  { key: 'rightArmCm', label: 'Right arm', unit: 'cm' },
  { key: 'hipsCm', label: 'Hips', unit: 'cm' },
]

const ratingInputs: { key: NumericKey; label: string }[] = [
  { key: 'postureRating', label: 'Posture rating' },
  { key: 'absVisibilityRating', label: 'Abs visibility' },
  { key: 'energyLevel', label: 'Energy level' },
  { key: 'sleepQuality', label: 'Sleep quality' },
]

const photoInputs: { key: PhotoSlot; label: string }[] = [
  { key: 'front', label: 'Front photo' },
  { key: 'side', label: 'Side photo' },
  { key: 'back', label: 'Back photo' },
]

const numericKeys = [...measurementInputs, ...ratingInputs].map((input) => input.key)
const ratingKeys = new Set<NumericKey>(ratingInputs.map((input) => input.key))

export function BodyCheckInForm({
  onSave,
  initialData,
  mode = 'create',
  onCancel,
  uploadingSlots = {},
}: BodyCheckInFormProps) {
  const { user } = useAuth()
  const cloudPhotos = isCloudPhotoEnabled(user)

  const [draft, setDraft] = useState<CheckInDraft>(() => createDraft(initialData))
  const [photos, setPhotos] = useState<Record<PhotoSlot, PhotoState>>(() =>
    createPhotoState(initialData),
  )
  const [photoFiles, setPhotoFiles] = useState<PhotoFiles>({})
  const [errors, setErrors] = useState<Partial<Record<keyof CheckInDraft, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  const isEdit = mode === 'edit'
  const weightMissing = draft.bodyWeightKg.trim() === ''

  function setField(key: keyof CheckInDraft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  async function handlePhotoSelect(
    slot: PhotoSlot,
    file: File,
    previewUrl: string | null,
  ) {
    if (cloudPhotos) {
      // Keep the File to upload on save; show the local preview immediately.
      setPhotoFiles((current) => ({ ...current, [slot]: file }))
      setPhotos((current) => ({
        ...current,
        [slot]: { preview: previewUrl, path: null, url: null },
      }))
      return
    }

    // Local mode: store base64 directly.
    try {
      const base64 = await fileToBase64(file)
      setPhotoFiles((current) => {
        const next = { ...current }
        delete next[slot]
        return next
      })
      setPhotos((current) => ({
        ...current,
        [slot]: { preview: base64, path: null, url: null },
      }))
    } catch {
      setPhotos((current) => ({
        ...current,
        [slot]: { preview: previewUrl, path: null, url: null },
      }))
    }
  }

  function handlePhotoRemove(slot: PhotoSlot) {
    setPhotoFiles((current) => {
      const next = { ...current }
      delete next[slot]
      return next
    })
    setPhotos((current) => ({
      ...current,
      [slot]: { preview: null, path: null, url: null },
    }))
  }

  function handleClear() {
    setDraft(createDraft(null))
    setPhotos(createPhotoState(null))
    setPhotoFiles({})
    setErrors({})
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (submitting) {
      return
    }

    const nextErrors: Partial<Record<keyof CheckInDraft, string>> = {}

    if (!draft.date) {
      nextErrors.date = 'Date is required.'
    }

    for (const key of numericKeys) {
      const raw = draft[key].trim()
      if (raw === '') {
        continue
      }

      const parsed = Number(raw)
      if (!Number.isFinite(parsed)) {
        nextErrors[key] = 'Enter a valid number.'
      } else if (parsed < 0) {
        nextErrors[key] = 'Cannot be negative.'
      } else if (ratingKeys.has(key) && (parsed < 1 || parsed > 10)) {
        nextErrors[key] = 'Must be 1–10.'
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    setSubmitting(true)
    try {
      const result = await onSave(
        buildCheckIn(draft, photos, photoFiles, initialData),
        photoFiles,
      )
      // Only clear on success so a failed upload keeps the user's data.
      if (result !== false && !isEdit) {
        handleClear()
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <article className="dashboard-card checkin-form-card">
      <div className="card-heading">
        <div>
          <p className="eyebrow">{isEdit ? 'Edit Check-in' : 'New Check-in'}</p>
          <h2>{isEdit ? 'Update measurements' : 'Log this week'}</h2>
        </div>
      </div>

      <form className="checkin-form" noValidate onSubmit={handleSubmit}>
        <div className="checkin-field">
          <label htmlFor="checkin-date">Date</label>
          <input
            className="checkin-input"
            id="checkin-date"
            onChange={(event) => setField('date', event.target.value)}
            type="date"
            value={draft.date}
          />
          {errors.date ? (
            <span className="checkin-field__error">{errors.date}</span>
          ) : null}
        </div>

        <div className="checkin-form__grid">
          {measurementInputs.map((input) => (
            <div className="checkin-field" key={input.key}>
              <label htmlFor={`checkin-${input.key}`}>
                {input.label} <span className="checkin-field__unit">({input.unit})</span>
              </label>
              <input
                className="checkin-input"
                id={`checkin-${input.key}`}
                inputMode="decimal"
                min={0}
                onChange={(event) => setField(input.key, event.target.value)}
                placeholder="0"
                step="0.1"
                type="number"
                value={draft[input.key]}
              />
              {input.key === 'bodyWeightKg' && weightMissing ? (
                <span className="checkin-field__hint">
                  Optional, but recommended for tracking.
                </span>
              ) : null}
              {errors[input.key] ? (
                <span className="checkin-field__error">{errors[input.key]}</span>
              ) : null}
            </div>
          ))}
        </div>

        <div className="checkin-form__grid">
          {ratingInputs.map((input) => (
            <div className="checkin-field" key={input.key}>
              <label htmlFor={`checkin-${input.key}`}>
                {input.label} <span className="checkin-field__unit">(1–10)</span>
              </label>
              <input
                className="checkin-input"
                id={`checkin-${input.key}`}
                inputMode="numeric"
                max={10}
                min={1}
                onChange={(event) => setField(input.key, event.target.value)}
                placeholder="1–10"
                step="1"
                type="number"
                value={draft[input.key]}
              />
              {errors[input.key] ? (
                <span className="checkin-field__error">{errors[input.key]}</span>
              ) : null}
            </div>
          ))}
        </div>

        <div className="checkin-field">
          <label htmlFor="checkin-notes">Notes</label>
          <textarea
            className="checkin-textarea"
            id="checkin-notes"
            onChange={(event) => setField('notes', event.target.value)}
            placeholder="How you look and feel, form cues, energy, anything worth remembering."
            rows={3}
            value={draft.notes}
          />
        </div>

        <div className="photo-upload-section">
          <div className="photo-upload-hint">
            {cloudPhotos
              ? 'Photos are saved securely to your cloud account.'
              : 'Photos are stored on this device. JPG, PNG, or WEBP up to 5 MB.'}
          </div>
          <div className="photo-upload-grid">
            {photoInputs.map((photo) => (
              <ImageUploadPreview
                key={photo.key}
                label={photo.label}
                onRemove={() => handlePhotoRemove(photo.key)}
                onSelect={(file, previewUrl) =>
                  handlePhotoSelect(photo.key, file, previewUrl)
                }
                previewSrc={photos[photo.key].preview}
                uploading={Boolean(uploadingSlots[photo.key])}
              />
            ))}
          </div>
        </div>

        <div className="checkin-actions">
          <button
            className="workout-primary-button"
            disabled={submitting}
            type="submit"
          >
            {submitting ? (
              <Loader2 size={18} strokeWidth={2.4} aria-hidden="true" />
            ) : (
              <Save size={18} strokeWidth={2.4} aria-hidden="true" />
            )}
            {submitting
              ? 'Saving…'
              : isEdit
                ? 'Update Check-in'
                : 'Save Check-in'}
          </button>
          <button
            className="workout-secondary-button"
            disabled={submitting}
            onClick={handleClear}
            type="button"
          >
            <RotateCcw size={18} strokeWidth={2.4} aria-hidden="true" />
            Clear Form
          </button>
          {isEdit && onCancel ? (
            <button
              className="workout-secondary-button"
              disabled={submitting}
              onClick={onCancel}
              type="button"
            >
              <X size={18} strokeWidth={2.4} aria-hidden="true" />
              Cancel Edit
            </button>
          ) : null}
        </div>
      </form>
    </article>
  )
}

function createDraft(initialData?: BodyCheckIn | null): CheckInDraft {
  return {
    date: initialData?.date || todayIso(),
    bodyWeightKg: numberToInput(initialData?.bodyWeightKg),
    waistCm: numberToInput(initialData?.waistCm),
    bellyCm: numberToInput(initialData?.bellyCm),
    chestCm: numberToInput(initialData?.chestCm),
    shouldersCm: numberToInput(initialData?.shouldersCm),
    leftArmCm: numberToInput(initialData?.leftArmCm),
    rightArmCm: numberToInput(initialData?.rightArmCm),
    hipsCm: numberToInput(initialData?.hipsCm),
    postureRating: numberToInput(initialData?.postureRating),
    absVisibilityRating: numberToInput(initialData?.absVisibilityRating),
    energyLevel: numberToInput(initialData?.energyLevel),
    sleepQuality: numberToInput(initialData?.sleepQuality),
    notes: initialData?.notes ?? '',
  }
}

function createPhotoState(
  initialData?: BodyCheckIn | null,
): Record<PhotoSlot, PhotoState> {
  const slots: PhotoSlot[] = ['front', 'side', 'back']
  const record = (initialData ?? null) as unknown as Record<string, unknown> | null

  return slots.reduce(
    (acc, slot) => {
      const url = asString(record?.[`${slot}PhotoUrl`])
      const base64 = asString(record?.[`${slot}Photo`])
      const path = asString(record?.[`${slot}PhotoPath`])
      acc[slot] = {
        preview: url || base64 || null,
        path: path || null,
        url: url || null,
      }
      return acc
    },
    {} as Record<PhotoSlot, PhotoState>,
  )
}

function buildCheckIn(
  draft: CheckInDraft,
  photos: Record<PhotoSlot, PhotoState>,
  photoFiles: PhotoFiles,
  initialData?: BodyCheckIn | null,
): BodyCheckIn {
  const slotFields = (slot: PhotoSlot) => {
    const state = photos[slot]
    const hasNewFile = Boolean(photoFiles[slot])

    if (hasNewFile) {
      // Uploaded by the service; don't persist the object-URL preview.
      return { photo: null, path: null, url: null }
    }

    // Unchanged or removed: keep base64 for local, keep path/url for cloud.
    const photo = isDataUrl(state.preview) ? state.preview : null
    return { photo, path: state.path, url: state.url }
  }

  const front = slotFields('front')
  const side = slotFields('side')
  const back = slotFields('back')

  return {
    id: initialData?.id ?? generateCheckInId(),
    date: draft.date,
    bodyWeightKg: inputToNumber(draft.bodyWeightKg),
    waistCm: inputToNumber(draft.waistCm),
    bellyCm: inputToNumber(draft.bellyCm),
    chestCm: inputToNumber(draft.chestCm),
    shouldersCm: inputToNumber(draft.shouldersCm),
    leftArmCm: inputToNumber(draft.leftArmCm),
    rightArmCm: inputToNumber(draft.rightArmCm),
    hipsCm: inputToNumber(draft.hipsCm),
    postureRating: inputToNumber(draft.postureRating),
    absVisibilityRating: inputToNumber(draft.absVisibilityRating),
    energyLevel: inputToNumber(draft.energyLevel),
    sleepQuality: inputToNumber(draft.sleepQuality),
    notes: draft.notes.trim(),
    frontPhoto: front.photo,
    sidePhoto: side.photo,
    backPhoto: back.photo,
    frontPhotoPath: front.path,
    sidePhotoPath: side.path,
    backPhotoPath: back.path,
    frontPhotoUrl: front.url,
    sidePhotoUrl: side.url,
    backPhotoUrl: back.url,
    createdAt: initialData?.createdAt ?? new Date().toISOString(),
  }
}

function isDataUrl(value: string | null): value is string {
  return typeof value === 'string' && value.startsWith('data:')
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null
}

function numberToInput(value: number | null | undefined): string {
  return value === null || value === undefined ? '' : String(value)
}

function inputToNumber(value: string): number | null {
  const raw = value.trim()
  if (raw === '') {
    return null
  }

  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}
