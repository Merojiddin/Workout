import { ImagePlus, Link2, Loader2, Trash2, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import {
  exerciseLibrary,
  type ExerciseMedia as ExerciseMediaFields,
  type LibraryExercise,
} from '../data/exerciseLibrary'
import { fileToBase64, resizeImageFile, validateImageFile } from '../utils/imageUtils'
import { getEmbedVideoUrl } from '../utils/mediaUtils'

interface ExerciseMediaEditorProps {
  exercise: LibraryExercise
  /** Called with just the media fields to merge into the exercise and persist. */
  onSave: (updates: Partial<ExerciseMediaFields>) => void
}

// Stored as base64 inside the customExerciseLibrary localStorage blob, so cap
// a single image well below the ~5 MB total quota.
const MAX_STORED_IMAGE_CHARS = 1_200_000

const defaultExercisesById = new Map(
  exerciseLibrary.map((entry) => [entry.id, entry]),
)

/**
 * Lets the user attach their own photo and YouTube link to an exercise.
 * Images are resized and stored as base64 data URLs; video links are
 * converted to safe embed URLs before saving. Removing either one restores
 * the default library media for that exercise (when it has any).
 */
export function ExerciseMediaEditor({ exercise, onSave }: ExerciseMediaEditorProps) {
  const inputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [videoInput, setVideoInput] = useState('')
  const [videoError, setVideoError] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!notice) {
      return
    }
    const timer = window.setTimeout(() => setNotice(''), 2500)
    return () => window.clearTimeout(timer)
  }, [notice])

  const defaultEntry = defaultExercisesById.get(exercise.id)

  // Uploaded photos are always data URLs; anything else is library media.
  const customImage =
    typeof exercise.imageUrl === 'string' && exercise.imageUrl.startsWith('data:')
      ? exercise.imageUrl
      : null

  const activeVideoUrl =
    exercise.videoType === 'none' ? '' : (exercise.videoUrl ?? '')
  const customVideo =
    activeVideoUrl !== '' && activeVideoUrl !== (defaultEntry?.videoUrl ?? '')
      ? activeVideoUrl
      : null

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Allow re-selecting the same file later.
    event.target.value = ''

    if (!file) {
      return
    }

    const check = validateImageFile(file)
    if (!check.valid) {
      setImageError(check.error)
      return
    }

    setImageError(null)
    setIsProcessing(true)

    try {
      const resized: File = await resizeImageFile(file, 960, 0.82)
      const dataUrl: string = await fileToBase64(resized)
      if (dataUrl.length > MAX_STORED_IMAGE_CHARS) {
        setImageError('That image is too large to store. Try a smaller one.')
        return
      }
      onSave({ imageUrl: dataUrl, imageAlt: `${exercise.name} — your photo` })
      setNotice('Image saved.')
    } catch {
      setImageError('Could not read that image. Try another one.')
    } finally {
      setIsProcessing(false)
    }
  }

  function removeImage() {
    onSave({
      imageUrl: defaultEntry?.imageUrl ?? '',
      imageAlt: defaultEntry?.imageAlt ?? '',
    })
    setImageError(null)
    setNotice('Image removed — default restored.')
    fileInputRef.current?.focus()
  }

  function saveVideo() {
    const embedUrl = getEmbedVideoUrl(videoInput)
    if (embedUrl === '') {
      setVideoError(
        'Paste a valid YouTube link (watch, Shorts, youtu.be, or embed URL).',
      )
      return
    }

    setVideoError(null)
    onSave({
      videoUrl: embedUrl,
      videoType: 'youtube',
      videoTitle: `${exercise.name} — your video`,
    })
    setVideoInput('')
    setNotice('Video link saved.')
  }

  function removeVideo() {
    if (defaultEntry?.videoUrl) {
      onSave({
        videoUrl: defaultEntry.videoUrl,
        videoType: defaultEntry.videoType ?? 'youtube',
        videoTitle: defaultEntry.videoTitle ?? '',
      })
    } else {
      onSave({ videoUrl: '', videoType: 'none', videoTitle: '' })
    }
    setVideoError(null)
    setNotice('Video removed — default restored.')
  }

  return (
    <div className="exercise-media-editor">
      <button
        aria-expanded={open}
        className="workout-secondary-button exercise-media-editor__toggle"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        type="button"
      >
        {open ? (
          <X size={18} strokeWidth={2.4} aria-hidden="true" />
        ) : (
          <ImagePlus size={18} strokeWidth={2.4} aria-hidden="true" />
        )}
        {open ? 'Close media editor' : 'Add your own image / video'}
      </button>

      {open ? (
        <div className="exercise-media-editor__body">
          <div className="exercise-media-editor__block">
            <span className="image-upload__label">Your image</span>
            {customImage ? (
              <div className="image-upload__preview">
                <div className="image-upload__frame">
                  <img
                    alt={`${exercise.name} custom preview`}
                    className="image-upload__thumb"
                    src={customImage}
                  />
                </div>
                <button
                  className="image-upload__remove"
                  onClick={removeImage}
                  type="button"
                >
                  <Trash2 size={16} strokeWidth={2.6} aria-hidden="true" />
                  Remove — restore default
                </button>
              </div>
            ) : (
              <label className="image-upload__dropzone" htmlFor={inputId}>
                {isProcessing ? (
                  <Loader2 size={22} strokeWidth={2.2} aria-hidden="true" />
                ) : (
                  <ImagePlus size={22} strokeWidth={2.2} aria-hidden="true" />
                )}
                <span>{isProcessing ? 'Processing…' : 'Upload your photo'}</span>
              </label>
            )}
            <input
              accept="image/jpeg,image/png,image/webp"
              className="image-upload__input"
              disabled={isProcessing}
              id={inputId}
              onChange={handleFileChange}
              ref={fileInputRef}
              type="file"
            />
            <p className="exercise-media-editor__hint">
              Stored on this device only. Photos are resized automatically.
            </p>
            {imageError ? (
              <span className="checkin-field__error">{imageError}</span>
            ) : null}
          </div>

          <div className="exercise-media-editor__block">
            <span className="image-upload__label">Your video link</span>
            {customVideo ? (
              <div className="exercise-media-editor__current-video">
                <Link2 size={16} strokeWidth={2.4} aria-hidden="true" />
                <span className="exercise-media-editor__video-url">
                  {customVideo}
                </span>
                <button
                  className="image-upload__remove"
                  onClick={removeVideo}
                  type="button"
                >
                  <Trash2 size={16} strokeWidth={2.6} aria-hidden="true" />
                  Remove — restore default
                </button>
              </div>
            ) : (
              <div className="exercise-media-editor__video-form">
                <input
                  className="settings-input"
                  onChange={(event) => setVideoInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      saveVideo()
                    }
                  }}
                  placeholder="https://www.youtube.com/watch?v=…"
                  type="url"
                  value={videoInput}
                />
                <button
                  className="workout-secondary-button"
                  disabled={videoInput.trim() === ''}
                  onClick={saveVideo}
                  type="button"
                >
                  Save video
                </button>
              </div>
            )}
            <p className="exercise-media-editor__hint">
              YouTube links only (watch, Shorts, or youtu.be) — they play inside
              the app.
            </p>
            {videoError ? (
              <span className="checkin-field__error">{videoError}</span>
            ) : null}
          </div>

          {notice ? (
            <p aria-live="polite" className="exercise-media-editor__notice">
              {notice}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
