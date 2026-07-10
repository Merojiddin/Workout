import { ImagePlus, Loader2, X } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import {
  createImagePreview,
  resizeImageFile,
  validateImageFile,
} from '../utils/imageUtils'

interface ImageUploadPreviewProps {
  label: string
  /** What to show in the preview (base64, object URL, or a signed URL). */
  previewSrc: string | null
  /** Called with a validated + resized File and a local object-URL preview. */
  onSelect: (file: File, previewUrl: string | null) => void
  onRemove: () => void
  /** True while the parent is uploading this photo to the cloud. */
  uploading?: boolean
  disabled?: boolean
}

export function ImageUploadPreview({
  label,
  previewSrc,
  onSelect,
  onRemove,
  uploading = false,
  disabled = false,
}: ImageUploadPreviewProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [failedToLoad, setFailedToLoad] = useState(false)

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Allow re-selecting the same file later.
    event.target.value = ''

    if (!file) {
      return
    }

    const check = validateImageFile(file)
    if (!check.valid) {
      setError(check.error)
      return
    }

    setError(null)
    setFailedToLoad(false)
    setIsProcessing(true)

    try {
      const resized: File = await resizeImageFile(file)
      const previewUrl: string | null = createImagePreview(resized)
      onSelect(resized, previewUrl)
    } catch {
      setError('Could not read that image. Try another one.')
    } finally {
      setIsProcessing(false)
    }
  }

  function handleRemove() {
    onRemove()
    setError(null)
    setFailedToLoad(false)
    inputRef.current?.focus()
  }

  const busy = isProcessing || uploading
  const showPreview = Boolean(previewSrc) && !failedToLoad

  return (
    <div className="image-upload">
      <span className="image-upload__label">{label}</span>

      {showPreview ? (
        <div className="image-upload__preview">
          <div className="image-upload__frame">
            <img
              alt={`${label} preview`}
              className="image-upload__thumb"
              onError={() => setFailedToLoad(true)}
              src={previewSrc ?? ''}
            />
            {uploading ? (
              <span className="image-upload__uploading">
                <Loader2 size={16} strokeWidth={2.6} aria-hidden="true" />
                Uploading…
              </span>
            ) : null}
          </div>
          <button
            aria-label={`Remove ${label}`}
            className="image-upload__remove"
            disabled={disabled || uploading}
            onClick={handleRemove}
            type="button"
          >
            <X size={16} strokeWidth={2.6} aria-hidden="true" />
            Remove
          </button>
        </div>
      ) : (
        <label className="image-upload__dropzone" htmlFor={inputId}>
          {busy ? (
            <Loader2 size={22} strokeWidth={2.2} aria-hidden="true" />
          ) : (
            <ImagePlus size={22} strokeWidth={2.2} aria-hidden="true" />
          )}
          <span>
            {failedToLoad
              ? 'Photo unavailable — add again'
              : busy
                ? 'Processing…'
                : 'Add photo'}
          </span>
        </label>
      )}

      <input
        accept="image/jpeg,image/png,image/webp"
        className="image-upload__input"
        disabled={disabled || busy}
        id={inputId}
        onChange={handleFileChange}
        ref={inputRef}
        type="file"
      />

      {error ? <span className="checkin-field__error">{error}</span> : null}
    </div>
  )
}
