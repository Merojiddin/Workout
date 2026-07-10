import { BookOpen, ImageOff, Play, Video, WifiOff, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import {
  DEFAULT_EXERCISE_IMAGE,
  getExerciseImage,
  getExerciseImageAlt,
  getExerciseVideo,
  getExerciseVideoTitle,
  getYouTubeSearchUrl,
  type ExerciseMediaSource,
} from '../utils/mediaUtils'

interface ExerciseMediaProps {
  exercise: ExerciseMediaSource | null | undefined
  /** Tighter layout for the live workout screen. */
  compact?: boolean
  /** Start with the video player open instead of collapsed. */
  showVideoDefault?: boolean
  /** Hide the image block (video controls still work). */
  showImage?: boolean
  /** When provided, renders an "Open Form Guide" button. */
  onOpenFormGuide?: () => void
}

/**
 * Exercise image + inline (embedded) video player with safe fallbacks:
 * placeholder image when no/broken image, collapsed-by-default video,
 * offline notice, and a loading skeleton while the iframe loads.
 */
export function ExerciseMedia({
  exercise,
  compact = false,
  showVideoDefault = false,
  showImage = true,
  onOpenFormGuide,
}: ExerciseMediaProps) {
  const { isOnline } = useOnlineStatus()
  const [showVideo, setShowVideo] = useState(showVideoDefault)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  const exerciseName = typeof exercise?.name === 'string' ? exercise.name : ''
  const videoUrl = getExerciseVideo(exercise)
  const hasVideo = videoUrl !== ''

  // Reset per-exercise state when the shown exercise changes.
  useEffect(() => {
    setShowVideo(showVideoDefault)
    setVideoLoaded(false)
    setImageFailed(false)
    // Re-run only when the exercise (or default) actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseName, videoUrl, showVideoDefault])

  if (!exercise) {
    return null
  }

  const imageSrc = imageFailed ? DEFAULT_EXERCISE_IMAGE : getExerciseImage(exercise)
  const videoOpen = showVideo && hasVideo

  return (
    <section
      className={`exercise-media${compact ? ' exercise-media--compact' : ''}`}
      aria-label={`${exerciseName || 'Exercise'} media`}
    >
      {showImage ? (
        <figure className="exercise-media__figure">
          <img
            alt={getExerciseImageAlt(exercise)}
            className="exercise-media__image"
            loading="lazy"
            onError={(event) => {
              // Broken external image -> local placeholder. If even that
              // fails, fall through to the text placeholder below.
              if (!imageFailed) {
                setImageFailed(true)
              } else {
                event.currentTarget.style.display = 'none'
              }
            }}
            src={imageSrc}
          />
          <figcaption className="exercise-media__caption">
            {exercise.imageUrl && !imageFailed
              ? exerciseName
              : 'Exercise image coming soon'}
          </figcaption>
        </figure>
      ) : null}

      <div className="exercise-media__actions">
        {hasVideo ? (
          <button
            aria-expanded={videoOpen}
            className={`workout-secondary-button exercise-media__video-toggle${
              videoOpen ? ' exercise-media__video-toggle--open' : ''
            }`}
            onClick={() => setShowVideo((open) => !open)}
            type="button"
          >
            {videoOpen ? (
              <X size={18} strokeWidth={2.4} aria-hidden="true" />
            ) : (
              <Play size={18} strokeWidth={2.4} aria-hidden="true" />
            )}
            {videoOpen ? 'Hide Video' : 'Watch Video'}
          </button>
        ) : null}
        {onOpenFormGuide ? (
          <button
            className="workout-secondary-button"
            onClick={onOpenFormGuide}
            type="button"
          >
            <BookOpen size={18} strokeWidth={2.4} aria-hidden="true" />
            Open Form Guide
          </button>
        ) : null}
      </div>

      {!hasVideo ? (
        <p className="exercise-media__note">
          <Video size={15} strokeWidth={2.4} aria-hidden="true" />
          Video guide not added yet.
          <a
            href={getYouTubeSearchUrl(exerciseName)}
            rel="noreferrer"
            target="_blank"
          >
            Search on YouTube
          </a>
        </p>
      ) : null}

      {videoOpen ? (
        isOnline ? (
          <div className="exercise-media__video">
            {!videoLoaded ? (
              <div className="exercise-media__skeleton" aria-hidden="true">
                <Play size={28} strokeWidth={2.2} />
                <span>Loading video...</span>
              </div>
            ) : null}
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={videoLoaded ? 'exercise-media__iframe--loaded' : ''}
              loading="lazy"
              onLoad={() => setVideoLoaded(true)}
              referrerPolicy="strict-origin-when-cross-origin"
              src={videoUrl}
              title={getExerciseVideoTitle(exercise)}
            />
          </div>
        ) : (
          <p className="exercise-media__note exercise-media__note--offline">
            <WifiOff size={15} strokeWidth={2.4} aria-hidden="true" />
            Video requires internet connection.
          </p>
        )
      ) : null}

      {showImage && imageFailed ? (
        <p className="exercise-media__note">
          <ImageOff size={15} strokeWidth={2.4} aria-hidden="true" />
          Original image failed to load - showing placeholder.
        </p>
      ) : null}
    </section>
  )
}
